import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { type GetServerSidePropsContext } from "next";
import {
  getServerSession,
  type DefaultSession,
  type NextAuthOptions,
} from "next-auth";
import { type Adapter } from "next-auth/adapters";

import CredentialsProvider from "next-auth/providers/credentials";
// import DiscordProvider from "next-auth/providers/discord";

import { eq } from 'drizzle-orm'

// import { env } from "~/env";
import { db } from "~/server/db";
import { pgTable, passwordToSalt } from "~/server/db/lib";
import { users } from "./db/schema";

/**
 * Module augmentation for `next-auth` types. Allows us to add custom properties to the `session`
 * object and keep type safety.
 *
 * @see https://next-auth.js.org/getting-started/typescript#module-augmentation
 */
declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string;
      email: string;
      // ...other properties
      // role: UserRole;
    } & DefaultSession["user"];
  }

  // interface User {
  //   // ...other properties
  //   // role: UserRole;
  // }
}

/**
 * Options for NextAuth.js used to configure adapters, providers, callbacks, etc.
 *
 * @see https://next-auth.js.org/configuration/options
 */
export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
  //   // strategy: "database",
  },
  callbacks: {
    session: ({ session, user, token }) => {
      // console.log("session", session)
      // console.log("user", user)
      console.log("token", token)

      return {
        ...session,
        user: {
          ...session.user,
          ...token,
          // id: user.id,
        },
      };
    }
    // session: ({ session, user, token }) => ({
    //   ...session,
    //   user: {
    //     ...session.user,
    //     id: user.id,
    //   },
    // }),
  },
  adapter: DrizzleAdapter(db, pgTable) as Adapter,
  providers: [
    CredentialsProvider({
      // The name to display on the sign in form (e.g. 'Sign in with...')
      name: "Credentials",
      // The credentials is used to generate a suitable form on the sign in page.
      // You can specify whatever fields you are expecting to be submitted.
      // e.g. domain, username, password, 2FA token, etc.
      credentials: {
        email: { label: "Email", type: "text", placeholder: "jsmith@kdm.rip" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials, req) {
        console.log('authorizing...', credentials)
        if (!credentials)
          return null;

        const saltedPassword = passwordToSalt(credentials.password);

        // Add logic here to look up the user from the credentials supplied
        // const user = { id: "15", name: "J Smith", email: "something" }
        const user = await db.query.users.findFirst({
          where: ({ email }, { eq }) => eq(email, credentials.email),
          columns: {
            id: true,
            password: true,
          }
        });
        // const user = await db.select({
        //   id: users.id,
        //   password: users.password,
        // })
        //   .from(users)
        //   .where(eq(users.email, credentials.email))
        //   .limit(1)[0] || undefined;

        if (!user) {
          // Create user
          const newUser = {
            id: "asdf",
            email: credentials.email,
            password: saltedPassword,
          }
          await db.insert(users).values(newUser);
          return { id: newUser.id };
        }

        if (user.password !== saltedPassword)
          return null;

        return { id: user.id };
      }
    }),

    // DiscordProvider({
    //   clientId: env.DISCORD_CLIENT_ID,
    //   clientSecret: env.DISCORD_CLIENT_SECRET,
    // }),
    /**
     * ...add more providers here.
     *
     * Most other providers require a bit more work than the Discord provider. For example, the
     * GitHub provider requires you to add the `refresh_token_expires_in` field to the Account
     * model. Refer to the NextAuth.js docs for the provider you want to use. Example:
     *
     * @see https://next-auth.js.org/providers/github
     */
  ],
};

/**
 * Wrapper for `getServerSession` so that you don't need to import the `authOptions` in every file.
 *
 * @see https://next-auth.js.org/configuration/nextjs
 */
export const getServerAuthSession = (ctx: {
  req: GetServerSidePropsContext["req"];
  res: GetServerSidePropsContext["res"];
}) => {
  return getServerSession(ctx.req, ctx.res, authOptions);
};
