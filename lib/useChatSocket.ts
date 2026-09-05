
"use client";

import { useEffect, useState, useCallback,useRef } from "react";
import { getSocket } from "./socket";
import type { ChatMessage } from "@/types/socket";
import {loadPrivateKey} from "./crypto/idb";
import {encrypt,decrypt} from "./crypto/aes";
import {deriveSharedSecret} from "./crypto/ecdh";

interface DecryptedMessage extends ChatMessage{
  text:string;
}


export function useChatSocket(roomId: string, userId: string) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);

  // caching shared secrets per peer public keys only derived once
  const secretsRef =  useRef<Map<string, CryptoKey>>(new Map());

  const fetchPublicKey =useCallback(async (peerId:string)=>{
    const res= await fetch(`/api/users/${peerId}/publickey`);
    if(!res.ok) throw new Error("couldnot fetch peer public key");

    const data = await res.json();

    return data.publicKey as string;

  },[]);


  const getSharedSecret = useCallback(async (peerPublicKey:string)=>{
    const cached =secretsRef.current.get(peerPublicKey);
    if(cached) return cached;
    const privateKey =await loadPrivateKey();

    if(!privateKey) throw new Error ("private key not found in indexedDB");

    const secret = await deriveSharedSecret(privateKey,peerPublicKey);

    secretsRef.current.set(peerPublicKey,secret);

    return secret;

  },[]);

  useEffect(() => {
    const socket = getSocket();
    if (!socket.connected) socket.connect();

    socket.emit("identify", userId);
    socket.emit("room:join", roomId);

    const onMessage = async (message: ChatMessage) => {
      try {
        const peerPublicKey = await fetchPublicKey(message.senderId);
        const secret = await getSharedSecret(peerPublicKey);
        const text = await decrypt(message.ciphertext, message.iv, secret);
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
  }, [roomId, userId, fetchPublicKey, getSharedSecret]);


  const sendMessage = useCallback(
    async (text: string, peerId: string) => {
      const socket = getSocket();
      const peerPublicKey = await fetchPublicKey(peerId);
      const secret = await getSharedSecret(peerPublicKey);
      const { ciphertext, iv } = await encrypt(text, secret);

      const message: ChatMessage = {
        id: crypto.randomUUID(),
        roomId,
        senderId: userId,
        ciphertext,
        iv,
        createdAt: new Date().toISOString(),
      };

      // optimistic local update (cipher added so UI shows text immediately)
      setMessages((prev) => [...prev, { ...message, text }]);
      socket.emit("message:send", { roomId, message });
    },
    [roomId, userId, fetchPublicKey, getSharedSecret]
  );

  return { messages, onlineUsers, sendMessage };
}