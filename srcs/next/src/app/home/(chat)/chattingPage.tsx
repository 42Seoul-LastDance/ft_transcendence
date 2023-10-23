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
  Typography,
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import {
  ChatMessage,
  ChattingPageProps,
  Events,
  receiveMessage,
} from '../../interfaces';
import ChatSetting from './chatSetting';
import { RootState } from '../../redux/store';
import { useDispatch, useSelector } from 'react-redux';
import { setChatRoom, setJoin } from '@/app/redux/userSlice';
import { myAlert } from '../alert';
import { useRouter } from 'next/navigation';
import sendRequest from '@/app/api';
import { clearSocketEvent, registerSocketEvent } from '@/app/contexts/socket';
import { isValid } from '../valid';
import { maxTypeLength } from '@/app/globals';
import { JoinStatus } from '@/app/enums';
import LogoutIcon from '@mui/icons-material/Logout';

const ChattingPage = (props: ChattingPageProps) => {
  const [inputMessage, setInputMessage] = useState('');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
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
  const [chatState, setChatState] = useState<boolean>(false);
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
        callback: (data: any) => {
          if (join === JoinStatus.CHAT) {
            setChatState(!chatState);
            props.socket?.emit('receiveMessage', data);
          } else if (
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
          console.log('receiveMessage 받음.');
          if (join === JoinStatus.CHAT && data.canReceive === false) return;
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
  }, [join, chatMessages, target, chatState]);
  
  useEffect(() => {
    if (join === JoinStatus.DM) prevDmMessages();
    else if (join === JoinStatus.CHAT) clearChatMessages();
  }, [target]);

  useEffect(() => {
    scrollToBottom();
  }, [inputMessage]);

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
    console.log(
      'sendMessage event 보냄',
      target,
      myName,
      inputMessage,
      chatRoom?.status,
	  props.socket
    );
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
      sx={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-start',
        alignItems: 'center',
      }}
    >
      {join === JoinStatus.CHAT && (
        <>
          <Button
            color="info"
            aria-label="settings"
            onMouseOver={handleMouseOver}
            onClick={toggleSettings}
          >
            <div style={settingsBarStyle}></div>
          </Button>
          <Drawer
            anchor="right"
            open={isMouseOver}
            onClose={toggleSettings}
            style={{ zIndex: 3 }} // z-index 값을 낮춤
          >
        <ChatSetting />
      </Drawer>
        </>
      )}
      <Card
        className="mt-4"
        sx={{
          height: '800px',
          width: '600px',
          alignItems: 'center',
          padding: '20px',
          borderRadius: '15px', // 가장자리 라운드 값 (여기서는 10px로 설정)
          // bgcolor: '#a0b8cf', // 원하는 색상을 여기
          bgcolor: '#d1afe9',
          // bgcolor: '#f4dfff',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <IconButton
            color="secondary"
            aria-label="quit"
            onClick={handleExitRoom}
            style={{ marginRight: '10px' }}
          >
            <LogoutIcon />
          </IconButton>
          <Typography variant="h5" style={{}}>
            {target}
          </Typography>
        </div>
        <CardContent
          sx={{
            overflowY: 'auto',
            height: '670px',
            width: '97%',
            borderRadius: '15px',
          }}
        >
          <List
            ref={listRef as React.RefObject<HTMLUListElement>}
            style={{
              maxHeight: '650px',
              overflowY: 'auto',
            }}
          >
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
                <div
                  key={index}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems:
                      myName === msg.userName ? 'flex-end' : 'flex-start',
                    marginRight: '10px',
                  }}
                >
                  <Typography variant="body2" sx={{ color: '#86a' }}>
                    {msg.userName}
                  </Typography>
                  <Card
                    sx={{
                      maxWidth: '200px',
                      height: 'auto',
                      marginBottom: '10px',
                      borderRadius: '15px',
                      bgcolor: '#f1f1f1',
                    }}
                  >
                    <ListItem key={index}>
                      <ListItemText secondary={msg.content} />
                    </ListItem>
                  </Card>
                </div>
              ),
            )}
          </List>
        </CardContent>
        <div
          style={{
            display: 'flex',
            alignItems: 'bottom',
          }}
        >
          <TextField
            fullWidth
            id="msgText"
            variant="outlined"
            color="secondary"
            label="Message"
            value={inputMessage}
            onChange={handleInputChange}
            onKeyUp={handleKeyDown}
            autoComplete="off"
            InputProps={{
              style: {
                backgroundColor: '#f1f1f1',
                borderRadius: '10px',
              },
            }}
          />
          <Button
            id="sendBtn"
            variant="contained"
            color="secondary"
            size="large"
            onClick={SendMessage}
            style={{ marginLeft: '15px', borderRadius: '10px' }}
            endIcon={<SendIcon />}
          >
            send
          </Button>
        </div>
      </Card>
    </Container>
  );
};

export default ChattingPage;
