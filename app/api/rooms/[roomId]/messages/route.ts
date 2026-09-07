import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/db/mongoose";
import Room from "@/lib/db/models/Room";
import Message from "@/lib/db/models/Message";
import { Types } from 'mongoose';

// get messages from room
export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ roomId: string }> }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        }
        const { roomId } = await params;
        await connectDB();

        const room = await Room.findOne({ _id: roomId, participants: session.user.id });
        if (!room) {
            return NextResponse.json({ error: "Room not found or unauthorized access" }, { status: 404 });
        }

        const searchParams = req.nextUrl.searchParams;
        const limit = Math.min(parseInt(searchParams.get("limit") || "20"), 100);

        const before = searchParams.get("before");

        const query: Record<string, unknown> = { room: roomId };

        if (before) {
            if (!Types.ObjectId.isValid(before)) {
                return NextResponse.json({ error: "invalid " }, { status: 400 });
            }

            query._id = { $lt: new Types.ObjectId(before) };
        }

        const messages = await Message.find(query)
            .sort({ _id: -1 })
            .limit(limit)
            .populate("sender", "username email")
            .lean();

        messages.reverse();

        return NextResponse.json({ messages });

    }

    catch (error) {
        console.log(error)
        return NextResponse.json({ error: "internal server error" }, { status: 500 });
    }
}

export async function POST(req: NextRequest,
    { params }: { params: Promise<{ roomId: string }> }) {

    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: "unauthorized" }, { status: 401 });
        }

        const { roomId } = await params;

        await connectDB();

        const room = await Room.findOne({
            _id: roomId,
            participants: session.user.id,
        });

        if (!room) {
            return NextResponse.json({ error: "Room not found or unauthorized access" }, { status: 404 });
        }

        const { ciphertext, iv } = await req.json();

        const { body, envelopes } = await req.json();

        if (!body?.ciphertext || !body?.iv || !Array.isArray(envelopes) || envelopes.length === 0) {
            return NextResponse.json({ error: "body and envelopes are required" }, { status: 400 });
        }

        const message = new Message({
            room: roomId,
            sender: session.user.id,
            body,
            envelopes,
        })

        await message.save();

        await message.populate("sender", "username");

        return NextResponse.json({ message }, { status: 201 });

    } catch (error) {
        console.log(error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }

}