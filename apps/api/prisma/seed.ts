import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Seeding database...');

    await prisma.order.createMany({
        data: [
            {
                id: 'ORD-001',
                userId: 'user-demo',
                status: 'shipped',
                items: JSON.stringify([
                    { name: 'Wireless Headphones', quantity: 1, price: 149.99 },
                    { name: 'Phone Case', quantity: 2, price: 24.99 }
                ]),
                total: 199.97,
                trackingNumber: 'TRK-9876543210',
                estimatedDelivery: '2026-01-20'
            },
            {
                id: 'ORD-002',
                userId: 'user-demo',
                status: 'processing',
                items: JSON.stringify([
                    { name: 'Mechanical Keyboard', quantity: 1, price: 189.99 }
                ]),
                total: 189.99,
                trackingNumber: null,
                estimatedDelivery: '2026-01-25'
            },
            {
                id: 'ORD-003',
                userId: 'user-demo',
                status: 'delivered',
                items: JSON.stringify([
                    { name: 'USB-C Hub', quantity: 1, price: 79.99 },
                    { name: 'HDMI Cable', quantity: 3, price: 15.99 }
                ]),
                total: 127.96,
                trackingNumber: 'TRK-1234567890',
                estimatedDelivery: '2026-01-10'
            },
            {
                id: 'ORD-004',
                userId: 'user-demo',
                status: 'cancelled',
                items: JSON.stringify([
                    { name: 'Gaming Mouse', quantity: 1, price: 69.99 }
                ]),
                total: 69.99,
                trackingNumber: null,
                estimatedDelivery: null
            }
        ],
        skipDuplicates: true
    });

    await prisma.invoice.createMany({
        data: [
            {
                id: 'INV-001',
                userId: 'user-demo',
                amount: 199.97,
                status: 'paid',
                orderId: 'ORD-001',
                dueDate: new Date('2026-01-15')
            },
            {
                id: 'INV-002',
                userId: 'user-demo',
                amount: 189.99,
                status: 'pending',
                orderId: 'ORD-002',
                dueDate: new Date('2026-02-01')
            },
            {
                id: 'INV-003',
                userId: 'user-demo',
                amount: 127.96,
                status: 'paid',
                orderId: 'ORD-003',
                dueDate: new Date('2026-01-05')
            },
            {
                id: 'INV-004',
                userId: 'user-demo',
                amount: 69.99,
                status: 'refunded',
                orderId: 'ORD-004',
                dueDate: new Date('2026-01-20')
            },
            {
                id: 'INV-005',
                userId: 'user-demo',
                amount: 299.99,
                status: 'overdue',
                orderId: 'ORD-005',
                dueDate: new Date('2026-01-01')
            }
        ],
        skipDuplicates: true
    });

    console.log('Database seeded successfully!');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
