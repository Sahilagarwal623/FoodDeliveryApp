import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prismaClient } from '@/lib/prisma';

// ✅ PATCH /api/addresses/[addressId]
export async function PATCH(
    request: Request,
    context: { params: { addressId: string } } // <-- FIX: Use context here
) {
    const { params } = context; // <-- FIX: Destructure params inside
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = parseInt(session.user.id, 10);
    const addressId =  parseInt(params.addressId, 10);
    const body = await request.json();

    try {
        const updatedAddress = await prismaClient.address.update({
            where: {
                id: addressId,
                userId: userId, // ensures user can update only their own address
            },
            data: body,
        });
        return NextResponse.json(updatedAddress);
    } catch (error) {
        return NextResponse.json(
            { error: 'Address not found or you do not have permission to edit it.' },
            { status: 404 }
        );
    }
}

// ✅ DELETE /api/addresses/[addressId]
export async function DELETE(
    request: Request,
    context: { params: { addressId: string } } // <-- FIX: Use context here
) {
    const { params } = context; // <-- FIX: Destructure params inside
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
                userId: userId, // ensures user can delete only their own address
            },
        });
        return new NextResponse(null, { status: 204 }); // 204 No Content
    } catch (error) {
        return NextResponse.json(
            { error: 'Address not found or you do not have permission to delete it.' },
            { status: 404 }
        );
    }
}