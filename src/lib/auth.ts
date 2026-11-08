import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { getPrismaClient } from "@/lib/prisma";

const secret = process.env.BETTER_AUTH_SECRET;
if (!secret) {
  throw new Error("BETTER_AUTH_SECRET is required for authentication.");
}

export const auth = betterAuth({
  appName: "Maviri",
  baseURL: process.env.BETTER_AUTH_URL ?? "http://localhost:3000",
  secret,
  database: prismaAdapter(getPrismaClient(), { provider: "postgresql" }),
  emailAndPassword: { enabled: true },
  session: { expiresIn: 60 * 60 * 24 * 30, updateAge: 60 * 60 * 24 },
  databaseHooks: {
    user: {
      create: {
        after: async (user) => {
          const stem = user.name.normalize("NFKD").toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "").slice(0, 14) || "anime_fan";
          await getPrismaClient().user.update({ where: { id: user.id }, data: { username: `${stem}_${user.id.slice(-8).toLowerCase()}` } });
        },
      },
    },
  },
});
