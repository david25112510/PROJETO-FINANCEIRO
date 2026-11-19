import { createHash, randomBytes } from "node:crypto";
import { userRepository } from "@/repositories/userRepository";
import { passwordResetTokenRepository } from "@/repositories/passwordResetTokenRepository";
import { auditLogRepository } from "@/repositories/auditLogRepository";
import { passwordService } from "@/services/auth/passwordService";
import { senhaForteSchema } from "@/services/auth/userService";
import { ValidationError } from "@/lib/errors";
import { logger } from "@/lib/logger";

const DURACAO_TOKEN_MS = 30 * 60 * 1000;

function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (character) => {
    const entities: Record<string, string> = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    };
    return entities[character];
  });
}

async function enviarEmail(to: string, name: string, resetUrl: string): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM;
  if (!apiKey || !from) {
    logger.warn("recuperacao_senha_email_nao_configurado");
    return false;
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [to],
      subject: "Redefinição de senha do FinanceOps",
      html: `<p>Olá, ${escapeHtml(name)}.</p><p>Recebemos uma solicitação para redefinir a senha da sua conta FinanceOps.</p><p><a href="${escapeHtml(resetUrl)}">Criar uma nova senha</a></p><p>O link expira em 30 minutos e só pode ser usado uma vez. Se você não solicitou esta alteração, ignore esta mensagem.</p>`,
      text: `Olá, ${name}. Para criar uma nova senha do FinanceOps, acesse: ${resetUrl}\n\nO link expira em 30 minutos e só pode ser usado uma vez. Se você não solicitou esta alteração, ignore esta mensagem.`,
    }),
  });

  if (!response.ok) {
    logger.warn({ status: response.status }, "recuperacao_senha_email_falhou");
    return false;
  }

  return true;
}

export const passwordResetService = {
  async requestReset(email: string, baseUrl: string): Promise<boolean> {
    const normalizedEmail = email.trim().toLowerCase();
    if (!process.env.RESEND_API_KEY || !process.env.EMAIL_FROM) {
      logger.warn("recuperacao_senha_email_nao_configurado");
      return false;
    }

    const user = await userRepository.findByEmail(normalizedEmail);
    if (!user) return true;

    await passwordResetTokenRepository.deleteForUser(user.id);
    const token = randomBytes(32).toString("base64url");
    const tokenHash = hashToken(token);
    await passwordResetTokenRepository.create({
      userId: user.id,
      tokenHash,
      expiresAt: new Date(Date.now() + DURACAO_TOKEN_MS),
    });

    const resetUrl = new URL(`/recuperar-senha/redefinir?token=${encodeURIComponent(token)}`, baseUrl).toString();
    try {
      const enviado = await enviarEmail(user.email, user.name, resetUrl);
      if (!enviado) await passwordResetTokenRepository.deleteByHash(tokenHash);
    } catch (error) {
      await passwordResetTokenRepository.deleteByHash(tokenHash);
      logger.warn({ err: error }, "recuperacao_senha_email_falhou");
    }

    return true;
  },

  async resetPassword(token: string, password: string, ipAddress?: string | null): Promise<void> {
    const senha = senhaForteSchema.parse(password);
    const normalizedToken = token.trim();
    if (!normalizedToken) {
      throw new ValidationError("Link inválido ou expirado. Solicite uma nova recuperação.", "TOKEN_REDEFINICAO_INVALIDO");
    }

    const tokenHash = hashToken(normalizedToken);
    const tokenRecord = await passwordResetTokenRepository.findValid(tokenHash);
    if (!tokenRecord) {
      throw new ValidationError("Link inválido ou expirado. Solicite uma nova recuperação.", "TOKEN_REDEFINICAO_INVALIDO");
    }

    const passwordHash = await passwordService.hash(senha);
    const userId = await passwordResetTokenRepository.resetPassword(tokenHash, passwordHash);
    if (!userId) {
      throw new ValidationError("Link inválido ou expirado. Solicite uma nova recuperação.", "TOKEN_REDEFINICAO_INVALIDO");
    }

    await auditLogRepository.create({
      userId,
      action: "SENHA_RECUPERADA",
      entity: "User",
      entityId: userId,
      ipAddress,
    });
  },
};
