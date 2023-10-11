'use client';

import React, { useEffect, useState } from 'react';
import { Tab, Tabs } from '@mui/material';
import ChatRoomList from './chatRoomList';
import FriendList from '../(dm)/friendList';

const ChattingTabs: React.FC = () => {
  const [value, setValue] = useState<number>(0);
  const handleChange = (event: React.ChangeEvent<{}>, newValue: number) => {
    setValue(newValue);
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
