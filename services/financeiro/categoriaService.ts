import { z } from "zod";
import { categoriaRepository } from "@/repositories/categoriaRepository";
import { auditLogRepository } from "@/repositories/auditLogRepository";
import { ConflictError, NotFoundError } from "@/lib/errors";

const CORES_PADRAO = ["#2c4a86", "#17a95a", "#d69b13", "#d13c3c", "#626c78", "#7f95c4"] as const;

export const criarCategoriaSchema = z.object({
  nome: z.string().trim().min(2, "Nome deve ter ao menos 2 caracteres.").max(40),
  tipo: z.enum(["RECEITA", "DESPESA"]),
  cor: z.enum(CORES_PADRAO).optional(),
});

export type CriarCategoriaDto = z.infer<typeof criarCategoriaSchema>;

export const atualizarCategoriaSchema = z.object({
  nome: z.string().trim().min(2, "Nome deve ter ao menos 2 caracteres.").max(40).optional(),
  cor: z.enum(CORES_PADRAO).optional(),
});

export type AtualizarCategoriaDto = z.infer<typeof atualizarCategoriaSchema>;

export const categoriaService = {
  async listar(userId: string, tipo?: "RECEITA" | "DESPESA") {
    return categoriaRepository.findAllForUser(userId, tipo);
  },

  async criar(userId: string, input: CriarCategoriaDto) {
    const dados = criarCategoriaSchema.parse(input);

    const existente = await categoriaRepository.findByNome(userId, dados.tipo, dados.nome);
    if (existente) {
      throw new ConflictError("Já existe uma categoria com este nome para este tipo.", "CATEGORIA_DUPLICADA");
    }

    const categoria = await categoriaRepository.create({ userId, ...dados });

    await auditLogRepository.create({
      userId,
      action: "CREATE",
      entity: "Categoria",
      entityId: categoria.id,
    });

    return categoria;
  },

  async atualizar(id: string, userId: string, input: AtualizarCategoriaDto) {
    const dados = atualizarCategoriaSchema.parse(input);

    const existente = await categoriaRepository.findById(id, userId);
    if (!existente) throw new NotFoundError("Categoria não encontrada.");

    if (dados.nome && dados.nome !== existente.nome) {
      const duplicada = await categoriaRepository.findByNome(userId, existente.tipo, dados.nome);
      if (duplicada && duplicada.id !== id) {
        throw new ConflictError("Já existe uma categoria com este nome para este tipo.", "CATEGORIA_DUPLICADA");
      }
    }

    const atualizada = await categoriaRepository.update(id, userId, dados);

    await auditLogRepository.create({
      userId,
      action: "UPDATE",
      entity: "Categoria",
      entityId: id,
    });

    return atualizada;
  },

  async excluir(id: string, userId: string) {
    const existente = await categoriaRepository.findById(id, userId);
    if (!existente) throw new NotFoundError("Categoria não encontrada.");

    await categoriaRepository.delete(id, userId);

    await auditLogRepository.create({
      userId,
      action: "DELETE",
      entity: "Categoria",
      entityId: id,
    });
  },
};
