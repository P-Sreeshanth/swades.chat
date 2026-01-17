import { Context, Next } from 'hono';

export class AppError extends Error {
    constructor(
        public statusCode: number,
        public message: string,
        public code?: string
    ) {
        super(message);
        this.name = 'AppError';
    }
}

export function errorHandler(err: Error, c: Context) {
    console.error('[Error]', err);

    if (err instanceof AppError) {
        return c.json({
            success: false,
            error: {
                code: err.code || 'ERROR',
                message: err.message
            }
        }, err.statusCode as 400 | 401 | 403 | 404 | 500);
    }

    return c.json({
        success: false,
        error: {
            code: 'INTERNAL_ERROR',
            message: 'An unexpected error occurred'
        }
    }, 500);
}

const requestCounts = new Map<string, { count: number; resetTime: number }>();

export async function rateLimiter(c: Context, next: Next) {
    const ip = c.req.header('x-forwarded-for') || c.req.header('x-real-ip') || 'unknown';
    const now = Date.now();
    const windowMs = 60 * 1000;
    const maxRequests = 30;

    const record = requestCounts.get(ip);

    if (!record || now > record.resetTime) {
        requestCounts.set(ip, { count: 1, resetTime: now + windowMs });
    } else if (record.count >= maxRequests) {
        return c.json({
            success: false,
            error: {
                code: 'RATE_LIMITED',
                message: 'Too many requests. Please wait before trying again.'
            }
        }, 429);
    } else {
        record.count++;
    }

    c.header('X-RateLimit-Limit', String(maxRequests));
    c.header('X-RateLimit-Remaining', String(maxRequests - (requestCounts.get(ip)?.count || 0)));

    await next();
}

export async function requestLogger(c: Context, next: Next) {
    const start = Date.now();
    await next();
    const ms = Date.now() - start;
    console.log(`[${c.req.method}] ${c.req.path} - ${c.res.status} (${ms}ms)`);
}
