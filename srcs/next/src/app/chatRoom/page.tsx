'use client';
import React, { useState, useEffect } from 'react';
import {
  Container,
  Card,
  CardContent,
  TextField,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
} from '@mui/material';

interface ChatMessage {
  username: string;
  message: string;
}

function Chatting() {
  const [username, setUsername] = useState('');
  const [message, setMessage] = useState('');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]); // ChatMessage[] 타입 명시

  useEffect(() => {
    setUsername('jun');
  }, []);

  // 메세지 보낼 때 동작
  const handleSendMessage = () => {
    if (message) {
      const newMsg: ChatMessage = {
        username,
        message,
      };
      setChatMessages([...chatMessages, newMsg]);
      setMessage('');
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      handleSendMessage();
    }
  };

  return (
    <Container maxWidth="sm">
      <Card
        className="mt-4"
        style={{ height: '600px', width: '35rem', margin: 'auto' }}
      >
        <CardContent
          style={{ overflowY: 'auto', height: 'calc(100% - 100px)' }}
        >
          <List>
            {chatMessages.map((msg, index) => (
              <ListItem key={index}>
                <ListItemText
                  primary={
                    <div
                      style={{
                        textAlign: username === msg.username ? 'right' : 'left',
                      }}
                    >
                      {msg.username}
                    </div>
                  }
                  secondary={msg.message}
                  primaryTypographyProps={{ variant: 'subtitle1' }}
                  secondaryTypographyProps={{ variant: 'body1' }}
                />
                <ListItemSecondaryAction>
                  <div
                    style={{
                      textAlign: username === msg.username ? 'right' : 'left',
                    }}
                  >
                    {msg.username === username ? 'You' : ''}
                  </div>
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>
        </CardContent>
        <div style={{ display: 'flex', alignItems: 'center', padding: '8px' }}>
          <TextField
            fullWidth
            id="msgText"
            variant="outlined"
            label="Message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <Button
            id="sendBtn"
            variant="contained"
            color="primary"
            size="large"
            onClick={handleSendMessage}
            style={{ marginLeft: '8px' }}
          >
            Send
          </Button>
        </div>
      </Card>
    </Container>
  );
}

export default Chatting;
