import { z } from "zod";
import { cartaoRepository } from "@/repositories/cartaoRepository";
import { faturaRepository } from "@/repositories/faturaRepository";
import { auditLogRepository } from "@/repositories/auditLogRepository";
import { NotFoundError } from "@/lib/errors";

export const criarCartaoSchema = z.object({
  nome: z.string().trim().min(2, "Nome deve ter ao menos 2 caracteres.").max(40),
  bandeira: z.string().trim().max(30).optional(),
  limite: z.number().positive("Limite deve ser maior que zero."),
  diaFechamento: z.number().int().min(1).max(31),
  diaVencimento: z.number().int().min(1).max(31),
  cor: z.string().trim().max(9).optional(),
});

export type CriarCartaoDto = z.infer<typeof criarCartaoSchema>;

export const atualizarCartaoSchema = z.object({
  nome: z.string().trim().min(2, "Nome deve ter ao menos 2 caracteres.").max(40).optional(),
  bandeira: z.string().trim().max(30).optional(),
  limite: z.number().positive("Limite deve ser maior que zero.").optional(),
  diaFechamento: z.number().int().min(1).max(31).optional(),
  diaVencimento: z.number().int().min(1).max(31).optional(),
  cor: z.string().trim().max(9).optional(),
  ativo: z.boolean().optional(),
});

export type AtualizarCartaoDto = z.infer<typeof atualizarCartaoSchema>;

const LIMIAR_ATENCAO = 0.8;

function comIndicadoresLimite<T extends { limite: unknown }>(cartao: T, limiteUsado: number) {
  const limite = Number(cartao.limite);
  const limiteDisponivel = limite - limiteUsado;
  const percentualUsado = limite > 0 ? limiteUsado / limite : 0;
  const nivelAlerta: "normal" | "atencao" | "critico" =
    percentualUsado >= 1 ? "critico" : percentualUsado >= LIMIAR_ATENCAO ? "atencao" : "normal";

  return { ...cartao, limite, limiteUsado, limiteDisponivel, percentualUsado, nivelAlerta };
}

export const cartaoService = {
  async listar(userId: string) {
    const cartoes = await cartaoRepository.findAllForUser(userId);
    return Promise.all(
      cartoes.map(async (cartao) => {
        const limiteUsado = await faturaRepository.calcularSaldoDevedor(cartao.id);
        return comIndicadoresLimite(cartao, limiteUsado);
      }),
    );
  },

  async buscarPorId(id: string, userId: string) {
    const cartao = await cartaoRepository.findById(id, userId);
    if (!cartao) throw new NotFoundError("Cartão não encontrado.");
    const limiteUsado = await faturaRepository.calcularSaldoDevedor(cartao.id);
    return comIndicadoresLimite(cartao, limiteUsado);
  },

  async criar(userId: string, input: CriarCartaoDto) {
    const dados = criarCartaoSchema.parse(input);
    const cartao = await cartaoRepository.create({ userId, ...dados });

    await auditLogRepository.create({ userId, action: "CREATE", entity: "Cartao", entityId: cartao.id });
    return cartao;
  },

  async atualizar(id: string, userId: string, input: AtualizarCartaoDto) {
    const dados = atualizarCartaoSchema.parse(input);
    const existente = await cartaoRepository.findById(id, userId);
    if (!existente) throw new NotFoundError("Cartão não encontrado.");

    const atualizado = await cartaoRepository.update(id, userId, dados);
    await auditLogRepository.create({ userId, action: "UPDATE", entity: "Cartao", entityId: id });
    return atualizado;
  },

  async excluir(id: string, userId: string) {
    const existente = await cartaoRepository.findById(id, userId);
    if (!existente) throw new NotFoundError("Cartão não encontrado.");

    await cartaoRepository.delete(id, userId);
    await auditLogRepository.create({ userId, action: "DELETE", entity: "Cartao", entityId: id });
  },
};
