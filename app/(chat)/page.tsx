"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface Room {
    _id: string;
    name: string;
    participants: { _id: string; username: string }[];
}

export default function RoomsPage() {
    const router = useRouter();
    const [rooms, setRooms] = useState<Room[]>([]);
    const [name, setName] = useState("");
    const [participant, setParticipant] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        fetch("/api/rooms")
            .then((res) => res.json())
            .then((data) => setRooms(data.rooms ?? []))
            .catch(() => setError("Failed to load rooms"));
    }, []);

    async function handleCreate(e: React.FormEvent) {
        e.preventDefault();
        setError("");
        setLoading(true);

        const participantIds = participant
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean);

        const res = await fetch("/api/rooms", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, participants: participantIds }),
        });

        setLoading(false);

        if (!res.ok) {
            const data = await res.json();
            setError(data.error ?? "Failed to create room");
            return;
        }

        const data = await res.json();
        router.push(`/rooms/${data.room._id}`);
    }

    return (
        <div className="p-6 flex-1 overflow-y-auto">
            <h1 className="text-2xl font-semibold mb-6">Rooms</h1>

            <form onSubmit={handleCreate} className="mb-8 flex flex-col gap-3">
                <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Room name"
                    required
                    className="rounded-lg border px-3 py-2 text-sm"
                />
                <input
                    value={participant}
                    onChange={(e) => setParticipant(e.target.value)}
                    placeholder="Participant user IDs (comma separated)"
                    required
                    className="rounded-lg border px-3 py-2 text-sm"
                />
                <button
                    type="submit"
                    disabled={loading}
                    className="rounded-lg text-white px-4 py-2 text-sm "
                >
                    {loading ? "Creating..." : "Create room"}
                </button>
                {error && <p className="text-sm text-red-600">{error}</p>}
            </form>

            <ul className="flex flex-col gap-2">
                {rooms.map((room) => (
                    <li key={room._id}>
                        <button
                            onClick={() => router.push(`/rooms/${room._id}`)}
                            className="w-full text-left rounded-lg border px-4 py-3 "
                        >
                            {room.name}
                        </button>
                    </li>
                ))}
            </ul>
        </div>
    );
}