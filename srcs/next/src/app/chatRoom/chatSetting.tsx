'use client';

import React, { useState } from 'react';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import Divider from '@mui/material/Divider';
import ListItemText from '@mui/material/ListItemText';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import Avatar from '@mui/material/Avatar';
import ChatMenu from './chatMenu';
import { Menu } from '@mui/material';

const ChatSetting: React.FC = () => {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLDivElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <List sx={{ width: 300, bgcolor: 'background.paper' }}>
      <h3>채팅방 유저 리스트</h3>
      <ListItem alignItems="flex-start">
        <ListItemAvatar onClick={handleClick}>
          <Avatar alt="JJun" src="/static/images/avatar/1.jpg" />
        </ListItemAvatar>
        <ListItemText primary="username" secondary="introduce" />
      </ListItem>
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
