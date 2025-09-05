import { prismaClient } from "@/lib/prisma";
import { auth } from "@/auth";
import { NextResponse } from "next/server";


export async function GET(request: Request) {

    try {

        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
        }
        const userId = parseInt(session.user.id, 10);

        const cartData = await prismaClient.cartItem.findMany({
            where: { userId: userId },
            select: {
                quantity: true,
                menuItem: {
                    select: {
                        id: true,
                        name: true,
                        price: true,
                    },
                },
            },
        });

        const formattedData = cartData.map((item) => ({

            ...item.menuItem,
            quantity: item.quantity

        }))

        return NextResponse.json(formattedData, { status: 200 });

    } catch (error) {

        console.error(error);
        return NextResponse.json({ error: 'internal server error' }, { status: 500 });

    }
}

export async function POST(request: Request) {

    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        const userId = parseInt(session.user.id, 10);
        const { menuItemId, quantity } = await request.json();

        const updatedCartItem = await prismaClient.cartItem.upsert({
            where: { userId_menuItemId: { userId, menuItemId } },
            update: { quantity: { increment: quantity } },
            create: { userId, menuItemId, quantity },
        });

        if (updatedCartItem.quantity <= 0) {
            await prismaClient.cartItem.delete({ where: { id: updatedCartItem.id } });
        }

        return NextResponse.json(updatedCartItem, { status: 200 });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'internal server error' }, { status: 500 });

    }
}

export async function DELETE(request: Request) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        const userId = parseInt(session.user.id, 10);

        await prismaClient.cartItem.deleteMany({
            where: {
                userId: userId,
            },
        });

        return NextResponse.json({ message: 'Cart cleared successfully' }, { status: 200 });

    } catch (error) {
        console.error("Failed to clear cart:", error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}