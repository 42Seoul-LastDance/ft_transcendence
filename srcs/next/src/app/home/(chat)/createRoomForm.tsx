'use client';
import React, { useEffect, useRef, useState } from 'react';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Button from '@mui/material/Button';
import { useDispatch } from 'react-redux';
import { useChatSocket } from '../../context/chatSocketContext';
import { ChatRoomDto, Events, JoinStatus, RoomStatus } from '../../interface';
import { setChatRoom, setJoin } from '../../redux/userSlice';
import { clearSocketEvent, registerSocketEvent } from '@/app/context/socket';
import { isValid } from '../valid';
import { maxNameLength, maxPasswordLength } from '@/app/globals';
import { Fab, Modal, Typography } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';

const style: React.CSSProperties = {
  position: 'absolute',
  top: '30%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  backgroundColor: 'background.paper',
  border: '2px solid #000',
  boxShadow: '24px 24px 48px rgba(0, 0, 0, 0.2)',
  padding: 4,
};

const CreateRoomForm = () => {
  const chatSocket = useChatSocket();
  const dispatch = useDispatch();
  const roomNameInputRef = useRef<HTMLInputElement | null>(null);
  const [roomName, setRoomName] = useState<string>('');
  const [isPrivate, setIsPrivate] = useState<boolean>(false);
  const [requirePassword, setIsLocked] = useState<boolean>(false);
  const [password, setPassword] = useState<string>('');
  const [showPasswordInput, setShowPasswordInput] = useState<boolean>(false);
  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setOpen(false);
    setRoomName('');
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
    return () => clearSocketEvent(chatSocket!, e);
  }, []);

  useEffect(() => {
    setTimeout(() => {
      if (roomNameInputRef.current) {
        roomNameInputRef.current.focus();
        console.log('hi');
      }
    }, 10);
  }, [open]);

  const handleRoomNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = event.target.value;
    setRoomName(inputValue);
  };

  const handlePrivacyChange = (
    event: React.MouseEvent<HTMLElement>,
    newPrivacy: string | null,
  ) => {
    if (newPrivacy !== null) {
      setIsPrivate(newPrivacy === 'private');
    }
  };

  const handlePasswordToggle = () => {
    setIsLocked(!requirePassword);
    setShowPasswordInput(!showPasswordInput);
  };

  const handlePasswordChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(event.target.value);
  };

  const addNewRoom = () => {
    if (
      isValid('방이름이', roomName, maxNameLength, dispatch) === false ||
      (requirePassword &&
        isValid('패스워드가', password, maxPasswordLength, dispatch) === false)
    )
      return;
    chatSocket?.emit('createChatRoom', {
      roomName: roomName,
      password: password ? password : null,
      requirePassword: requirePassword,
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
            onClick={handleOpen}
          >
            <AddIcon />
          </Fab>
        </Box>
        <Modal open={open} onClose={handleClose}>
          <Box sx={style}>
            <Typography id="modal-modal-title" variant="h6" component="h6">
              방 만들기
            </Typography>
            <Box>
              <TextField
                required
                label="방 이름"
                variant="outlined"
                value={roomName}
                onChange={handleRoomNameChange}
                inputRef={roomNameInputRef}
                fullWidth
                margin="normal"
                onKeyUp={handleKeyDown}
              />
              <ToggleButtonGroup
                value={isPrivate ? 'private' : 'public'}
                exclusive
                onChange={handlePrivacyChange}
                fullWidth
                aria-label="방 프라이버시"
              >
                <ToggleButton value="public" aria-label="퍼블릭">
                  퍼블릭
                </ToggleButton>
                <ToggleButton value="private" aria-label="프라이빗">
                  프라이빗
                </ToggleButton>
              </ToggleButtonGroup>
              <ToggleButton
                value="check"
                selected={requirePassword}
                onClick={handlePasswordToggle}
                aria-label="비밀번호 설정"
                color="primary"
                size="small"
              >
                비밀번호 설정
              </ToggleButton>
              {showPasswordInput && (
                <TextField
                  label="비밀번호"
                  variant="outlined"
                  type="password"
                  value={password}
                  onChange={handlePasswordChange}
                  fullWidth
                  margin="normal"
                />
              )}
              <Button variant="contained" color="primary" onClick={addNewRoom}>
                완료
              </Button>
            </Box>
          </Box>
        </Modal>
      </div>
    </>
  );
};

export default CreateRoomForm;
