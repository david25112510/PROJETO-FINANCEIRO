import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const headers = {
  "Cache-Control": "no-store, max-age=0",
};

export async function GET() {
  try {
    await prisma.$queryRaw`SELECT 1`;

    return Response.json(
      {
        status: "ok",
        database: "ok",
        checkedAt: new Date().toISOString(),
      },
      { headers },
    );
  } catch (error) {
    logger.error({ err: error }, "health_check_falhou");

    return Response.json(
      {
        status: "indisponivel",
        database: "indisponivel",
        checkedAt: new Date().toISOString(),
      },
      { status: 503, headers },
    );
  }
}
