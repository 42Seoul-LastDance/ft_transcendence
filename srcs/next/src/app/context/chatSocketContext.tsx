import React, { createContext, useContext, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { io, Socket } from 'socket.io-client';
import { setRoomNameList } from '../redux/roomSlice';
import { RoomStatus } from '../interface';
import BACK_URL from '../globals';
import { RootState } from '../redux/store';
import tryAuth from '../auth';
import { useSelector } from 'react-redux';

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

  // Socket.IO 소켓 초기화
  const chatSocket: Socket = io(`${BACK_URL}/RoomChat`, {
    withCredentials: false,
    autoConnect: false,
    transports: ['websocket'],
    query: {
      token,
    },
    reconnection: true,
    reconnectionDelay: 3000,
  });

  useEffect(() => {
    if (chatSocket.connected) chatSocket.disconnect();

    function reconnectSocket() {
      chatSocket.connect();
    }

    function handleExpiredToken() {
      tryAuth();
    }

    function handleGetChatRoomList(data: string[]) {
      dispatch(setRoomNameList(data));
    }

    function handleConnectSuccess() {
      chatSocket.emit('getChatRoomList', {
        roomStatus: RoomStatus.PUBLIC,
      });
    }

    if (!chatSocket.hasListeners('disconnect')) {
      chatSocket.on('disconnect', reconnectSocket);
    }

    if (!chatSocket.hasListeners('expiredToken')) {
      chatSocket.on('expiredToken', handleExpiredToken);
    }

    if (!chatSocket.hasListeners('getChatRoomList')) {
      chatSocket.on('getChatRoomList', handleGetChatRoomList);
    }

    if (!chatSocket.hasListeners('connectSuccess')) {
      chatSocket.on('connectSuccess', handleConnectSuccess);
    }

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
