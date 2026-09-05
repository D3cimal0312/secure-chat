
"use client";

import { useEffect, useState, useCallback } from "react";
import { getSocket } from "./socket";
import type { ChatMessage } from "@/types/socket";

export function useChatSocket(roomId: string, userId: string) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);

  useEffect(() => {
    const socket = getSocket();
    if (!socket.connected) socket.connect();

    socket.emit("identify", userId);
    socket.emit("room:join", roomId);

    const onMessage = (message: ChatMessage) => {
      setMessages((prev) => [...prev, message]);
    };
    const onPresence = (ids: string[]) => setOnlineUsers(ids);

    socket.on("message:new", onMessage);
    socket.on("presence:update", onPresence);

    return () => {
      socket.emit("room:leave", roomId);
      socket.off("message:new", onMessage);
      socket.off("presence:update", onPresence);
    };
  }, [roomId, userId]);

  const sendMessage = useCallback(
    (text: string) => {
      const socket = getSocket();
      const message: ChatMessage = {
        id: crypto.randomUUID(),
        roomId,
        senderId: userId,
        text,
        createdAt: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, message]);
      socket.emit("message:send", { roomId, message });
    },
    [roomId, userId]
  );

  return { messages, onlineUsers, sendMessage };
}