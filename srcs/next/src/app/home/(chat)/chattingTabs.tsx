'use client';

import React, { use, useEffect, useState } from 'react';
import { Tab, Tabs } from '@mui/material';
import ChatRoomList from './chatRoomList';
import FriendList from '../(dm)/friendList';
import BlockList from '../(block)/blockList';
import RequestList from '../(friendRequest)/requestList';

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
        {value === 2 && <RequestList />}
        {value === 3 && <BlockList />}
      </div>
    </div>
  );
};

export default ChattingTabs;
