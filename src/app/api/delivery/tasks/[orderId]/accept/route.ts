import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prismaClient } from '@/lib/prisma';
import { simulateDriver } from '@/lib/route-simulator';
import Pusher from 'pusher';

const pusher = new Pusher({
    appId: process.env.PUSHER_APP_ID!,
    key: process.env.PUSHER_KEY!,
    secret: process.env.PUSHER_SECRET!,
    cluster: process.env.PUSHER_CLUSTER!,
    useTLS: true
});

export async function PATCH(request: Request, context: any) {
    const session = await auth();

    if (!session?.user?.id || session.user.role !== 'DELIVERY') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = parseInt(session.user.id, 10);
    const orderId = parseInt(context.params.orderId, 10);

    try {
        const deliveryMan = await prismaClient.deliveryMan.findUnique({ where: { userId } });
        if (!deliveryMan) {
            return NextResponse.json({ error: 'Delivery profile not found' }, { status: 404 });
        }

        // 1️⃣ Fetch the order and related vendor/address
        const orderToAccept = await prismaClient.orders.findFirst({
            where: { id: orderId, status: 'PENDING', deliveryManId: null },
            include: { vendor: { include: { address: true } }, address: true }
        });

        if (!orderToAccept) {
            return NextResponse.json({ error: 'Order is no longer available to accept.' }, { status: 409 });
        }

        // 2️⃣ Assign the order to the delivery man
        await prismaClient.orders.update({
            where: { id: orderId },
            data: {
                deliveryManId: deliveryMan.id,
                status: 'OUT_FOR_DELIVERY'
            }
        });

        // 3️⃣ Notify clients via Pusher
        await pusher.trigger(`order-${orderId}`, 'status-update', {
            status: 'OUT_FOR_DELIVERY'
        });

        // 4️⃣ Simulate driver movement using Google Directions API
        const vendorAddress = orderToAccept.vendor.address;
        const userAddress = orderToAccept.address;

        if (vendorAddress?.latitude && userAddress?.latitude) {
            const startLocation = `${vendorAddress.latitude},${vendorAddress.longitude}`;
            const endLocation = `${userAddress.latitude},${userAddress.longitude}`;

            const directionsUrl = `https://maps.googleapis.com/maps/api/directions/json?origin=${startLocation}&destination=${endLocation}&key=${process.env.GOOGLE_MAPS_SERVER_KEY}`;
            const directionsResponse = await fetch(directionsUrl);
            const directionsData = await directionsResponse.json();

            if (directionsData.status === 'OK') {
                const encodedPolyline = directionsData.routes[0].overview_polyline.points;
                simulateDriver(orderId, encodedPolyline); // Fire-and-forget simulation
            }
        }

        return NextResponse.json({ message: 'Order accepted successfully' });

    } catch (error) {
        console.error(`Error accepting order ${context.params?.orderId}:`, error);
        return NextResponse.json({ error: 'Failed to accept order' }, { status: 500 });
    }
}
