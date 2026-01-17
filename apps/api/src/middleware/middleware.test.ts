import { describe, it, expect } from 'vitest';
import { Hono } from 'hono';
import { rateLimiter, errorHandler, AppError } from './index.js';

describe('Middleware', () => {
    describe('rateLimiter', () => {
        it('should allow requests under the limit', async () => {
            const app = new Hono();
            app.use('*', rateLimiter);
            app.get('/test', (c) => c.json({ ok: true }));

            const res = await app.request('/test', {
                headers: { 'x-forwarded-for': '192.168.1.1' }
            });

            expect(res.status).toBe(200);
            expect(res.headers.get('X-RateLimit-Limit')).toBe('30');
        });

        it('should include rate limit headers', async () => {
            const app = new Hono();
            app.use('*', rateLimiter);
            app.get('/test', (c) => c.json({ ok: true }));

            const res = await app.request('/test', {
                headers: { 'x-forwarded-for': '192.168.1.2' }
            });

            expect(res.headers.get('X-RateLimit-Limit')).toBeTruthy();
            expect(res.headers.get('X-RateLimit-Remaining')).toBeTruthy();
        });
    });

    describe('errorHandler', () => {
        it('should handle AppError with custom status', async () => {
            const app = new Hono();
            app.get('/error', () => {
                throw new AppError(404, 'Not found', 'NOT_FOUND');
            });
            app.onError(errorHandler);

            const res = await app.request('/error');
            const body = await res.json();

            expect(res.status).toBe(404);
            expect(body.success).toBe(false);
            expect(body.error.code).toBe('NOT_FOUND');
        });

        it('should handle generic errors as 500', async () => {
            const app = new Hono();
            app.get('/error', () => {
                throw new Error('Something went wrong');
            });
            app.onError(errorHandler);

            const res = await app.request('/error');
            const body = await res.json();

            expect(res.status).toBe(500);
            expect(body.error.code).toBe('INTERNAL_ERROR');
        });
    });

    describe('AppError', () => {
        it('should create error with status code and message', () => {
            const error = new AppError(400, 'Bad request', 'BAD_REQUEST');

            expect(error.statusCode).toBe(400);
            expect(error.message).toBe('Bad request');
            expect(error.code).toBe('BAD_REQUEST');
            expect(error.name).toBe('AppError');
        });
    });
});
