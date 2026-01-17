import { tool } from 'ai';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';

export const billingTools = {
    getInvoice: tool({
        description: 'Get invoice details by invoice ID or order ID',
        parameters: z.object({
            invoiceId: z.string().optional().describe('The invoice ID to look up'),
            orderId: z.string().optional().describe('The order ID to find associated invoice')
        }),
        execute: async ({ invoiceId, orderId }) => {
            let invoice;

            if (invoiceId) {
                invoice = await prisma.invoice.findUnique({
                    where: { id: invoiceId }
                });
            } else if (orderId) {
                invoice = await prisma.invoice.findFirst({
                    where: { orderId }
                });
            }

            if (!invoice) {
                return {
                    found: false,
                    message: 'Invoice not found. Please check the ID and try again.'
                };
            }

            return {
                found: true,
                invoice: {
                    id: invoice.id,
                    amount: invoice.amount,
                    status: invoice.status,
                    orderId: invoice.orderId,
                    dueDate: invoice.dueDate,
                    createdAt: invoice.createdAt
                }
            };
        }
    }),

    checkRefund: tool({
        description: 'Check refund status or eligibility for an order',
        parameters: z.object({
            orderId: z.string().describe('The order ID to check refund status for')
        }),
        execute: async ({ orderId }) => {
            const invoice = await prisma.invoice.findFirst({
                where: { orderId }
            });

            const order = await prisma.order.findUnique({
                where: { id: orderId }
            });

            if (!order) {
                return {
                    found: false,
                    message: `Order ${orderId} not found.`
                };
            }

            if (invoice?.status === 'refunded') {
                return {
                    found: true,
                    refundStatus: 'completed',
                    message: `Refund of $${invoice.amount} for order ${orderId} has been processed and should appear in your account within 5-7 business days.`
                };
            }

            if (order.status === 'cancelled') {
                return {
                    found: true,
                    refundStatus: 'processing',
                    message: `Your order ${orderId} has been cancelled. The refund is being processed.`,
                    eligibleAmount: order.total
                };
            }

            const orderDate = new Date(order.createdAt);
            const daysSinceOrder = Math.floor((Date.now() - orderDate.getTime()) / (1000 * 60 * 60 * 24));
            const isEligible = daysSinceOrder <= 30 && order.status !== 'processing';

            return {
                found: true,
                refundStatus: 'not_requested',
                eligible: isEligible,
                eligibleAmount: order.total,
                message: isEligible
                    ? `Order ${orderId} is eligible for a refund of $${order.total}. Would you like me to initiate the refund process?`
                    : `Order ${orderId} is not eligible for a refund. Orders must be returned within 30 days.`
            };
        }
    }),

    listInvoices: tool({
        description: 'List all invoices for a user',
        parameters: z.object({
            userId: z.string().describe('The user ID to list invoices for'),
            status: z.enum(['paid', 'pending', 'overdue', 'refunded']).optional()
        }),
        execute: async ({ userId, status }) => {
            const invoices = await prisma.invoice.findMany({
                where: {
                    userId,
                    ...(status && { status })
                },
                orderBy: { createdAt: 'desc' },
                take: 10
            });

            if (invoices.length === 0) {
                return {
                    found: false,
                    message: 'No invoices found matching the criteria.'
                };
            }

            return {
                found: true,
                invoices: invoices.map(inv => ({
                    id: inv.id,
                    amount: inv.amount,
                    status: inv.status,
                    orderId: inv.orderId,
                    dueDate: inv.dueDate
                }))
            };
        }
    }),

    initiateRefund: tool({
        description: 'Initiate a refund for an eligible order',
        parameters: z.object({
            orderId: z.string().describe('The order ID to refund'),
            reason: z.string().describe('Reason for the refund request')
        }),
        execute: async ({ orderId, reason }) => {
            const order = await prisma.order.findUnique({
                where: { id: orderId }
            });

            if (!order) {
                return {
                    success: false,
                    message: `Order ${orderId} not found.`
                };
            }

            await prisma.invoice.updateMany({
                where: { orderId },
                data: { status: 'refunded' }
            });

            return {
                success: true,
                refundId: `REF-${Date.now().toString(36).toUpperCase()}`,
                amount: order.total,
                message: `Refund of $${order.total} has been initiated for order ${orderId}. It will be credited to your original payment method within 5-7 business days.`
            };
        }
    })
};
