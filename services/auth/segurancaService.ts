import QRCode from "qrcode";
import { z } from "zod";
import { userRepository } from "@/repositories/userRepository";
import { sessionRepository } from "@/repositories/sessionRepository";
import { auditLogRepository } from "@/repositories/auditLogRepository";
import { passwordService } from "@/services/auth/passwordService";
import { totpService } from "@/services/auth/totpService";
import { NotFoundError, UnauthorizedError, ValidationError } from "@/lib/errors";

export const confirmarTotpSchema = z.object({
  codigo: z.string().min(6, "Informe o código de 6 dígitos."),
});

export const desativarTotpSchema = z.object({
  senha: z.string().min(1, "Informe sua senha."),
});

export const segurancaService = {
  async iniciarAtivacaoTotp(userId: string) {
    const user = await userRepository.findById(userId);
    if (!user) throw new NotFoundError("Usuário não encontrado.");
    if (user.totpAtivado) {
      throw new ValidationError("A autenticação em duas etapas já está ativada.", "TOTP_JA_ATIVO");
    }

    const secret = totpService.gerarSegredo();
    await userRepository.salvarSegredoTotpPendente(userId, secret);

    const otpauthUri = totpService.gerarUri(user.email, secret);
    const qrCodeDataUrl = await QRCode.toDataURL(otpauthUri);

    return { secret, otpauthUri, qrCodeDataUrl };
  },

  async confirmarAtivacaoTotp(userId: string, input: unknown) {
    const dados = confirmarTotpSchema.parse(input);

    const user = await userRepository.findById(userId);
    if (!user || !user.totpSecret) {
      throw new ValidationError("Nenhuma ativação de 2FA em andamento.", "TOTP_NAO_INICIADO");
    }

    const valido = await totpService.verificarCodigo(user.totpSecret, dados.codigo);
    if (!valido) {
      throw new UnauthorizedError("Código inválido.", "TOTP_INVALIDO");
    }

    const codigosBackup = totpService.gerarCodigosBackup();
    await userRepository.ativarTotp(userId, user.totpSecret, codigosBackup);
    await auditLogRepository.create({ userId, action: "TOTP_ATIVADO", entity: "User", entityId: userId });

    return { codigosBackup };
  },

  async desativarTotp(userId: string, input: unknown) {
    const dados = desativarTotpSchema.parse(input);

    const user = await userRepository.findById(userId);
    if (!user) throw new NotFoundError("Usuário não encontrado.");

    const senhaValida = await passwordService.verify(dados.senha, user.passwordHash);
    if (!senhaValida) {
      throw new UnauthorizedError("Senha incorreta.", "SENHA_INCORRETA");
    }

    await userRepository.desativarTotp(userId);
    await auditLogRepository.create({ userId, action: "TOTP_DESATIVADO", entity: "User", entityId: userId });
  },

  async listarSessoes(userId: string, tokenHashAtual: string) {
    const sessoes = await sessionRepository.findAtivasParaUsuario(userId);
    return sessoes.map((s) => ({
      id: s.id,
      userAgent: s.userAgent,
      ipAddress: s.ipAddress,
      createdAt: s.createdAt,
      expiresAt: s.expiresAt,
      atual: s.tokenHash === tokenHashAtual,
    }));
  },

  async revogarSessao(id: string, userId: string) {
    await sessionRepository.revokeById(id, userId);
    await auditLogRepository.create({ userId, action: "SESSAO_REVOGADA", entity: "Session", entityId: id });
  },
};
