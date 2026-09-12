import { randomBytes } from "crypto";
import { generateSecret, generateURI, verify } from "otplib";

const EMISSOR = "FinanceOps";
const QUANTIDADE_CODIGOS_BACKUP = 8;

export const totpService = {
  gerarSegredo(): string {
    return generateSecret();
  },

  gerarUri(email: string, secret: string): string {
    return generateURI({ issuer: EMISSOR, label: email, secret });
  },

  async verificarCodigo(secret: string, codigo: string): Promise<boolean> {
    if (!codigo || !/^\d{6}$/.test(codigo.trim())) return false;
    const resultado = await verify({ secret, token: codigo.trim() });
    return resultado.valid;
  },

  gerarCodigosBackup(): string[] {
    return Array.from({ length: QUANTIDADE_CODIGOS_BACKUP }, () =>
      randomBytes(5).toString("hex").match(/.{1,5}/g)!.join("-"),
    );
  },
};
