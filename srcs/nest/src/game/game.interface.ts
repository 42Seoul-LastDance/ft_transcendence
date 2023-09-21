import { Socket } from 'socket.io';

export interface Vector {
    x: number;
    y: number;
}

export interface WaitRoom {
    id: number;
    gameType: number;
    gameMode: number;
    hostUsername: string;
    hostSocket: string;
    hostReady: boolean;
    guestUsername: string;
    guestSocket: string;
    guestReady: boolean;
}

export interface GameRoom {
    id: number;
    gameType: number;
    gameMode: number;
    hostUsername: string;
    hostSocket: string;
    guestUsername: string;
    guestSocket: string;
    startTime: Date;
    endTime: Date;
    winner: number;
    loser: number;
    endGameStatus: number;
}

export interface Player {
    username: string;
    socketId: string;
    socket: Socket;
    gameType: number;
    gameMode: number;
}
