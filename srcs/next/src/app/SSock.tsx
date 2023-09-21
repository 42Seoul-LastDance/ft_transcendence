import { io, Socket } from 'socket.io-client';
import { useAppDispatch } from './Test/store';

var dmSocket: Socket;
var chatSocket: Socket;
var gameSocket: Socket;

export const getDmSocket = (): Socket => {
    if (!dmSocket || !dmSocket.connected) {
        console.log('getDmSocket()');
        dmSocket = io('http://10.14.6.6:3000/', {
            withCredentials: false,
        });
        dmSocket.connect();
        console.log('DM socket connect');
    }
    return dmSocket;
};

export const getChatSocket = (): Socket => {
    if (!chatSocket || !chatSocket.connected) {
        console.log('getChatSocket()');
        chatSocket = io('http://10.14.6.6:3000/RoomChat', {
            withCredentials: false,
            auth: {
                token: 'myToken',
            },
            query: {
                username: 'kwsong',
                id: '1234',
            },
        });
        chatSocket.connect();
        console.log('chat socket connect');
    }
    return chatSocket;
};

export const getGameSocket = (): Socket => {
    if (!gameSocket || !gameSocket.connected) {
        console.log('getgameSocket()');
        gameSocket = io('http://10.14.6.6:3000/', {
            withCredentials: false,
        });
        gameSocket.connect();
        console.log('game socket connect');
    }
    return gameSocket;
};
