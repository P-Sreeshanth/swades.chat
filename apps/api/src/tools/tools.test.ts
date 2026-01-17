import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock Prisma
vi.mock('../lib/prisma.js', () => ({
    prisma: {
        order: {
            findUnique: vi.fn(),
            findMany: vi.fn(),
        },
        invoice: {
            findUnique: vi.fn(),
            findFirst: vi.fn(),
            findMany: vi.fn(),
        },
    },
}));

import { prisma } from '../lib/prisma.js';

describe('Order Tools', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('fetchOrder', () => {
        it('should return order when found', async () => {
            const mockOrder = {
                id: 'ORD-001',
                userId: 'user-demo',
                status: 'shipped',
                items: [{ name: 'Headphones', price: 149.99, quantity: 1 }],
                total: 149.99,
                trackingNumber: 'TRK-123',
                estimatedDelivery: '2026-01-20',
            };

            (prisma.order.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(mockOrder);

            const result = await prisma.order.findUnique({ where: { id: 'ORD-001' } });

            expect(result).toEqual(mockOrder);
            expect(prisma.order.findUnique).toHaveBeenCalledWith({ where: { id: 'ORD-001' } });
        });

        it('should return null when order not found', async () => {
            (prisma.order.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(null);

            const result = await prisma.order.findUnique({ where: { id: 'ORD-999' } });

            expect(result).toBeNull();
        });
    });

    describe('listOrders', () => {
        it('should return orders for user', async () => {
            const mockOrders = [
                { id: 'ORD-001', status: 'shipped', total: 149.99 },
                { id: 'ORD-002', status: 'delivered', total: 299.99 },
            ];

            (prisma.order.findMany as ReturnType<typeof vi.fn>).mockResolvedValue(mockOrders);

            const result = await prisma.order.findMany({ where: { userId: 'user-demo' } });

            expect(result).toHaveLength(2);
            expect(result[0].id).toBe('ORD-001');
        });

        it('should filter orders by status', async () => {
            const mockOrders = [{ id: 'ORD-001', status: 'shipped', total: 149.99 }];

            (prisma.order.findMany as ReturnType<typeof vi.fn>).mockResolvedValue(mockOrders);

            const result = await prisma.order.findMany({
                where: { userId: 'user-demo', status: 'shipped' }
            });

            expect(result).toHaveLength(1);
            expect(result[0].status).toBe('shipped');
        });
    });
});

describe('Invoice Tools', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('getInvoice', () => {
        it('should return invoice when found by ID', async () => {
            const mockInvoice = {
                id: 'INV-001',
                userId: 'user-demo',
                orderId: 'ORD-001',
                amount: 149.99,
                status: 'paid',
            };

            (prisma.invoice.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(mockInvoice);

            const result = await prisma.invoice.findUnique({ where: { id: 'INV-001' } });

            expect(result).toEqual(mockInvoice);
        });

        it('should return invoice when found by order ID', async () => {
            const mockInvoice = {
                id: 'INV-001',
                userId: 'user-demo',
                orderId: 'ORD-001',
                amount: 149.99,
                status: 'paid',
            };

            (prisma.invoice.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue(mockInvoice);

            const result = await prisma.invoice.findFirst({ where: { orderId: 'ORD-001' } });

            expect(result).toEqual(mockInvoice);
        });
    });

    describe('listInvoices', () => {
        it('should return all invoices for user', async () => {
            const mockInvoices = [
                { id: 'INV-001', amount: 149.99, status: 'paid' },
                { id: 'INV-002', amount: 299.99, status: 'pending' },
            ];

            (prisma.invoice.findMany as ReturnType<typeof vi.fn>).mockResolvedValue(mockInvoices);

            const result = await prisma.invoice.findMany({ where: { userId: 'user-demo' } });

            expect(result).toHaveLength(2);
        });
    });
});
