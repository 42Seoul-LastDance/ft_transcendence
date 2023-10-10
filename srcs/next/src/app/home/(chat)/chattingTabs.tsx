'use client';

import React, { useState } from 'react';
import { Tab, Tabs } from '@mui/material';
import ChatRoomList from './chatRoomList';
import FriendList from '../(dm)/friendList';
import { useDispatch } from 'react-redux';

const ChattingTabs = () => {
  const dispatch = useDispatch();
  const value = useSelector((state: RootState) => state.user.chattingTabValue);

  const handleChange = (event: React.ChangeEvent<{}>, newValue: number) => {
    dispatch(setValue(newValue));
  };

  return (
    <div>
      <Tabs value={value} onChange={handleChange}>
        <Tab label="Chatting" />
        <Tab label="Friends" />
        <Tab label="Requests" />
        <Tab label="Block Lists" />
      </Tabs>
      <div>
        {value === 0 && <ChatRoomList />}
        {value === 1 && <FriendList />}
        {value === 2 && <div>친구 요청 목록</div>}
        {value === 3 && <div>차단 목록</div>}
      </div>
    </div>
  );
};

export default ChattingTabs;