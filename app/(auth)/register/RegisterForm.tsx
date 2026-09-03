"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterForm() {
    const router = useRouter();
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError("");
        setLoading(true);

        const res = await fetch("/api/auth/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, email, password }),
        });

        if (!res.ok) {
            const data = await res.json();
            setError(data.error ?? "Registration failed");
            setLoading(false);
            return;
        }


        await signIn("credentials", { redirect: false, email, password });
        router.push("/rooms");
    }

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
                <label className="text-sm font-medium ">
                    Username
                </label>
                <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    className="rounded-lg border  px-3 py-2 text-sm t outline-none focus:ring-2 "
                />
            </div>

            <div className="flex flex-col gap-1">
                <label className="text-sm font-medium ">
                    Email
                </label>
                <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="rounded-lg border px-3 py-2 text-sm t outline-none focus:ring-2 "
                />
            </div>

            <div className="flex flex-col gap-1">
                <label className="text-sm font-medium ">
                    Password
                </label>
                <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="rounded-lg border  px-3 py-2 text-sm  outline-none focus:ring-2 "
                />
            </div>

            {error && (
                <p className="text-sm">{error}</p>
            )}

            <button
                type="submit"
                disabled={loading}
                className="mt-2 rounded-lg  px-4 py-2 text-sm font-medium text-white disabled:opacity-50 transition-colors"
            >
                {loading ? "Creating account..." : "Create account"}
            </button>

            <p className="text-center text-sm text-zinc-500">
                Already have an account?{" "}
                <Link href="/login" className="font-medium  hover:underline">
                    Sign in
                </Link>
            </p>
        </form>
    );
}