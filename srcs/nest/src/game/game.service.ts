import {
    BadRequestException,
    Injectable,
    InternalServerErrorException,
} from '@nestjs/common';
import { Socket } from 'socket.io';
import {
    GameMode,
    GameType,
    PlayerSide,
    GameStatus,
    GameEndStatus,
} from './game.enum';
import { MIN, MAX, MINF, MAXF, MAXSCORE } from './game.constants';
import { GameRoom, Player } from './game.interface';
import { Game } from './game.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { GameRepository } from './game.repository';
import { UserService } from 'src/user/user.service';

@Injectable()
export class GameService {
    constructor(
        @InjectRepository(Game)
        private gameRepository: GameRepository,
        private userService: UserService,
    ) {}

    //Players
    private playerList: Map<string, Player> = new Map<string, Player>(); //socket.id
    //Queue
    private matchQueue: [string, string] = [undefined, undefined]; //socket.id
    private friendGameList: Map<string, string> = new Map<string, string>(); //username, socket.id
    //Room
    private gameRoomIdx: number = 0;
    private gameRoomList: Map<number, GameRoom> = new Map<number, GameRoom>(); //room.id

    //Player 삭제 (handleDisconnect용)
    deletePlayer(playerId: string) {
        this.playerList.delete(playerId);
    }

    //* Match Game ======================================
    //큐 등록
    pushQueue(client: Socket, gameMode: number, username: string): void {
        //PlayerList에 등록
        const player: Player = {
            username: username,
            socket: client,
            gameType: GameType.MATCH,
            gameMode: gameMode,
        };
        this.playerList.set(client.id, player);

        if (gameMode === GameMode.NONE)
            throw new BadRequestException('gameMode invalid');
        if (this.matchQueue[gameMode]) this.makeGameRoom(gameMode, client.id);
        else this.matchQueue[gameMode] = client.id;
    }

    popQueue(playerId: string): void {
        if (this.matchQueue[this.playerList[playerId].gameMode] === playerId)
            this.matchQueue[this.playerList[playerId].gameMode] = undefined;
        else throw new BadRequestException('player was not in Queue');
    }

    //* Game Room ======================================
    getReady(playerId: string): void {
        const roomId = this.playerList[playerId].roomId;
        const side = this.playerList[playerId].side;
        const rivalSide = (side + 1) % 2;
        this.gameRoomList[roomId].ready[side] = true;
        if (this.gameRoomList[roomId].ready[rivalSide]) {
            //둘 다 게임 준비 완료!
            this.startGame(roomId);
            const [leftPlayer, rightPlayer] = this.gameRoomList[roomId].socket;
            const ballDirection = this.getBallStartDir();
            //TODO ballDirection 잘 가는지 확인 필요! (JSON 관련)111
            leftPlayer.emit('startGame', ballDirection);
            rightPlayer.emit('startGame', ballDirection);
        }
    }

    //* In Game ======================================
    movePaddle(playerId: string, paddlePosZ: number) {
        const roomId = this.playerList[playerId].roomId;
        const side = this.playerList[playerId].side;
        const rival = this.gameRoomList[roomId].socket[side];
        rival.emit('movePaddle', {
            paddlePosition: {
                x: 0,
                y: 0,
                z: paddlePosZ,
            },
        });
    }

    async scorePoint(playerId: string, side: number) {
        if (side === PlayerSide.NONE)
            throw new BadRequestException('score side invalid');
        const roomId = this.playerList[playerId].roomId;
        this.gameRoomList[roomId].score[side] += 1;
        if (this.gameRoomList[roomId].score[side] === MAXSCORE) {
            await this.finishGame(roomId, side, GameEndStatus.NORNAL);
        } else this.continueGame(roomId);
    }

    //* other functions ======================================

    //득점 후 계속 진행
    continueGame(roomId: number) {
        const [player1, player2] = this.gameRoomList[roomId].socket;
        const ballDirection = this.getBallStartDir();
        //TODO ballDirection 잘 가는지 확인 필요! (JSON 관련)222
        player1.emit('scorePoint', ballDirection);
        player2.emit('scorePoint', ballDirection);
    }

    //게임 종료 (정상 + 비정상)
    async finishGame(roomId: number, side: number, endGameStatus: number) {
        //gameRoom 업데이트
        this.updateGameRoom(roomId, side, endGameStatus);
        //플레이어들에게 결과 전달
        const [player1, player2] = this.gameRoomList[roomId].socket;
        const gameResult = {
            winner: side,
            leftScore: this.gameRoomList[roomId].score[PlayerSide.LEFT],
            rightScore: this.gameRoomList[roomId].score[PlayerSide.RIGHT],
            reason: GameEndStatus.NORNAL,
        };
        //TODO gameResult 잘 전달되는지 확인 필요! (JSON 관련)
        player1.emit('gameOver', gameResult);
        player2.emit('gameOver', gameResult);
        //DB에 저장하고 gameRoom 없애기
        await this.createGameData(roomId);
        this.gameRoomList.delete(roomId);
    }

