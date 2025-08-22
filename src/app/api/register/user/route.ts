import { prismaClient } from '../../../../lib/prisma';
import { hash } from 'bcryptjs';
import { encrypt } from '@/lib/encrypt';


export async function POST(request: Request) {

    const body = await request.json();
    const { name, email, password, phone } = body;

    if (!name || !email || !password) {

        return new Response(JSON.stringify({ message: 'Missig required fields' }), {
            status: 400,
        })

    }

    const existingUser = await prismaClient.user.findUnique({
        where: {
            email: email,
        }
    });

    if (existingUser) {
        return new Response(JSON.stringify({ message: 'User already exists' }), {
            status: 400,
        });
    }

    const hashedPassword = await hash(password, 10);
    let hashedPhone = null;

    if (phone) {
        hashedPhone = encrypt(phone);
    }

    const newUser = await prismaClient.user.create({
        data: {
            name: name,
            email: email,
            password: hashedPassword,
            ...(hashedPhone && { phone: hashedPhone }),
        }
    });

    return new Response(JSON.stringify({
        message: 'User registered successfully', user: {
            name: newUser.name,
            email: newUser.email,
            id: newUser.id,
        }
    }), {
        status: 201,
    });
}