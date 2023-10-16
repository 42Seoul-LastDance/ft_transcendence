import React, { createContext, useContext, useEffect, useState } from 'react';
import { Socket } from 'socket.io-client';
import {
  clearSocketEvent,
  createSocket,
  handleTryAuth,
  registerSocketEvent,
} from './socket';
import { getCookie } from '../Cookie';
import { useRouter } from 'next/navigation';
import { Events } from '../interface';

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
  const router = useRouter();

  useEffect(() => {
    const e: Events[] = [
      {
        event: 'expireToken',
        callback: async () => {
          await handleTryAuth(superSocket, router);
        },
      },
      {
        event: 'connectSuccess',
        callback: () => {
          console.log('[Connect] superSocket info', superSocket);
        },
      },
    ];
    superSocket.connect();
    registerSocketEvent(superSocket, e);
    return () => {
      clearSocketEvent(superSocket, e);
    };
  }, []);

  return (
    <SuperSocketContext.Provider value={superSocket}>
      {children}
    </SuperSocketContext.Provider>
  );
};

export default SuperSocketProvider;
