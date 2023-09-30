'use client';
import * as React from 'react';
import Button from '@mui/material/Button';
import ButtonGroup from '@mui/material/ButtonGroup';
import Box from '@mui/material/Box';

const buttons = [
  <Button key="profile">Profile</Button>,
  <Button key="kick">Kick</Button>,
  <Button key="ban">Ban</Button>,
  <Button key="mute">Mute</Button>,
  <Button key="game">Game</Button>,
];

const ChatMenu = () => {
  return (
    <Box
      sx={{
        display: 'flex',
        '& > *': {
          m: 1,
        },
      }}
    >
      <ButtonGroup
        orientation="vertical"
        aria-label="vertical outlined button group"
      >
        {buttons}
      </ButtonGroup>
    </Box>
  );
};

export default ChatMenu;
