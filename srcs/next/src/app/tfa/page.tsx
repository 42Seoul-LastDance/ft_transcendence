'use client';

import { useEffect, useState } from 'react';
import * as React from 'react';
import { useRouter } from 'next/navigation';
import TextField from '@mui/material/TextField';
import { BACK_URL } from '../globals';
import { getCookie, removeCookie, setCookie } from '../cookie';
import axios from 'axios';
import { Button, CircularProgress, Divider } from '@mui/material';
import { Typography, Card } from '@mui/material';
const TFA = () => {
  const router = useRouter();
  const [code, setCode] = useState<string>('');
  const [isRendered, setIsRendered] = useState<boolean>(false);

  const requestTFA = async () => {
    const tfaToken = getCookie('2fa_token');

    if (!tfaToken) {
      router.push('/');
      alert('tfaToken is empty');
      return new Promise(() => {});
    }
    try {
      const response = await axios.patch(
        `${BACK_URL}/auth/verify2fa`,
        {
          code: code,
        },
        {
          headers: { Authorization: `Bearer ${tfaToken}` },
        },
      );
      removeCookie('2fa_token');
      setCookie('access_token', response.data['access_token']);
      setCookie('refresh_token', response.data['refresh_token']);
      router.push('/home');
    } catch (error: any) {
      alert('인증 코드가 틀립니다');
    }
  };

  const handleInputValue = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setCode(e.target.value);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === 'Enter') requestTFA();
  };

  // 자동 2fa
  useEffect(() => {
    if (getCookie('access_token')) router.push('/home');

    setTimeout(() => {
      setIsRendered(true);
    }, 1000);
  }, []);

  return (
    <>
      {isRendered ? (
        <>
          <Typography variant="h3" sx={{ color: '#ffbf06', mb: '20px' }}>
            2단계 인증
          </Typography>
          <Typography variant="h5" sx={{ color: 'white' }}>
            {'42 Email로 발송된 '}
          </Typography>
          <Typography variant="h5" sx={{ color: '#ffbf06' }}>
            {'인증 코드를 '}
          </Typography>
          <Typography variant="h5" sx={{ color: 'white' }}>
            {'입력해주세요'}
          </Typography>

          <Card
            style={{
              display: 'flex',
              alignItems: 'center',
              width: '300px',
              borderRadius: '15px',
            }}
          >
            <TextField
              id="friendRequest"
              variant="outlined"
              label="인증 코드를 입력하세요"
              color="secondary"
              value={code}
              onChange={handleInputValue}
              onKeyPress={handleKeyDown}
            />
            <Button
              id="sendBtn"
              variant="contained"
              color="secondary"
              size="large"
              onClick={requestTFA}
              style={{ marginLeft: '10px' }}
            >
              send
            </Button>
          </Card>
        </>
      ) : (
        <>
          <h2> 이미 로그인한 이력이 있는지 확인하는 중 ... 🙃 </h2>
          <CircularProgress />
        </>
      )}
    </>
  );
};

export default TFA;
