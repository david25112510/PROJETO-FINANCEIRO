import { randomBytes, createHmac } from "crypto";
import { SESSION_DURATION_MS } from "@/lib/constants";

const DEV_SESSION_SECRET = "financeops-dev-session-secret-change-before-production";

function getSessionSecret(): string {
  const secret = process.env.SESSION_SECRET;
  if (secret && secret.length >= 32) return secret;

  if (process.env.NODE_ENV === "production") {
    throw new Error("SESSION_SECRET deve ter ao menos 32 caracteres em produção.");
  }

  return DEV_SESSION_SECRET;
}

export const sessionTokenService = {
  generate(): string {
    return randomBytes(32).toString("hex");
  },

  hash(token: string): string {
    return createHmac("sha256", getSessionSecret()).update(token).digest("hex");
  },

  newExpiryDate(): Date {
    return new Date(Date.now() + SESSION_DURATION_MS);
  },
};
