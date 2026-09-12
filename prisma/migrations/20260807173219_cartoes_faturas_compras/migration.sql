-- CreateEnum
CREATE TYPE "StatusFatura" AS ENUM ('ABERTA', 'FECHADA', 'PAGA_PARCIAL', 'PAGA');

-- CreateTable
CREATE TABLE "cartoes" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "bandeira" TEXT,
    "limite" DECIMAL(12,2) NOT NULL,
    "diaFechamento" INTEGER NOT NULL,
    "diaVencimento" INTEGER NOT NULL,
    "cor" TEXT NOT NULL DEFAULT '#2c4a86',
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cartoes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "faturas" (
    "id" TEXT NOT NULL,
    "cartaoId" TEXT NOT NULL,
    "mesReferencia" INTEGER NOT NULL,
    "anoReferencia" INTEGER NOT NULL,
    "dataFechamento" DATE NOT NULL,
    "dataVencimento" DATE NOT NULL,
    "status" "StatusFatura" NOT NULL DEFAULT 'ABERTA',
    "valorTotal" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "valorPago" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "faturas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "compras" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "cartaoId" TEXT NOT NULL,
    "faturaId" TEXT NOT NULL,
    "categoriaId" TEXT,
    "descricao" TEXT NOT NULL,
    "valor" DECIMAL(12,2) NOT NULL,
    "data" DATE NOT NULL,
    "parcelaAtual" INTEGER,
    "totalParcelas" INTEGER,
    "grupoParcelamentoId" TEXT,
    "observacoes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "compras_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "cartoes_userId_idx" ON "cartoes"("userId");

-- CreateIndex
CREATE INDEX "faturas_cartaoId_status_idx" ON "faturas"("cartaoId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "faturas_cartaoId_mesReferencia_anoReferencia_key" ON "faturas"("cartaoId", "mesReferencia", "anoReferencia");

-- CreateIndex
CREATE INDEX "compras_userId_idx" ON "compras"("userId");

-- CreateIndex
CREATE INDEX "compras_cartaoId_idx" ON "compras"("cartaoId");

-- CreateIndex
CREATE INDEX "compras_faturaId_idx" ON "compras"("faturaId");

-- CreateIndex
CREATE INDEX "compras_grupoParcelamentoId_idx" ON "compras"("grupoParcelamentoId");

-- AddForeignKey
ALTER TABLE "cartoes" ADD CONSTRAINT "cartoes_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "faturas" ADD CONSTRAINT "faturas_cartaoId_fkey" FOREIGN KEY ("cartaoId") REFERENCES "cartoes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "compras" ADD CONSTRAINT "compras_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "compras" ADD CONSTRAINT "compras_cartaoId_fkey" FOREIGN KEY ("cartaoId") REFERENCES "cartoes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "compras" ADD CONSTRAINT "compras_faturaId_fkey" FOREIGN KEY ("faturaId") REFERENCES "faturas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "compras" ADD CONSTRAINT "compras_categoriaId_fkey" FOREIGN KEY ("categoriaId") REFERENCES "categorias"("id") ON DELETE SET NULL ON UPDATE CASCADE;
