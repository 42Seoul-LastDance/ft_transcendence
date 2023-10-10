import React, { createContext, useContext, useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { io, Socket } from 'socket.io-client';
import { setRoomNameList } from '../redux/roomSlice';
import { RoomStatus } from '../interface';
import {
  IoEventListener,
  IoEventOnce,
  createSocket,
  handleTryAuth,
} from './socket';
import { getCookie, removeCookie, setCookie } from '../Cookie';
import { useRouter } from 'next/navigation';
import { setName } from '../redux/userSlice';

// SocketContext 생성
const GameSocketContext = createContext<Socket | undefined>(undefined);

// 커스텀 훅 정의
export const useGameSocket = () => {
  const socket = useContext(GameSocketContext);
  return socket;
};

// SocketProvider 컴포넌트 정의
const GameSocketProvider = ({ children }: { children: React.ReactNode }) => {
  const dispatch = useDispatch();
  const router = useRouter();
  const [gameSocket, setGameSocket] = useState<Socket | undefined>(undefined);

  const handleConnectSuccess = () => {
    console.log('[Connect] gameSocket Success');
  };

  const handleGetMyName = (data: string) => {
    dispatch(setName(data));
  };

  useEffect(() => {
    const cookie = getCookie('access_token');
    if (cookie === undefined) {
      console.log('access token is not exist -> cookie is empty');
      router.push('/');
      return;
    }

    const socket = createSocket('Game', getCookie('access_token'));
    setGameSocket(socket);
    return () => {
      socket.disconnect();
    };
  }, []);

  useEffect(() => {
    if (gameSocket?.connected) gameSocket?.disconnect();
    if (gameSocket) {
      IoEventOnce(gameSocket, 'expireToken', () => {
        handleTryAuth(gameSocket, router);
      });
      IoEventListener(gameSocket, 'getMyName', handleGetMyName);
      IoEventListener(gameSocket, 'connectSuccess', handleConnectSuccess);
      console.log('[Handle] game socket info', gameSocket);
      gameSocket?.connect();
    }

    return () => {
      gameSocket?.disconnect();
    };
  }, [gameSocket, dispatch]);

  return (
    <GameSocketContext.Provider value={gameSocket}>
      {children}
    </GameSocketContext.Provider>
  );
};

export default GameSocketProvider;
