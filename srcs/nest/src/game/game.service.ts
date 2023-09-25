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
    private friendGameList: Map<number, string> = new Map<number, string>(); //userId, socket.id
    //Room
    private gameRoomIdx: number = 0;
    private gameRoomList: Map<number, GameRoom> = new Map<number, GameRoom>(); //room.id

    createPlayer(playerSocket: Socket) {
        //PlayerList에 등록
        const player: Player = {
            socket: playerSocket,
        };
        this.playerList.set(playerSocket.id, player);
    }

    handleDisconnect(playerId: string) {
        const player = this.playerList.get(playerId);
        if (player.userId === undefined) return;
        if (player.roomId === undefined) {
            // in Queue => queue에서 제거
            if (player.gameType === GameType.MATCH) {
                //ranking
                if (this.matchQueue[player.gameMode] === player.socket.id)
                    this.matchQueue[player.gameMode] = undefined;
                else throw new BadRequestException('player not in the queue');
            } else {
                //friendly
                const userId = player.userId;
                if (this.friendGameList.get(userId)) {
                    this.friendGameList.delete(userId);
                } else throw new BadRequestException('friend: bad request');
            }
        } else {
            const gameRoom = this.gameRoomList.get(player.roomId);
            if (gameRoom.gameStatus === GameStatus.WAIT) {
                //in waiting Room => 랭킹일 경우 상대방 다시 Q에 집어 넣음
                if (gameRoom.gameType === GameType.MATCH) {
                    const rival: Player = this.playerList.get(
                        gameRoom.socket[(player.side + 1) % 2].id,
                    );
                    [rival.side, rival.roomId] = [undefined, undefined];
                    this.pushQueue(
                        rival.socket.id,
                        gameRoom.gameMode,
                        undefined,
                    );
                }
            } else if (gameRoom.gameStatus === GameStatus.GAME) {
                //게임중 => 게임 강제종료
                this.finishGame(
                    gameRoom.id,
                    (player.side + 1) % 2,
                    GameEndStatus.DISCONNECT,
                );
            } else throw new BadRequestException('무슨 에러지..?');
            //gameroom 없애기
            this.gameRoomList.delete(player.roomId);
        }
    }
    //Player 삭제 (handleDisconnect용)
    deletePlayer(playerId: string) {
        this.playerList.delete(playerId);
    }

    //* Match Game ======================================
    //큐 등록
    async pushQueue(
        playerId: string,
        gameMode: number,
        username: string,
    ): Promise<void> {
        const player: Player = this.playerList.get(playerId);
        if (player.roomId)
            throw new BadRequestException('player already in gameRoom');
        //! TESTCODE
        if (username === 'kwsong') player.userId = 1234;
        else if (username) {
            player.userId = (
                await this.userService.getUserByUsername(username)
            ).id;
        }
        player.gameMode = gameMode;
        player.gameType = GameType.MATCH;

        if (gameMode === GameMode.NONE)
            throw new BadRequestException('gameMode invalid');
        if (this.matchQueue[gameMode]) this.makeGameRoom(gameMode, playerId);
        else this.matchQueue[gameMode] = playerId;
    }

    popQueue(playerId: string): void {
        if (
            this.matchQueue[this.playerList.get(playerId).gameMode] === playerId
        )
            this.matchQueue[this.playerList.get(playerId).gameMode] = undefined;
        else throw new BadRequestException('player was not in Queue');
    }

    //* Game Room ======================================
    getReady(playerId: string): void {
        const roomId = this.playerList.get(playerId).roomId;
        const side = this.playerList.get(playerId).side;
        const rivalSide = (side + 1) % 2;
        this.gameRoomList.get(roomId).ready[side] = true;
        if (this.gameRoomList.get(roomId).ready[rivalSide]) {
            //둘 다 게임 준비 완료!
            this.startGame(roomId);
            const [leftPlayer, rightPlayer] =
                this.gameRoomList.get(roomId).socket;
            const gameInfo = this.getBallStartDir();
            gameInfo['isFirst'] = true;
            //TODO ballDirection 잘 가는지 확인 필요! (JSON 관련)111
            leftPlayer.emit('startGame', gameInfo);
            rightPlayer.emit('startGame', gameInfo);
        }
    }

    //* In Game ======================================
    movePaddle(playerId: string, paddlePosZ: number) {
        const roomId = this.playerList.get(playerId).roomId;
        const side = this.playerList.get(playerId).side;
        const rival = this.gameRoomList.get(roomId).socket[side];
        rival.emit('movePaddle', {
            paddlePosition: {
                PaddlePositionX: 0,
                PaddlePositionY: 0,
                PaddlePositionZ: paddlePosZ,
            },
        });
    }

    async scorePoint(playerId: string, side: number) {
        if (side === PlayerSide.NONE)
            throw new BadRequestException('score side invalid');
        const roomId = this.playerList.get(playerId).roomId;
        this.gameRoomList.get(roomId).score[side] += 1;
        if (this.gameRoomList.get(roomId).score[side] === MAXSCORE) {
            //if game ends
            await this.finishGame(roomId, side, GameEndStatus.NORNAL);
        } else this.continueGame(roomId);
    }

    //* other functions ======================================

    //득점 후 계속 진행
    continueGame(roomId: number) {
        const [player1, player2] = this.gameRoomList.get(roomId).socket;
        const gameInfo = this.getBallStartDir();
        gameInfo['isFirst'] = false;
        //TODO ballDirection 잘 가는지 확인 필요! (JSON 관련)222
        player1.emit('scorePoint', gameInfo);
        player2.emit('scorePoint', gameInfo);
    }

    //게임 종료 (정상 + 비정상)
    async finishGame(
        roomId: number,
        winnerSide: number,
        endGameStatus: number,
    ) {
        //gameRoom 업데이트
        this.updateGameRoom(roomId, winnerSide, endGameStatus);
        //플레이어들에게 결과 전달
        const [player1, player2] = this.gameRoomList.get(roomId).socket;
        const gameResult = {
            winner: winnerSide,
            leftScore: this.gameRoomList.get(roomId).score[PlayerSide.LEFT],
            rightScore: this.gameRoomList.get(roomId).score[PlayerSide.RIGHT],
            reason: GameEndStatus.NORNAL,
        };
        //TODO gameResult 잘 전달되는지 확인 필요! (JSON 관련)
        player1.emit('gameOver', gameResult);
        player2.emit('gameOver', gameResult);
        //DB에 저장하고 gameRoom 없애기
        await this.createGameData(roomId);
        if (
            this.gameRoomList.get(roomId).gameType === GameType.FRIEND &&
            endGameStatus === GameEndStatus.NORNAL
        ) {
            this.resetGameRoom(roomId);
            //reset gameRoom for restart
        } else this.gameRoomList.delete(roomId);
    }

    resetGameRoom(roomId: number) {
        this.gameRoomList.get(roomId).ready = [false, false];
        this.gameRoomList.get(roomId).gameStatus = GameStatus.WAIT;
        this.gameRoomList.get(roomId).score = [0, 0];
        //이 아래는 필요 없을지도..?
        this.gameRoomList.get(roomId).startTime = undefined;
        this.gameRoomList.get(roomId).endTime = undefined;
        this.gameRoomList.get(roomId).winner = undefined;
        this.gameRoomList.get(roomId).loser = undefined;
        this.gameRoomList.get(roomId).endGameStatus = undefined;
    }
    //게임 종료시 gameRoom 업데이트
    updateGameRoom(roomId: number, side: number, endGameStatus: number) {
        this.gameRoomList.get(roomId).endTime = new Date();
        this.gameRoomList.get(roomId).winner = side;
        this.gameRoomList.get(roomId).loser = (side + 1) % 2;
        this.gameRoomList.get(roomId).endGameStatus = endGameStatus;
        if (
            endGameStatus === GameEndStatus.CHEATING ||
            endGameStatus === GameEndStatus.DISCONNECT
        ) {
            this.gameRoomList.get(roomId).winnerScore = MAXSCORE;
            this.gameRoomList.get(roomId).loserScore = 0;
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
            const room = this.gameRoomList.get(roomId);
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
                startTime: room.startTime,
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
            ready: [false, false],
        };
        //TESTCODE
        console.log('makeGameRoom: ', player1Id, player2Id);
        //방입장
        this.enterGameRoom(gameRoom, player1Id, player2Id);
        this.gameRoomList.set(this.gameRoomIdx++, gameRoom);
    }

    // players enter the gameRoom
    enterGameRoom(gameRoom: GameRoom, player1Id: string, player2Id: string) {
        //TODO: random => left / right
        const left = player1Id;
        const right = player2Id;

        gameRoom.socket = [
            this.playerList.get(left).socket,
            this.playerList.get(right).socket,
        ];
        gameRoom.ready = [false, false];

        //Player 업데이트 && emit('handShake')
        console.log('enterGameRoom:', gameRoom.id);
        this.updatePlayer(left, PlayerSide.LEFT, gameRoom.id);
        this.updatePlayer(right, PlayerSide.RIGHT, gameRoom.id);
        this.playerList.get(left).socket.emit('handShake', {
            side: PlayerSide.LEFT,
        });
        this.playerList.get(right).socket.emit('handShake', {
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
        this.playerList.get(playerId).roomId = roomId;
        this.playerList.get(playerId).side = side;
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
