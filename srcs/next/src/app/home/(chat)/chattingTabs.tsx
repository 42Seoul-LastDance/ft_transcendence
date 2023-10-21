'use client';

import React, { useEffect, useState } from 'react';
import { Tab, Tabs } from '@mui/material';
import ChatRoomList from './chatRoomList';
import FriendList from '../(dm)/friendList';
import BlockList from '../(block)/blockList';
import RequestList from '../(friendRequest)/requestList';
import { useSuperSocket } from '@/app/contexts/superSocketContext';
import { useDispatch, useSelector } from 'react-redux';
import { setChatRoom, setJoin } from '@/app/redux/userSlice';
import ChattingPage from './chattingPage';
import { RootState } from '@/app/redux/store';
import { useChatSocket } from '@/app/contexts/chatSocketContext';
import { JoinStatus } from '@/app/enums';

const commonTabStyle = {
  bgcolor: '#white',
  borderRadius: '15px 15px 0 0',
};

const activeTabStyle = {
  ...commonTabStyle,
  fontWeight: 'bold',
};

const inactiveTabStyle = {
  ...commonTabStyle,
  opacity: 0.8,
};

const ChattingTabs: React.FC = () => {
  const [value, setValue] = useState<number>(0);
  const dispatch = useDispatch();
  const chatSocket = useChatSocket();
  const superSocket = useSuperSocket();
  const joinStatus = useSelector((state: RootState) => state.user.join);

  const handleChange = (event: React.ChangeEvent<{}>, newValue: number) => {
    dispatch(setJoin(JoinStatus.NONE));
    dispatch(setChatRoom(null));
    chatSocket?.emit('exitChatRoom');
    setValue(newValue);
  };

  return (
    <div style={{ justifyContent: 'center' }}>
      <Tabs value={value} onChange={handleChange}>
        <Tab
          label="Chatting"
          className="list-item"
          sx={value === 0 ? activeTabStyle : inactiveTabStyle}
        />
        <Tab
          label="Friends"
          className="list-item"
          sx={value === 1 ? activeTabStyle : inactiveTabStyle}
        />
        <Tab
          label="Requests"
          className="list-item"
          sx={value === 2 ? activeTabStyle : inactiveTabStyle}
        />
        <Tab
          label="Block List"
          className="list-item"
          sx={value === 3 ? activeTabStyle : inactiveTabStyle}
        />
      </Tabs>
      <div>
        {value === 0 && (
          <div>
            <div>
              <ChatRoomList />
            </div>
            <div>
              {joinStatus === JoinStatus.CHAT && (
                <ChattingPage socket={chatSocket} />
              )}
            </div>
          </div>
        )}
        {value === 1 && (
          <div>
            <FriendList />
            {joinStatus === JoinStatus.DM && (
              <ChattingPage socket={superSocket} />
            )}
          </div>
        )}
        {value === 2 && <RequestList />}
        {value === 3 && <BlockList />}
      </div>
    </div>
  );
};

export default ChattingTabs;
