export const runtime = "nodejs"; // Forza il runtime su Node.js
export const preferredRegion = "auto"; // (Opzionale per Vercel)

import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import Nodemailer from "next-auth/providers/nodemailer";
import CredentialsProvider from "next-auth/providers/credentials";

import prisma from "./db"


export const authOptions = {
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async session({ session, token }) {
      // Aggiungi user.id alla sessione
      if (token?.id) {
        session.user.id = token.id;
      }
      return session;
    },
    async jwt({ token, user }) {
      // Aggiungi user.id al token JWT
      if (user) {
        token.id = user.id;
      }
      return token;
    },
  },
  providers: [
    Nodemailer({
      id: "mail",
      name: "mail",
      service: "Outlook365",
      tls: {
        ciphers:'SSLv3',
        rejectUnauthorized: false 
      },
      server:"smtp://info@xpylon.com:P1l1$$0!12$@smtp.office365.com:587",
      from: "Pianificato <info@xpylon.com>",
    }),
    CredentialsProvider({
      id: "whatsapp",
      name: "WhatsApp",
      credentials: {
        phone: { label: "Phone", type: "text" },
        code: { label: "Code", type: "text" }
      },
      async authorize(credentials, req) {
        const phone = credentials?.phone;
        const code = credentials?.code;

        if (!phone || !code) return null;

        const client = require('twilio')(
          process.env.TWILIO_SID,
          process.env.TWILIO_AUTH_TOKEN
        );

        const verification = await client.verify.v2.services(process.env.TWILIO_VERIFY_SERVICE_SID)
          .verificationChecks
          .create({ to: `whatsapp:${phone}`, code });

        if (verification.status !== "approved") return null;

      
        const users = await prisma.user.findMany({
          where: { phone: phone }
        });

        var user = null;
        //se users non non nullo o vuoto prendo il priimo
        if (users && users.length > 0) {
          user = users[0];
        }

        if (!user) {
          return await prisma.user.create({
            data: {
              name: "Not Set",
              phone: phone,
              email: phone + "@mailnotset.xpylon",
            },
          });
        }
        return user;
      }
    }),
  ],
  //debug: true, // Aggiunge log per il debug
};

export const { handlers, signIn, signOut, auth } = NextAuth(authOptions);