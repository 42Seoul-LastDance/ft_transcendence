import { io, Socket } from 'socket.io-client';

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
        dmSocket.on('getMessage', (str) => {
            console.log('msg from server : ', str);
        });
    } else console.log('getDmSocket() : Old socket');
    return dmSocket;
};

export const getChatSocket = (): Socket => {
    if (!chatSocket || !chatSocket.connected) {
        console.log('getChatSocket()');
        chatSocket = io('http://10.14.6.6:3000/RoomChat', {
            withCredentials: false,
        });
        chatSocket.connect();
        chatSocket.on('getMessage', (str) => {
            console.log('msg from server : ', str);
        });
    } else console.log('getChatSocket() : Old socket');
    return chatSocket;
};

export const getGameSocket = (): Socket => {
    if (!gameSocket || !gameSocket.connected) {
        console.log('getGameSocket() : New socket');
        gameSocket = io('http://10.14.6.6:3000/Game', {
            withCredentials: false,
        });
        // gameSocket.connect();
    } else console.log('getGameSocket() : Old socket');
    return gameSocket;
};

export const disconnectDmSocket = () => {
    if (!dmSocket || !dmSocket.connected) {
        console.log('disconnectDmSocket() : not connected');
    } else {
        dmSocket.disconnect();
        console.log('disconnectDmSocket() : disconnect');
    }
};

export const disconnectGameSocket = () => {
    if (!gameSocket || !gameSocket.connected) {
        console.log('disconnectGameSocket() : not connected');
    } else {
        gameSocket.disconnect();
        console.log('disconnectGameSocket() : disconnect');
    }
};

export const disconnectChatSocket = () => {
    if (!chatSocket || !chatSocket.connected) {
        console.log('disconnectChatSocket() : not connected');
    } else {
        chatSocket.disconnect();
        console.log('disconnectChatSocket() : disconnect');
    }
};
