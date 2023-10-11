import React, { createContext, useContext, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
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
import { RootState } from '../redux/store';

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

  const handleGetMyName = (data: string) => {
    dispatch(setName(data));
  };

  const handleGetChatRoomList = (data: string[]) =>
    dispatch(setRoomNameList(data));

  const handleConnectSuccess = () => {
    // console.log('[Connect] chatSocket Success');
    chatSocket?.emit('getChatRoomList', { roomStatus: RoomStatus.PUBLIC });
    chatSocket?.emit('getMyName');
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
      IoEventListener(chatSocket, 'getMyName', handleGetMyName);
      IoEventListener(chatSocket, 'getChatRoomList', handleGetChatRoomList);
      IoEventListener(chatSocket, 'connectSuccess', handleConnectSuccess);
      console.log('[Connect] chat socket info', chatSocket);
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
