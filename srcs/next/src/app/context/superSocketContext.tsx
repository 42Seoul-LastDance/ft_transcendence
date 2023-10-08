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
const superSocket = createSocket('DM', getCookie('access_token'));

const SuperSocketProvider = ({ children }: { children: React.ReactNode }) => {
  // 소켓 상태 관리
  // const [superSocket, setSuperSocket] = useState<Socket | undefined>(undefined);

  const handleConnectSuccess = () => {
    console.log('[Connect] superSocket Success');
  };

  const handleTryAuth = () => {
    // const value = getCookie('access_token');
    console.log('super socket try auth');
    // superSocket?.emit('expireToken', getCookie('access_token'));
  };

  useEffect(() => {
    IoEventListner(superSocket, 'connectSuccess', handleConnectSuccess);
    IoEventListner(superSocket, 'expireToken', handleTryAuth);
    if (!superSocket.connected) superSocket.connect();
  }, []);

  return (
    <SuperSocketContext.Provider value={superSocket}>
      {children}
    </SuperSocketContext.Provider>
  );
};

export default SuperSocketProvider;
