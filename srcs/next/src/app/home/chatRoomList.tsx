'use client';

import React, { useEffect, useState } from 'react';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import CreateRoomButton from './createRoomButton';
import { useChatSocket } from '../context/chatSocketContext';
import { ChatRoomDto, RoomStatus } from '../interface'; // ChatRoomDto 및 ChatRoomListDto는 사용되지 않으므로 import 제거
import { useSelector } from 'react-redux';
import { RootState } from '../redux/store';
import { useDispatch } from 'react-redux';
import { setIsJoined } from '../redux/roomSlice';
import { setChatRoom } from '../redux/userSlice';

const style = {
  width: '100%',
  maxWidth: 360,
  bgcolor: 'background.paper',
};

const ChatRoomList: React.FC = () => {
  const chatSocket = useChatSocket();
  const dispatch = useDispatch();

  const roomNameList = useSelector(
    (state: RootState) => state.room.roomNameList,
  );

  const joinRoom = (roomName: string) => {
    if (!chatSocket.hasListeners('getChatRoomInfo')) {
      chatSocket.on('getChatRoomInfo', (data: ChatRoomDto) => {
        if (data.requirePassword === true) {
          const password = prompt('비밀번호를 입력하세요');
          console.log('password: ', data.password);
          if (password === data.password) {
            dispatch(setChatRoom(data));
            dispatch(setIsJoined(true));
          } else {
            alert('비밀번호가 틀렸습니다');
          }
        } else if (data.requirePassword === false) {
          dispatch(setChatRoom(data));
          dispatch(setIsJoined(true));
        } else {
          console.log('curRoom.requirePassword : 이것은 backend 잘못이여');
        }
      });
    }

    chatSocket.emit('getChatRoomInfo', {
      roomName: roomName,
      status: RoomStatus.PUBLIC,
    });
    console.log('join!!');
  };

  return (
    <>
      <List sx={style} component="nav" aria-label="mailbox folders">
        {roomNameList.map((roomName) => (
          <ListItem
            key={roomName}
            divider
            onClick={() => {
              joinRoom(roomName);
            }}
          >
            <ListItemText
              primary={`방 이름: ${roomName}`}
              // secondary={`잠금 여부: ${roomName}`}
            />
          </ListItem>
        ))}
      </List>
      <CreateRoomButton />
    </>
  );
};

export default ChatRoomList;
