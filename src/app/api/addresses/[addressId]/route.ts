import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prismaClient } from '@/lib/prisma';

interface RouteParams {
    params: { addressId: string };
}

// PATCH /api/addresses/[addressId]
// Updates a specific address belonging to the logged-in user
export async function PATCH(request: Request, { params }: RouteParams) {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const userId = parseInt(session.user.id, 10);
    const addressId = parseInt(params.addressId, 10);

    const body = await request.json();

    try {
        const updatedAddress = await prismaClient.address.update({
            where: {
                id: addressId,
                userId: userId, // IMPORTANT: Ensures a user can only update their OWN address
            },
            data: body,
        });
        return NextResponse.json(updatedAddress);
    } catch (error) {
        // Prisma throws an error if the record to update is not found
        return NextResponse.json({ error: 'Address not found or you do not have permission to edit it.' }, { status: 404 });
    }
}

// DELETE /api/addresses/[addressId]
// Deletes a specific address belonging to the logged-in user
export async function DELETE(request: Request, { params }: RouteParams) {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const userId = parseInt(session.user.id, 10);
    const addressId = parseInt(params.addressId, 10);

    try {
        await prismaClient.address.delete({
            where: {
                id: addressId,
                userId: userId, // IMPORTANT: Ensures a user can only delete their OWN address
            },
        });
        return new NextResponse(null, { status: 204 }); // 204 No Content is a standard success response for DELETE
    } catch (error) {
        return NextResponse.json({ error: 'Address not found or you do not have permission to delete it.' }, { status: 404 });
    }
}