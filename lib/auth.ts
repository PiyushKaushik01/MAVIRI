// lib/auth.ts
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "@/lib/prisma";
import { BrevoClient } from "@getbrevo/brevo";

const brevo = new BrevoClient({ apiKey: process.env.BREVO_API_KEY! });

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true, // <-- This is what was missing
    disableSignUp: false, // <-- Explicitly allow new signups
    requireEmailVerification: true,
  },
  emailVerification: {
    sendOnSignUp: true,
    sendVerificationEmail: async ({ user, url }) => {
      console.log(`[Brevo] Attempting to send email to: ${user.email}`);
      try {
        await brevo.transactionalEmails.sendTransacEmail({
          sender: { name: "Maviri", email: "maviridev@gmail.com" }, // Make sure this is verified in Brevo
          to: [{ email: user.email, name: user.name || "Trainer" }],
          subject: "Verify your Maviri email",
          htmlContent: `
            <html>
              <body>
                <h2>Welcome to Maviri, ${user.name || "Trainer"}!</h2>
                <p>Click the link below to verify your email address:</p>
                <a href="${url}">Verify Email</a>
              </body>
            </html>
          `,
        });
        console.log(`[Brevo] Success sending email to: ${user.email}`);
      } catch (error) {
        console.error("[Brevo] FAILED to send email:", error);
      }
    },
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    },
    discord: {
      clientId: process.env.DISCORD_CLIENT_ID!,
      clientSecret: process.env.DISCORD_CLIENT_SECRET!,
    },
  },
});