'use client';

// import logo from './logo.svg';
import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Link from 'next/link';
import { BACK_URL } from './globals';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // TODO: 토큰이 있다면 홈으로 푸쉬
    // if (getCookie('access_token')) router.push('/home');
  }, []);

  return (
    <main>
      {/* <img src={logo} width="300" height="300" /> */}
      <h1>42Login!</h1>
      <img src="" />
      <Divider />
      <Link href={`${BACK_URL}/auth/42login`}>
        <Button variant="contained">42login</Button>
      </Link>
    </main>
  );
}
