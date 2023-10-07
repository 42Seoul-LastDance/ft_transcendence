import React, { createContext, useContext, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { io, Socket } from 'socket.io-client';
import { setRoomNameList } from '../redux/roomSlice';
import { RoomStatus } from '../interface';
import BACK_URL from '../globals';
import { RootState } from '../redux/store';
import tryAuth from '../auth';
import { useSelector } from 'react-redux';
import { IoEventListner, createSocket } from './socket';

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

// SocketProvider 컴포넌트 정의
const ChatSocketProvider = ({ children }: { children: React.ReactNode }) => {
  const dispatch = useDispatch();
  const token = useSelector((state: RootState) => state.user.token);
  const chatSocket: Socket = createSocket('chat', token);

  // Io event handler
  const reconnectSocket = () => chatSocket.connect();

  const handleExpiredToken = tryAuth;

  const handleGetChatRoomList = (data: string[]) =>
    dispatch(setRoomNameList(data));

  const handleConnectSuccess = () => {
    chatSocket.emit('getChatRoomList', { roomStatus: RoomStatus.PUBLIC });
  };

  useEffect(() => {
    if (chatSocket.connected) chatSocket.disconnect();

    IoEventListner(chatSocket, 'disconnect', reconnectSocket);
    IoEventListner(chatSocket, 'expiredToken', handleExpiredToken);
    IoEventListner(chatSocket, 'getChatRoomList', handleGetChatRoomList);
    IoEventListner(chatSocket, 'connectSuccess', handleConnectSuccess);

    chatSocket.connect();
    return () => {
      chatSocket.disconnect();
    };
  }, [chatSocket, dispatch]);

  return (
    <ChatSocketContext.Provider value={chatSocket}>
      {children}
    </ChatSocketContext.Provider>
  );
};

export default ChatSocketProvider;
