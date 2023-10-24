'use client';
import React, { useEffect, useRef, useState } from 'react';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import { useDispatch } from 'react-redux';
import { useChatSocket } from '../../contexts/chatSocketContext';
import { ChatRoomDto, EmitResult, Events } from '../../interfaces';
import { setChatRoom, setJoin } from '../../redux/userSlice';
import { clearSocketEvent, registerSocketEvent } from '@/app/contexts/socket';
import { isValid } from '../valid';
import { maxNameLength, maxPasswordLength } from '@/app/globals';
import {
  Card,
  CardContent,
  Fab,
  Modal,
  Switch,
  Typography,
} from '@mui/material';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import { JoinStatus, RoomStatus } from '@/app/enums';
import HeaderAlert, { myAlert } from '../alert';

const CreateRoomForm = () => {
  const chatSocket = useChatSocket();
  const dispatch = useDispatch();
  const roomNameInputRef = useRef<HTMLInputElement | null>(null);
  const [roomName, setRoomName] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [isPrivate, setIsPrivate] = useState<boolean>(false);
  const [passwordEnabled, setPasswordEnabled] = useState<boolean>(false);
  const [open, setOpen] = useState(false);

  const handleClose = () => {
    setPasswordEnabled(false);
    setIsPrivate(false);
    setOpen(false);
    setRoomName('');
    setPassword('');
  };

  useEffect(() => {
    console.log('--------- createRoomForm component ---------');
    const e: Events[] = [
      {
        event: 'createChatRoom',
        callback: (data: ChatRoomDto) => {
          dispatch(setChatRoom(data));
          dispatch(setJoin(JoinStatus.CHAT));
        },
      },
    ];
    registerSocketEvent(chatSocket!, e);
    return () => {
      clearSocketEvent(chatSocket!, e);
    };
  }, []);

  useEffect(() => {
    setTimeout(() => {
      if (roomNameInputRef.current) {
        roomNameInputRef.current.focus();
      }
    }, 100);
  }, [open]);

  const handleRoomNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = event.target.value;
    setRoomName(inputValue);
  };

  const handlePasswordChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(event.target.value);
  };

  const addNewRoom = () => {
    if (isValid('방이름이', roomName, maxNameLength, dispatch) === false)
      return;
    if (
      passwordEnabled &&
      isValid('패스워드가', password, maxPasswordLength, dispatch) === false
    )
      return;
    if (!chatSocket?.connected) chatSocket?.connect();
    chatSocket?.emit('createChatRoom', {
      roomName: roomName,
      password: password ? password : null,
      requirePassword: passwordEnabled,
      status: isPrivate ? RoomStatus.PRIVATE : RoomStatus.PUBLIC,
    });
    handleClose();
  };

  const cardStyle = {
    borderRadius: '15px',
    background: '#ffffff',
    opacity: '0.95',
  };

  return (
    <>
      <div>
        <div
          style={{
            position: 'fixed',
            top: '0',
            left: '0',
            right: '0',
            margin: '0 auto',
            textAlign: 'center',
            zIndex: 9999,
          }}
        >
          <HeaderAlert severity={'warning'} />
        </div>

        <Box sx={{ '& > :not(style)': { m: 1 }, opacity: 0.9 }}>
          <Fab
            sx={{ border: '1px solid #ffbf06', background: 'black' }}
            size="small"
            aria-label="add"
            onClick={() => {
              setOpen(true);
            }}
          >
            <StarBorderIcon sx={{ color: '#ffbf06' }} />
          </Fab>
        </Box>
        <Modal open={open} onClose={handleClose} className="modal">
          <Box className="modal-content">
            <Typography id="modal-modal-title" variant="h5" color="#f1f1f1">
              방 만들기 {passwordEnabled ? '🔐' : ''}
            </Typography>
            <Box sx={{ marginTop: '30px' }}>
              <Card
                sx={{
                  ...cardStyle,
                  marginBottom: '20px',
                }}
              >
                <CardContent>
                  <TextField
                    required
                    label="방 이름"
                    color="secondary"
                    variant="standard"
                    value={roomName}
                    onChange={handleRoomNameChange}
                    inputRef={roomNameInputRef}
                    fullWidth
                    margin="normal"
                    sx={{ width: 'flex', height: 'auto' }} // 크기 조절을 원하는 값으로 설정
                  />
                </CardContent>
              </Card>
              <div
                style={{
                  display: 'flex',
                }}
              >
                <Card
                  className="yellow-hover"
                  sx={{
                    ...cardStyle,
                    width: '200px',
                    marginRight: '10px',
                  }}
                  onClick={() => {
                    if (!isPrivate) {
                      setPasswordEnabled(false);
                      setPassword('');
                    }
                    setIsPrivate(!isPrivate);
                  }}
                >
                  <CardContent
                    sx={{
                      display: 'flex',
                      justifyContent: 'center',
                    }}
                  >
                    <Typography
                      variant="h4"
                      color={isPrivate ? 'secondary' : 'primary'}
                    >
                      {isPrivate ? <p>private</p> : <p>public</p>}
                    </Typography>
                  </CardContent>
                </Card>
                <Card
                  sx={{
                    ...cardStyle,
                    width: '200px',
                    marginLeft: '10px',
                  }}
                >
                  <CardContent>
                    <Switch
                      onChange={() => {
                        if (isPrivate) {
                          myAlert(
                            'info',
                            '비밀번호 설정은 퍼블릭 방에서만 가능합니다.',
                            dispatch,
                          );
                          return;
                        }
                        setPasswordEnabled(!passwordEnabled);
                        setPassword('');
                      }}
                      checked={passwordEnabled}
                      color="secondary"
                    />
                    <TextField
                      label="비밀번호"
                      variant="outlined"
                      color="secondary"
                      type="password"
                      value={password}
                      onChange={handlePasswordChange}
                      fullWidth
                      disabled={!passwordEnabled}
                    />
                  </CardContent>
                </Card>
              </div>
              <Card
                className="yellow-hover"
                sx={{
                  ...cardStyle,
                  width: 'auto',
                  height: '50px',
                  marginTop: '20px',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <Button onClick={addNewRoom} color="secondary">
                  <Typography variant="h5">완료</Typography>
                </Button>
              </Card>
            </Box>
          </Box>
        </Modal>
      </div>
    </>
  );
};

export default CreateRoomForm;
