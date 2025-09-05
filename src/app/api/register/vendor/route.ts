import {prismaClient} from '../../../../lib/prisma';
import {hash} from 'bcryptjs';
import { NextResponse } from 'next/server';


export async function POST(request: Request) {
    try {
        const { name, email, password, restaurantName, restaurantId, address } = await request.json();

        // --- Basic Validation ---
        if (!name || !email || !password || !restaurantName || !restaurantId || !address) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }
        
        // --- Check for Existing User/Restaurant ---
        const existingUser = await prismaClient.user.findUnique({ where: { email } });
        if (existingUser) {
            return NextResponse.json({ error: 'User with this email already exists' }, { status: 409 });
        }
        const existingVendor = await prismaClient.vendor.findUnique({ where: { restaurantId } });
        if (existingVendor) {
            return NextResponse.json({ error: 'This Restaurant ID is already taken' }, { status: 409 });
        }

        const hashedPassword = await hash(password, 12);

        // --- Create Records in a Transaction ---
        // Using a transaction ensures that if any step fails, all previous steps are rolled back.
        await prismaClient.$transaction(async (tx) => {
            // 1. Create the User
            const newUser = await tx.user.create({
                data: {
                    name,
                    email,
                    password: hashedPassword,
                    role: 'VENDOR',
                },
            });

            // 2. Create the Address, linking it to the new User
            const newAddress = await tx.address.create({
                data: {
                    street: address.street,
                    city: address.city,
                    state: address.state,
                    zipCode: address.zipCode,
                    phone: address.phone,
                    latitude: address.latitude,
                    longitude: address.longitude,
                    userId: newUser.id,
                },
            });

            // 3. Create the Vendor, linking it to the User and the Address
            await tx.vendor.create({
                data: {
                    restaurantName,
                    restaurantId,
                    userId: newUser.id,
                    addressId: newAddress.id,
                },
            });
        });

        return NextResponse.json({ message: 'Vendor registered successfully!' }, { status: 201 });

    } catch (error) {
        console.error("Vendor Registration Error:", error);
        return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 });
    }
}