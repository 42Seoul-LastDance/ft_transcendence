import React, { createContext, useContext, useEffect } from 'react';
import { io, Socket } from 'socket.io-client';
import BACK_URL from '../globals';

const token =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI0MjQyIiwibmFtZSI6InRlc3RtYW4iLCJpYXQiOjE1MTYyMjM0MjM0fQ.jZsy7aTM-GcoSbQW6TERNuTCBCvIS-7l_qfm5PMg0-U';

// Socket.IO 소켓 초기화
export var superSocket: Socket = io(`${BACK_URL}/DM`, {
  // forceNew: true,
  withCredentials: false,
  autoConnect: true,
  transports: ['websocket'],
  closeOnBeforeunload: true,
  query: {
    token,
  },
  // * 실 구현은 auth.token
  // auth: {
  // token,
  // }
});

// SocketContext 생성
const SuperSocketContext = createContext<Socket | undefined>(undefined);

// 커스텀 훅 정의
export function useSuperSocket() {
  const socket = useContext(SuperSocketContext);
  if (!socket) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return socket;
}

// SocketProvider 컴포넌트 정의
export function SuperSocketProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    if (!superSocket.connected) superSocket.connect();
    // return () => {
    //   superSocket.disconnect();
    // };
  }, []);

  return (
    <SuperSocketContext.Provider value={superSocket}>
      {children}
    </SuperSocketContext.Provider>
  );
}
