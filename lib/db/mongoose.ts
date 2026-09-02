// usign a singleton connection so single connection handles all the requests

import mongoose from "mongoose";
const MONGODB_URI = process.env.MONGODB_URI as string;

if (!MONGODB_URI) {
    throw new Error("MONGODB_URI is not defined");
}

// global mongoose survies hot reloads
const cached = global as unknown as {
    conn: typeof import("mongoose") | null;
    promise: Promise<typeof import("mongoose")> | null;
};


async function connectDB() {
    if (cached.conn) return cached.conn;

    // connection in progress
    if (!cached.promise) {
        cached.promise = mongoose.connect(MONGODB_URI, {
            bufferCommands: false, // dont store commands and execute them later 
        });
    }
    cached.conn = await cached.promise;
    return cached.conn;
}

export default connectDB;