import type { User } from "@prisma/client";
import { userRepository } from "@/repositories/userRepository";
import { sessionRepository } from "@/repositories/sessionRepository";
import { loginPendenteRepository } from "@/repositories/loginPendenteRepository";
import { auditLogRepository } from "@/repositories/auditLogRepository";
import { passwordService } from "@/services/auth/passwordService";
import { sessionTokenService } from "@/services/auth/sessionTokenService";
import { totpService } from "@/services/auth/totpService";
import { UnauthorizedError } from "@/lib/errors";

export type SafeUser = Omit<User, "passwordHash" | "totpSecret" | "codigosBackup">;

export type RequestMeta = {
  userAgent?: string | null;
  ipAddress?: string | null;
};

export type ResultadoLogin =
  | { requerTotp: false; user: SafeUser; token: string; expiresAt: Date }
  | { requerTotp: true; loginPendenteId: string };

const MAX_FALHAS_LOGIN = 5;
const DURACAO_BLOQUEIO_MS = 15 * 60 * 1000;
const DURACAO_LOGIN_PENDENTE_MS = 5 * 60 * 1000;

export function toSafeUser(user: User): SafeUser {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    avatarUrl: user.avatarUrl,
    theme: user.theme,
    lastLoginAt: user.lastLoginAt,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
    falhasLoginConsecutivas: user.falhasLoginConsecutivas,
    bloqueadoAte: user.bloqueadoAte,
    totpAtivado: user.totpAtivado,
  };
}

async function registrarFalhaLogin(user: User, meta: RequestMeta) {
  const atualizado = await userRepository.incrementarFalhasLogin(user.id);

  if (atualizado.falhasLoginConsecutivas >= MAX_FALHAS_LOGIN) {
    await userRepository.bloquearAte(user.id, new Date(Date.now() + DURACAO_BLOQUEIO_MS));
    await auditLogRepository.create({
      userId: user.id,
      action: "CONTA_BLOQUEADA",
      entity: "User",
      entityId: user.id,
      metadata: { falhas: atualizado.falhasLoginConsecutivas },
      ipAddress: meta.ipAddress,
    });
  }

  await auditLogRepository.create({
    userId: user.id,
    action: "LOGIN_FALHOU",
    entity: "User",
    entityId: user.id,
    ipAddress: meta.ipAddress,
  });
}

async function criarSessao(user: User, meta: RequestMeta) {
  const token = sessionTokenService.generate();
  const expiresAt = sessionTokenService.newExpiryDate();

  await sessionRepository.create({
    userId: user.id,
    tokenHash: sessionTokenService.hash(token),
    expiresAt,
    userAgent: meta.userAgent,
    ipAddress: meta.ipAddress,
  });

  await userRepository.updateLastLogin(user.id);

  await auditLogRepository.create({
    userId: user.id,
    action: "LOGIN",
    entity: "User",
    entityId: user.id,
    ipAddress: meta.ipAddress,
  });

  return { token, expiresAt };
}

export const authService = {
  async login(email: string, password: string, meta: RequestMeta): Promise<ResultadoLogin> {
    const user = await userRepository.findByEmail(email.trim().toLowerCase());

    // Mensagem genérica de propósito: não revelar se o e-mail existe ou não.
    if (!user) {
      throw new UnauthorizedError("E-mail ou senha inválidos.");
    }

    if (user.bloqueadoAte && user.bloqueadoAte > new Date()) {
      throw new UnauthorizedError(
        "Conta temporariamente bloqueada por excesso de tentativas. Tente novamente mais tarde.",
        "CONTA_BLOQUEADA",
      );
    }

    const senhaValida = await passwordService.verify(password, user.passwordHash);
    if (!senhaValida) {
      await registrarFalhaLogin(user, meta);
      throw new UnauthorizedError("E-mail ou senha inválidos.");
    }

    await userRepository.resetarFalhasLogin(user.id);

    if (user.totpAtivado) {
      const pendente = await loginPendenteRepository.create({
        userId: user.id,
        expiresAt: new Date(Date.now() + DURACAO_LOGIN_PENDENTE_MS),
        ipAddress: meta.ipAddress,
        userAgent: meta.userAgent,
      });
      return { requerTotp: true, loginPendenteId: pendente.id };
    }

    const { token, expiresAt } = await criarSessao(user, meta);
    return { requerTotp: false, user: toSafeUser(user), token, expiresAt };
  },

  async verificarTotpLogin(loginPendenteId: string, codigo: string, meta: RequestMeta) {
    const pendente = await loginPendenteRepository.findValidoComUsuario(loginPendenteId);
    if (!pendente) {
      throw new UnauthorizedError("Login expirado. Faça login novamente.", "LOGIN_PENDENTE_EXPIRADO");
    }

    const { user } = pendente;
    const codigoValido = user.totpSecret ? await totpService.verificarCodigo(user.totpSecret, codigo) : false;

    let usouCodigoBackup = false;
    let valido = codigoValido;
    if (!valido) {
      const codigoNormalizado = codigo.trim().toLowerCase();
      const indice = user.codigosBackup.indexOf(codigoNormalizado);
      if (indice !== -1) {
        valido = true;
        usouCodigoBackup = true;
        const restantes = [...user.codigosBackup];
        restantes.splice(indice, 1);
        await userRepository.atualizarCodigosBackup(user.id, restantes);
      }
    }

    if (!valido) {
      await auditLogRepository.create({
        userId: user.id,
        action: "TOTP_FALHOU",
        entity: "User",
        entityId: user.id,
        ipAddress: meta.ipAddress,
      });
      throw new UnauthorizedError("Código inválido.", "TOTP_INVALIDO");
    }

    await loginPendenteRepository.delete(pendente.id);
    if (usouCodigoBackup) {
      await auditLogRepository.create({
        userId: user.id,
        action: "TOTP_CODIGO_BACKUP_USADO",
        entity: "User",
        entityId: user.id,
        ipAddress: meta.ipAddress,
      });
    }

    const { token, expiresAt } = await criarSessao(user, meta);
    return { user: toSafeUser(user), token, expiresAt };
  },

  async logout(token: string, meta: RequestMeta) {
    const tokenHash = sessionTokenService.hash(token);
    const session = await sessionRepository.findActiveByTokenHash(tokenHash);

    await sessionRepository.revokeByTokenHash(tokenHash);

    if (session) {
      await auditLogRepository.create({
        userId: session.userId,
        action: "LOGOUT",
        entity: "User",
        entityId: session.userId,
        ipAddress: meta.ipAddress,
      });
    }
  },

  async validateSession(token: string): Promise<SafeUser | null> {
    const tokenHash = sessionTokenService.hash(token);
    const session = await sessionRepository.findActiveByTokenHashWithUser(tokenHash);
    if (!session) return null;
    return toSafeUser(session.user);
  },
};
