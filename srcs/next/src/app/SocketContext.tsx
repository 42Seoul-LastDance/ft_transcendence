import { io, Socket } from 'socket.io-client';
import { createContext } from 'react';

export const socket = io('http://10.14.6.6:3000/Game', {
    withCredentials: false,
});
socket.connect();

export const SocketContext = createContext();
