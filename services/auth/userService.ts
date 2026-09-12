import { z } from "zod";
import { userRepository } from "@/repositories/userRepository";
import { auditLogRepository } from "@/repositories/auditLogRepository";
import { passwordService } from "@/services/auth/passwordService";
import { ConflictError, NotFoundError, UnauthorizedError, ValidationError } from "@/lib/errors";
import { toSafeUser, type SafeUser } from "@/services/auth/authService";

export const senhaForteSchema = z
  .string()
  .min(8, "Senha deve ter ao menos 8 caracteres.")
  .regex(/[a-z]/, "Senha deve conter ao menos uma letra minúscula.")
  .regex(/[A-Z]/, "Senha deve conter ao menos uma letra maiúscula.")
  .regex(/[0-9]/, "Senha deve conter ao menos um número.");

export const createUserSchema = z.object({
  name: z.string().trim().min(2, "Nome deve ter ao menos 2 caracteres."),
  email: z.email("E-mail inválido.").trim().toLowerCase(),
  password: senhaForteSchema,
});

export type CreateUserDto = z.infer<typeof createUserSchema>;

export const trocarSenhaSchema = z.object({
  senhaAtual: z.string().min(1, "Informe a senha atual."),
  novaSenha: senhaForteSchema,
});

export type TrocarSenhaDto = z.infer<typeof trocarSenhaSchema>;

export const userService = {
  async createUser(input: CreateUserDto, actorUserId?: string | null): Promise<SafeUser> {
    const data = createUserSchema.parse(input);

    const existente = await userRepository.findByEmail(data.email);
    if (existente) {
      throw new ConflictError("Já existe um usuário com este e-mail.", "EMAIL_EM_USO");
    }

    const passwordHash = await passwordService.hash(data.password);
    const user = await userRepository.create({
      name: data.name,
      email: data.email,
      passwordHash,
    });

    await auditLogRepository.create({
      userId: actorUserId ?? user.id,
      action: "CREATE",
      entity: "User",
      entityId: user.id,
    });

    return toSafeUser(user);
  },

  async trocarSenha(userId: string, input: TrocarSenhaDto): Promise<void> {
    const dados = trocarSenhaSchema.parse(input);

    const user = await userRepository.findById(userId);
    if (!user) throw new NotFoundError("Usuário não encontrado.");

    const senhaAtualValida = await passwordService.verify(dados.senhaAtual, user.passwordHash);
    if (!senhaAtualValida) {
      throw new UnauthorizedError("Senha atual incorreta.", "SENHA_ATUAL_INCORRETA");
    }
    if (dados.senhaAtual === dados.novaSenha) {
      throw new ValidationError("A nova senha deve ser diferente da atual.");
    }

    const novoPasswordHash = await passwordService.hash(dados.novaSenha);
    await userRepository.atualizarSenha(userId, novoPasswordHash);

    await auditLogRepository.create({ userId, action: "SENHA_ALTERADA", entity: "User", entityId: userId });
  },
};
