import React, { createContext, useContext, useEffect } from 'react';
import { io, Socket } from 'socket.io-client';

// Socket.IO 소켓 초기화
var chatSocket: Socket = io('http://127.0.0.1:3000/RoomChat', {
  withCredentials: false,
});

// SocketContext 생성
const ChatSocketContext = createContext<Socket | undefined>(undefined);

// 커스텀 훅 정의
export function useChatSocket() {
  const socket = useContext(ChatSocketContext);
  if (!socket) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return socket;
}

// SocketProvider 컴포넌트 정의
export function ChatSocketProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  // 소켓 초기화와 컨텍스트 제공을 한꺼번에 수행
  useEffect(() => {
    chatSocket.connect();
    return () => {
      chatSocket.disconnect();
    };
  }, []);

  return (
    <ChatSocketContext.Provider value={chatSocket}>
      {children}
    </ChatSocketContext.Provider>
  );
}
