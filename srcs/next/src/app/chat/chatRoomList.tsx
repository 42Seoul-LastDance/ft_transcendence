'use client';

import React, { useEffect, useState } from 'react';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import CreateRoomButton from './createRoomButton';
import { useRouter } from 'next/navigation';
import { useChatSocket } from '../Context/ChatSocketContext';
import { RoomStatus } from '../DTO/RoomInfo.dto'; // ChatRoomDto 및 ChatRoomListDto는 사용되지 않으므로 import 제거
import { ChatRoomDto } from '../DTO/ChatRoom.dto';
import { useSelector } from 'react-redux';
import { RootState } from '../redux/store';
import { useDispatch } from 'react-redux';
import { setIsJoined, setRoomNameList } from '../redux/roomSlice';
import { DefaultEventsMap } from '@socket.io/component-emitter';
import { Dispatch, AnyAction } from 'redux';
import { Socket } from 'socket.io-client';

const style = {
  width: '100%',
  maxWidth: 360,
  bgcolor: 'background.paper',
};

// const eventSet = (chatSocket: Socket, dispatch: Dispatch) => {
//   chatSocket.on('getChatRoomList', (data) => {
//     dispatch(setRoomNameList(data));
//     console.log('event Detected');
//   });
//   chatSocket.emit('getChatRoomList', {
//     roomStatus: RoomStatus.PUBLIC,
//   });
// };

const ChatRoomList: React.FC = () => {
  const chatSocket = useChatSocket();
  const dispatch = useDispatch();
  const isJoined = useSelector((state: RootState) => state.room.isJoined);

  const roomNameList = useSelector(
    (state: RootState) => state.room.roomNameList,
  );

  // if (!chatSocket.hasListeners('getChatRoomList')) {
  //   chatSocket.on('getChatRoomList', (data) => {
  //     dispatch(setRoomNameList(data));
  //   });
  // }

  // useEffect(() => {
  //   chatSocket.emit('getChatRoomList', {
  //     roomStatus: RoomStatus.PUBLIC,
  //   });
  // }, []);

  const joinRoom = (roomName: string) => {
    if (!chatSocket.hasListeners('getChatRoomInfo')) {
      chatSocket.on('getChatRoomInfo', (curRoomInfo: ChatRoomDto) => {
        console.log('curRoomInfo: ', curRoomInfo);
        console.log('curRoomInfo: ', curRoomInfo.requirePassword);
        if (curRoomInfo.requirePassword === true) {
          const password = prompt('비밀번호를 입력하세요');
          console.log('password: ', curRoomInfo.password);
          if (password === curRoomInfo.password) {
            // router.push('/chatRoom');
            dispatch(setIsJoined(true));
          } else {
            alert('비밀번호가 틀렸습니다');
          }
        } else if (curRoomInfo.requirePassword === false) {
          console.log('비밀번호 없음');
          // router.push('/chatRoom');
          dispatch(setIsJoined(true));
        } else {
          console.log('curRoomInfo.requirePassword : 이것은 backend 잘못이여');
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
