import { PrismaAdapter } from "@next-auth/prisma-adapter";
import type { PrismaClient } from "@prisma/client";
import { compare } from "bcryptjs";
import {
  getServerSession,
  type DefaultSession,
  type NextAuthOptions,
} from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { db } from "./db";

declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string;
      name?: string;
      email: string;
    };
  }
}

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
  },

  // Include user.id on session
  callbacks: {
    session({ session, token }) {
      if (session.user) {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        session.user.id = token.sub!;
      }
      return session;
    },
  },
  // Configure one or more authentication providers
  adapter: PrismaAdapter(db),
  providers: [
    CredentialsProvider({
      credentials: {
        email: {
          type: "email",
        },
        password: {
          type: "password",
        },
      },
      authorize: authorize(db),
    }),
  ],
};

function authorize(db: PrismaClient) {
  return async (
    credentials: Record<"email" | "password", string> | undefined,
  ) => {
    if (!credentials) {
      throw new Error("Missing credentials");
    }

    if (!credentials.email) {
      throw new Error('"email" is required in credentials');
    }

    if (!credentials.password) {
      throw new Error('"password" is required in credentials');
    }

    const maybeUser = await db.user.findFirst({
      where: {
        email: credentials.email,
      },
      select: {
        id: true,
        email: true,
        password: true,
      },
    });

    if (!maybeUser?.password) {
      return null;
    }

    const isValid = await compare(credentials.password, maybeUser.password);

    if (!isValid) {
      return null;
    }

    return {
      id: maybeUser.id,
      email: maybeUser.email,
    };
  };
}

export const getServerAuthSession = () => getServerSession(authOptions);
