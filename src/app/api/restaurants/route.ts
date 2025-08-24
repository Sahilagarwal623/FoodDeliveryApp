import { auth } from "@/auth";
import { prismaClient } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(request: Request) {

    try {

        const vendor = await prismaClient.vendor.findMany({
            select: {
                id: true,
                restaurantName: true,
                imageUrl: true,
                rating: true,
                priceRange: true,
            }
        });

        if (!vendor) {
            return NextResponse.json({ error: 'No vendor found' }, { status: 401 })
        }

        return NextResponse.json(vendor, { status: 200 })

    } catch (error) {
        console.error("Failed to fetch menu items:", error);

        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}