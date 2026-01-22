import 'dotenv/config';
import { z } from 'zod';

const envSchema = z.object({
    DATABASE_URL: z.string().url(),
    CLOUDINARY_CLOUD_NAME: z.string(),
    CLOUDINARY_API_KEY: z.string(),
    CLOUDINARY_API_SECRET: z.string(),
    ADMIN_USER: z.string().optional().default('admin'),
    ADMIN_PASSWORD: z.string().optional().default('M@p3s'),
    JWT_SECRET: z.string().min(16).optional().default('super-secret-key-change-this-in-production-long-key'),
    PORT: z.coerce.number().default(3001),
    FRONTEND_URL: z.string().optional().default('http://localhost:3000'),
    NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
    console.error('❌ Invalid environment variables:', parsed.error.format());
    process.exit(1);
}

if (!process.env.ADMIN_USER || !process.env.ADMIN_PASSWORD || !process.env.JWT_SECRET) {
    console.warn('⚠️ WARNING: Using default security credentials for Admin/JWT. Environment variables not found.');
}

export const env = parsed.data;
