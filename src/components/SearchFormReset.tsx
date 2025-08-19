'use client'

import React from 'react'
import Link from 'next/link'
import {X} from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function SearchFormReset() {

    const reset = () => {
        const form = document.querySelector('.search-form') as HTMLFormElement;
        if (form) {
            form.reset();
        }
    }

    return (
        <Button
            type='reset'
            onClick={reset}
            className="bg-black hover:bg-red-600 text-white px-3 py-1 rounded-full transition"
        >
            <Link href='/' className="text-white font-bold text-lg">
                <X className="w-6 h-6" />
            </Link>
        </Button>
    )
}
