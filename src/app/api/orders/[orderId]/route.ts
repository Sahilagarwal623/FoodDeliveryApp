import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prismaClient } from '@/lib/prisma';


// GET /api/orders/[orderId]
// Fetches a single order by its ID for the logged-in user
export async function GET(request: Request, context: any) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        const userId = parseInt(session.user.id, 10);
        const orderId = parseInt(context.params.orderId, 10);

        if (isNaN(orderId)) {
            return NextResponse.json({ error: 'Invalid Order ID' }, { status: 400 });
        }

        // Fetch the order. The `where` clause is critical for security.
        // It ensures a user can ONLY access their own orders.
        const order = await prismaClient.orders.findUnique({
            where: {
                id: orderId,
                userId: userId, // SECURITY: Ensures the order belongs to the logged-in user
            },
            include: {
                vendor: { select: { restaurantName: true } },
                items: {
                    include: {
                        menuItem: { select: { name: true, imageUrl: true } },
                    },
                },
            },
        });

        if (!order) {
            return NextResponse.json({ error: 'Order not found' }, { status: 404 });
        }

        return NextResponse.json(order, { status: 200 });

    } catch (error) {
        console.error("Failed to fetch order:", error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}