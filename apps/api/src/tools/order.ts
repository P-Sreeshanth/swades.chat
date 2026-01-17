import { tool } from 'ai';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';

export const orderTools = {
    fetchOrder: tool({
        description: 'Fetch order details by order ID',
        parameters: z.object({
            orderId: z.string().describe('The order ID to look up (e.g., ORD-001)')
        }),
        execute: async ({ orderId }) => {
            const order = await prisma.order.findUnique({
                where: { id: orderId }
            });

            if (!order) {
                return {
                    found: false,
                    message: `Order ${orderId} not found. Please check the order ID and try again.`
                };
            }

            return {
                found: true,
                order: {
                    id: order.id,
                    status: order.status,
                    items: JSON.parse(order.items as string),
                    total: order.total,
                    trackingNumber: order.trackingNumber,
                    estimatedDelivery: order.estimatedDelivery,
                    createdAt: order.createdAt
                }
            };
        }
    }),

    trackDelivery: tool({
        description: 'Track the delivery status of an order using its tracking number',
        parameters: z.object({
            trackingNumber: z.string().describe('The tracking number to look up')
        }),
        execute: async ({ trackingNumber }) => {
            const order = await prisma.order.findFirst({
                where: { trackingNumber }
            });

            if (!order) {
                return {
                    found: false,
                    message: `No order found with tracking number ${trackingNumber}.`
                };
            }

            const trackingEvents = [
                { date: '2026-01-15', time: '09:00', status: 'Package picked up from seller', location: 'Los Angeles, CA' },
                { date: '2026-01-16', time: '14:30', status: 'In transit to regional facility', location: 'Phoenix, AZ' },
                { date: '2026-01-17', time: '08:15', status: 'Arrived at regional distribution center', location: 'Denver, CO' },
                { date: '2026-01-17', time: '16:45', status: 'Out for delivery', location: 'Local Delivery Hub' }
            ];

            return {
                found: true,
                tracking: {
                    trackingNumber,
                    orderId: order.id,
                    currentStatus: order.status,
                    estimatedDelivery: order.estimatedDelivery,
                    events: trackingEvents
                }
            };
        }
    }),

    listOrders: tool({
        description: 'List all orders for a user',
        parameters: z.object({
            userId: z.string().describe('The user ID to list orders for'),
            status: z.enum(['shipped', 'processing', 'cancelled', 'delivered']).optional()
        }),
        execute: async ({ userId, status }) => {
            const orders = await prisma.order.findMany({
                where: {
                    userId,
                    ...(status && { status })
                },
                orderBy: { createdAt: 'desc' },
                take: 10
            });

            if (orders.length === 0) {
                return {
                    found: false,
                    message: 'No orders found matching the criteria.'
                };
            }

            return {
                found: true,
                orders: orders.map(order => ({
                    id: order.id,
                    status: order.status,
                    total: order.total,
                    itemCount: JSON.parse(order.items as string).length,
                    createdAt: order.createdAt
                }))
            };
        }
    })
};
