import React, { createContext, useContext, useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { Socket } from 'socket.io-client';
import { setRoomList } from '../redux/roomSlice';
import {
  Events,
  GetChatRoomListJSON,
  JoinStatus,
  RoomStatus,
} from '../interface';
import {
  clearSocketEvent,
  createSocket,
  handleTryAuth,
  registerSocketEvent,
} from './socket';
import { getCookie, removeCookie, setCookie } from '../Cookie';
import { useRouter } from 'next/navigation';
import { setJoin, setName } from '../redux/userSlice';

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
  // let chatSocket: Socket;

  // 소켓 수명 관리
  useEffect(() => {
    const cookie = getCookie('access_token');
    if (cookie == undefined) {
      console.log('access token is not exist -> cookie is empty');
      router.push('/');
      return;
    }
    const socket = createSocket('RoomChat', cookie);
    socket.connect();
    setChatSocket(socket);
    return () => {
      chatSocket?.disconnect();
    };
  }, []);

  useEffect(() => {
    //이벤트 관리
    const e: Events[] = [
      {
        event: 'expireToken',
        callback: async () => {
          await handleTryAuth(chatSocket!, router);
        },
      },
      {
        event: 'getChatRoomList',
        callback: (data: GetChatRoomListJSON[]) => dispatch(setRoomList(data)),
      },
      {
        event: 'connectSuccess',
        callback: () => {
          console.log('[Connect] chatSocket info', chatSocket);
          chatSocket?.emit('getChatRoomList', {
            roomStatus: RoomStatus.PUBLIC,
          });
        },
      },
    ];

    registerSocketEvent(chatSocket!, e);
    return () => {
      clearSocketEvent(chatSocket!, e);
    };
  }, [chatSocket]);

  return (
    <ChatSocketContext.Provider value={chatSocket}>
      {children}
    </ChatSocketContext.Provider>
  );
};

export default ChatSocketProvider;
