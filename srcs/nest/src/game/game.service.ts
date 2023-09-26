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
    Emoji,
} from './game.enum';
import { MIN, MAX, MINF, MAXF, MAXSCORE, TIMEZONE } from './game.constants';
import { GameRoom, Player } from './game.interface';
import { Game } from './game.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { GameRepository } from './game.repository';
import { UserService } from 'src/user/user.service';
import { DateTime } from 'luxon';

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

    //PlayerList에 등록
    createPlayer(playerSocket: Socket) {
        const player: Player = {
            socket: playerSocket,
        };
        this.playerList.set(playerSocket.id, player);
    }

    //disconnect 시 처리
    async handleDisconnect(playerId: string) {
        const player = this.playerList.get(playerId);
        if (player.userId === undefined) return;
        if (player.roomId === undefined) {
            // in Queue => queue에서 제거
            if (player.gameType === GameType.MATCH) {
                if (this.matchQueue[player.gameMode] === player.socket.id)
                    this.matchQueue[player.gameMode] = undefined;
                else throw new BadRequestException('player not in the queue');
            } else if (player.gameType === GameType.FRIEND) {
                if (this.friendGameList.get(player.username)) {
                    this.friendGameList.delete(player.username);
                } else throw new BadRequestException('friend: bad request');
            }
        } else {
            //in room (waiting or game)
            const gameRoom = this.gameRoomList.get(player.roomId);
            if (gameRoom.gameStatus === GameStatus.WAIT) {
                //in waiting Room => 상대방에게 대기방 나가기 이벤트 발생!
                const rival: Player = this.playerList.get(
                    gameRoom.socket[(player.side + 1) % 2].id,
                );
                this.resetPlayer(rival);
                rival.socket.emit('kickout');
            } else if (gameRoom.gameStatus === GameStatus.GAME) {
                //게임중 => 게임 강제종료
                await this.finishGame(
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
        await this.updatePlayer(playerId, username, gameMode, GameType.MATCH);
        if (this.matchQueue[gameMode]) {
            const playerQ = this.matchQueue[gameMode];
            this.matchQueue[gameMode] = undefined;
            this.makeGameRoom(playerQ, playerId, GameType.MATCH, gameMode);
        } else this.matchQueue[gameMode] = playerId;
    }

    popQueue(playerId: string): void {
        if (
            this.matchQueue[this.playerList.get(playerId).gameMode] === playerId
        ) {
            this.matchQueue[this.playerList.get(playerId).gameMode] = undefined;
            this.resetPlayer(this.playerList.get(playerId));
        } else throw new BadRequestException('player was not in Queue');
    }

    //* Friend Game ======================================
    async inviteGame(
        playerId: string,
        gameMode: number,
        username: string,
        friend: string,
    ) {
        await this.updatePlayer(
            playerId,
            username,
            gameMode,
            GameType.FRIEND,
            friend,
        );
        this.friendGameList.set(username, playerId);
        console.log('inviteGame:', username, 'waiting for', friend);
    }

    async agreeInvite(playerId: string, username: string, friend: string) {
        //queue에 초대한 친구 있는지 확인
        const hostId = this.friendGameList.get(friend);
        if (hostId && this.playerList.get(hostId).friend === username) {
            //friendlist에서 해당 큐 제외
            this.friendGameList.delete(friend);
            //player update
            const gameMode = this.playerList.get(hostId).gameMode;
            await this.updatePlayer(
                playerId,
                username,
                gameMode,
                GameType.FRIEND,
                friend,
            );
            console.log('invite connected:', username, '&', friend);
            //방파줌. 즐겜!
            this.makeGameRoom(hostId, playerId, GameType.FRIEND, gameMode);
        } else {
            // 초대한 친구 없거나 초대한 사람이 내가 아니야!! => kickout 발동!
            this.playerList.get(playerId).socket.emit('kickout');
        }
    }

    denyInvite(playerId: string, username: string, friend: string) {
        //queue에 초대한 친구 있는지 확인
        const hostId = this.friendGameList.get(friend);
        if (hostId && this.playerList.get(hostId).friend === username) {
            this.friendGameList.delete(friend);
            this.playerList.get(hostId).socket.emit('denyInvite');
        } else throw new BadRequestException('no invitation to deny');
    }

    //* Game Room ======================================
    getReady(playerId: string): void {
        const roomId = this.playerList.get(playerId).roomId;
        const side = this.playerList.get(playerId).side;
        const rivalSide = (side + 1) % 2;
        this.gameRoomList.get(roomId).ready[side] = true;
        if (this.gameRoomList.get(roomId).ready[rivalSide]) {
            //둘 다 게임 준비 완료!
            this.updateGame(roomId);
            const [leftPlayer, rightPlayer] =
                this.gameRoomList.get(roomId).socket;
            const gameInfo = this.getBallStartDir(roomId);
            //TODO ballDirection 잘 가는지 확인 필요! (JSON 관련)111
            gameInfo['isFirst'] = true;
            gameInfo['side'] = PlayerSide.LEFT;
            leftPlayer.emit('startGame', gameInfo);
            gameInfo['side'] = PlayerSide.RIGHT;
            rightPlayer.emit('startGame', gameInfo);
            console.log('>>>>>> emit startGame done');
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
            await this.finishGame(roomId, side, GameEndStatus.NORMAL);
        } else this.continueGame(roomId);
    }

    sendEmoji(playerId: string, emoji: number) {
        if (emoji < Emoji.HI || Emoji.BADWORDS < emoji)
            throw new BadRequestException('wrong emoji sent');
        const player = this.playerList.get(playerId);
        const side = player.side;
        const rivalSocket = this.gameRoomList.get(player.roomId).socket[
            (side + 1) % 2
        ];
        rivalSocket.emit('sendEmoji', { type: emoji });
    }

    //* other functions ======================================

    //득점 후 계속 진행
    continueGame(roomId: number) {
        const [player1, player2] = this.gameRoomList.get(roomId).socket;
        const gameInfo = this.getBallStartDir(roomId);
        gameInfo['isFirst'] = false;
        gameInfo['side'] = PlayerSide.NONE; //아무값
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
        console.log('gameRoom: ', this.gameRoomList.get(roomId));
        //플레이어들에게 결과 전달
        const [player1Socket, player2Socket] =
            this.gameRoomList.get(roomId).socket;
        const gameResult = {
            winner: winnerSide,
            leftScore: this.gameRoomList.get(roomId).score[PlayerSide.LEFT],
            rightScore: this.gameRoomList.get(roomId).score[PlayerSide.RIGHT],
            reason: endGameStatus,
        };
        //TODO gameResult 잘 전달되는지 확인 필요! (JSON 관련)
        console.log(
            'send gameOver to players:',
            gameResult.leftScore,
            'vs',
            gameResult.rightScore,
        );
        player1Socket.emit('gameOver', gameResult);
        player2Socket.emit('gameOver', gameResult);
        console.log('sent gameOver');
        //DB에 저장
        await this.createGameData(roomId);
        //gameRoom 처리
        if (
            this.gameRoomList.get(roomId).gameType === GameType.FRIEND &&
            endGameStatus === GameEndStatus.NORMAL
        ) {
            //친선경기 => reset gameRoom for restart
            this.resetGameRoom(roomId);
        } else {
            //그 외 => player reset && delete room
            this.resetPlayer(this.playerList.get(player1Socket.id));
            this.resetPlayer(this.playerList.get(player2Socket.id));
            if (this.gameRoomList.get(roomId)) this.gameRoomList.delete(roomId);
        }
    }

    resetGameRoom(roomId: number) {
        this.gameRoomList.get(roomId).ready = [false, false];
        this.gameRoomList.get(roomId).gameStatus = GameStatus.WAIT;
        this.gameRoomList.get(roomId).score = [0, 0];
        this.gameRoomList.get(roomId).startTime = undefined;
        this.gameRoomList.get(roomId).endTime = undefined;
        this.gameRoomList.get(roomId).winner = undefined;
        this.gameRoomList.get(roomId).loser = undefined;
        this.gameRoomList.get(roomId).endGameStatus = undefined;
    }
    //게임 종료시 gameRoom 업데이트
    updateGameRoom(roomId: number, side: number, endGameStatus: number) {
        this.gameRoomList.get(roomId).endTime =
            DateTime.now().setZone(TIMEZONE);
        this.gameRoomList.get(roomId).winner = side;
        this.gameRoomList.get(roomId).loser = (side + 1) % 2;
        this.gameRoomList.get(roomId).endGameStatus = endGameStatus;
        if (
            endGameStatus === GameEndStatus.CHEATING ||
            endGameStatus === GameEndStatus.DISCONNECT
        ) {
            this.gameRoomList.get(roomId).score[side] = MAXSCORE;
            this.gameRoomList.get(roomId).score[(side + 1) % 2] = 0;
        }
    }
    //DB에 게임 결과 저장
    async createGameData(roomId: number) {
        try {
            const room = this.gameRoomList.get(roomId);
            const [winnerUserId, loserUserId] = [
                this.playerList.get(room.socket[room.winner].id).userId,
                this.playerList.get(room.socket[room.loser].id).userId,
            ];
            const newGameData = this.gameRepository.create({
                winnerId: winnerUserId,
                winnerScore: room.score[room.winner],
                winnerSide: room.winner,
                loserId: loserUserId,
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
    makeGameRoom(
        player1Id: string,
        player2Id: string,
        gameType: number,
        gameMode: number,
    ) {
        //waitRoom 만들기
        const gameRoom: GameRoom = {
            id: this.gameRoomIdx,
            gameType: gameType,
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
        let left: string, right: string;
        if (Math.floor(Math.random() * 2)) {
            left = player1Id;
            right = player2Id;
        } else {
            left = player2Id;
            right = player1Id;
        }
        gameRoom.socket = [
            this.playerList.get(left).socket,
            this.playerList.get(right).socket,
        ];

        //Player 업데이트 && emit('handShake')
        console.log('enterGameRoom:', gameRoom.id);
        this.handShake(left, PlayerSide.LEFT, gameRoom.id);
        this.handShake(right, PlayerSide.RIGHT, gameRoom.id);
    }
    //gameRoom 진입 시 Player 정보 업데이트
    handShake(playerId: string, side: number, roomId: number): void {
        this.playerList.get(playerId).roomId = roomId;
        this.playerList.get(playerId).side = side;
        this.playerList.get(playerId).socket.emit('handShake');
    }

    //game 시작 시 => gameRoom 업데이트
    updateGame(gameRoomId: number) {
        this.gameRoomList.get(gameRoomId).gameStatus = GameStatus.GAME;
        this.gameRoomList.get(gameRoomId).startTime =
            DateTime.now().setZone(TIMEZONE);
        this.gameRoomList.get(gameRoomId).score = [0, 0];
        //TESTCODE: startTime
        // console.log('startTime:', this.gameRoomList.get(gameRoomId).startTime);
    }

    async updatePlayer(
        playerId: string,
        username: string,
        gameMode: number,
        gameType: number,
        friend?: string | undefined,
    ) {
        const player: Player = this.playerList.get(playerId);
        if (player.roomId)
            throw new BadRequestException('player already in gameRoom');

        //! TESTCODE
        if (username === 'kwsong') player.userId = 1234;
        else {
            player.username = username;
            player.userId = (
                await this.userService.getUserByUsername(username)
            ).id;
        }
        if (friend) player.friend = friend;
        player.gameType = gameType;
        player.gameMode = gameMode;
        if (gameMode === GameMode.NONE)
            throw new BadRequestException('gameMode invalid');
    }

    //game 각 라운드 시작 시 공 방향 세팅
    getBallStartDir(roomId: number): any {
        const dirX = (Math.random() * (MAX - MIN) + MIN) * -2 + 1;
        const dirZ =
            ((Math.random() * (MAX - MIN) + MIN) * -2 + 1) *
            (Math.random() * (MAXF - MINF) + MINF);
        this.firstBallHit(roomId, dirX, dirZ);
        return {
            x: dirX,
            y: 0,
            z: dirZ,
        };
    }
    //시작 시 첫 ball hit point
    firstBallHit(roomId: number, dirX: number, dirZ: number) {
        // this.gameRoomList.get(roomId).ballHitX =
        // this.gameRoomList.get(roomId).ballHitY =
        // this.gameRoomList.get(roomId).ballHitZ =
    }
    //충돌 이후 다음 ball hit point
    nextBallHit(roomId: number) {}

    //게임 중단/종료 시 플레이어 리셋
    resetPlayer(player: Player) {
        player.gameType = undefined;
        player.gameMode = undefined;
        player.side = undefined;
        player.roomId = undefined;
        player.friend = undefined;
    }
}
