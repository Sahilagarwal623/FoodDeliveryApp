'use client';

import Link from "next/link";
import Image from "next/image";
import { useSession, signOut } from "next-auth/react";
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { UserIcon, LayoutGrid, LogOut, Building2, User, Truck, LogIn } from "lucide-react";
import Cart from "./Cart";

export default function Navbar() {
  const { data: session } = useSession();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Effect to close the dropdown when clicking outside of it
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownRef]);

  const getInitials = (name: string | null | undefined) => {
    return name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U';
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-sm">
      <nav className="container mx-auto flex h-20 items-center justify-between px-4">
        <Link href="/" className="transition-transform hover:scale-105">
          <Image src="/logo.png" alt="QuickBite Logo" width={100} height={40} priority />
        </Link>

        {/* This div now contains ALL items on the right side */}
        <div className="flex items-center gap-4">

          {session?.user ? (
            // --- LOGGED-IN USER VIEW ---
            <div className="flex items-center gap-4">

              {/* Show cart only for USER role */}
              {session.user.role === 'USER' && <Cart />}

              {/* Profile Avatar and Dropdown is now the last item */}
              <div className="relative" ref={dropdownRef}>
                <button onClick={() => setIsDropdownOpen(!isDropdownOpen)}>
                  <Avatar className="h-10 w-10 cursor-pointer border-2 border-transparent hover:border-primary transition-all">
                    <AvatarImage src={session.user.image ?? ''} alt={session.user.name ?? 'User'} />
                    <AvatarFallback>{getInitials(session.user.name)}</AvatarFallback>
                  </Avatar>
                </button>

                {isDropdownOpen && (
                  <div className="absolute right-0 top-full mt-2 w-56 origin-top-right rounded-xl border bg-background shadow-lg z-50">
                    <div className="p-2">
                      <div className="px-3 py-2">
                        <p className="font-semibold text-sm truncate">{session.user.name}</p>
                        <p className="text-xs text-muted-foreground truncate">{session.user.email}</p>
                      </div>
                      <div className="my-1 h-px bg-border"></div>
                      <Link href="/orders" onClick={() => setIsDropdownOpen(false)}>
                        <span className="flex cursor-pointer items-center gap-3 rounded-md px-3 py-2 text-sm hover:bg-muted">
                          <LayoutGrid className="h-4 w-4" /> My Orders
                        </span>
                      </Link>
                      {
                        session.user.role === 'USER' ? (
                          <Link href="/profile/user" onClick={() => setIsDropdownOpen(false)}>
                            <span className="flex cursor-pointer items-center gap-3 rounded-md px-3 py-2 text-sm hover:bg-muted">
                              <UserIcon className="h-4 w-4" /> My Profile
                            </span>
                          </Link>
                        ) : session.user.role === 'DELIVERY' ? (
                          <Link href="/profile/delivery" onClick={() => setIsDropdownOpen(false)}>
                            <span className="flex cursor-pointer items-center gap-3 rounded-md px-3 py-2 text-sm hover:bg-muted">
                              <UserIcon className="h-4 w-4" /> My Profile
                            </span>
                          </Link>
                        ) : (
                          <Link href="/profile/vendor" onClick={() => setIsDropdownOpen(false)}>
                            <span className="flex cursor-pointer items-center gap-3 rounded-md px-3 py-2 text-sm hover:bg-muted">
                              <UserIcon className="h-4 w-4" /> My Profile
                            </span>
                          </Link>
                        )
                      }
                      <button
                        onClick={() => signOut({ callbackUrl: "/" })}
                        className="flex w-full cursor-pointer items-center gap-3 rounded-md px-3 py-2 text-sm text-destructive hover:bg-destructive/10"
                      >
                        <LogOut className="h-4 w-4" /> Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            // --- LOGGED-OUT USER VIEW ---
            <div className="relative" ref={dropdownRef}>
              <Button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="bg-primary text-primary-foreground hover:bg-primary/90"
              >
                Sign In / Register
              </Button>
              {isDropdownOpen && (
                <div className="absolute right-0 top-full mt-2 w-56 origin-top-right rounded-xl border bg-background shadow-lg z-50">
                  <div className="p-2">
                    <div className="my-2 h-px bg-border"></div>
                    <div className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Create an Account
                    </div>
                    <Link href="/register/user" onClick={() => setIsDropdownOpen(false)}>
                      <span className="flex cursor-pointer items-center gap-3 rounded-md px-3 py-2 text-sm hover:bg-muted">
                        <User className="h-4 w-4" /> As a Customer
                      </span>
                    </Link>
                    <Link href="/register/vendor" onClick={() => setIsDropdownOpen(false)}>
                      <span className="flex cursor-pointer items-center gap-3 rounded-md px-3 py-2 text-sm hover:bg-muted">
                        <Building2 className="h-4 w-4" /> As a Vendor
                      </span>
                    </Link>
                    <Link href="/register/delivery" onClick={() => setIsDropdownOpen(false)}>
                      <span className="flex cursor-pointer items-center gap-3 rounded-md px-3 py-2 text-sm hover:bg-muted">
                        <Truck className="h-4 w-4" /> As a Delivery Partner
                      </span>
                    </Link>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </nav>
    </header>
  )
}