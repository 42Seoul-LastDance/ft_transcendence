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
    socket?: [Socket | undefined, Socket | undefined];
    ready?: [boolean | undefined, boolean | undefined];
    name?: [string | undefined, string | undefined];
    //when game starts
    startTime?: Date | undefined;
    score?: [number | undefined, number | undefined];
    posX?: number | undefined;
    posZ?: number | undefined;
    dirX?: number | undefined;
    dirZ?: number | undefined;
    //when ends
    endTime?: Date | undefined;
    winner?: number | undefined;
    loser?: number | undefined;
    endGameStatus?: number | undefined;
}

export interface Player {
    socket: Socket;
    userId: number;
    userName: string;
    gameType?: number | undefined; //enum
    gameMode?: number | undefined; //enum
    side?: number | undefined; //enum
    roomId?: number | undefined;
    friendId?: number | undefined;
}

export interface GameData {
    normalWin: number;
    normalLose: number;
    hardWin: number;
    hardLose: number;
}

export interface FriendGameData {
    normalWin: number;
    normalLose: number;
    hardWin: number;
    hardLose: number;
    rightWin: number;
    rightLose: number;
    leftWin: number;
    leftLose: number;
}
