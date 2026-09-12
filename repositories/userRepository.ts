import { prisma } from "@/lib/prisma";
import type { Theme, User } from "@prisma/client";

export type CreateUserInput = {
  name: string;
  email: string;
  passwordHash: string;
};

/**
 * Único ponto de acesso ao Prisma para a entidade User.
 * Nenhuma outra camada (services, api routes) deve importar `prisma` para operar em usuários.
 */
export const userRepository = {
  async findByEmail(email: string): Promise<User | null> {
    return prisma.user.findUnique({ where: { email } });
  },

  async findById(id: string): Promise<User | null> {
    return prisma.user.findUnique({ where: { id } });
  },

  async create(data: CreateUserInput): Promise<User> {
    return prisma.user.create({ data });
  },

  async updateLastLogin(id: string): Promise<User> {
    return prisma.user.update({
      where: { id },
      data: { lastLoginAt: new Date() },
    });
  },

  async updateTheme(id: string, theme: Theme): Promise<User> {
    return prisma.user.update({
      where: { id },
      data: { theme },
    });
  },

  async atualizarSenha(id: string, passwordHash: string): Promise<User> {
    return prisma.user.update({ where: { id }, data: { passwordHash } });
  },

  async count(): Promise<number> {
    return prisma.user.count();
  },

  async incrementarFalhasLogin(id: string): Promise<User> {
    return prisma.user.update({
      where: { id },
      data: { falhasLoginConsecutivas: { increment: 1 } },
    });
  },

  async resetarFalhasLogin(id: string): Promise<User> {
    return prisma.user.update({
      where: { id },
      data: { falhasLoginConsecutivas: 0, bloqueadoAte: null },
    });
  },

  async bloquearAte(id: string, ate: Date): Promise<User> {
    return prisma.user.update({
      where: { id },
      data: { bloqueadoAte: ate },
    });
  },

  async salvarSegredoTotpPendente(id: string, totpSecret: string): Promise<User> {
    return prisma.user.update({
      where: { id },
      data: { totpSecret, totpAtivado: false },
    });
  },

  async ativarTotp(id: string, totpSecret: string, codigosBackup: string[]): Promise<User> {
    return prisma.user.update({
      where: { id },
      data: { totpSecret, totpAtivado: true, codigosBackup },
    });
  },

  async desativarTotp(id: string): Promise<User> {
    return prisma.user.update({
      where: { id },
      data: { totpSecret: null, totpAtivado: false, codigosBackup: [] },
    });
  },

  async atualizarCodigosBackup(id: string, codigosBackup: string[]): Promise<User> {
    return prisma.user.update({ where: { id }, data: { codigosBackup } });
  },
};
