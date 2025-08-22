'use client';  // Mark this as a client component because of hooks and SessionProvider

import React from 'react';
import Navbar from '../../../components/Navbar';
import AuthProvider from '@/context/AuthProvider';
export default function Layout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <main className="font-work-sans">
      <AuthProvider>
        <Navbar />
        {children}
      </AuthProvider>
    </main>
  );
}
