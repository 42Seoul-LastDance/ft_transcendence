'use client';
import axios from 'axios';
import { io, Socket } from 'socket.io-client';
import { getDmSocket } from './SSock';
import { useEffect } from 'react';
import ChatRoomList from './Chat/ChatButton';
import Link from 'next/link';
import Button from '@mui/material/Button';
import Game from './Game';

// var socket = getDmSocket();

// socket.on('getMessage', (msg) => {
//     console.log('msg from server: ', msg);
// });

// const socketEvent = () => {
//     socket.emit('sendMessage', '안녕 친구들🚴🏿‍♂️🚗🚎');
// };

const TestButton = () => {
    return (
        <Link href="/Test">
            <Button variant="contained">5억년 버튼</Button>
        </Link>
    );
};

export default function Home() {
    return (
        <main>
            <Game />
            {/* <ChatRoomList />
            <TestButton /> */}
            {/* <button onClick={socketEvent}> 안녕 친구들 </button> */}
        </main>
    );
}
