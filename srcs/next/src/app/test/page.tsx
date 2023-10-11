'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import axios from 'axios';
import { FRONT_URL, FT_CLIENT_ID } from '../globals';

export default function Home() {
  const router = useRouter();
  const handleTry42 = () => {
    // nest
    // https://api.intra.42.fr/oauth/authorize?response_type=code&redirect_uri=http%3A%2F%2F10.28.5.12%3A3000%2Fauth%2Fcallback&client_id=u-s4t2ud-a427703c4f116e42ae3e0f39fe75e3cab653a0044cd87b6449a2b413f40a5506
    // next
    // https://api.intra.42.fr/oauth/authorize?response_type=code&redirect_uri=http%3A%2F%2F10.28.5.12%3A4242%2Ftest&client_id=u-s4t2ud-a427703c4f116e42ae3e0f39fe75e3cab653a0044cd87b6449a2b413f40a5506

    const apiUrl =
      'https://api.intra.42.fr/oauth/authorize?response_type=code&redirect_uri=http%3A%2F%2F10.28.5.12%3A4242%2Ftest&client_id=u-s4t2ud-a427703c4f116e42ae3e0f39fe75e3cab653a0044cd87b6449a2b413f40a5506';

    const headers = {
      'Access-Control-Allow-Origin': `http://localhost:4242/test`,
      withCredentials: true, // 이렇게 설정
    };
    axios
      .get(apiUrl, { headers })
      .then((response) => {
        console.log('응답 데이터:', response.data);
      })
      .catch((error) => {
        console.error('오류:', error);
      });
  };
  return (
    <main>
      <h1>42Login!</h1>
      <Button variant="contained" onClick={handleTry42}>
        5억년버튼
      </Button>
      <Divider />
    </main>
  );
}
