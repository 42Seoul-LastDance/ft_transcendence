import React, { createContext, useContext, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { io, Socket } from 'socket.io-client';
import { setRoomNameList } from '../redux/roomSlice';
import { RoomStatus, TokenType } from '../interface';
import BACK_URL from '../globals';
import { RootState } from '../redux/store';
import tryAuth from '../auth';
import { useSelector } from 'react-redux';
import { getCookie } from '../Cookie';
import { setToken } from '../redux/userSlice';

var token = '';

// Socket.IO 소켓 초기화
export var chatSocket: Socket = io(`${BACK_URL}/RoomChat`, {
  // forceNew: true,
  withCredentials: false,
  autoConnect: false,
  transports: ['websocket'],
  query: {
    token,
  },
  // auth: {
  //   token,
  // },
  reconnection: true,
  reconnectionDelay: 3000,
});

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
export const ChatSocketProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const dispatch = useDispatch();

  useEffect(() => {
    if (chatSocket.connected) chatSocket.disconnect();

    // ERR : 입뺀 당하면 재연결을 안 함
    if (!chatSocket.hasListeners('disconnect')) {
      chatSocket.on('disconnect', () => {
        chatSocket.connect();
      });
    }

    dispatch(setToken(getCookie('access_token')));
    token = useSelector((state: RootState) => state.user.token);

    if (!chatSocket.hasListeners('expiredToken')) {
      chatSocket.on('expiredToken', () => {
        tryAuth();
      });
    }

    // 기타 🎸
    if (!chatSocket.hasListeners('getChatRoomList')) {
      chatSocket.on('getChatRoomList', (data: string[]) => {
        dispatch(setRoomNameList(data));
      });
    }
    if (!chatSocket.hasListeners('connectSuccess')) {
      chatSocket.on('connectSuccess', () => {
        chatSocket.emit('getChatRoomList', {
          roomStatus: RoomStatus.PUBLIC,
        });
      });
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