    //게임 종료시 gameRoom 업데이트
    updateGameRoom(roomId: number, side: number, endGameStatus: number) {
        this.gameRoomList[roomId].endTime = new Date();
        this.gameRoomList[roomId].winner = side;
        this.gameRoomList[roomId].loser = (side + 1) % 2;
        this.gameRoomList[roomId].endGameStatus = endGameStatus;
        if (
            endGameStatus === GameEndStatus.CHEATING ||
            endGameStatus === GameEndStatus.DISCONNECT
        ) {
            this.gameRoomList[roomId].winnerScore = MAXSCORE;
            this.gameRoomList[roomId].loserScore = 0;
        }
    }

    async getPlayerUserIds(room: GameRoom): Promise<[number, number]> {
        const winner = this.playerList[room.socket[room.winner].id];
        const loser = this.playerList[room.socket[room.loser].id];
        const winnerUserId = (
            await this.userService.getUserByUsername(winner.username)
        ).id;
        const lowerUserId = (
            await this.userService.getUserByUsername(loser.username)
        ).id;
        return [winnerUserId, lowerUserId];
    }
    //DB에 게임 결과 저장
    async createGameData(roomId: number) {
        try {
            const room = this.gameRoomList[roomId];
            const [winnerUserId, lowerUserId] =
                await this.getPlayerUserIds(room);
            const newGameData = this.gameRepository.create({
                winnerId: winnerUserId,
                winnerScore: room.score[room.winner],
                winnerSide: room.winner,
                loserId: lowerUserId,
                loserScore: room.score[room.loser],
                loserSide: room.loser,
                gameType: room.gameType,
                gameMode: room.gameMode,
                startTime: room.startGame,
                endTime: room.endTime,
                endGameStatus: room.endGameStatus,
            } as Game);
            await this.gameRepository.save(newGameData);
        } catch (error) {
            //TESTCODE
            console.log('Error: game => internal error while save DB');
            throw new InternalServerErrorException(
                'error while save game data',
            );
        }
    }

    //gameRoom 만들기
    makeGameRoom(gameMode: number, player2Id: string) {
        //player1 and queue setting
        const player1Id = this.matchQueue[gameMode];
        this.matchQueue[gameMode] = undefined;

        //waitRoom 만들기
        const gameRoom: GameRoom = {
            id: this.gameRoomIdx,
            gameType: GameType.MATCH,
            gameMode: gameMode,
            gameStatus: GameStatus.WAIT,
        };
        //방입장
        this.enterGameRoom(gameRoom, player1Id, player2Id);
        this.gameRoomList.set(this.gameRoomIdx++, gameRoom);
        //TESTCODE
        console.log('makeGameRoom: ', player1Id, player2Id);
    }

    // players enter the gameRoom
    enterGameRoom(gameRoom: GameRoom, player1Id: string, player2Id: string) {
        //TODO: random => left / right
        const left = player1Id;
        const right = player2Id;

        gameRoom.socket = [this.playerList[left], this.playerList[right]];
        gameRoom.ready = [false, false];

        //Player 업데이트 && emit('handShake')
        this.updatePlayer(left, PlayerSide.LEFT, gameRoom.id);
        this.updatePlayer(right, PlayerSide.RIGHT, gameRoom.id);
        this.playerList[left].emit('handShake', {
            side: PlayerSide.LEFT,
        });
        this.playerList[right].emit('handShake', {
            side: PlayerSide.RIGHT,
        });
    }

    //game 시작 시 => gameRoom 업데이트
    startGame(gameRoomId: number) {
        this.gameRoomList[gameRoomId].gameStatus = GameStatus.GAME;
        this.gameRoomList[gameRoomId].startTime = new Date();
        this.gameRoomList[gameRoomId].score = [0, 0];
        //TESTCODE: startTime
        console.log(this.gameRoomList[gameRoomId].startTime);
    }

    //gameRoom 진입 시 Player 정보 업데이트
    updatePlayer(playerId: string, side: number, roomId: number): void {
        this.playerList[playerId].roomId = roomId;
        this.playerList[playerId].side = side;
    }

    //game 각 라운드 시작 시 공 방향 세팅
    getBallStartDir(): any {
        const dirX = (Math.random() * (MAX - MIN) + MIN) * -2 + 1;
        const dirZ =
            ((Math.random() * (MAX - MIN) + MIN) * -2 + 1) *
            (Math.random() * (MAXF - MINF) + MINF);
        return {
            ballDirection: {
                x: dirX,
                y: 0,
                z: dirZ,
            },
        };
    }
}
