'use client';
import React, { useEffect, useRef, useState } from 'react';
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
import {
  ChatMessage,
  ChattingPageProps,
  JoinStatus,
  MemberList,
} from '../../interface';
import DirectionsRunIcon from '@mui/icons-material/DirectionsRun';

import {
  clearChatMessages,
  setChatMessages,
  setRoomMemberList,
} from '@/app/redux/roomSlice';
import { IoEventListener, IoEventOnce } from '@/app/context/socket';
import { setShowAlert } from '@/app/redux/alertSlice';
import { isValid } from '../valid';
import { setChatRoom, setJoin } from '@/app/redux/userSlice';
import { myAlert } from '../alert';

const ChattingPage = (props: ChattingPageProps) => {
  const [message, setMessage] = useState('');
  const chatMessages = useSelector(
    (state: RootState) => state.room.chatMessages,
  );
  const [isSettingsOpen, setIsSettingsOpen] = useState(false); // 설정 아이콘 클릭 시 설정창 표시 여부
  const dispatch = useDispatch();
  const chatRoom = useSelector((state: RootState) => state.user.chatRoom);
  const myName = useSelector((state: RootState) => state.user.userName);
  const listRef = useRef(null);
  const join = useSelector((state: RootState) => state.user.join);

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
    if (join === JoinStatus.CHAT) {
      IoEventListener(props.socket!, 'sendMessage', (data: any) => {
        props.socket?.emit('receiveMessage', {
          userName: data.userName,
          content: data.content,
        });
      });
      IoEventListener(props.socket!, 'receiveMessage', (data: ChatMessage) => {
        dispatch(setChatMessages([...chatMessages, data]));
      });
      IoEventListener(props.socket!, 'explodeRoom', () => {
        handleExitRoom();
      });
      IoEventListener(
        props.socket!,
        'getMemberStateList',
        (data: MemberList[]) => {
          dispatch(setRoomMemberList(data));
        },
      );
    }
  }, [join, chatMessages]);

  // 메세지 보내기
  const SendMessage = () => {
    if (!message) return;
    if (!chatRoom) throw new Error('chatRoom is null');

    setChatMessages([
      ...chatMessages,
      {
        userName: myName!,
        content: message,
      },
    ]);

    props.socket?.emit('sendMessage', {
      roomName: chatRoom.roomName,
      userName: myName!,
      content: message,
      status: chatRoom.status,
    });

    setMessage('');
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      SendMessage();
    }
  };

  const toggleSettings = () => {
    IoEventListener(
      props.socket!,
      'getMemberStateList',
      (data: MemberList[]) => {
        dispatch(setRoomMemberList(data));
      },
    );
    props.socket?.emit('getMemberStateList', {
      roomName: chatRoom?.roomName,
      status: chatRoom?.status,
    });
    setIsSettingsOpen(!isSettingsOpen);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isValid('메세지가', e.target.value + ' ⏎', 50, dispatch)) {
      setMessage(e.target.value);
    }
  };

  const handleExitRoom = () => {
    props.socket?.emit('exitChatRoom');
    dispatch(setJoin(JoinStatus.NONE));
    dispatch(clearChatMessages([]));
    myAlert('success', '나가졌어요 펑 ~', dispatch);
    props.socket?.emit('getRoomNameList');
  };

  return join === JoinStatus.CHAT ? (
    <Container
      maxWidth="sm"
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-start',
        alignItems: 'center',
        height: '100vh',
      }}
    >
      {/* 설정 아이콘 버튼 */}
      <IconButton
        color="primary"
        aria-label="settings"
        sx={{ position: 'absolute', top: '16px', right: '20px' }}
        onClick={toggleSettings}
      >
        <SettingsIcon />
      </IconButton>
      <IconButton
        color="primary"
        aria-label="quit"
        sx={{ position: 'absolute', top: '16px', right: '60px' }}
        onClick={handleExitRoom}
      >
        <DirectionsRunIcon />
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
          {chatRoom?.roomName}
          <List ref={listRef} style={{ maxHeight: '550px', overflowY: 'auto' }}>
            {chatMessages?.map((msg, index) => (
              <ListItem key={index}>
                <ListItemText
                  primary={msg.userName} //undefiend userName
                  secondary={msg.content}
                  style={{
                    textAlign: myName === msg.userName ? 'right' : 'left', // 방 폭파되고 undefined되어있는 이슈
                    paddingRight: '8px',
                    paddingLeft: '8px',
                  }}
                />
                <div
                  style={{
                    textAlign: myName === msg.userName ? 'left' : 'right',
                    fontSize: '12px',
                    color: 'gray',
                  }}
                ></div>
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
            onChange={handleInputChange}
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
  ) : null;
};

export default ChattingPage;
