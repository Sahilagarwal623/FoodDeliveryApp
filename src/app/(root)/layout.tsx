'use client';  // Mark this as a client component because of hooks and SessionProvider

import React from 'react';
import Navbar from '../../components/Navbar';
import { SessionProvider } from 'next-auth/react';

export default function Layout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <SessionProvider>
      <main className="font-work-sans">
        <Navbar />
        {children}
      </main>
    </SessionProvider>
  );
}
