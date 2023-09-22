'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import { getChatSocket } from './SSock';

export default function Home() {
    const backAddr = 'https://10.14.6.7:4242';
    console.log(backAddr);
    const router = useRouter();

    return (
        <main>
            <h1>42Login!</h1>
            <Divider />
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
