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
  Paper,
} from '@mui/material';
import {
  ChatMessage,
  ChattingPageProps,
  Events,
  receiveMessage,
} from '../../interfaces';
import ChatSetting from './chatSetting';
import { RootState } from '../../redux/store';
import { useDispatch, useSelector } from 'react-redux';
import DirectionsRunIcon from '@mui/icons-material/DirectionsRun';
import { setChatRoom, setJoin } from '@/app/redux/userSlice';
import { myAlert } from '../alert';
import { useRouter } from 'next/navigation';
import sendRequest from '@/app/api';
import { clearSocketEvent, registerSocketEvent } from '@/app/contexts/socket';
import { isValid } from '../valid';
import { maxTypeLength } from '@/app/globals';
import { JoinStatus } from '@/app/enums';

const ChattingPage = (props: ChattingPageProps) => {
  const [inputMessage, setInputMessage] = useState('');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false); // 설정 아이콘 클릭 시 설정창 표시 여부
  const [isMouseOver, setIsMouseOver] = useState(false);
  const dispatch = useDispatch();
  const chatRoom = useSelector((state: RootState) => state.user.chatRoom);
  const myName = useSelector((state: RootState) => state.user.userName);
  const listRef = useRef<HTMLDivElement | null>(null);
  const join = useSelector((state: RootState) => state.user.join);
  const router = useRouter();
  const friendName = useSelector((state: RootState) => state.dm.friendName);
  const friendSlackId = useSelector(
    (state: RootState) => state.dm.friendSlackId,
  );
  let target: string | undefined | null = undefined;

  join === JoinStatus.CHAT
    ? (target = chatRoom?.roomName)
    : (target = friendName);

  useEffect(() => {
    console.log('--------- chattingPage component ---------');
    if (listRef.current)
      listRef.current.scrollTop = listRef.current.scrollHeight;

    const e: Events[] = [
      {
        event: 'sendMessage',
        once: true,
        callback: (data: ChatMessage) => {
          if (join === JoinStatus.CHAT)
            props.socket?.emit('receiveMessage', data);
          else if (
            join === JoinStatus.DM &&
            (data.userName === friendName || data.userName === myName)
          )
            setChatMessages([...chatMessages, data]);
        },
      },
      {
        event: 'receiveMessage',
        once: true,
        callback: (data: receiveMessage) => {
          if (data.canReceive === false) return;

          let newMsg: ChatMessage = {
            userName: data.userName,
            content: data.content,
          };
          setChatMessages([...chatMessages, newMsg]);
        },
      },
      {
        event: 'serverMessage',
        once: true,
        callback: (data: string) => {
          const serverMsg: ChatMessage = {
            userName: 'server',
            content: data,
          };
          setChatMessages([...chatMessages, serverMsg]);
        },
      },
      {
        event: 'explodeRoom',
        callback: handleExitRoom,
      },
      {
        event: 'kickUser',
        callback: handleExitRoom,
      },
    ];
    registerSocketEvent(props.socket!, e);
    return () => clearSocketEvent(props.socket!, e);
  }, [join, chatMessages, target]);

  useEffect(() => {
    if (join === JoinStatus.DM) prevDmMessages();
    else if (join === JoinStatus.CHAT) clearChatMessages();
    // TODO : 채팅방 입장 -> 퇴장 -> 다시 입장 시 메시지 안 옴!
  }, [target]);

  useEffect(() => {
    scrollToBottom();
  }, [inputMessage] );

  // 기존 DM메시지 가져오기
  const prevDmMessages = async () => {
    const response = await sendRequest(
      'get',
      `/DM/with/${friendSlackId}`,
      router,
    ); // ChatMessages[] 로 올 예정
    setChatMessages(response.data);
  };

  const clearChatMessages = () => {
    setChatMessages([]);
  };

  // 메세지 보내기
  const SendMessage = () => {
    if (!inputMessage) return;

    props.socket?.emit('sendMessage', {
      roomName: target,
      userName: myName!,
      content: inputMessage,
      status: chatRoom?.status,
    });

    setInputMessage('');
  };

  const scrollToBottom = () => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') SendMessage();
  };

  const handleMouseOver = () => {
    setIsMouseOver(true);
  };

  const toggleSettings = () => {
    setIsMouseOver(!isMouseOver);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isValid('메세지가', e.target.value + ' ⏎', maxTypeLength, dispatch))
      setInputMessage(e.target.value);
  };

  const handleExitRoom = () => {
    dispatch(setChatRoom(null));
    props.socket?.emit('exitChatRoom');
    myAlert('success', '채팅방을 나갔습니다', dispatch);
    dispatch(setJoin(JoinStatus.NONE));
    target = undefined;
  };

  const settingsBarStyle = {
    position: 'fixed' as 'fixed', // 문자열을 'fixed' 타입으로 캐스팅
    top: '50%',
    right: '20px',
    width: '10px',
    height: isMouseOver ? '0px' : '200px',
    backgroundColor: 'silver',
    borderRadius: '4px',
    transition: 'height 0.3s',
    transform: 'translateY(-50%)',
  };

  return (
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
      {join === JoinStatus.CHAT && (
        <>
            <IconButton
              color="info"
              aria-label="settings"
              onMouseOver={handleMouseOver}
              onClick={toggleSettings}
            > 
              <div style={settingsBarStyle}></div> 
            </IconButton>
          <Drawer anchor="right" open={isMouseOver} onClose={toggleSettings}>
            <ChatSetting />
          </Drawer>
        </>
      )}
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
          
          <List
            ref={listRef as React.RefObject<HTMLUListElement>}
            style={{ maxHeight: '550px', overflowY: 'auto' }}
          >
            <ListItemText>{target}</ListItemText>
            {chatMessages?.map((msg, index) =>
              msg.userName === 'server' ? (
                <ListItem key={index}>
                  <ListItemText
                    secondary={`___ ${msg.content} ___`}
                    style={{
                      textAlign: 'center',
                      paddingRight: '8px',
                      paddingLeft: '8px',
                    }}
                  />
                </ListItem>
              ) : (
                <ListItem key={index}>
                  <ListItemText
                    primary={msg.userName}
                    secondary={msg.content}
                    style={{
                      textAlign: myName === msg.userName ? 'right' : 'left',
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
              ),
            )}
          </List>
        </CardContent>
        <div style={{ display: 'flex', alignItems: 'center', padding: '8px' }}>
          <TextField
            fullWidth
            id="msgText"
            variant="outlined"
            label="Message"
            value={inputMessage}
            onChange={handleInputChange}
            onKeyUp={handleKeyDown}
            autoComplete="off"
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
          <IconButton
              color="primary"
              aria-label="quit"
              sx={{ position: 'static', top: '0px', left: '10%' }}
              onClick={handleExitRoom}
            >
              <DirectionsRunIcon />
        </IconButton>
        </div>
      </Card>
    </Container>
  );
};

export default ChattingPage;
