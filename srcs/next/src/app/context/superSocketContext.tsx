import React, { createContext, useContext, useEffect, useState } from 'react';
import { Socket } from 'socket.io-client';
import { IoEventListener, IoEventOnce, createSocket } from './socket';
import { getCookie, setCookie } from '../Cookie';
import axios from 'axios';
import { BACK_URL } from '../globals';
import { useRouter } from 'next/navigation';
import sendRequest from '../api';

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
  const router = useRouter();

  const handleTryAuth = async () => {
    console.log('try auth');
    const refreshToken = getCookie('refresh_token');
    if (!refreshToken) {
      console.log('refresh token is not exist');
      router.push('/');
      return;
    }

    // removeCookie('access_token');
    const response = await axios.get(`${BACK_URL}/auth/regenerateToken`, {
      headers: { Authorization: `Bearer ${refreshToken}` },
    });

    switch (response.status) {
      case 200:
        const xAccessToken = response.data['token'];
        setCookie('access_token', xAccessToken);
        if (superSocket?.connected) {

          superSocket?.disconnect();
          superSocket.auth = {
            token: xAccessToken,
          };
          superSocket.connect();
        }
        break;
      case 401:
        router.push('/');
        break;
      default:
        console.log('refresh token: ', response.status);
    }
  };

  const handleConnectSuccess = () => {
    console.log('[Connect] superSocket Success');
  };

  useEffect(() => {
    IoEventListener(superSocket, 'expireToken', handleTryAuth);
    IoEventListener(superSocket, 'connectSuccess', handleConnectSuccess);
    IoEventListener(superSocket, 'expireToken', handleTryAuth);
    if (!superSocket.connected) superSocket.connect();
  }, []);

  return (
    <SuperSocketContext.Provider value={superSocket}>
      {children}
    </SuperSocketContext.Provider>
  );
};

export default SuperSocketProvider;
 