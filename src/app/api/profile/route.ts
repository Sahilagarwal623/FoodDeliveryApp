import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prismaClient } from '@/lib/prisma';

// GET /api/profile
// Fetches the profile AND addresses of the currently logged-in user
export async function GET(request: Request) {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const userId = parseInt(session.user.id, 10);

    const user = await prismaClient.user.findUnique({
        where: { id: userId },
        // ✅ Include the related addresses in the response
        select: {
            name: true,
            email: true,
            phone: true,
            createdAt: true, // For the "Joined" date
            addresses: true, // Include the full address list
        },
    });

    if (!user) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json(user);
}

// PATCH /api/profile
// Updates ONLY the user's direct information (name, phone). Address is handled by its own API.
export async function PATCH(request: Request) {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const userId = parseInt(session.user.id, 10);

    try {
        const body = await request.json();
        const { name, phone } = body; // We only handle name and phone here

        const updatedUser = await prismaClient.user.update({
            where: { id: userId },
            data: {
                name: name,
                phone: phone,
                // Do NOT update email, bio, or location string here
            },
        });

        const { password, ...safeUser } = updatedUser;
        return NextResponse.json(safeUser);

    } catch (error) {
        console.error("Profile update error:", error);
        return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
    }
}