'use client';

import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  List,
  ListItem,
  ListItemText,
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';

const ChatRoom: React.FC = () => {
  const [messages, setMessages] = useState<string[]>([]);
  const [newMessage, setNewMessage] = useState<string>('');

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setNewMessage(event.target.value);
  };

  const handleSendMessage = () => {
    if (newMessage) {
      // 새 메시지를 배열에 추가
      setMessages([...messages, newMessage]);
      // 입력 상자 비우기
      setNewMessage('');
    }
  };

  return (
    <Box>
      <List>
        {messages.map((message, index) => (
          <ListItem key={index}>
            <ListItemText primary={message} />
          </ListItem>
        ))}
      </List>
      <Box display="flex" alignItems="center">
        <TextField
          label="메시지 입력"
          variant="outlined"
          fullWidth
          value={newMessage}
          onChange={handleInputChange}
        />
        <Button
          variant="contained"
          color="primary"
          endIcon={<SendIcon />}
          onClick={handleSendMessage}
        >
          보내기
        </Button>
      </Box>
    </Box>
  );
};

export default ChatRoom;
