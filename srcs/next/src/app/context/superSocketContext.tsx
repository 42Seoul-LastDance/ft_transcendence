import React, { createContext, useContext, useEffect, useState } from 'react';
import { Socket } from 'socket.io-client';
import { IoEventListner, createSocket } from './socket';
import { getCookie } from '../Cookie';

// SocketContext 생성
const SuperSocketContext = createContext<Socket | undefined>(undefined);

// 커스텀 훅 정의
export const useSuperSocket = () => {
  const socket = useContext(SuperSocketContext);
  return socket;
};

// SocketProvider 컴포넌트 정의
const SuperSocketProvider = ({ children }: { children: React.ReactNode }) => {
  // 소켓 상태 관리
  const [superSocket, setSuperSocket] = useState<Socket | undefined>(undefined);

  const handleConnectSuccess = () => {
    console.log('[Connect] superSocket Success');
  };

  useEffect(() => {
    const socket = createSocket('DM', getCookie('token'));
    setSuperSocket(socket);

    return () => {
      socket.disconnect();
    };
  }, []);

  useEffect(() => {
    if (superSocket?.connected) superSocket?.disconnect();
    if (superSocket)
      IoEventListner(superSocket, 'connectSuccess', handleConnectSuccess);
    superSocket?.connect();
  }, [superSocket]);

  return (
    <SuperSocketContext.Provider value={superSocket}>
      {children}
    </SuperSocketContext.Provider>
  );
};

export default SuperSocketProvider;
