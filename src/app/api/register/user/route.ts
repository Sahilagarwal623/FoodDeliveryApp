import { prismaClient } from '../../../lib/prisma';
import { hash } from 'bcryptjs';


export async function POST(request: Request) {

    const body = await request.json();
    const { name, email, password } = body;

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

    const newUser = await prismaClient.user.create({
        data: {
            name: name,
            email: email,
            password: hashedPassword,
        }
    });

    return new Response(JSON.stringify({ message: 'User registered successfully', user: newUser }), {
        status: 201,
    });
}