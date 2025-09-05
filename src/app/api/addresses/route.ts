import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prismaClient } from '@/lib/prisma';

// GET /api/addresses
// Fetches all addresses for the logged-in user
export async function GET(request: Request) {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const userId = parseInt(session.user.id, 10);

    const addresses = await prismaClient.address.findMany({
        where: { userId: userId },
    });

    return NextResponse.json(addresses);
}

export async function POST(request: Request) {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const userId = parseInt(session.user.id, 10);

    const body = await request.json();
    // ✅ Destructure latitude and longitude from the body
    const { street, city, state, zipCode, phone, latitude, longitude } = body;

    if (!street || !city || !state || !zipCode || !phone) {
        return NextResponse.json({ error: 'All address fields are required' }, { status: 400 });
    }

    const newAddress = await prismaClient.address.create({
        data: {
            street, city, state, zipCode, phone, userId,
            latitude, // Save the coordinates
            longitude, // Save the coordinates
        },
    });

    return NextResponse.json(newAddress, { status: 201 });
}