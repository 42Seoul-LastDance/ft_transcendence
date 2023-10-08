import React, { createContext, useContext, useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { io, Socket } from 'socket.io-client';
import { setRoomNameList } from '../redux/roomSlice';
import { RoomStatus } from '../interface';
import { RootState } from '../redux/store';
import { useSelector } from 'react-redux';
import { IoEventListner, IoEventOnce, createSocket } from './socket';
import { getCookie } from '../Cookie';
import { setToken } from '../redux/userSlice';
import axios from 'axios';
import { BACK_URL } from '../globals';
import { useRouter } from 'next/navigation';
import { access } from 'fs';

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
  const token = useSelector((state: RootState) => state.user.token);
  const router = useRouter();
  const [chatSocket, setChatSocket] = useState<Socket | undefined>(undefined);

  // refresh 토큰으로 access 토큰 재발급 로직
  const handleTryAuth = async () => {
    const refreshToken = getCookie('refresh_token');
    if (!refreshToken) router.push('/');

    const response = await axios.get(`${BACK_URL}/auth/regenerateToken`, {
      headers: { Authorization: `Bearer ${refreshToken}` },
    });

    switch (response.status) {
      case 200:
        const newToken = getCookie('access_token');
        console.log('new token: ', newToken);
        if (chatSocket?.connected) {
          chatSocket?.emit('expireToken', token);

          chatSocket.auth = {
            token: newToken,
          };
          setChatSocket(chatSocket);
        }
        break;
      case 401:
        router.push('/');
        break;
      default:
        console.log('refresh token: ', response.status);
    }
  };

  const handleGetChatRoomList = (data: string[]) =>
    dispatch(setRoomNameList(data));

  const handleConnectSuccess = () => {
    console.log('[Connect] chatSocket Success');
    chatSocket?.emit('getChatRoomList', { roomStatus: RoomStatus.PUBLIC });
  };

  useEffect(() => {
    const socket = createSocket('RoomChat', getCookie('access_token'));
    setChatSocket(socket);

    return () => {
      socket.disconnect();
    };
  }, []);

  useEffect(() => {
    if (chatSocket?.connected) chatSocket?.disconnect();

    if (chatSocket) {
      IoEventOnce(chatSocket, 'expireToken', handleTryAuth);
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
