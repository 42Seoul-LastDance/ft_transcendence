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

  useEffect(() => {
    const cookie = getCookie('access_token');
    if (cookie == undefined) {
      console.log('access token is not exist -> cookie is empty');
      router.push('/');
      return;
    }
    const socket = createSocket('RoomChat', cookie);
    setChatSocket(socket);

    return () => {
      socket.disconnect();
    };
  }, [router]);

  useEffect(() => {
    const cookie = getCookie('access_token');
    if (cookie == undefined) {
      console.log('access token is not exist -> cookie is empty');
      router.push('/');
      return;
    }
    const socket = createSocket('RoomChat', cookie);
    setChatSocket(socket);

    return () => {
      socket.disconnect();
    };
  }, [router]);

  useEffect(() => {
    const cookie = getCookie('access_token');
    if (cookie == undefined) {
      console.log('access token is not exist -> cookie is empty');
      router.push('/');
      return;
    }
    const socket = createSocket('RoomChat', cookie);
    setChatSocket(socket);

    return () => {
      socket.disconnect();
    };
  }, [router]);

  useEffect(() => {
    if (chatSocket?.connected === false) {
      chatSocket?.connect();
      console.log('[Connect] chatSocket info', chatSocket);
    }

    const eventListeners = [
      {
        event: 'expireToken',
        callback: () => handleTryAuth(chatSocket!, router),
      },
      {
        event: 'getChatRoomList',
        callback: (data: string[]) => dispatch(setRoomNameList(data)),
      },
      {
        event: 'getMyName',
        callback: (data: string) => dispatch(setName(data)),
      },
      {
        event: 'connectSuccess',
        callback: () => {
          chatSocket?.emit('getChatRoomList', {
            roomStatus: RoomStatus.PUBLIC,
          });
          chatSocket?.emit('getMyName');
        },
      },
      {
        event: 'disconnect',
        callback: () => {
          setChatSocket(undefined);
        },
      },
    ];

    // 소켓 이벤트 등록
    eventListeners.forEach(({ event, callback }) => {
      IoEventListener(chatSocket!, event, callback);
    });

    return () => {
      // 이벤트 삭제
      eventListeners.forEach(({ event, callback }) => {
        chatSocket?.off(event, callback);
      });
    };
  }, [chatSocket]);

  return (
    <ChatSocketContext.Provider value={chatSocket}>
      {children}
    </ChatSocketContext.Provider>
  );
};

export default ChatSocketProvider;
