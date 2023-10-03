import React, { createContext, useContext, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { io, Socket } from 'socket.io-client';
import { setRoomNameList } from '../redux/roomSlice';
import { RoomStatus } from '../DTO/RoomInfo.dto';

const token =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI0MjQyIiwibmFtZSI6InRlc3RtYW4iLCJpYXQiOjE1MTYyMjM0MjM0fQ.jZsy7aTM-GcoSbQW6TERNuTCBCvIS-7l_qfm5PMg0-U';

// Socket.IO 소켓 초기화
export var chatSocket: Socket = io('http://localhost:3000/RoomChat', {
  // forceNew: true,
  withCredentials: false,
  autoConnect: true,
  transports: ['websocket'],
  query: {
    token,
  },
  // * 실 구현은 auth.token
  // auth: {
  // token,
  // }
});

// SocketContext 생성
const ChatSocketContext = createContext<Socket | undefined>(undefined);

// 커스텀 훅 정의
export function useChatSocket() {
  const socket = useContext(ChatSocketContext);
  if (!socket) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return socket;
}

// SocketProvider 컴포넌트 정의
export function ChatSocketProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  // 소켓 초기화와 컨텍스트 제공을 한꺼번에 수행
  const dispatch = useDispatch();
  useEffect(() => {
	if (chatSocket.connected)
		chatSocket.disconnect();
	if (!chatSocket.hasListeners('getChatRoomList')) {
		chatSocket.on('getChatRoomList', (data) => {
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
}
