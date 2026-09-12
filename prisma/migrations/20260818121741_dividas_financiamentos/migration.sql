-- CreateEnum
CREATE TYPE "StatusDivida" AS ENUM ('ATIVA', 'QUITADA');

-- CreateEnum
CREATE TYPE "SistemaAmortizacao" AS ENUM ('PRICE', 'SAC');

-- CreateEnum
CREATE TYPE "StatusFinanciamento" AS ENUM ('ATIVO', 'QUITADO');

-- CreateTable
CREATE TABLE "dividas" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "descricao" TEXT NOT NULL,
    "credor" TEXT,
    "valorOriginal" DECIMAL(12,2) NOT NULL,
    "valorAtual" DECIMAL(12,2) NOT NULL,
    "taxaJurosMensal" DECIMAL(6,4) NOT NULL,
    "parcelasRestantes" INTEGER,
    "valorParcela" DECIMAL(12,2),
    "dataContratacao" DATE NOT NULL,
    "status" "StatusDivida" NOT NULL DEFAULT 'ATIVA',
    "dataQuitacao" DATE,
    "observacoes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "dividas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "financiamentos" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "descricao" TEXT NOT NULL,
    "valorTotal" DECIMAL(12,2) NOT NULL,
    "taxaJurosMensal" DECIMAL(6,4) NOT NULL,
    "numeroParcelas" INTEGER NOT NULL,
    "sistemaAmortizacao" "SistemaAmortizacao" NOT NULL,
    "dataContratacao" DATE NOT NULL,
    "status" "StatusFinanciamento" NOT NULL DEFAULT 'ATIVO',
    "observacoes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "financiamentos_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "dividas_userId_idx" ON "dividas"("userId");

-- CreateIndex
CREATE INDEX "financiamentos_userId_idx" ON "financiamentos"("userId");

-- AddForeignKey
ALTER TABLE "dividas" ADD CONSTRAINT "dividas_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "financiamentos" ADD CONSTRAINT "financiamentos_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
