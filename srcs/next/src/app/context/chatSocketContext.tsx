import React, { createContext, useContext, useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { io, Socket } from 'socket.io-client';
import { setRoomNameList } from '../redux/roomSlice';
import { RoomStatus } from '../interface';
import {
  IoEventListner,
  IoEventOnce,
  createSocket,
  handleTryAuth,
} from './socket';
import { getCookie, removeCookie, setCookie } from '../Cookie';
import { useRouter } from 'next/navigation';

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

  const handleGetChatRoomList = (data: string[]) =>
    dispatch(setRoomNameList(data));

  const handleConnectSuccess = () => {
    console.log('[Connect] chatSocket Success');
    chatSocket?.emit('getChatRoomList', { roomStatus: RoomStatus.PUBLIC });
  };

  useEffect(() => {
    const cookie = getCookie('access_token');
    if (cookie === undefined) {
      console.log('access token is not exist -> cookie is empty');
      router.push('/');
      return;
    }
    const socket = createSocket('RoomChat', getCookie('access_token'));
    setChatSocket(socket);

    return () => {
      socket.disconnect();
    };
  }, []);

  useEffect(() => {
    if (chatSocket?.connected) chatSocket?.disconnect();

    if (chatSocket) {
      IoEventOnce(chatSocket, 'expireToken', () => {
        handleTryAuth(chatSocket, router);
      });
      IoEventListner(chatSocket, 'getChatRoomList', handleGetChatRoomList);
      IoEventListner(chatSocket, 'connectSuccess', handleConnectSuccess);
      console.log('[Handle] chat socket info', chatSocket);
      chatSocket?.connect();
    }

    return () => {
      chatSocket?.disconnect();
    };
  }, [chatSocket, dispatch]);

  return (
    <ChatSocketContext.Provider value={chatSocket}>
      {children}
    </ChatSocketContext.Provider>
  );
};

export default ChatSocketProvider;
