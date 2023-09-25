import * as React from 'react';
import { useState } from 'react';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Button from '@mui/material/Button';

export default function CreateRoomForm() {
  const [roomName, setRoomName] = useState<string>('');
  const [isPrivate, setIsPrivate] = useState<boolean>(false);
  const [isPasswordProtected, setIsPasswordProtected] =
    useState<boolean>(false);
  const [password, setPassword] = useState<string>('');
  const [showPasswordInput, setShowPasswordInput] = useState<boolean>(false);

  const handleRoomNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRoomName(event.target.value);
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
    setIsPasswordProtected(!isPasswordProtected);
    setShowPasswordInput(!showPasswordInput);
  };

  const handlePasswordChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(event.target.value);
  };

  const handleSubmit = () => {
    // 여기에서 방 정보를 제출하는 로직을 추가... 근데 언제하지... ㅠㅠㅠ
    console.log('방 이름:', roomName);
    console.log('프라이빗:', isPrivate);
    console.log('비밀번호 설정:', isPasswordProtected);
    if (isPasswordProtected) {
      console.log('비밀번호:', password);
    }
  };

  return (
    <Box>
      <TextField
        label="방 이름"
        variant="outlined"
        value={roomName}
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
        margin="normal"
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
        selected={isPasswordProtected}
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
      <Button variant="contained" color="primary" onClick={handleSubmit}>
        완료
      </Button>
    </Box>
  );
}
