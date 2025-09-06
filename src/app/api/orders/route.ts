import { prismaClient } from "@/lib/prisma";
import { auth } from "@/auth";
import { NextResponse } from "next/server";
import { simulateDriver } from '@/lib/route-simulator';


export async function POST(request: Request) {

    const session = await auth();

    const { addressId } = await request.json();

    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = parseInt(session.user.id, 10);

    const cartItems = await prismaClient.cartItem.findMany({
        where: {
            userId: userId,
        },
        include: {
            menuItem: true,
        }
    })

    if (cartItems.length === 0) {
        return NextResponse.json({ error: 'Cart is empty' }, { status: 400 });
    }

    const total = cartItems.reduce((acc, item) => acc + item.quantity * item.menuItem.price, 0);
    const vendorId = cartItems[0].menuItem.vendorId;

    try {

        const order = await prismaClient.$transaction(async (tx) => {

            const newOrder = await tx.orders.create({
                data: {
                    userId: userId,
                    vendorId: vendorId,
                    status: 'PENDING',
                    amount: total,
                    addressId: addressId,
                }
            });

            await tx.orderItem.createMany({
                data: cartItems.map((item) => ({
                    orderId: newOrder.id,
                    menuItemId: item.menuItemId,
                    quantity: item.quantity,
                    price: item.menuItem.price,
                })),
            });

            await tx.cartItem.deleteMany({
                where: {
                    userId: userId
                }
            });

            return newOrder;

        })

        // --- FETCH REAL ROUTE & START DYNAMIC SIMULATION ---
        console.log("route initialization starts");

        // 1. Fetch the vendor and address records to get their coordinates
        const vendor = await prismaClient.vendor.findUnique({
            where: { id: order.vendorId },
            include: { address: true }
        });
        const deliveryAddress = await prismaClient.address.findUnique({
            where: { id: order.addressId }
        });

        if (vendor?.address?.latitude && deliveryAddress?.latitude) {
            console.log("inside");

            const startLocation = `${vendor.address.latitude},${vendor.address.longitude}`;
            const endLocation = `${deliveryAddress.latitude},${deliveryAddress.longitude}`;

            // 2. Call the Google Maps Directions API
            const directionsUrl = `https://maps.googleapis.com/maps/api/directions/json?origin=${startLocation}&destination=${endLocation}&key=${process.env.GOOGLE_MAPS_SERVER_KEY}`;

            const directionsResponse = await fetch(directionsUrl);
            const directionsData = await directionsResponse.json();

            if (directionsData.status === 'OK' && directionsData.routes.length > 0) {
                console.log("Successfully fetched route from Google.");
                const encodedPolyline = directionsData.routes[0].overview_polyline.points;
                simulateDriver(order.id, encodedPolyline);
            } else {
                // This will now log the specific error from Google
                console.error("Google Directions API Error:", directionsData.status, directionsData.error_message);
            }
        }

        // --- END SIMULATION LOGIC ---

        return NextResponse.json({ message: 'Order created successfully!', orderId: order.id }, { status: 201 });

    } catch (error) {

        return NextResponse.json({ error: 'Failed to create Order' }, { status: 500 });

    }

}

export async function GET(request: Request) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        const userId = parseInt(session.user.id, 10);

        // Find all orders for the logged-in user
        const orders = await prismaClient.orders.findMany({
            where: {
                userId: userId,
            },
            // Include related data to show on the frontend
            include: {
                vendor: { // Get the restaurant's name
                    select: {
                        restaurantName: true,
                    },
                },
                items: { // Get the list of items in the order
                    include: {
                        menuItem: { // For each item, get its name
                            select: {
                                name: true,
                            },
                        },
                    },
                },
            },
            orderBy: {
                createdAt: 'desc', // Show the most recent orders first
            },
        });

        return NextResponse.json(orders, { status: 200 });

    } catch (error) {
        console.error("Failed to fetch orders:", error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

