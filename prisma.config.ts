import "dotenv/config";
import { defineConfig, env } from "prisma/config";

const databaseUrl = process.env.DIRECT_URL ?? env("DATABASE_URL");

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    // Em produção, DIRECT_URL mantém as migrações fora do pool de conexões.
    // No desenvolvimento local, DATABASE_URL continua sendo suficiente.
    url: databaseUrl,
  },
});
