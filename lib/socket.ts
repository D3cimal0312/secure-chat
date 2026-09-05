// Client-side singleton so you don't open a new connection on every render.

"use client";

import { io, Socket } from "socket.io-client";
import type {
  ClientToServerEvents,
  ServerToClientEvents,
} from "@/types/socket";

let socket: Socket<ServerToClientEvents, ClientToServerEvents> | null = null;

export function getSocket() {
  if (!socket) {
    socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || undefined, {
      path: "/api/socket",
      autoConnect: false,
      // Use websocket first>> falls back to polling if it fails.
      transports: ["websocket", "polling"],
    });
  }
  return socket;
}