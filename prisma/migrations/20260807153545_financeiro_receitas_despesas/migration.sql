-- CreateEnum
CREATE TYPE "TipoCategoria" AS ENUM ('RECEITA', 'DESPESA');

-- CreateEnum
CREATE TYPE "FrequenciaRecorrencia" AS ENUM ('SEMANAL', 'MENSAL', 'BIMESTRAL', 'TRIMESTRAL', 'SEMESTRAL', 'ANUAL');

-- CreateTable
CREATE TABLE "categorias" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "tipo" "TipoCategoria" NOT NULL,
    "cor" TEXT NOT NULL DEFAULT '#626c78',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "categorias_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "receitas" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "categoriaId" TEXT,
    "descricao" TEXT NOT NULL,
    "valor" DECIMAL(12,2) NOT NULL,
    "data" DATE NOT NULL,
    "recorrente" BOOLEAN NOT NULL DEFAULT false,
    "frequenciaRecorrencia" "FrequenciaRecorrencia",
    "grupoRecorrenciaId" TEXT,
    "parcelaAtual" INTEGER,
    "totalParcelas" INTEGER,
    "grupoParcelamentoId" TEXT,
    "observacoes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "receitas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "despesas" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "categoriaId" TEXT,
    "descricao" TEXT NOT NULL,
    "valor" DECIMAL(12,2) NOT NULL,
    "data" DATE NOT NULL,
    "recorrente" BOOLEAN NOT NULL DEFAULT false,
    "frequenciaRecorrencia" "FrequenciaRecorrencia",
    "grupoRecorrenciaId" TEXT,
    "parcelaAtual" INTEGER,
    "totalParcelas" INTEGER,
    "grupoParcelamentoId" TEXT,
    "observacoes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "despesas_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "categorias_userId_idx" ON "categorias"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "categorias_userId_tipo_nome_key" ON "categorias"("userId", "tipo", "nome");

-- CreateIndex
CREATE INDEX "receitas_userId_data_idx" ON "receitas"("userId", "data");

-- CreateIndex
CREATE INDEX "receitas_grupoRecorrenciaId_idx" ON "receitas"("grupoRecorrenciaId");

-- CreateIndex
CREATE INDEX "receitas_grupoParcelamentoId_idx" ON "receitas"("grupoParcelamentoId");

-- CreateIndex
CREATE INDEX "despesas_userId_data_idx" ON "despesas"("userId", "data");

-- CreateIndex
CREATE INDEX "despesas_grupoRecorrenciaId_idx" ON "despesas"("grupoRecorrenciaId");

-- CreateIndex
CREATE INDEX "despesas_grupoParcelamentoId_idx" ON "despesas"("grupoParcelamentoId");

-- AddForeignKey
ALTER TABLE "categorias" ADD CONSTRAINT "categorias_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "receitas" ADD CONSTRAINT "receitas_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "receitas" ADD CONSTRAINT "receitas_categoriaId_fkey" FOREIGN KEY ("categoriaId") REFERENCES "categorias"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "despesas" ADD CONSTRAINT "despesas_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "despesas" ADD CONSTRAINT "despesas_categoriaId_fkey" FOREIGN KEY ("categoriaId") REFERENCES "categorias"("id") ON DELETE SET NULL ON UPDATE CASCADE;
