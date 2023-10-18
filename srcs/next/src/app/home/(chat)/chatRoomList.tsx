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
  GetChatRoomListJSON,
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
import { useEffect, useState } from 'react';
import { setRoomList } from '@/app/redux/roomSlice';
import { Grow } from '@mui/material';
import { maxPasswordLength } from '@/app/globals';

const ChatRoomList: React.FC = () => {
  const chatRoom = useSelector((state: RootState) => state.user.chatRoom);
  const chatSocket = useChatSocket();
  const dispatch = useDispatch();
  const roomList = useSelector((state: RootState) => state.room.roomList);
  const join = useSelector((state: RootState) => state.user.join);
  const [click, setClick] = useState<boolean>(false);

  useEffect(() => {
    const e: Events[] = [
      {
        event: 'getChatRoomInfo',
        callback: (data: ChatRoomDto) => {
          dispatch(setChatRoom(data));
        },
      },
      {
        event: 'getChatRoomList',
        callback: (data: GetChatRoomListJSON[]) => dispatch(setRoomList(data)),
      },
      {
        event: 'joinPublicChatRoom',
        once: true,
        callback: (data: EmitResult) => {
          setClick(false);
          if (data.result === true) {
            dispatch(setJoin(JoinStatus.CHAT));
            myAlert('success', data.reason, dispatch);
          } else {
            // dispatch(setChatRoom(null));
            dispatch(setJoin(JoinStatus.NONE));
            myAlert('error', data.reason, dispatch);
          }
        },
      },
    ];
    registerSocketEvent(chatSocket!, e);
    return () => {
      clearSocketEvent(chatSocket!, e);
    };
  }, [join, chatRoom, click]);

  const joinRoom = (room: GetChatRoomListJSON) => {
    setClick(true);
    let password;
    if (room.requirePassword) {
      password = prompt(); // 비밀번호 비동기 입력
      if (!isValid('비밀번호가', password!, maxPasswordLength, dispatch))
        return;
    }
    chatSocket!.emit('joinPublicChatRoom', {
      roomName: room.roomName,
      password: password ? password : null,
    });
  };

  return (
    <>
      <List aria-label="ChatRoom-List">
        {roomList.map((room: GetChatRoomListJSON, rowIdx: number) => {
          return room.roomName !== chatRoom?.roomName ? (
            <Grow in={true} key={room.roomName} timeout={1000}>
              <ListItem
                divider
                onClick={() => joinRoom(room)}
                className="list-item"
              >
                room.requirePassWord ? (<></>):(null)
                <ListItemText primary={`방 이름: ${room.roomName}`} />
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
