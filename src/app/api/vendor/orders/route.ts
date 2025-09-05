import { NextResponse, NextRequest } from 'next/server'; // Import NextRequest
import { auth } from '@/auth';
import { prismaClient } from '@/lib/prisma';
import { OrderStatus } from '@/generated/prisma';

export async function GET(request: NextRequest) { // Use NextRequest to access searchParams
    try {
        const session = await auth();
        if (!session?.user?.id || session.user.role !== 'VENDOR') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        const userId = parseInt(session.user.id, 10);

        const vendor = await prismaClient.vendor.findUnique({ where: { userId } });
        if (!vendor) {
            return NextResponse.json({ error: 'Vendor profile not found.' }, { status: 404 });
        }

        // Read the status filter from the URL query
        const { searchParams } = new URL(request.url);
        const status = searchParams.get('status') as OrderStatus | null;

        // Build the Prisma query
        const whereClause: { vendorId: number; status?: OrderStatus } = {
            vendorId: vendor.id,
        };

        if (status && Object.values(OrderStatus).includes(status)) {
            whereClause.status = status;
        }

        const orders = await prismaClient.orders.findMany({
            where: whereClause,
            include: {
                user: {
                    select: {
                        name: true,
                    }
                },
                items: {
                    select: {
                        quantity: true,
                        price: true, // Price at the time of order
                        menuItem: { // Go one level deeper to get the item's name
                            select: {
                                name: true,
                            },
                        },
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });

        return NextResponse.json(orders, { status: 200 });

    } catch (error) {
        console.error("Failed to fetch vendor orders:", error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}