"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { getSocket } from "./socket";
import type { ChatMessage } from "@/types/socket";
import { loadPrivateKey } from "./crypto/idb";
import { encrypt, decrypt } from "./crypto/aes";
import { deriveSharedSecret } from "./crypto/ecdh";
import { generateMessageKey, buildEnvelope, openEnvelope } from "./crypto/envelope";

interface DecryptedMessage extends ChatMessage {
  text: string;
}

export function useChatSocket(roomId: string, userId: string) {
  const [messages, setMessages] = useState<DecryptedMessage[]>([]);
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);

  const secretsRef = useRef<Map<string, CryptoKey>>(new Map());

  const fetchPublicKey = useCallback(async (peerId: string) => {
    const res = await fetch(`/api/users/${peerId}/publickey`);
    if (!res.ok) throw new Error("could not fetch peer public key");

    const data = await res.json();

    return data.publicKey as string;
  }, []);

  const getSharedSecret = useCallback(
    async (peerPublicKey: string) => {
      const cached = secretsRef.current.get(peerPublicKey);
      if (cached) return cached;

      const privateKey = await loadPrivateKey();

      if (!privateKey) throw new Error("private key not found in indexedDB");

      const secret = await deriveSharedSecret(privateKey, peerPublicKey);

      secretsRef.current.set(peerPublicKey, secret);

      return secret;
    },
    []
  );

  const getPeerSecret = useCallback(
    async (peerId: string) => {
      const peerPublicKey = await fetchPublicKey(peerId);
      return getSharedSecret(peerPublicKey);
    },
    [fetchPublicKey, getSharedSecret]
  );

  useEffect(() => {
    const socket = getSocket();
    if (!socket.connected) socket.connect();

    socket.emit("identify", userId);
    socket.emit("room:join", roomId);

    const onMessage = async (message: ChatMessage) => {
      try {
        const envelope = message.envelopes.find((e) => e.recipientId === userId);
        if (!envelope) return;

        const secret = await getPeerSecret(message.senderId);
        const messageKey = await openEnvelope(envelope, secret);
        const text = await decrypt(message.body.ciphertext, message.body.iv, messageKey);
        setMessages((prev) => [...prev, { ...message, text }]);
      } catch (err) {
        console.error("Failed to decrypt message from", message.senderId, err);
      }
    };
    const onPresence = (ids: string[]) => setOnlineUsers(ids);

    socket.on("message:new", onMessage);
    socket.on("presence:update", onPresence);

    return () => {
      socket.emit("room:leave", roomId);
      socket.off("message:new", onMessage);
      socket.off("presence:update", onPresence);
    };
  }, [roomId, userId, getPeerSecret]);

  const sendMessage = useCallback(
    async (text: string, recipientIds: string[]) => {
      const socket = getSocket();

      const messageKey = await generateMessageKey();
      const { ciphertext, iv } = await encrypt(text, messageKey);

      const envelopes = [];
      for (const recipientId of recipientIds) {
        if (recipientId === userId) continue;
        const secret = await getPeerSecret(recipientId);
        envelopes.push(await buildEnvelope(messageKey, recipientId, secret));
      }

      const message: ChatMessage = {
        id: crypto.randomUUID(),
        roomId,
        senderId: userId,
        body: { ciphertext, iv },
        envelopes,
        createdAt: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, { ...message, text }]);
      socket.emit("message:send", { roomId, message });
    },
    [roomId, userId, getPeerSecret]
  );

  return { messages, onlineUsers, sendMessage };
}