'use client';

import React, { useState } from 'react';
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
import PersonIcon from '@mui/icons-material/Person';
import ChatIcon from '@mui/icons-material/Chat';
import GroupAddIcon from '@mui/icons-material/GroupAdd';
import BlockIcon from '@mui/icons-material/Block';
const commonTabStyle = {
  color: 'black', // 텍스트 색상을 검정색으로 설정
  width: '120px',
  height: '40px',
  borderRadius: '15px 15px 0 0',
  borderBottom: '1px solid transparent', // 아웃라인 추가
  borderColor: '#ffbf06', // 테두리의 색상을 검정색으로 설정
  borderWidth: '2px', // 테두리의 두께를 2px로 설정
  borderStyle: 'solid', // 테두리 스타일을 실선으로 설정
};

const activeTabStyle = {
  ...commonTabStyle,
  fontWeight: 'bold',
};

const inactiveTabStyle = {
  ...commonTabStyle,
};

// 선택된 탭의 아웃라인 스타일 변경
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
      <Tabs
        value={value}
        onChange={handleChange}
        textColor="secondary"
        indicatorColor="secondary"
      >
        <Tab
          label="Chatting"
          icon={<ChatIcon />}
          className="yellow-hover"
          sx={value === 0 ? activeTabStyle : inactiveTabStyle}
        />
        <Tab
          label="Friends"
          icon={<PersonIcon />}
          className="yellow-hover"
          sx={value === 1 ? activeTabStyle : inactiveTabStyle}
        />
        <Tab
          label="Requests"
          icon={<GroupAddIcon />}
          className="yellow-hover"
          sx={value === 2 ? activeTabStyle : inactiveTabStyle}
        />
        <Tab
          label="BlockList"
          icon={<BlockIcon />}
          className="yellow-hover"
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
