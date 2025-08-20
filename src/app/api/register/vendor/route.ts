import {prismaClient} from '../../../../lib/prisma';
import {hash} from 'bcryptjs';


export async function POST(request: Request) {

    const {name, email, password, restrauntName, restrauntId} = await request.json();

    if (!name || !email || !password || !restrauntName || !restrauntId) {

        return new Response(JSON.stringify({message: 'Missing required fields'}), {
            status: 400,
        });

    }

    const existingVendor = await prismaClient.user.findUnique({
        where: {
            email: email,
        }
    });

    if (existingVendor) {
        return new Response(JSON.stringify({message: 'Account already exists with this Email'}), {
            status: 400,
        });
    }

    const hashedPassword = await hash(password, 10);

    const newUser = await prismaClient.user.create({
        data: {
            name: name,
            email: email,
            password: hashedPassword,
            role: 'VENDOR',
            vendor: {
                create: {
                    restaurantName: restrauntName,
                    restaurantId: restrauntId,
                }
            }
        }
    });

    return new Response(JSON.stringify({id: newUser.id, name: newUser.name, email: newUser.email}), {
        status: 201,
    });

}