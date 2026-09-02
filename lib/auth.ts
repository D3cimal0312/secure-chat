import connectDB from "./db/mongoose";
import User from "./db/models/User";
import bcrypt from "bcryptjs";
import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
export const authOptions: NextAuthOptions = {
    providers: [CredentialsProvider({

        credentials: {
            email: {},
            password: {},
        },

        async authorize(credentials) {
            await connectDB()
            const user = await User.findOne({ email: credentials?.email }).select("+passwordHash")
            if (user && await bcrypt.compare(credentials?.password!, user.passwordHash)) {
                return { id: user._id.toString(), email: user.email, name: user.username }
            }
            return null
        }

    }
    )],

    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id
            }
            return token
        },
        async session({ session, token }) {

            if (session.user) {

                session.user.id = token.id as string

            }
            return session
        }
    },
    session: { strategy: "jwt" },
    pages: { signIn: "/login" },
} 
