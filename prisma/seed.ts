import { userService } from "@/services/auth/userService";
import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";

async function main() {
  const email = process.env.SEED_ADMIN_EMAIL ?? "admin@financeops.local";
  const password = process.env.SEED_ADMIN_PASSWORD ?? "TrocarSenha123!";

  const jaExiste = await prisma.user.findUnique({ where: { email } });
  if (jaExiste) {
    logger.info({ email }, "seed_usuario_ja_existe");
    return;
  }

  await userService.createUser({ name: "Administrador", email, password });
  logger.info({ email }, "seed_usuario_criado");
}

main()
  .catch((error) => {
    logger.error({ err: error }, "seed_falhou");
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
