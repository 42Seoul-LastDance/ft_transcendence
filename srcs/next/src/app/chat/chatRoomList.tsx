'use client'

import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../redux/store';
import { Room, RoomArray } from '../redux/roomSlice';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Divider from '@mui/material/Divider';
import Box from '@mui/material/Box';
import Fab from '@mui/material/Fab';
import AddIcon from '@mui/icons-material/Add';
import CreateRoomButton from './createRoomButton';

import { getChatSocket } from '../SSock';
import { Socket } from 'socket.io-client';

const style = {
  width: '100%',
  maxWidth: 360,
  bgcolor: 'background.paper',
};

const ChatRoomList: React.FC = () => {
  const [isClicked, setClicked] = useState(false);

  const handleFabClick = () => {
    if (isClicked) setClicked(false);
    else setClicked(true);
  };

  const joinRoom = (roomname: string) => {
    console.log('join: ', roomname);
  }
  
  // socket.on('chatRooms', (data) => {
  //   // 서버에서 chatRooms 이벤트를 통해 DTO를 받음
  //   console.log('서버로부터 DTO 수신:', data);

  const rooms: Room[] = useSelector((state: RootState) => state.room.roomArray);

  return (
    <>
      <div>
        <List sx={style} component="nav" aria-label="mailbox folders">
          {rooms.map((room) => (
            <ListItem button 
              key={room.username} 
              divider 
              onClick={()=>{joinRoom(room.roomname)}}>
              <ListItemText primary={room.roomname} />
            </ListItem>
          ))}
        </List>
      </div>

      <Box sx={{ '& > :not(style)': { m: 1 } }}>
        <Fab
          color="primary"
          aria-label="add"
          onClick={handleFabClick}
        >
          <AddIcon />
        </Fab>
        {isClicked ? <CreateRoomButton /> : null}
      </Box>
    </>
  );
};

export default ChatRoomList;
