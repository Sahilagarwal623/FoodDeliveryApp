import { prismaClient } from "@/lib/prisma";
import { auth } from "@/auth";
import { NextResponse } from "next/server";


export async function POST(request: Request) {

    const session = await auth();

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

