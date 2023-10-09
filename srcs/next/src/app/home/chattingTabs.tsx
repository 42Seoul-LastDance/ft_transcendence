'use client';

import React, { useState } from 'react';
import { Tab, Tabs } from '@mui/material';
import ChatRoomList from './chatRoomList';
import FriendList from './(dm)/friendList';

const ChattingTabs = () => {
  const [value, setValue] = useState<number>(0);

  const handleChange = (event: React.ChangeEvent<{}>, newValue: number) => {
    setValue(newValue);
  };

  return (
    <div>
      <Tabs value={value} onChange={handleChange}>
        <Tab label="Chatting" />
        <Tab label="DM" />
        <Tab label="Friends" />
      </Tabs>
      <div>
        {value === 0 && <ChatRoomList />}
        {value === 1 && <FriendList />}
        {value === 2 && <div>친구요청 목록, ㅊㅏ다ㄴ 목목록록</div>}
      </div>
    </div>
  );
};

export default ChattingTabs;
