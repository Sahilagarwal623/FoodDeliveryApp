import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prismaClient } from '@/lib/prisma';

// GET /api/profile/delivery
// Fetches the combined User and DeliveryMan profile
export async function GET(request: Request) {
    const session = await auth();
    if (!session?.user?.id || session.user.role !== 'DELIVERY') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const userId = parseInt(session.user.id, 10);

    // Fetch the user and include their related deliveryMan data
    const userProfile = await prismaClient.user.findUnique({
        where: { id: userId },
        select: {
            name: true,
            email: true,
            phone: true,
            deliveryMan: { // Include the nested deliveryMan details
                select: {
                    isAvailable: true,
                    vehicleType: true,
                    vehicleNumber: true,
                }
            }
        },
    });

    if (!userProfile) {
        return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    return NextResponse.json(userProfile);
}

// PATCH /api/profile/delivery
// Updates the Delivery Person's profile
export async function PATCH(request: Request) {
    const session = await auth();
    if (!session?.user?.id || session.user.role !== 'DELIVERY') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const userId = parseInt(session.user.id, 10);

    try {
        const body = await request.json();
        const { name, phone, isAvailable, vehicleType, vehicleNumber } = body;

        // Use a transaction to update both User and DeliveryMan tables safely
        const updatedUser = await prismaClient.$transaction(async (tx) => {
            // 1. Update the User model
            const user = await tx.user.update({
                where: { id: userId },
                data: { name, phone },
            });

            // 2. Update the DeliveryMan model
            await tx.deliveryMan.update({
                where: { userId: userId },
                data: { isAvailable, vehicleType, vehicleNumber },
            });

            return user;
        });

        return NextResponse.json({ message: "Profile updated successfully" });

    } catch (error) {
        console.error("Delivery profile update error:", error);
        return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
    }
}