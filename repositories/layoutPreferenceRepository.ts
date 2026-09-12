import { prisma } from "@/lib/prisma";
import type { LayoutPreference, Prisma } from "@prisma/client";

export type UpsertLayoutPreferenceInput = {
  userId: string;
  widgetKey: string;
  position: number;
  width: number;
  height: number;
  visible?: boolean;
  config?: Prisma.InputJsonValue;
};

/**
 * Único ponto de acesso ao Prisma para a entidade LayoutPreference.
 */
export const layoutPreferenceRepository = {
  async findAllForUser(userId: string): Promise<LayoutPreference[]> {
    return prisma.layoutPreference.findMany({
      where: { userId },
      orderBy: { position: "asc" },
    });
  },

  async upsert(data: UpsertLayoutPreferenceInput): Promise<LayoutPreference> {
    const { userId, widgetKey, ...rest } = data;
    return prisma.layoutPreference.upsert({
      where: { userId_widgetKey: { userId, widgetKey } },
      create: { userId, widgetKey, ...rest },
      update: rest,
    });
  },
};
