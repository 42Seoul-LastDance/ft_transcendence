'use client';

import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import CreateRoomButton from './createRoomButton';
import { useChatSocket } from '../../context/chatSocketContext';
import { ChatRoomDto, JoinStatus, RoomStatus } from '../../interface';
import { useSelector } from 'react-redux';
import { RootState } from '../../redux/store';
import { useDispatch } from 'react-redux';
import { setChatRoom, setJoin } from '../../redux/userSlice';
import { isValid } from '../valid';
import { myAlert } from '../alert';
import { IoEventListener, IoEventOnce } from '@/app/context/socket';
import { useEffect } from 'react';
import {
  clearChatMessages,
  setChatMessages,
  setRoomNameList,
} from '@/app/redux/roomSlice';

const style = {
  width: '100%',
  maxWidth: 360,
  bgcolor: 'background.paper',
};

const ChatRoomList: React.FC = () => {
  const chatRoom = useSelector((state: RootState) => state.user.chatRoom);
  const chatSocket = useChatSocket();
  const dispatch = useDispatch();
  const roomNameList = useSelector(
    (state: RootState) => state.room.roomNameList,
  );
  const join = useSelector((state: RootState) => state.user.join);

  useEffect(() => {
    IoEventListener(chatSocket!, 'getChatRoomList', (data: string[]) =>
      dispatch(setRoomNameList(data)),
    );
    return () => {};
  }, [roomNameList]);

  const joinRoom = async (roomName: string) => {
    // 방 정보 받아오기
    const data: ChatRoomDto = await getChatRoomInfo(roomName);
    if (!data) return;
    console.log('getChatRoomInfo Data', data);

    // 비밀번호 문자열 검사
    let password: string | null = null;
    if (data.requirePassword) {
      password = prompt('비밀번호를 입력하세요');
      if (
        password === null ||
        !isValid('비밀번호가', password, 20, dispatch) === false
      )
        return;
    }

    // 방 들어갈 수 있는지 시도 해봄 (비밀번호 인증)
    const result = await joinChatRoom(roomName, password);
    if (result) {
      dispatch(setChatRoom(data));
      dispatch(clearChatMessages([]));
      dispatch(setJoin(JoinStatus.CHAT));
      myAlert('success', '채팅방에 입장하였습니다.', dispatch);
    } else {
      dispatch(setChatRoom(null));
      dispatch(clearChatMessages([]));
      dispatch(setJoin(JoinStatus.NONE));
      myAlert('error', '비밀번호가 틀렸습니다.', dispatch);
    }
  };

  const getChatRoomInfo = (roomName: string): Promise<ChatRoomDto> => {
    return new Promise((resolve) => {
      chatSocket?.emit('getChatRoomInfo', {
        roomName,
        status: RoomStatus.PUBLIC,
      });
      IoEventOnce(chatSocket!, 'getChatRoomInfo', (data: ChatRoomDto) => {
        resolve(data);
      });
    });
  };

  const joinChatRoom = (
    roomName: string,
    password: string | null,
  ): Promise<any> => {
    return new Promise((resolve) => {
      chatSocket?.emit('joinPublicChatRoom', { roomName, password });
      IoEventOnce(chatSocket!, 'joinPublicChatRoom', (data: any) => {
        resolve(data);
      });
    });
  };

  return (
    <>
      <List sx={style} component="nav" aria-label="mailbox folders">
        {roomNameList.map((roomName: string) => {
          return roomName !== chatRoom?.roomName ? (
            <ListItem
              key={roomName}
              divider
              onClick={async () => {
                await joinRoom(roomName);
              }}
            >
              <ListItemText primary={`방 이름: ${roomName}`} />
            </ListItem>
          ) : null;
        })}
      </List>
      <CreateRoomButton />
    </>
  );
};

export default ChatRoomList;
