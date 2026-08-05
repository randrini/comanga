import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().default("./data/comanga.db"),
  REDIS_HOST: z.string().default("localhost"),
  REDIS_PORT: z.coerce.number().default(6379),
  NEXTAUTH_SECRET: z.string().default("dev-secret-change-in-production"),
  NEXTAUTH_URL: z.string().url().default("http://localhost:3000"),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  ADMIN_USERNAME: z.string().optional(),
  ADMIN_PASSWORD: z.string().optional(),
});

export const env = envSchema.parse(process.env);
