import { auth } from "@/auth";
import { prismaClient } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(request: Request) {

    try {

        const session = await auth();

        if (!session?.user?.id || session.user.role !== 'VENDOR') {
            return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
        }

        const userId = parseInt(session.user.id, 10);

        const vendor = await prismaClient.vendor.findUnique({
            where: {
                userId: userId,
            }
        })

        if (!vendor) {
            return NextResponse.json({ error: 'No vendor found' }, { status: 401 })
        }
        const menuItems = await prismaClient.menuItem.findMany({
            where: {
                vendorId: vendor.id
            },
            orderBy: {
                category: 'asc'
            }
        })

        return NextResponse.json(menuItems, { status: 200 })

    } catch (error) {
        console.error("Failed to fetch menu items:", error);

        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const session = await auth();
        if (!session?.user?.id || session.user.role !== 'VENDOR') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const userId = parseInt(session.user.id, 10);

        const vendor = await prismaClient.vendor.findUnique({
            where: {
                userId: userId,
            },
        });

        if (!vendor) {
            return NextResponse.json({ error: 'Vendor profile not found.' }, { status: 404 });
        }

        const body = await request.json();
        const { name, description, price, imageUrl, category, isAvailable } = body;

        if (!name || !description || price == null || !category) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const newMenuItem = await prismaClient.menuItem.create({
            data: {
                name,
                description,
                price,
                imageUrl,
                category,
                isAvailable,
                vendorId: vendor.id,
            },
        });

        return NextResponse.json(newMenuItem, { status: 201 });

    } catch (error) {
        console.error("Failed to create menu item:", error);
        if ((error as any).code === 'P2003') {
            return NextResponse.json({ error: 'Foreign key constraint failed.' }, { status: 400 });
        }
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}