'use client';

import React, { useState } from 'react';
import { Tab, Tabs } from '@mui/material';
import ChatRoomList from './chatRoomList';

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
        <Tab label="Setting" />
      </Tabs>
      <div>
        {value === 0 && <ChatRoomList />}
        {value === 1 && (
          <div>
            {/* 요기에다 DM 구현 고고 */}
            Tab 2 Content
          </div>
        )}
        {value === 2 && <div>Tab 3 Content</div>}
      </div>
    </div>
  );
};

export default ChattingTabs;
