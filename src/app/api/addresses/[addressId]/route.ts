import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prismaClient } from '@/lib/prisma';

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ addressId: string }> }  // 👈 Promise here
) {
  const { addressId } = await context.params; // 👈 await required

  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userId = parseInt(session.user.id, 10);
  const id = parseInt(addressId, 10);

  try {
    await prismaClient.address.delete({
      where: {
        id,
        userId,
      },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Address not found or you do not have permission to delete it.' },
      { status: 404 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ addressId: string }> }
) {
  const { addressId } = await context.params;

  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userId = parseInt(session.user.id, 10);
  const id = parseInt(addressId, 10);
  const body = await request.json();

  try {
    const updatedAddress = await prismaClient.address.update({
      where: { id, userId },
      data: body,
    });

    return NextResponse.json(updatedAddress);
  } catch {
    return NextResponse.json(
      { error: 'Address not found or you do not have permission to edit it.' },
      { status: 404 }
    );
  }
}

