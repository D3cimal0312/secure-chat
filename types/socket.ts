
export interface ChatMessage {
  id: string;
  roomId: string;
  senderId: string;
  text: string;
  createdAt: string; 
}

export interface ClientToServerEvents {
  identify: (userId: string) => void;
  "room:join": (roomId: string) => void;
  "room:leave": (roomId: string) => void;
  "message:send": (payload: { roomId: string; message: ChatMessage }) => void;
  "typing:start": (payload: { roomId: string; userId: string }) => void;
  "typing:stop": (payload: { roomId: string; userId: string }) => void;
}

export interface ServerToClientEvents {
  "message:new": (message: ChatMessage) => void;
  "presence:update": (onlineUserIds: string[]) => void;
  "typing:start": (payload: { userId: string }) => void;
  "typing:stop": (payload: { userId: string }) => void;
}

export interface InterServerEvents {
  ping: () => void;
}

export interface SocketData {
  userId: string;
}