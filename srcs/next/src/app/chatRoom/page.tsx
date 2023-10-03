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
  AppBar,
  Box,
  Toolbar,
  IconButton,
  Drawer,
} from '@mui/material';
import SettingsIcon from '@mui/icons-material/Settings'; // 설정 아이콘 추가
import ChatSetting from './chatSetting';
import {useChatSocket, ChatSocketProvider} from '../Context/ChatSocketContext'
interface ChatMessage {
  username: string;
  message: string;
}

// ㅅㅐ로고침하면 밖으로 나가게 해해야야함함

const ChattingContent = () => {
  const [username, setUsername] = useState('');
  const [message, setMessage] = useState('');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]); // ChatMessage[] 타입 명시
  const [isSettingsOpen, setIsSettingsOpen] = useState(false); // 설정 아이콘 클릭 시 설정창 표시 여부

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

  const toggleSettings = () => {
    setIsSettingsOpen(!isSettingsOpen);
  };

  return (
    <Container
      maxWidth="sm"
      style={{
        display: 'flex',
        flexDirection: 'column', // 컨테이너 내의 요소를 위에서 아래로 배치하도록 수정
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
      }}
    >
      {/* 설정 아이콘 버튼 */}
      <IconButton
        color="primary"
        aria-label="settings"
        sx={{ position: 'absolute', top: '16px', right: '16px' }}
        onClick={toggleSettings} // 설정 아이콘 버튼 클릭 시 설정창 토글
      >
        <SettingsIcon />
      </IconButton>

      <Card
        className="mt-4"
        style={{
          height: '700px',
          width: '35rem',
          margin: 'auto',
          alignItems: 'center',
        }}
      >
        <CardContent
          style={{ overflowY: 'auto', height: 'calc(100% - 105px)' }}
        >
          <List>
            {chatMessages.map((msg, index) => (
              <ListItem key={index}>
                <ListItemText
                  primary={
                    <div
                      style={{
                        textAlign: username === msg.username ? 'left' : 'left',
                      }}
                    >
                      {msg.username}
                    </div>
                  }
                  secondary={msg.message}
                  primaryTypographyProps={{ variant: 'subtitle1' }}
                  secondaryTypographyProps={{ variant: 'body1' }}
                />
              </ListItem>
            ))}
          </List>
        </CardContent>
        <div style={{ display: 'flex', alignItems: 'center', padding: '8px' }}>
          {/* 채팅 입력 필드와 전송 버튼 */}
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

      {/* 오른쪽 설정창 */}
      <Drawer anchor="right" open={isSettingsOpen} onClose={toggleSettings}>
        {/* 설정창 내용 */}
        <ChatSetting />
      </Drawer>
    </Container>
  );
}

const Chatting = () => {
  return (
    <>
          <ChattingContent/>
    </>
  );
}

export default Chatting;
