'use client';

import { useEffect, useState } from 'react';
import * as React from 'react';
import { useRouter } from 'next/navigation';
import TextField from '@mui/material/TextField';
import { BACK_URL } from '../globals';
import { getCookie, removeCookie, setCookie } from '../cookie';
import axios from 'axios';
import { Button, CircularProgress, Divider } from '@mui/material';

const TFA = () => {
  const router = useRouter();
  const [code, setCode] = useState<string>('');
  const [isRendered, setIsRendered] = useState<boolean>(false);

  const requestTFA = async () => {
    if (typeof window === 'undefined') return;

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
      if (error.status === 401) alert('인증 코드가 틀립니다');
      else console.log('이건 무슨 에러에용?', error.status);
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
          <h1> 2단계 인증 </h1>
          <Divider />
          <h3> 42 Email로 발송된 인증 코드를 입력해주세요 </h3>
          <TextField
            id="friendRequest"
            variant="outlined"
            label="인증 코드를 입력하세요"
            value={code}
            onChange={handleInputValue}
            onKeyPress={handleKeyDown}
          />
          <Button
            id="sendBtn"
            variant="contained"
            color="primary"
            size="large"
            onClick={requestTFA}
            style={{ marginLeft: '8px' }}
          >
            send
          </Button>
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
