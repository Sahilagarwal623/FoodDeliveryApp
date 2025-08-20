"use client"

import Link from "next/link"
import Image from "next/image"
import { useSession, signOut } from "next-auth/react"
import { useState } from "react"

export default function Navbar() {
  const { data: session } = useSession()
  const [showDropdown, setShowDropdown] = useState(false)

  return (
    <header className="px-10 py-0 bg-gradient-to-r from-slate-50 to-white border-b border-slate-200 font-sans">
      <nav className="flex justify-between items-center mx-auto">
        <Link href="/" className="transition-transform hover:scale-105">
          <Image src="/logo.png" alt="Logo" width={200} height={200} className="h-20 w-auto" />
        </Link>

        <div className="flex items-center gap-6 relative">
          {session && session.user ? (
            <div className="flex items-center gap-4">
              <span className="text-slate-700 font-medium text-sm">Welcome, {session.user.name}</span>

              <button
                onClick={() => signOut({ redirect: true, redirectTo: "/" })}
                className="bg-slate-600 hover:bg-slate-700 text-white px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 hover:shadow-md"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <div className="relative">
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 text-white px-6 py-2.5 rounded-lg font-medium text-sm transition-all duration-200 hover:shadow-lg transform hover:-translate-y-0.5"
              >
                Get Started
              </button>

              {showDropdown && (
                <div className="absolute right-0 top-full mt-2 bg-white border border-slate-200 shadow-xl rounded-xl overflow-hidden w-48 z-50 animate-in slide-in-from-top-2 duration-200">
                  <div className="py-2">
                    <div className="px-4 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wide border-b border-slate-100">
                      Join as
                    </div>
                    <Link href="/register/user">
                      <span className="block px-4 py-3 text-slate-700 hover:bg-blue-50 hover:text-blue-700 cursor-pointer transition-colors duration-150 font-medium">
                        👤 User
                      </span>
                    </Link>
                    <Link href="/register/vendor">
                      <span className="block px-4 py-3 text-slate-700 hover:bg-blue-50 hover:text-blue-700 cursor-pointer transition-colors duration-150 font-medium">
                        🏪 Vendor
                      </span>
                    </Link>
                    <Link href="/register/delivery">
                      <span className="block px-4 py-3 text-slate-700 hover:bg-blue-50 hover:text-blue-700 cursor-pointer transition-colors duration-150 font-medium">
                        🚚 Delivery Partner
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
