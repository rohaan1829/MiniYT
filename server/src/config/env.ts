import { z } from 'zod';
import dotenv from 'dotenv';

dotenv.config();

const envSchema = z.object({
    NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
    PORT: z.string().default('4000'),
    DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
    REDIS_URL: z.string().min(1, 'REDIS_URL is required'),
    JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters'),
    FRONTEND_URL: z.string().default('http://localhost:3000'),
    AWS_ACCESS_KEY_ID: z.string().min(1, 'AWS_ACCESS_KEY_ID is required'),
    AWS_SECRET_ACCESS_KEY: z.string().min(1, 'AWS_SECRET_ACCESS_KEY is required'),
    AWS_REGION: z.string().min(1, 'AWS_REGION is required'),
    AWS_S3_BUCKET: z.string().min(1, 'AWS_S3_BUCKET is required'),
});

const parseEnv = () => {
    try {
        const parsed = envSchema.parse(process.env);
        return parsed;
    } catch (error) {
        if (error instanceof z.ZodError) {
            console.error('❌ Environment validation failed:');
            error.errors.forEach((err) => {
                console.error(`  - ${err.path.join('.')}: ${err.message}`);
            });
            process.exit(1);
        }
        throw error;
    }
};

const env = parseEnv();

export const config = {
    nodeEnv: env.NODE_ENV,
    port: parseInt(env.PORT, 10),
    databaseUrl: env.DATABASE_URL,
    redisUrl: env.REDIS_URL,
    jwtSecret: env.JWT_SECRET,
    frontendUrl: env.FRONTEND_URL.split(',').map(url => url.trim()),
    aws: {
        accessKeyId: env.AWS_ACCESS_KEY_ID,
        secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
        region: env.AWS_REGION,
        bucket: env.AWS_S3_BUCKET,
    },
};
