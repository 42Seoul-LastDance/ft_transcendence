import React, { createContext, useContext, useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { Socket } from 'socket.io-client';
import { setRoomList } from '../redux/roomSlice';
import {
	EmitResult,
  Events,
  GetChatRoomListJSON,
} from '../interfaces';
import {
  clearSocketEvent,
  createSocket,
  handleTryAuth,
  registerSocketEvent,
} from './socket';
import { useRouter } from 'next/navigation';
import { RoomStatus } from '../enums';
import { getToken } from '../auth';
import { myAlert } from '../home/alert';

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
    const token = getToken('access_token');
	if (!token){
		router.push('/');
		return;
	}
    const socket = createSocket('RoomChat', token);
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
      {
        event: 'eventFailure',
        callback: (data: EmitResult) => {
          if (data.result === false) {
            myAlert('error', data.reason, dispatch);
          }
        } 
      }
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
