import { prismaClient } from "@/lib/prisma";
import { NextResponse } from "next/server";


interface RouteParams {
    params: {
        restaurantId: string
    }
}
//     type MenuApiResponse = {
//   restaurant: {
//     name: string;
//   };
//   menu: MenuItem[];
// };

export async function GET(request: Request, { params }: RouteParams) {

    try {
        const { restaurantId } = await params
        const restaurantIdInt = parseInt(restaurantId, 10);
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