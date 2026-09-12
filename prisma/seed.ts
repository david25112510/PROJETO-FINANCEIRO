import { userService } from "@/services/auth/userService";
import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";

async function main() {
  const name = process.env.SEED_ADMIN_NAME?.trim() || "Administrador";
  const email = process.env.SEED_ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.SEED_ADMIN_PASSWORD;

  if (!email || !password) {
    throw new Error(
      "Defina SEED_ADMIN_EMAIL e SEED_ADMIN_PASSWORD antes de criar o usuário inicial.",
    );
  }

  if (password.length < 12) {
    throw new Error("SEED_ADMIN_PASSWORD deve ter ao menos 12 caracteres.");
  }

  const jaExiste = await prisma.user.findUnique({ where: { email } });
  if (jaExiste) {
    logger.info({ email }, "seed_usuario_ja_existe");
    return;
  }

  await userService.createUser({ name, email, password });
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
