// next-auth.d.ts

import NextAuth, { type DefaultSession } from "next-auth";
import { JWT } from "next-auth/jwt";

declare module "next-auth" {
  /**
   * Extends the built-in `Session` type to add the `role` property.
   */
  interface Session {
    user: {
      role?: string; // Add your custom property here
    } & DefaultSession["user"];
  }

  /**
   * Extends the built-in `User` type.
   */
  interface User {
    role?: string;
  }
}

declare module "next-auth/jwt" {
  /**
   * Extends the built-in `JWT` type.
   */
  interface JWT {
    role?: string;
  }
}