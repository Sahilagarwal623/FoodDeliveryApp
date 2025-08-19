import React, { use } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { auth, signOut, signIn } from "@/auth";

export default async function Navbar() {

    const session = await auth();

    return (
        <header className='px-5 py-3 bg-white shadow-sm font-work-sans'>
            <nav className='flex justify-between items-center'>
                <Link href="/">
                    <Image src="/logo.png" alt="Logo" width={144} height={30} />
                </Link>
                <div className='flex items-center gap-5 text-black'>
                    {session && session?.user ? (
                        <>
                            <Link href="/startup/create">
                                <span>Create</span>
                            </Link>
                            <form
                                action={async () => {
                                    "use server";
                                    await signOut({ redirectTo: '/'});
                                }}
                            >
                                <button type="submit" className='cursor-pointer bg-red-500 text-white px-4 py-2 rounded-md'>
                                    <span>Logout</span>
                                </button>
                            </form>

                            <Link href={`/user/${session?.user?.id}`}>
                                <span>{session?.user?.name}</span>
                            </Link>
                        </>
                    ) : (
                        <form action={async () => {
                            "use server";

                            await signIn('google')
                        }}>
                            <button type='submit' className='cursor-pointer bg-blue-500 text-white px-4 py-2 rounded-md'>
                                Login
                            </button>
                        </form>
                    )}
                </div>
            </nav>

        </header >
    )
}
