import { defineConfig, env } from "prisma/config";
import { config as loadEnv } from "dotenv";
import { existsSync } from "node:fs";
import { resolve } from "node:path";

const envFiles = [".env.local", ".env"];

for (const file of envFiles) {
  const path = resolve(process.cwd(), file);
  if (existsSync(path)) {
    loadEnv({ path });
    break;
  }
}

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  engine: "classic",
  datasource: {
    url: env("DATABASE_URL"),
  },
});
