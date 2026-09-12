import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

export type CreateAuditLogInput = {
  userId?: string | null;
  action: string;
  entity: string;
  entityId?: string | null;
  metadata?: Prisma.InputJsonValue;
  ipAddress?: string | null;
};

/**
 * Único ponto de acesso ao Prisma para a entidade AuditLog.
 * Toda operação de escrita nos services deve registrar uma entrada aqui.
 */
export const auditLogRepository = {
  async create(data: CreateAuditLogInput): Promise<void> {
    await prisma.auditLog.create({ data });
  },
};
