import 'dotenv/config';
import { z } from 'zod';

const schema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().min(1).max(65535).default(4000),
  DB_HOST: z.string().min(1).default('127.0.0.1'),
  DB_PORT: z.coerce.number().int().min(1).max(65535).default(3306),
  DB_USER: z.string().min(1).default('root'),
  DB_PASSWORD: z.string().default(''),
  DB_NAME: z.string().min(1).default('products_manager'),
  CORS_ORIGINS: z.string().default('http://localhost:5175,http://127.0.0.1:5175'),
});

const parsed = schema.safeParse(process.env);
if (!parsed.success) {
  throw new Error(`Invalid API configuration: ${parsed.error.issues.map((issue) => issue.path.join('.')).join(', ')}`);
}

export const env = parsed.data;
export const allowedOrigins = env.CORS_ORIGINS.split(',').map((origin) => origin.trim()).filter(Boolean);
