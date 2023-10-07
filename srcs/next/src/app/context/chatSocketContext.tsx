import React, { createContext, useContext, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { io, Socket } from 'socket.io-client';
import { setRoomNameList } from '../redux/roomSlice';
import { RoomStatus } from '../interface';
import { RootState } from '../redux/store';
import tryAuth from '../auth';
import { useSelector } from 'react-redux';
import { IoEventListner, IoEventOnce, createSocket } from './socket';
import { getCookie } from '../Cookie';
import BACK_URL from '../globals';
import { get } from 'http';
import { profile } from 'console';

// SocketContext 생성
const ChatSocketContext = createContext<Socket | undefined>(undefined);

// 커스텀 훅 정의
export const useChatSocket = () => {
  const socket = useContext(ChatSocketContext);
  if (!socket) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return socket;
};

var chatSocket: Socket = createSocket('RoomChat', null);

// SocketProvider 컴포넌트 정의
const ChatSocketProvider = ({ children }: { children: React.ReactNode }) => {
  const dispatch = useDispatch();
  const token = useSelector((state: RootState) => state.user.token);

  useEffect(() => {
    const handleSendToken = () => {
      console.log('[Connect] handShake');
      const key = getCookie('token');
      chatSocket.emit('getTokenByFront', key);
    };

    // const handleTryAuth = () => {
    //   tryAuth();
    //   console.log('[handle] tryAuth() token', token);
    //   console.log('[handle] createSocket', chatSocket);
    //   chatSocket.emit('expiredToken', {
    //     token: token,
    //   });
    // };

    const handleGetChatRoomList = (data: string[]) =>
      dispatch(setRoomNameList(data));

    const handleConnectSuccess = () => {
      console.log('[Connect] Success');
      chatSocket.emit('getChatRoomList', { roomStatus: RoomStatus.PUBLIC });
    };

    IoEventListner(chatSocket, 'handShake', handleSendToken);
    // IoEventListner(chatSocket, 'expiredToken', handleTryAuth);
    IoEventOnce(chatSocket, 'getChatRoomList', handleGetChatRoomList);
    IoEventOnce(chatSocket, 'connectSuccess', handleConnectSuccess);

    chatSocket.connect();
    return () => {
      chatSocket.disconnect();
    };
  }, []);

  return (
    <ChatSocketContext.Provider value={chatSocket}>
      {children}
    </ChatSocketContext.Provider>
  );
};

export default ChatSocketProvider;
