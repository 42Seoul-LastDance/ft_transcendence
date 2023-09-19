'use client';
// import Game from "./Game";
// import ReactDOM from 'react-dom/client';
// import App from './App';
// import InputForm from './component/multi/InputForm';
// import HandleLoginButton from './component/single/HandleLoginButton';
// import AxiosComponent from 'AxiosComponent';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { io } from 'socket.io-client';

interface MyResponse {
    str: string;
}

const socket = io('http://10.14.4.2:3000', {
    withCredentials: false,
});
socket.connect();

const SocketEvent = () => {
    socket.emit('sendMessage', '안녕 친구들🚴🏿‍♂️🚗🚎');
};

export default function Home() {
    socket.on('getMessage', (str) => {
        console.log('msg from server : ', str);
    });

    return (
        <main>
            <p>ㅋㅋㅋㅋ케소케ㄱ연ㄱ스테스트</p>
            <button onClick={SocketEvent}> 5억년 버튼 </button>
        </main>
    );
}
