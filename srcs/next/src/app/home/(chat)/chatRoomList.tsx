'use client';

import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import CreateRoomButton from './createRoomButton';
import { useChatSocket } from '../../context/chatSocketContext';
import {
  ChatRoomDto,
  EmitResult,
  Events,
  JoinStatus,
  RoomStatus,
} from '../../interface';
import { useSelector } from 'react-redux';
import { RootState } from '../../redux/store';
import { useDispatch } from 'react-redux';
import { setChatRoom, setJoin } from '../../redux/userSlice';
import { isValid } from '../valid';
import { myAlert } from '../alert';
import { clearSocketEvent, registerSocketEvent } from '@/app/context/socket';
import { useEffect } from 'react';
import { setRoomNameList } from '@/app/redux/roomSlice';
import { Grow } from '@mui/material';
import { maxPasswordLength } from '@/app/globals';

const ChatRoomList: React.FC = () => {
  const chatRoom = useSelector((state: RootState) => state.user.chatRoom);
  const chatSocket = useChatSocket();
  const dispatch = useDispatch();
  const roomNameList = useSelector(
    (state: RootState) => state.room.roomNameList,
  );
  const join = useSelector((state: RootState) => state.user.join);

  useEffect(() => {
    const e: Events[] = [
      {
        event: 'getChatRoomList',
        callback: (data: string[]) => dispatch(setRoomNameList(data)),
      },
      {
        event: 'joinPublicChatRoom',
        callback: (data: EmitResult) => {
          if (data.result === true) {
            dispatch(setJoin(JoinStatus.CHAT));
            myAlert('success', data.reason, dispatch);
          } else {
            dispatch(setChatRoom(null));
            dispatch(setJoin(JoinStatus.NONE));
            myAlert('error', data.reason, dispatch);
          }
        },
      },
      {
        event: 'getChatRoomInfo',
        callback: (data: ChatRoomDto) => {
          dispatch(setChatRoom(data));
        },
      },
    ];
    registerSocketEvent(chatSocket!, e);
    return () => {
      clearSocketEvent(chatSocket!, e);
    };
  }, [roomNameList]);

  // TODO: 내일 로직 바꾸기 ^ 3 🙈
  useEffect(() => {
    console.log('챗룸 유즈이펙트', chatRoom);
    if (chatRoom) {
      let password: string | null = null;
      if (chatRoom.requirePassword) {
        password = prompt('비밀번호를 입력하세요');
        if (
          password === null ||
          isValid('비밀번호가', password, maxPasswordLength, dispatch) === false
        )
          return;
      }
      chatSocket?.emit('joinPublicChatRoom', {
        roomName: chatRoom.roomName,
        password: password,
      });
    }
  }, [chatRoom]);

  const joinRoom = (roomName: string) => {
    chatSocket?.emit('getChatRoomInfo', {
      roomName: roomName,
      status: RoomStatus.PUBLIC,
    });
  };

  return (
    <>
      <List aria-label="ChatRoom-List">
        {roomNameList.map((roomName: string) => {
          return roomName !== chatRoom?.roomName ? (
            <Grow in={true} key={roomName} timeout={1000}>
              <ListItem
                divider
                onClick={() => joinRoom(roomName)}
                className="list-item"
              >
                <ListItemText primary={`방 이름: ${roomName}`} />
              </ListItem>
            </Grow>
          ) : null;
        })}
      </List>
      <CreateRoomButton />
    </>
  );
};
export default ChatRoomList;
