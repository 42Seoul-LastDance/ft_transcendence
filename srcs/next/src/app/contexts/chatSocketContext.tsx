import React, { createContext, useContext, useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { Socket } from 'socket.io-client';
import { setRoomList } from '../redux/roomSlice';
import { ChatRoomDto, EmitResult, Events, GetChatRoomListJSON } from '../interfaces';
import {
  clearSocketEvent,
  createSocket,
  handleTryAuth,
  registerSocketEvent,
} from './socket';
import { useRouter } from 'next/navigation';
import { JoinStatus, RoomStatus } from '../enums';
import { myAlert } from '../home/alert';
import { getCookie } from '../cookie';
import { setChatRoom, setJoin } from '../redux/userSlice';

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
    const token = getCookie('access_token');
    if (!token) {
      router.push('/');
      return;
    }
    const socket = createSocket('RoomChat', token);
    socket.connect();
    setChatSocket(socket);
    // return () => {
    //   chatSocket?.disconnect();
    // };
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
        event: 'joinPrivateChatRoom',
        callback: () => {
          dispatch(setJoin(JoinStatus.CHAT));
        },
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
            myAlert('error', data.reason, dispatch);
			console.log('eventFailure', data.reason)
        },
      },
      {
        event: 'getChatRoomInfo',
        callback: (data: ChatRoomDto) => {
          dispatch(setChatRoom(data));
        },
      },
      {
        event: 'joinPublicChatRoom',
        callback: (data: EmitResult) => {
          if (data.result === true) {
            dispatch(setJoin(JoinStatus.CHAT));
            myAlert('success', data.reason, dispatch);
          } else {
            // 밴 당했을 때, 비밀번호 틀렸을 때, (서버 자료구조에 이상이 있을 때, 서버한테 데이터 잘 못 보냈을 때)
            // if (join !== JoinStatus.CHAT) dispatch(setJoin(JoinStatus.NONE));
            myAlert('error', data.reason, dispatch);
          }
        },
      },
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
