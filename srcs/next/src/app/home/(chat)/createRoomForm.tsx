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
import AddIcon from '@mui/icons-material/Add';
import { JoinStatus, RoomStatus } from '@/app/enums';
import { myAlert } from '../alert';

const modalStyle: React.CSSProperties = {
  position: 'absolute',
  top: '30%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  background: '#444444',
  boxShadow: '24px 24px 48px rgba(0, 0, 0, 0.2)',
  padding: 4,
  borderRadius: '15px',
  opacity: '0.95',
};

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
    chatSocket?.emit('createChatRoom', {
      roomName: roomName,
      password: password ? password : null,
      requirePassword: passwordEnabled,
      status: isPrivate ? RoomStatus.PRIVATE : RoomStatus.PUBLIC,
    });
    handleClose();
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') addNewRoom();
  };

  return (
    <>
      <div>
        <Box sx={{ '& > :not(style)': { m: 1 } }}>
          <Fab
            color="primary"
            size="small"
            aria-label="add"
            onClick={() => {
              setOpen(true);
            }}
          >
            <AddIcon />
          </Fab>
        </Box>
        <Modal open={open} onClose={handleClose}>
          <Box sx={modalStyle}>
            <Typography id="modal-modal-title" variant="h5" component="h6">
              방 만들기 {passwordEnabled ? '🔐' : ''}
            </Typography>
            <Box sx={{ marginTop: '30px' }}>
              <Card
                sx={{
                  borderRadius: '15px',
                  marginBottom: '15px',
                  background: '#555',
                  opacity: '0.9',
                }}
              >
                <CardContent>
                  <TextField
                    required
                    label="방 이름"
                    variant="standard"
                    value={roomName}
                    onChange={handleRoomNameChange}
                    inputRef={roomNameInputRef}
                    fullWidth
                    margin="normal"
                    onKeyUp={handleKeyDown}
                  />
                </CardContent>
              </Card>
              <div
                style={{
                  display: 'flex',
                }}
              >
                <Card
                  className="black-hover"
                  sx={{
                    width: '200px',
                    bgcolor: '#555',
                    borderRadius: '15px',
                    marginRight: '7.5px',
                    opacity: '0.9',
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
                    width: '200px',
                    borderRadius: '15px',
                    marginLeft: '7.5px',
                    background: '#555',
                    opacity: '0.9',
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
                    />
                    <TextField
                      label="비밀번호"
                      variant="outlined"
                      type="password"
                      value={password}
                      onChange={handlePasswordChange}
                      fullWidth
                      disabled={!passwordEnabled}
                    />
                  </CardContent>
                </Card>
              </div>
              <Button
                onClick={() => {
                  addNewRoom();
                }}
                color="primary"
                className="black-hover"
                sx={{
                  width: '400px',
                  height: '50px',
                  borderRadius: '15px',
                  marginTop: '15px',
                  display: 'flex',
                  bgcolor: '#555',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <Typography variant="h5">완료</Typography>
              </Button>
            </Box>
          </Box>
        </Modal>
      </div>
    </>
  );
};

export default CreateRoomForm;
