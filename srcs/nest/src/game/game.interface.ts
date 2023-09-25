import { Socket } from 'socket.io';

export interface Vector {
    x: number;
    y: number;
    z: number;
}

export interface GameRoom {
    //when create (waiting)
    id: number;
    gameType: number; //enum
    gameMode: number; //enum
    gameStatus: number; //enum
    socket?: [Socket, Socket];
    ready?: [boolean, boolean];
    //when game starts
    startTime?: Date;
    score?: [number, number];
    //when ends
    endTime?: Date;
    winner?: number;
    loser?: number;
    winnerScore?: number;
    loserScore?: number;
    endGameStatus?: number;
}

export interface Player {
    socket: Socket;
    userId?: number;
    gameType?: number; //enum
    gameMode?: number; //enum
    side?: number; //enum
    roomId?: number;
}
