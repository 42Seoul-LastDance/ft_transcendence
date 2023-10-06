'use client';

import React, { useState, MouseEvent } from 'react';
import List from '@mui/material/List';
import Divider from '@mui/material/Divider';
import ChatMenu from './chatMenu';
import { Menu } from '@mui/material';
import { useSelector } from 'react-redux';
import { RootState } from '../redux/store';
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
      채팅방 유저 리스트
      <Divider />오 - 너
      {chatRoom?.ownerName && (
        <CommonListItem text={chatRoom?.ownerName} onClick={handleClick} />
      )}
      <Divider />
      관리자
      {chatRoom?.operatorList.map((member: string | undefined) => (
        <CommonListItem text={member} onClick={handleClick} />
      ))}
      <Divider />
      먼지
      {chatRoom?.memberList.map((member: string | undefined) => (
        <CommonListItem text={member} onClick={handleClick} />
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
