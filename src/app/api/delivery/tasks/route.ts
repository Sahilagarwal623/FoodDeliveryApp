import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prismaClient } from '@/lib/prisma';

export async function GET(request: Request) {
    const session = await auth();
    if (!session?.user?.id || session.user.role !== 'DELIVERY') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const userId = parseInt(session.user.id, 10);

    const deliveryMan = await prismaClient.deliveryMan.findUnique({ where: { userId } });
    if (!deliveryMan) {
        return NextResponse.json({ error: 'Delivery profile not found' }, { status: 404 });
    }

    // Fetch orders assigned to this driver OR pending orders without an assigned driver
    const tasks = await prismaClient.orders.findMany({
        where: {
            OR: [
                { deliveryManId: deliveryMan.id, status: 'OUT_FOR_DELIVERY' },
                { status: 'PENDING', deliveryManId: null } // Find available jobs
            ]
        },
        include: {
            user: { select: { name: true } },
            address: true,
            vendor: { select: { restaurantName: true, address: true } }
        },
        orderBy: { createdAt: 'asc' }
    });

    return NextResponse.json(tasks);
}