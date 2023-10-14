'use client';

import React, { useEffect, useState } from 'react';
import { Tab, Tabs } from '@mui/material';
import ChatRoomList from './chatRoomList';
import FriendList from '../(dm)/friendList';
import BlockList from '../(block)/blockList';
import RequestList from '../(friendRequest)/requestList';
import { useSuperSocket } from '@/app/context/superSocketContext';
import { useDispatch } from 'react-redux';
import { JoinStatus } from '@/app/interface';
import { setJoin } from '@/app/redux/userSlice';

const ChattingTabs: React.FC = () => {
  const [value, setValue] = useState<number>(0);
  const dispatch = useDispatch();

  const handleChange = (event: React.ChangeEvent<{}>, newValue: number) => {
    dispatch(setJoin(JoinStatus.NONE));
    setValue(newValue);
  };

  return (
    <div>
      <Tabs value={value} component="nav" onChange={handleChange}>
        <Tab label="Chatting" />
        <Tab label="Friends" />
        <Tab label="Requests" />
        <Tab label="Block List" />
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
