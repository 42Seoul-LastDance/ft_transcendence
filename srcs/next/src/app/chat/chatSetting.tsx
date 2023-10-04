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
  const curRoomInfo = useSelector((state: RootState) => state.user.curRoom);

  const handleClick = (event: MouseEvent<HTMLDivElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <List sx={{ width: 300, bgcolor: 'background.paper' }}>
      채팅방 유저 리스트
      <CommonListItem text={curRoomInfo?.ownerName} onClick={handleClick} />
      {curRoomInfo?.operatorList.map((member) => (
        <CommonListItem text={member} onClick={handleClick} />
      ))}
      {curRoomInfo?.memberList.map((member) => (
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
