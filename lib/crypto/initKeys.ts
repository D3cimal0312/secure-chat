"use client";

import { generateKeyPair } from "./ecdh";
import { loadPrivateKey } from "./idb";

export async function initUserKeys(userId: string): Promise<void> {
    const res = await fetch(`/api/users/${userId}/publickey`);
    if (!res.ok) throw new Error("failed to fetch public key");

    const { publicKey } = await res.json();

    if (publicKey) {
        const privateKey = await loadPrivateKey();
        if (privateKey) return;
    }

    const newPublicKey = await generateKeyPair();
    const putRes = await fetch(`/api/users/${userId}/publickey`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ publicKey: newPublicKey }),
    });
    if (!putRes.ok) throw new Error("failed to upload public key");
}