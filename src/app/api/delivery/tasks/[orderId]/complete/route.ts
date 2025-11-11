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
  useTLS: true,
});

// PATCH /api/delivery/tasks/[orderId]/complete
// Marks an assigned order as DELIVERED
export async function PATCH(request: Request, context: any) {
  try {
    // 1️⃣ Authenticate and ensure the user is a delivery person
    const session = await auth();
    if (!session?.user?.id || session.user.role !== 'DELIVERY') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = parseInt(session.user.id, 10);
    const orderId = parseInt(context.params.orderId, 10);

    if (isNaN(orderId)) {
      return NextResponse.json({ error: 'Invalid Order ID' }, { status: 400 });
    }

    // 2️⃣ Find the delivery person's own record
    const deliveryMan = await prismaClient.deliveryMan.findUnique({
      where: { userId },
    });

    if (!deliveryMan) {
      return NextResponse.json({ error: 'Delivery profile not found.' }, { status: 404 });
    }

    // 3️⃣ Update the order status (only if assigned to this delivery person)
    const updatedOrder = await prismaClient.orders.update({
      where: {
        id: orderId,
        deliveryManId: deliveryMan.id,
      },
      data: {
        status: 'DELIVERED',
      },
    });

    // 4️⃣ Notify customer in real-time via Pusher
    await pusher.trigger(`order-${orderId}`, 'status-update', {
      status: 'DELIVERED',
    });

    return NextResponse.json(updatedOrder, { status: 200 });

  } catch (error) {
    console.error(`Failed to mark order as delivered:`, error);
    return NextResponse.json(
      {
        error:
          'Failed to update order. It may not exist or is not assigned to you.',
      },
      { status: 500 },
    );
  }
}
