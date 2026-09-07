"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { useChatSocket } from "@/lib/useChatSocket";

interface Room {
    _id: string;
    name: string;
    participants: { _id: string; username: string }[];
}

export default function RoomChatPage() {
    const params = useParams<{ roomId: string }>();
    const roomId = params.roomId;
    const { data: session } = useSession();
    const userId = session?.user?.id ?? "";
    const [room, setRoom] = useState<Room | null>(null);
    const [text, setText] = useState("");

    useEffect(() => {
        if (!roomId) return;
        fetch("/api/rooms")
            .then((res) => res.json())
            .then((data) => {
                const found = (data.rooms ?? []).find(
                    (r: Room) => r._id === roomId
                );
                setRoom(found ?? null);
            })
            .catch(() => {});
    }, [roomId]);

    const otherParticipantIds = (room?.participants ?? [])
        .map((p) => p._id)
        .filter((id) => id !== userId);

    const { messages, onlineUsers, sendMessage } = useChatSocket(
        roomId,
        userId
    );

    function handleSend(e: React.FormEvent) {
        e.preventDefault();
        if (!text.trim()) return;
        sendMessage(text, otherParticipantIds);
        setText("");
    }

    if (!room) {
        return <div className="p-6">Loading...</div>;
    }

    return (
        <div className="flex flex-1 flex-col">
            <header className="border-b px-6 py-3 font-semibold">
                {room.name}
            </header>

            <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-3">
                {messages.map((msg) => (
                    <div
                        key={msg.id}
                        className={
                            msg.senderId === userId
                                ? "self-end text-white rounded-lg px-4 py-2"
                                : "self-start bg-zinc-100 rounded-lg px-4 py-2"
                        }
                    >
                        {msg.text}
                    </div>
                ))}
            </div>

            <form onSubmit={handleSend} className="border-t p-4 flex gap-2">
                <input
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="Type a message"
                    className="flex-1 rounded-lg border px-3 py-2 text-sm"
                />
                <button
                    type="submit"
                    className="rounded-lg text-white px-4 py-2 text-sm"
                >
                    Send
                </button>
            </form>
        </div>
    );
}