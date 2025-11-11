import { prismaClient } from "@/lib/prisma";
import { NextResponse } from "next/server";


export async function GET(request: Request, context: any) {

    try {
    const restaurantIdInt = parseInt(context.params.restaurantId, 10);
        const vendor = await prismaClient.vendor.findUnique({
            where: {
                id: restaurantIdInt
            }
        })
        const menuItems = await prismaClient.menuItem.findMany({
            where: {
                vendorId: restaurantIdInt
            }
        })

        const data = {
            restaurant: {
                name: vendor?.restaurantName
            },
            menu: menuItems
        }
        return NextResponse.json(data, { status: 200 });

    } catch (error) {

        console.error(error);
        return NextResponse.json({ error: 'Unable to fetch Menu' }, { status: 500 });

    }

}