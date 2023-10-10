'use client';
import React, { useState, useEffect, use } from 'react';
import {
  Container,
  Card,
  CardContent,
  TextField,
  Button,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Drawer,
} from '@mui/material';
import SettingsIcon from '@mui/icons-material/Settings'; // 설정 아이콘 추가
import ChatSetting from './chatSetting';
import { RootState } from '../../redux/store';
import { useDispatch, useSelector } from 'react-redux';
import { useChatSocket } from '../../context/chatSocketContext';
import {
  ChatMessage,
  ChattingPageProps,
  SendMessageDto,
} from '../../interface';
import { setChatMessages } from '@/app/redux/roomSlice';
import { IoEventListener, IoEventOnce } from '@/app/context/socket';

const ChattingPage = (props: ChattingPageProps) => {
  const [message, setMessage] = useState('');
  const chatMessages = useSelector(
    (state: RootState) => state.room.chatMessages,
  );
  const [isSettingsOpen, setIsSettingsOpen] = useState(false); // 설정 아이콘 클릭 시 설정창 표시 여부
  const dispatch = useDispatch();
  const chatRoom = useSelector((state: RootState) => state.user.chatRoom);
  const myName = useSelector((state: RootState) => state.user.userName);

  const handleCheckRendering = (data: any) => {
    console.log('check rendering', data);
    props.socket?.emit('receiveMessage', {
      userName: data.userName,
      content: data.content,
    });
  };

  const handleReceiveMessage = (data: any) => {
    console.log('receive Message', data);
    if (data) {
      const receiveMsg: ChatMessage = {
        userName: data.userName,
        content: data.content,
      };
      // 그리기
      dispatch(setChatMessages([...chatMessages, receiveMsg]));
    }
  };

  // 메세지 받기
  IoEventListener(props.socket!, 'sendMessage', handleCheckRendering);
  IoEventListener(props.socket!, 'receiveMessage', handleReceiveMessage);

  // 메세지 보내기
  const SendMessage = () => {
    if (!message) return;
    if (!chatRoom) throw new Error('chatRoom is null');
    const newMsg: ChatMessage = {
      userName: myName!,
      content: message,
    };
    setChatMessages([...chatMessages, newMsg]);
    const newSend: SendMessageDto = {
      roomName: chatRoom.roomName,
      status: chatRoom.status,
      userName: myName!,
      content: message,
    };
    console.log('newSend', newSend);
    props.socket?.emit('sendMessage', newSend);
    setMessage('');
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      SendMessage();
    }
  };

  const toggleSettings = () => {
    setIsSettingsOpen(!isSettingsOpen);
  };

  return (
    <Container
      maxWidth="sm"
      style={{
        display: 'flex', //오 플렉스
        flexDirection: 'column', // 컨테이너 내의 요소를 위에서 아래로 배치하도록 수정
        justifyContent: 'flex-start',
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
                  primary={msg.userName}
                  secondary={msg.content}
                  style={{
                    textAlign: myName === msg.userName ? 'right' : 'left',
                  }}
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
            onChange={(e: {
              target: { value: React.SetStateAction<string> };
            }) => setMessage(e.target.value)}
            onKeyPress={handleKeyDown}
          />
          <Button
            id="sendBtn"
            variant="contained"
            color="primary"
            size="large"
            onClick={SendMessage}
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
};

export default ChattingPage;
