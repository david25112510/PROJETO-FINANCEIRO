-- CreateEnum
CREATE TYPE "TipoArquivoImportacao" AS ENUM ('OFX', 'CSV');

-- CreateTable
CREATE TABLE "importacoes_arquivo" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "nomeArquivo" TEXT NOT NULL,
    "tipoArquivo" "TipoArquivoImportacao" NOT NULL,
    "totalLidos" INTEGER NOT NULL,
    "totalImportados" INTEGER NOT NULL,
    "totalDuplicados" INTEGER NOT NULL,
    "totalErros" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "importacoes_arquivo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "consentimentos_open_finance" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "consentido" BOOLEAN NOT NULL DEFAULT false,
    "consentidoEm" TIMESTAMP(3),
    "revogadoEm" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "consentimentos_open_finance_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "importacoes_arquivo_userId_idx" ON "importacoes_arquivo"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "consentimentos_open_finance_userId_key" ON "consentimentos_open_finance"("userId");

-- AddForeignKey
ALTER TABLE "importacoes_arquivo" ADD CONSTRAINT "importacoes_arquivo_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "consentimentos_open_finance" ADD CONSTRAINT "consentimentos_open_finance_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
