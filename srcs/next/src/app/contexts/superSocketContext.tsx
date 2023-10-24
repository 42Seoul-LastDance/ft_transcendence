import React, { createContext, useContext, useEffect, useState } from 'react';
import { Socket } from 'socket.io-client';
import {
  clearSocketEvent,
  createSocket,
  handleTryAuth,
  registerSocketEvent,
} from './socket';
import { useRouter } from 'next/navigation';
import {
  EmitResult,
  Events,
  FriendListJson,
  UserInfoJson,
} from '../interfaces';
import {
  setInvitationList,
  setJoin,
  setName,
  setNotiCount,
  setSlackId,
} from '../redux/userSlice';
import { useDispatch } from 'react-redux';
import { getCookie } from '../cookie';
import { JoinStatus } from '../enums';
import { myAlert } from '../home/alert';
import { setFriendList } from '../redux/friendSlice';

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
  const dispatch = useDispatch();
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
          superSocket?.emit('getMyName');
          console.log('[Connect] superSocket info', superSocket);
        },
      },
      {
        event: 'getMyName',
        callback: (data: UserInfoJson) => {
          dispatch(setName(data.userName));
          dispatch(setSlackId(data.slackId));
        },
      },
      {
        event: 'invitationSize',
        callback: (data) => {
          dispatch(setNotiCount(data));
        },
      },
      {
        event: 'getInvitationList',
        callback: (data) => dispatch(setInvitationList(data)),
      },
      {
        event: 'updateInvitation',
        callback: () => {
          superSocket?.emit('getInvitationList');
        },
      },
      {
        event: 'eventFailure',
        callback: (data: EmitResult) => {
          myAlert('error', data.reason, dispatch);
          console.log('eventFailure', data.reason);
        },
      },
      {
        event: 'getFriendStateList',
        callback: (data: FriendListJson[]) => {
          dispatch(setFriendList(data));
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
