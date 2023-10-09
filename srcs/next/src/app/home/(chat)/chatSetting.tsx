'use client';

import React, { useState, MouseEvent } from 'react';
import List from '@mui/material/List';
import Divider from '@mui/material/Divider';
import ChatMenu from './chatMenu';
import { Menu } from '@mui/material';
import { useSelector } from 'react-redux';
import { RootState } from '../../redux/store';
import CommonListItem from './CommonListItem';

const ChatSetting: React.FC = () => {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const open = Boolean(anchorEl);
  const chatRoom = useSelector((state: RootState) => state.user.chatRoom);

  const handleClick = (event: MouseEvent<HTMLDivElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <List sx={{ width: 300, bgcolor: 'background.paper' }}>
      <p>채팅방 유저 리스트</p>
      {chatRoom?.memberList.map((member: string | undefined, index: number) => (
        <CommonListItem key={index} text={member} onClick={handleClick} />
      ))}
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        MenuListProps={{
          'aria-labelledby': 'basic-button',
        }}
      >
        <ChatMenu />
      </Menu>
      <Divider variant="inset" component="li" />
    </List>
  );
};

export default ChatSetting;
