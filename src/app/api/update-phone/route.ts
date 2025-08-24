import { auth } from '@/auth';
import { prismaClient } from '@/lib/prisma';
import { NextResponse } from 'next/server';

// ✅ PATCH function: ONLY for updating data
export async function PATCH(request: Request) {
    try {
        const session = await auth();
        console.log(session);
        
        if (!session?.user?.id) {
            console.log("this runs");
            
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const userId = parseInt(session.user.id, 10);

        // Read the body here, in the PATCH function
        const { phone } = await request.json();

        if (!phone || typeof phone !== 'string') {
            return NextResponse.json({ error: 'Phone number is required' }, { status: 400 });
        }
        console.log(typeof(userId));
        
        console.log(userId);

        console.log(typeof(phone));
        console.log(phone);
        
        
        const updatedUser = await prismaClient.user.update({
            where: { id: userId },
            data: { phone: phone },
        });

        const { password, ...safeUser } = updatedUser;
        return NextResponse.json(safeUser, { status: 200 });

    } catch (error) {

        console.log(error);
        throw new Error('Error during update phone')
        
    }
}