import React, { createContext, useContext, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Socket } from 'socket.io-client';
import {
  clearSocketEvent,
  createSocket,
  handleTryAuth,
  registerSocketEvent,
} from './socket';
import { useRouter } from 'next/navigation';
import { Events, HandShakeJson } from '../interfaces';
import { RootState } from '../redux/store';
import { GameJoinMode } from '../enums';
import {
  setIsMatchInProgress,
  setIsMatched,
  setSide,
} from '../redux/matchSlice';
import { myAlert } from '../home/alert';
import { getToken } from '../auth';

// SocketContext 생성
const GameSocketContext = createContext<Socket | undefined>(undefined);

// 커스텀 훅 정의
export const useGameSocket = () => {
  const socket = useContext(GameSocketContext);
  return socket;
};

// SocketProvider 컴포넌트 정의
const GameSocketProvider = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();
  const [gameSocket, setGameSocket] = useState<Socket | undefined>(undefined);
  const customSet = useSelector((state: RootState) => state.match.customSet);
  const dispatch = useDispatch();

  useEffect(() => {
    const cookie = getToken('access_token');
    if (cookie === undefined) {
      console.log('access token is not exist -> cookie is empty');
      router.push('/');
      return;
    }

    const socket = createSocket('Game', cookie);
    socket.connect();
    setGameSocket(socket);
    return () => {
      socket?.disconnect();
    };
  }, []);

  useEffect(() => {
    //이벤트 관리
    const e: Events[] = [
      {
        event: 'expireToken',
        callback: async () => {
          await handleTryAuth(gameSocket!, router);
        },
      },
      {
        event: 'connectSuccess',
        callback: () => {
          console.log('[Connect] gameSocket info', gameSocket);
          if (customSet.joinMode === GameJoinMode.CUSTOM_SEND) {
            gameSocket?.emit('inviteGame', {
              gameMode: customSet.gameMode,
              friendName: customSet.opponentName,
            });
          } else if (customSet.joinMode === GameJoinMode.CUSTOM_RECV) {
            gameSocket?.emit('agreeInvite', {
              friendName: customSet.opponentName,
            });
          }
        },
      },
      {
        event: 'kickout',
        callback: () => {
          myAlert('error', '상대방이 나갔습니다', dispatch);
          dispatch(setIsMatched({ isMatched: false }));
          dispatch(setIsMatchInProgress({ isMatchInProgress: false }));
        },
      },
      {
        event: 'denyInvite',
        callback: () => {
          myAlert('error', '상대가 초대를 거절했습니다', dispatch);
          dispatch(setIsMatchInProgress({ isMatchInProgress: false }));
        },
      },
      {
        event: 'handShake',
        callback: (json: HandShakeJson) => {
          myAlert('success', '매칭이 완료되었습니다', dispatch);
          dispatch(setSide({ side: json.side }));
          dispatch(setIsMatched({ isMatched: true }));
        },
      },
    ];
    registerSocketEvent(gameSocket!, e);
    return () => {
      clearSocketEvent(gameSocket!, e);
    };
  }, [gameSocket]);

  return (
    <GameSocketContext.Provider value={gameSocket}>
      {children}
    </GameSocketContext.Provider>
  );
};

export default GameSocketProvider;
