'use client';
import React, { useEffect, useState } from 'react';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import CreateRoomButton from './createRoomButton';
import { useRouter } from 'next/navigation';
import { useChatSocket } from '../Context/ChatSocketContext';
import { ChatRoomDto } from '../DTO/ChatRoom.dto';
import { RoomInfoDto, RoomStatus } from '../DTO/RoomInfo.dto';
import { useSelector } from 'react-redux';
import { RootState } from '../redux/store';

const style = {
  width: '100%',
  maxWidth: 360,
  bgcolor: 'background.paper',
};

const ChatRoomList: React.FC = () => {
  const chatSocket = useChatSocket();
  const router = useRouter();

  const [chatRoomList, setChatRoomList] = useState<ChatRoomDto>({});

  chatSocket.emit('getChatRoomList', {
    roomStatus: RoomStatus.PUBLIC,
  });

  chatSocket.on('getChatRoomList', (data: ChatRoomDto) => {
    setChatRoomList(data);
    console.log('room list: ', data);
  });

  const joinRoom = (roomName: string) => {
    router.push('/chatRoom');
  };

  // test code for roomSlice
  const rooms: RoomInfoDto[] = useSelector(
    (state: RootState) => state.room.roomArray,
  );

  return (
    <>
      <List sx={style} component="nav" aria-label="mailbox folders">
        {Object.keys(chatRoomList).map((roomName) => (
          <ListItem
            key={roomName}
            divider
            onClick={() => {
              joinRoom(roomName);
            }}
          >
            <ListItemText primary={roomName} />
          </ListItem>
        ))}
      </List>
      <List sx={style} component="nav" aria-label="mailbox folders">
        {rooms.map((room) => (
          <ListItem
            key={room.username}
            divider
            onClick={() => {
              joinRoom(room.roomname);
            }}
          >
            <ListItemText primary={room.roomname} />
          </ListItem>
        ))}
      </List>
      <CreateRoomButton />
    </>
  );
};

export default ChatRoomList;
