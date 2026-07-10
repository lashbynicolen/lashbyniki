import "dotenv/config"
import path from "node:path"
import { defineConfig, env } from "prisma/config"

export default defineConfig({
  schema: path.join("prisma", "schema.prisma"),
  migrations: {
    path: path.join("prisma", "migrations"),
  },
  // Use the direct (unpooled) connection for CLI tasks like db push / migrate.
  datasource: {
    url: env("DATABASE_URL_UNPOOLED"),
  },
})
