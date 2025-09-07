import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prismaClient } from '@/lib/prisma';

// GET /api/profile/vendor
// Fetches the combined User, Vendor, and Address profile
export async function GET(request: Request) {
    const session = await auth();
    if (!session?.user?.id || session.user.role !== 'VENDOR') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const userId = parseInt(session.user.id, 10);

    const vendorProfile = await prismaClient.vendor.findUnique({
        where: { userId: userId },
        select: {
            restaurantName: true,
            restaurantId: true,
            imageUrl: true,
            priceRange: true,
            rating: true,
            user: {
                select: {
                    name: true,
                    email: true,
                    phone: true,
                    createdAt: true,
                }
            },
            address: true
        },
    });

    if (!vendorProfile) {
        return NextResponse.json({ error: 'Vendor profile not found' }, { status: 404 });
    }

    return NextResponse.json(vendorProfile);
}

// PATCH /api/profile/vendor
// Updates the Vendor's profile information
export async function PATCH(request: Request) {
    const session = await auth();
    if (!session?.user?.id || session.user.role !== 'VENDOR') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const userId = parseInt(session.user.id, 10);

    try {
        const body = await request.json();
        // Separate data for each model
        const { name, phone } = body.user;
        const { restaurantName, imageUrl, priceRange } = body.vendor;
        const { street, city, state, zipCode, addressPhone } = body.address;

        const vendor = await prismaClient.vendor.findUnique({ where: { userId } });
        if (!vendor) {
            return NextResponse.json({ error: 'Vendor not found' }, { status: 404 });
        }

        // Use a transaction to update all related tables
        await prismaClient.$transaction([
            // 1. Update User model
            prismaClient.user.update({
                where: { id: userId },
                data: { name, phone },
            }),
            // 2. Update Vendor model
            prismaClient.vendor.update({
                where: { userId: userId },
                data: { restaurantName, imageUrl, priceRange },
            }),
            // 3. Update Address model
            prismaClient.address.update({
                where: { id: vendor.addressId! }, // Use the addressId from the vendor record
                data: {
                    street: street,
                    city: city,
                    state: state,
                    zipCode: zipCode,
                    phone: addressPhone,
                },
            }),
        ]);

        return NextResponse.json({ message: "Profile updated successfully" });

    } catch (error) {
        console.error("Vendor profile update error:", error);
        return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
    }
}