'use client';

import React from 'react';
import { useRouter, redirect } from 'next/navigation';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';

export default function Home() {
  const router = useRouter();
  console.log('addr:', process.env.NEXT_PUBLIC_BACK_URL);

  return (
    <main>
      <h1>42Login!</h1>
      <Divider />
      <Button
        variant="contained"
        onClick={() => {
          router.push('http://10.14.6.5:3000/auth/42login');
        }}
      >
        42login
      </Button>
      <Button
        variant="contained"
        onClick={() => {
          router.push('/register');
        }}
      >
        register
      </Button>
      <h1>make Room</h1>
      <Divider />
      <Button
        variant="contained"
        onClick={() => {
          router.push('/chat');
        }}
      >
        chat
      </Button>
    </main>
  );
}
