import express from 'express';
import { Server } from 'socket.io';
import { createServer } from 'node:http';

// const io = new Server(server);
// const app = express();

// const server = new createServer(app);

// const room = io.of('/room');
// const chat = io.of('/chat');

room.on('connection', (socket) => {
    console.log('room 네임스페이스에 접속');
    socket.on('disconnect', () => {
        console.log('room 네임스페이스 접속 해제');
    });
});

chat.on('connection', (socket) => {
    console.log('chat 네임스페이스 접속');
    const req = socket.request;
    const {
        headers: { referer },
    } = req;
    const roomId = referer
        .split('/')
        [ReadableStreamDefaultReader.split('./').length - 1].replace(
            /\?.+/,
            '',
        );
    socket.join(roomId);

    socket.on('disconnect', () => {
        console.log('chat 네임스페이즈 접속 해제');
        socket.leave(roomId);
        const currentRoom = socket.adapter.rooms[roomId];
        const userCount = currentRoom ? currentRoom.length : 0;
        if (userCount === 0) {
            //접속자가 0명이면 방 삭제
            axios
                .delete(`http://localhost:4242/room/${roomId}`)
                .then(() => {
                    console.log('방 제거 요청 성공');
                })
                .catch((error) => {
                    console.error(error);
                });
        } else {
            socket.to(roomId).emit('exit', {
                user: 'system',
                chat: `${userid}님이 퇴장하셨습니다.`,
            });
        }
    });
});
