import React, { createContext, useContext, useEffect, useState } from 'react';
import { Socket } from 'socket.io-client';
import { useSelector } from 'react-redux';
import { RootState } from '../redux/store';
import { IoEventListner, createSocket } from './socket';
import { getCookie } from '../Cookie';

// Socket.IO 소켓 초기화

// SocketContext 생성
const SuperSocketContext = createContext<Socket | undefined>(undefined);

// 커스텀 훅 정의
export const useSuperSocket = () => {
  const socket = useContext(SuperSocketContext);
  return socket;
};

// SocketProvider 컴포넌트 정의
const SuperSocketProvider = ({ children }: { children: React.ReactNode }) => {
  // const token = useSelector((state: RootState) => state.user.token);
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
    IoEventListner(superSocket!, 'connectSuccess', handleConnectSuccess);
    if (!superSocket?.connected) superSocket?.connect();
  }, []);

  return (
    <SuperSocketContext.Provider value={superSocket}>
      {children}
    </SuperSocketContext.Provider>
  );
};

export default SuperSocketProvider;
