-- CreateEnum
CREATE TYPE "DirecaoMensagemWhatsapp" AS ENUM ('ENTRADA', 'SAIDA');

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "bloqueadoAte" TIMESTAMP(3),
ADD COLUMN     "codigosBackup" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "falhasLoginConsecutivas" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "totpAtivado" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "totpSecret" TEXT;

-- CreateTable
CREATE TABLE "logins_pendentes" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "logins_pendentes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "telefones_whatsapp" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "numero" TEXT NOT NULL,
    "verificado" BOOLEAN NOT NULL DEFAULT false,
    "codigoVerificacao" TEXT,
    "codigoExpiraEm" TIMESTAMP(3),
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "telefones_whatsapp_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mensagens_whatsapp" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "numero" TEXT NOT NULL,
    "direcao" "DirecaoMensagemWhatsapp" NOT NULL,
    "conteudo" TEXT NOT NULL,
    "intencao" TEXT,
    "processadoComSucesso" BOOLEAN NOT NULL DEFAULT false,
    "entidadeCriadaTipo" TEXT,
    "entidadeCriadaId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "mensagens_whatsapp_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "logins_pendentes_userId_idx" ON "logins_pendentes"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "telefones_whatsapp_userId_key" ON "telefones_whatsapp"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "telefones_whatsapp_numero_key" ON "telefones_whatsapp"("numero");

-- CreateIndex
CREATE INDEX "mensagens_whatsapp_userId_idx" ON "mensagens_whatsapp"("userId");

-- CreateIndex
CREATE INDEX "mensagens_whatsapp_numero_idx" ON "mensagens_whatsapp"("numero");

-- AddForeignKey
ALTER TABLE "logins_pendentes" ADD CONSTRAINT "logins_pendentes_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "telefones_whatsapp" ADD CONSTRAINT "telefones_whatsapp_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mensagens_whatsapp" ADD CONSTRAINT "mensagens_whatsapp_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
