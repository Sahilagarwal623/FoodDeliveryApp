// src/auth-client.ts
import { signIn as nextAuthSignIn, signOut as nextAuthSignOut } from "next-auth/react";

export const signIn = (provider: string, options?: any) => {
  return nextAuthSignIn(provider, options);
};

export const signOut = (options?: any) => {
  return nextAuthSignOut(options);
};
