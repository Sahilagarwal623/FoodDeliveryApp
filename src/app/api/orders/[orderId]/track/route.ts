import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prismaClient } from '@/lib/prisma';

// Define the shape of the parameters object for clarity
interface RouteContext {
    params: {
        orderId: string;
    }
}

// GET /api/orders/[orderId]/track
// Fetches the necessary location data for a specific order to display on a map.
export async function GET(request: Request, { params }: RouteContext) {
    try {
        // 1. Authenticate the user session
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const userId = parseInt(session.user.id, 10);
        const { orderId: orderIdString } = await params;
        const orderId = parseInt(orderIdString, 10);

        if (isNaN(orderId)) {
            return NextResponse.json({ error: 'Invalid Order ID' }, { status: 400 });
        }

        // 2. Fetch the order from the database.
        // SECURITY: The 'where' clause ensures a user can ONLY access their own orders.
        const order = await prismaClient.orders.findUnique({
            where: {
                id: orderId,
                userId: userId,
            },
            // 3. Select only the data needed for the tracking page
            select: {
                status: true,
                vendor: {
                    select: {
                        restaurantName: true,
                        address: {
                            select: {
                                latitude: true,
                                longitude: true,
                            }
                        }
                    },
                },
                address: {
                    select: {
                        street: true,
                        latitude: true,
                        longitude: true,
                    },
                },
                deliveryMan: {
                    select: {
                        latitude: true,
                        longitude: true,
                    },
                },
            },
        });

        // 4. Handle cases where the order is not found
        if (!order) {
            return NextResponse.json({ error: 'Order not found or you do not have permission to view it.' }, { status: 404 });
        }

        // 5. Return the fetched data
        return NextResponse.json(order, { status: 200 });

    } catch (error) {
        console.error("Failed to fetch order tracking data:", error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}