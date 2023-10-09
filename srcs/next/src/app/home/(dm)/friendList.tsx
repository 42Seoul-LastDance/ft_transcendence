'use client';

import React, { useEffect, useState } from 'react';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import { useSuperSocket } from '../../context/superSocketContext';
import { useSelector } from 'react-redux';
import { RootState } from '../../redux/store';
import { useDispatch } from 'react-redux';
import sendRequest from '../../api';
// import { IoEventListner } from '../context/socket';

const style = {
  width: '100%',
  maxWidth: 360,
  bgcolor: 'background.paper',
};

const FriendList: React.FC = () => {
  const superSocket = useSuperSocket();
  const dispatch = useDispatch();

  const handleResponse = async () => {
    const response = await sendRequest('get', '/friends/getFriendList');
  };
  handleResponse();
  // const roomNameList = useSelector(
  //   (state: RootState) => state.room.roomNameList,
  // );

  return (
    <>
      {/* <List sx={style} component="nav" aria-label="mailbox folders">
          {roomNameList.map((roomName: string) => {
            return roomName !== chatRoom?.roomName ? (
              <ListItem
                key={roomName}
                divider
                onClick={() => {
                  //joinRoom(roomName);
                }}
              >
                <ListItemText primary={`방 이름: ${roomName}`} />
              </ListItem>
            ) : null;
          })}
        </List> */}
    </>
  );
};

export default FriendList;
