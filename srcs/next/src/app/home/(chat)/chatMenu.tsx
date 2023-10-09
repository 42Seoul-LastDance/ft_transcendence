'use client';
import * as React from 'react';
import Button from '@mui/material/Button';
import ButtonGroup from '@mui/material/ButtonGroup';
import Box from '@mui/material/Box';
import { useSelector } from 'react-redux';
import { RootState } from '../../redux/store';
import { UserPermission } from '../../interface';

const ChatMenu = () => {
  const chatRoom = useSelector((state: RootState) => state.user.chatRoom);
  const buttons = [
    <Button key="profile">Profile</Button>,
    <Button key="mute">Mute</Button>,
    <Button key="game">Game</Button>,
    chatRoom?.userPermission === UserPermission.OPERATOR ? (
      <>
        <Button key="kick">Kick</Button>,<Button key="ban">Ban</Button>,
      </>
    ) : null,
    chatRoom?.userPermission === UserPermission.OWNER ? (
      <>
        <Button key="makeOperator">MakeOperator</Button>,
      </>
    ) : null,
  ];

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
