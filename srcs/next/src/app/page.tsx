'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Link from 'next/link';
import { BACK_URL } from './globals';

export default function Home() {
  const router = useRouter();

  return (
    <main>
      <h1>42Login!</h1>
      <Divider />
      <Link href={`${BACK_URL}/auth/42login`}>
        <Button variant="contained">42login</Button>
      </Link>
      {/* <Button
        variant="contained"
        onClick={() => {
          router.push('/test');
        }}
      >
        5억년버튼
      </Button>
      <Divider /> */}
    </main>
  );
}
