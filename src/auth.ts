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
            role: true,
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
          role: user.role
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
    async jwt({ token, user, account, profile }) {
      // When user signs in with Google
      if (account?.provider === "google" && user?.email) {
        // Check if user exists in DB
        let existingUser = await prismaClient.user.findUnique({
          where: { email: user.email },
        });

        // If not, create one
        if (!existingUser) {
          existingUser = await prismaClient.user.create({
            data: {
              name: user.name || "",
              email: user.email,
              image: user.image || "",
              role: "USER", // default role
            },
          });
        }

        // Sync DB info into token
        token.id = existingUser.id;
        token.name = existingUser.name;
        token.email = existingUser.email;
        token.role = existingUser.role;
      }

      // When using credentials provider
      if (user && account?.provider === "credentials") {
        token.id = user.id;
        token.name = user.name;
        token.email = user.email;
        token.role = user.role;
      }

      return token;
    },

    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.name = token.name as string;
        session.user.email = token.email as string;
        session.user.role = token.role as string;
      }
      return session;
    },
  },
  secret: process.env.AUTH_SECRET,
})