'use client';

// import logo from './logo.svg';
import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Link from 'next/link';
import { BACK_URL } from './globals';

const Home = () => {
  const router = useRouter();

  useEffect(() => {
    // TODO: 토큰이 있다면 홈으로 푸쉬
	if (typeof window !== 'undefined')
	{
		if (localStorage.getItem('access_token'))
			router.push('/home');
	}
  }, []);

  return (
    <main>
      {/* <img src={logo} width="300" height="300" /> */}
      <h1>42Login!</h1>
      <img src="@/src/public/logo.png" alt="탁구라켓 이미지"/>  
      <Divider />
      <Link href={`${BACK_URL}/auth/42login`}>
        <Button variant="contained">42login</Button>
      </Link>
    </main>
  );
};

export default Home;
