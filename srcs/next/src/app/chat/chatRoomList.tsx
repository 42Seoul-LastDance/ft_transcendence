'use client';

import * as React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../redux/store';
import { Room } from '../redux/roomSlice';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import CreateRoomButton from './createRoomButton';
import { useRouter } from 'next/navigation';

const style = {
  width: '100%',
  maxWidth: 360,
  bgcolor: 'background.paper',
};

const ChatRoomList: React.FC = () => {
  const router = useRouter();
  const joinRoom = (roomname: string) => {
    // console.log('join: ', roomname);
    router.push('/chatRoom');
  };

  // socket.on('chatRooms', (data) => {
  //   // 서버에서 chatRooms 이벤트를 통해 DTO를 받음
  //   console.log('서버로부터 DTO 수신:', data);

  // 룸 목록 슬라이스에서 꺼내오기
  const rooms: Room[] = useSelector((state: RootState) => state.room.roomArray);

  return (
    <>
      <div>
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
      </div>
      <CreateRoomButton />
    </>
  );
};

export default ChatRoomList;
