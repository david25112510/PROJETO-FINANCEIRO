import { prisma } from "@/lib/prisma";
import type { ImportacaoArquivo, TipoArquivoImportacao } from "@prisma/client";

export type CreateImportacaoInput = {
  userId: string;
  nomeArquivo: string;
  tipoArquivo: TipoArquivoImportacao;
  totalLidos: number;
  totalImportados: number;
  totalDuplicados: number;
  totalErros: number;
};

export type LancamentoParaDeduplicacao = {
  data: Date;
  valor: number;
  descricao: string;
};

export const importacaoRepository = {
  async create(data: CreateImportacaoInput): Promise<ImportacaoArquivo> {
    return prisma.importacaoArquivo.create({ data });
  },

  async findAllForUser(userId: string): Promise<ImportacaoArquivo[]> {
    return prisma.importacaoArquivo.findMany({ where: { userId }, orderBy: { createdAt: "desc" }, take: 50 });
  },
};
