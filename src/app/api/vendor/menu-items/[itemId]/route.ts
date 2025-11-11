import { auth } from "@/auth";
import { prismaClient } from "@/lib/prisma";
import { NextResponse, NextRequest } from "next/server";

// PATCH: Update menu item
export async function PATCH(
    request: NextRequest,
    context: any
) {
    try {
        const session = await auth();
        if (!session?.user?.id || session.user.role !== 'VENDOR') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const userId = parseInt(session.user.id, 10);
        const itemId = parseInt(context.params.itemId, 10);

        if (isNaN(itemId)) {
            return NextResponse.json({ error: 'Invalid item ID' }, { status: 400 });
        }

        // Verify vendor exists
        const vendor = await prismaClient.vendor.findUnique({
            where: { userId }
        });

        if (!vendor) {
            return NextResponse.json({ error: 'Vendor profile not found.' }, { status: 404 });
        }

        // Verify menu item belongs to this vendor
        const menuItem = await prismaClient.menuItem.findUnique({
            where: { id: itemId }
        });

        if (!menuItem) {
            return NextResponse.json({ error: 'Menu item not found.' }, { status: 404 });
        }

        if (menuItem.vendorId !== vendor.id) {
            return NextResponse.json({ error: 'Unauthorized. This item belongs to another vendor.' }, { status: 403 });
        }

        const body = await request.json();
        const { name, description, price, imageUrl, category, isAvailable } = body;

        // Build update data with only provided fields
        const updateData: any = {};
        if (name !== undefined) updateData.name = name;
        if (description !== undefined) updateData.description = description;
        if (price !== undefined) updateData.price = price;
        if (imageUrl !== undefined) updateData.imageUrl = imageUrl;
        if (category !== undefined) updateData.category = category;
        if (isAvailable !== undefined) updateData.isAvailable = isAvailable;

        if (Object.keys(updateData).length === 0) {
            return NextResponse.json({ error: 'No fields to update.' }, { status: 400 });
        }

        const updatedItem = await prismaClient.menuItem.update({
            where: { id: itemId },
            data: updateData
        });

        return NextResponse.json(updatedItem, { status: 200 });

    } catch (error) {
        console.error("Failed to update menu item:", error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

// DELETE: Delete menu item
export async function DELETE(
    request: NextRequest,
    context: any
) {
    try {
        const session = await auth();
        if (!session?.user?.id || session.user.role !== 'VENDOR') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const userId = parseInt(session.user.id, 10);
        const itemId = parseInt(context.params.itemId, 10);

        if (isNaN(itemId)) {
            return NextResponse.json({ error: 'Invalid item ID' }, { status: 400 });
        }

        // Verify vendor exists
        const vendor = await prismaClient.vendor.findUnique({
            where: { userId }
        });

        if (!vendor) {
            return NextResponse.json({ error: 'Vendor profile not found.' }, { status: 404 });
        }

        // Verify menu item belongs to this vendor
        const menuItem = await prismaClient.menuItem.findUnique({
            where: { id: itemId },
            include: { cartItem: true }
        });

        if (!menuItem) {
            return NextResponse.json({ error: 'Menu item not found.' }, { status: 404 });
        }

        if (menuItem.vendorId !== vendor.id) {
            return NextResponse.json({ error: 'Unauthorized. This item belongs to another vendor.' }, { status: 403 });
        }

        // Delete cart items first (due to foreign key constraints)
        if (menuItem.cartItem.length > 0) {
            await prismaClient.cartItem.deleteMany({
                where: { menuItemId: itemId }
            });
        }

        // Delete order items
        await prismaClient.orderItem.deleteMany({
            where: { menuItemId: itemId }
        });

        // Delete the menu item
        const deletedItem = await prismaClient.menuItem.delete({
            where: { id: itemId }
        });

        return NextResponse.json(
            { message: 'Menu item deleted successfully', item: deletedItem },
            { status: 200 }
        );

    } catch (error) {
        console.error("Failed to delete menu item:", error);
        if ((error as any).code === 'P2025') {
            return NextResponse.json({ error: 'Menu item not found.' }, { status: 404 });
        }
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
