'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';

export default function Home() {
    const backAddr = 'https://10.14.6.5:4242';
    console.log(backAddr);
    const router = useRouter();

    return (
        <main>
            <h1>42Login!</h1>
            {/* <Button variant="contained" onClick={redirect('/register')}>
                register
            </Button> */}
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
