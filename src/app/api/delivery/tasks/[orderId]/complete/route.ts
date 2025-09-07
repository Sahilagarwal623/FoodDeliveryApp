import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prismaClient } from '@/lib/prisma';
import Pusher from 'pusher';

// Initialize the Pusher server client
const pusher = new Pusher({
    appId: process.env.PUSHER_APP_ID!,
    key: process.env.PUSHER_KEY!,
    secret: process.env.PUSHER_SECRET!,
    cluster: process.env.PUSHER_CLUSTER!,
    useTLS: true
});

interface RouteContext {
    params: { orderId: string };
}

// PATCH /api/delivery/tasks/[orderId]/complete
// Marks an assigned order as DELIVERED
export async function PATCH(request: Request, { params }: RouteContext) {
    try {
        // 1. Authenticate and ensure the user is a delivery person
        const session = await auth();
        if (!session?.user?.id || session.user.role !== 'DELIVERY') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const userId = parseInt(session.user.id, 10);
        const orderId = parseInt(params.orderId, 10);

        if (isNaN(orderId)) {
            return NextResponse.json({ error: 'Invalid Order ID' }, { status: 400 });
        }

        // Find the delivery person's own record
        const deliveryMan = await prismaClient.deliveryMan.findUnique({
            where: { userId: userId },
        });

        if (!deliveryMan) {
            return NextResponse.json({ error: 'Delivery profile not found.' }, { status: 404 });
        }

        // 2. Update the order status.
        // SECURITY: The `where` clause is critical. It ensures a delivery person can ONLY update
        // an order that is currently assigned to them.
        const updatedOrder = await prismaClient.orders.update({
            where: {
                id: orderId,
                deliveryManId: deliveryMan.id
            },
            data: {
                status: 'DELIVERED',
            },
        });

        // 3. Trigger a Pusher event to notify the customer in real-time
        await pusher.trigger(`order-${orderId}`, 'status-update', {
            status: 'DELIVERED',
        });

        return NextResponse.json(updatedOrder, { status: 200 });

    } catch (error) {
        console.error(`Failed to mark order ${params.orderId} as delivered:`, error);
        // Prisma will throw an error if the record is not found, which we can catch here.
        return NextResponse.json({ error: 'Failed to update order. It may not exist or is not assigned to you.' }, { status: 500 });
    }
}