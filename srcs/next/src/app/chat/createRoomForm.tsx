'use client';
import React, { useState } from 'react';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Button from '@mui/material/Button';
import { useDispatch } from 'react-redux';
import { useChatSocket } from '../Context/ChatSocketContext';
import { RoomInfoDto, RoomStatus } from '../DTO/RoomInfo.dto';
import { push } from '../redux/roomSlice';

export default function CreateRoomForm({ onClose }: { onClose: () => void }) {
  const dispatch = useDispatch();
  const chatSocket = useChatSocket();
  const [roomname, setRoomname] = useState<string>('');
  const [isPrivate, setIsPrivate] = useState<boolean>(false);
  const [requirePassword, setIsLocked] = useState<boolean>(false);
  const [password, setPassword] = useState<string>('');
  const [showPasswordInput, setShowPasswordInput] = useState<boolean>(false);

  const handleRoomNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRoomname(event.target.value);
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
    const newRoomInfo: RoomInfoDto = {
      roomname: roomname,
      username: 'jaejun',
      password: password ? password : null,
      requirePassword: requirePassword,
      status: isPrivate ? RoomStatus.PRIVATE : RoomStatus.PUBLIC,
    };

    chatSocket.emit('createChatRoom', newRoomInfo);
    chatSocket.on('createChatRoom', (data) => {
      console.log(data);
    });

    dispatch(push(newRoomInfo));
    onClose();
  };

  return (
    <Box>
      <TextField
        label="방 이름"
        variant="outlined"
        value={roomname}
        onChange={handleRoomNameChange}
        fullWidth
        margin="normal"
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
  );
}
