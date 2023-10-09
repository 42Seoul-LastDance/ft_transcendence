'use client';

import React, { useEffect, useState } from 'react';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import CreateRoomButton from './createRoomButton';
import { useChatSocket } from '../context/chatSocketContext';
import { ChatRoomDto, RoomStatus, JoinRoomDto } from '../interface'; // ChatRoomDto 및 ChatRoomListDto는 사용되지 않으므로 import 제거
import { useSelector } from 'react-redux';
import { RootState } from '../redux/store';
import { useDispatch } from 'react-redux';
import { setIsJoined } from '../redux/roomSlice';
import { setChatRoom } from '../redux/userSlice';
import { IoEventListner } from '../context/socket';

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

  const joinRoom = (roomName: string) => {
    if (!chatSocket?.hasListeners('joinPublicChatRoom')) {
      chatSocket?.on('joinPublicChatRoom', (data: JoinRoomDto) => {
        if (data.result === true) {
          dispatch(setIsJoined(true));
        } else {
          dispatch(setIsJoined(false));
          dispatch(setChatRoom(null));
          console.log('방 입장 실패함 ', data.reason);
          console.log(data);
        }
      });
    }

    const handleGetChatRoom = (data: ChatRoomDto) => {
      console.log('getChatRoomInfo data ', data);
      dispatch(setChatRoom(data));
      let password: string | null = null;
      if (data.requirePassword === true)
        password = prompt('비밀번호를 입력하세요');

      dispatch(setIsJoined(false));
      chatSocket?.emit('joinPublicChatRoom', {
        roomName: roomName,
        password: password,
      });
    };

    IoEventListner(chatSocket!, 'getChatRoomInfo', handleGetChatRoom);

    // if (!chatSocket.hasListeners('getChatRoomInfo')) {
    //   chatSocket.on('getChatRoomInfo', (data: ChatRoomDto) => {
    //     console.log('getChatRoomInfo data ', data);
    //     dispatch(setChatRoom(data));
    //     let password: string | null = null;
    //     if (data.requirePassword === true)
    //       password = prompt('비밀번호를 입력하세요');

    //     dispatch(setIsJoined(false));
    //     chatSocket.emit('joinPublicChatRoom', {
    //       roomName: roomName,
    //       password: password,
    //     });
    //   });
    // }

    chatSocket?.emit('getChatRoomInfo', {
      roomName: roomName,
      status: RoomStatus.PUBLIC,
    });
  };

  return (
    <>
      <>
        <List sx={style} component="nav" aria-label="mailbox folders">
          {roomNameList.map((roomName: string) => {
            return roomName !== chatRoom?.roomName ? (
              <ListItem
                key={roomName}
                divider
                onClick={() => {
                  joinRoom(roomName);
                }}
              >
                <ListItemText primary={`방 이름: ${roomName}`} />
              </ListItem>
            ) : null;
          })}
        </List>
      </>
      <CreateRoomButton />
    </>
  );
};

export default ChatRoomList;
