import NextAuth from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import CredentialsProvider from "next-auth/providers/credentials"
import { prismaClient } from "./lib/prisma";
import { compare } from "bcryptjs";

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    GoogleProvider,
    CredentialsProvider({
      id: 'credentials',
      name: 'Credentials',
      credentials: {
        email: { label: "email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials: any): Promise<any> {

        const { email, password } = credentials;

        const user = await prismaClient.user.findUnique({
          where: {
            email: email,
          },
          select: {
            id: true,
            name: true,
            email: true,
            password: true,  // explicitly included
          }
        });

        if (!user) {
          throw new Error('No user found with the given credentials');
        }

        const isValid = await compare(password, user.password);

        if (!isValid) {
          throw new Error('Invalid password');
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
        };
      }
    })
  ],

  pages: {
    signIn: '/login',
  },

  session: {
    strategy: "jwt",
  },

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.name = user.name;
        token.email = user.email;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.name = token.name as string;
        session.user.email = token.email as string;
      }
      return session;
    }
  },
  secret: process.env.AUTH_SECRET,
})