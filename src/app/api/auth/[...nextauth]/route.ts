// app/api/auth/[...nextauth]/route.ts
import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { checkWalletAuth } from "@/lib/db/query/authdb";
import { verifyMessage } from "viem";
import { getStoredNonce } from "../nonce/route";


const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: "Ethereum Wallet",
      credentials: {
        address: { label: "Wallet Address", type: "text", placeholder: "0x..." },
        signature: { label: "Signature", type: "text" },
        nonce: { label: "Nonce", type: "text" },
      },
      async authorize(credentials) {
        try {
          if (!credentials?.address || !credentials?.signature || !credentials?.nonce) {
            return null;
          }

          const storedNonce = getStoredNonce(credentials.nonce as string);
          if (!storedNonce) {
            console.error("Invalid or expired nonce");
            return null;
          }

          if (Date.now() > storedNonce.expiresAt) {
            console.error("Nonce expired");
            return null;
          }

          const registertext = await checkWalletAuth(credentials.address);
          if (!registertext) {
            console.error("Failed to load register");
            return null;
          }

   

          const user = registertext;
          if (!user) {
            return null;
          }

          const message = `Login to Oneblock\nNonce: ${credentials.nonce}\nTimestamp: ${storedNonce.issuedAt}`;
          const isValidSignature = await verifyMessage({
            address: credentials.address as `0x${string}`,
            message,
            signature: credentials.signature as `0x${string}`,
          });

          if (!isValidSignature) {
            return null;
          }

          if (user.success === true) {
            return {
              id: user.id!,
              name:user.name!,
              address: credentials.address,
              status: "approved",
              role: user.role ?? "user"
            };
          }

          return null;
        } catch (error) {
          console.error("Authentication error:", error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    jwt: async ({ token, user }) => {
      if (user && "address" in user && "status" in user) {
        token.id=user.id as string;
        token.name=user.name as string;
        token.address = user.address as string;
        token.status = user.status as string;
        token.role=user.role as string;
      }
      return token;
    },
    session: async ({ session, token }) => {
      if (session.user) {
        const user = session.user as unknown as { id:string; name:string; address: string;role:string; status: string };
        user.id=token.id as string;
        user.name=token.name as string;
        user.address = token.address as string;
        user.status = token.status as string;
        user.role =token.role as string;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
});

export { handler as GET, handler as POST }; 