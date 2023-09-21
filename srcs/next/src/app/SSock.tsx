import { io, Socket } from 'socket.io-client';
import { useAppDispatch } from './Test/store';

var dmSocket: Socket;
var chatSocket: Socket;
var gameSocket: Socket;

export const getDmSocket = (): Socket => {
    if (!dmSocket || !dmSocket.connected) {
        console.log('getDmSocket()');
        dmSocket = io('http://10.14.6.3:3000/', {
            withCredentials: false,
        });
        dmSocket.connect();
        dmSocket.on('getMessage', (str) => {
            console.log('msg from server : ', str);
        });
    }
    return dmSocket;
};

export const getChatSocket = (): Socket => {
    if (!chatSocket || !chatSocket.connected) {
        console.log('getChatSocket()');
        chatSocket = io('http://10.14.6.3:3000/RoomChat', {
            withCredentials: false,
        });
        chatSocket.connect();
        chatSocket.on('getMessage', (str) => {
            console.log('msg from server : ', str);
        });
    }
    return chatSocket;
};

export const getGameSocket = (): Socket => {
    if (!gameSocket || !gameSocket.connected) {
        console.log('getgameSocket()');
        gameSocket = io('http://10.14.6.3:3000/Game', {
            withCredentials: false,
        });
        gameSocket.connect();
        gameSocket.on('getMessage', (str) => {
            console.log('msg from server : ', str);
        });
    }
    return gameSocket;
};
