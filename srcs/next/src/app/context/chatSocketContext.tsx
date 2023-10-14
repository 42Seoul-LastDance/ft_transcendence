import React, { createContext, useContext, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { io, Socket } from 'socket.io-client';
import { setRoomNameList } from '../redux/roomSlice';
import { EventListeners, RoomStatus } from '../interface';
import {
  clearSocketEvent,
  createSocket,
  handleTryAuth,
  registerSocketEvent,
} from './socket';
import { getCookie, removeCookie, setCookie } from '../Cookie';
import { useRouter } from 'next/navigation';
import { setName } from '../redux/userSlice';

// SocketContext 생성
const ChatSocketContext = createContext<Socket | undefined>(undefined);

// 커스텀 훅 정의
export const useChatSocket = () => {
  const socket = useContext(ChatSocketContext);
  return socket;
};

// SocketProvider 컴포넌트 정의
const ChatSocketProvider = ({ children }: { children: React.ReactNode }) => {
  const dispatch = useDispatch();
  const router = useRouter();
  const [chatSocket, setChatSocket] = useState<Socket | undefined>(undefined);

  // 소켓 수명 관리
  useEffect(() => {
    const cookie = getCookie('access_token');
    if (cookie == undefined) {
      console.log('access token is not exist -> cookie is empty');
      router.push('/');
      return;
    }
    const socket = createSocket('RoomChat', cookie);
    setChatSocket(socket);

    return () => {
      socket.disconnect();
    };
  }, []);

  //이벤트 관리
  useEffect(() => {
    if (chatSocket?.connected === false) {
      chatSocket.connect();
      console.log('[Connect] chatSocket info', chatSocket);
    }

    const eventListeners: EventListeners[] = [
      {
        event: 'expireToken',
        callback: async () => {
          await handleTryAuth(chatSocket!, router);
        },
      },
      {
        event: 'getMyName',
        callback: (data: string) => dispatch(setName(data)),
      },
      {
        event: 'getChatRoomList',
        callback: (data: string[]) => dispatch(setRoomNameList(data)),
      },
      {
        event: 'connectSuccess',
        callback: () => {
          chatSocket?.emit('getMyName');
          chatSocket?.emit('getChatRoomList', {
            roomStatus: RoomStatus.PUBLIC,
          });
        },
      },
    ];

    registerSocketEvent(chatSocket!, eventListeners);
    return () => {
      clearSocketEvent(chatSocket!, eventListeners);
    };
  }, [chatSocket]);

  return (
    <ChatSocketContext.Provider value={chatSocket}>
      {children}
    </ChatSocketContext.Provider>
  );
};

export default ChatSocketProvider;
