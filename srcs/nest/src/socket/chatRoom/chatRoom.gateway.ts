import {
    OnGatewayConnection,
    OnGatewayDisconnect,
    SubscribeMessage,
    WebSocketGateway,
    WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatRoomService } from './chatRoom.service';
import { CreateRoomDto } from './dto/createRoom.dto';
import { JwtService } from '@nestjs/jwt';

@WebSocketGateway({
    port: 3000,
    cors: {
        origin: true,
        withCredentials: true,
    },
    transport: ['websocket'],
    namespace: 'RoomChat',
})
export class ChatRoomGateway implements OnGatewayConnection, OnGatewayDisconnect {
    constructor(
        private chatroomService: ChatRoomService,
        private jwtService: JwtService,
    ) {}

    @WebSocketServer()
    public server: Server;

    // * 커넥션 핸들링 ========================================================
    async handleConnection(socket: Socket) {
        // socket.emit('expireToken', async () => {
        // console.log('token: ', socket.handshake.query.token); // * 테스트용
        // console.log('HANDLE CONNECTION 함수 called');
        // console.log('socket.handshake.auth.token : ', socket.handshake.auth.token); // * 실 구현은 auth.token으로 전달 받기
        const tokenString: string = socket.handshake.auth.token as string;
        try {
            if (!tokenString) {
                throw new Error('jwt is empty.');
            }
            const decodedToken = this.jwtService.verify(tokenString, {
                secret: process.env.JWT_SECRET_KEY,
            });
            console.log('NEW CONNECTION WITH', decodedToken.userName);
            await this.chatroomService.addNewUser(socket, decodedToken.sub, this.server);
        } catch (error) {
            console.log('error : ', error.message);
            if (
                // => null 들어가면 (토큰 형식 안맞)
                // error.message === 'jwt malformed' ||
                // => undefined 비어 있으면 (토큰 안들어옴)
                // error.message === 'jwt must be provided' ||
                error.message === 'jwt expired'
            ) {
                // `${BACK_URL}/auth/regenerateToken`
                // * 토큰 만료 => 근데 왜 404 날라와요?.. ?
                console.log('expireToken emit called');
                socket.emit('expireToken');
            }
            socket.disconnect(true);
            // console.log(error);
            return;
        }
        // });
        console.log(socket.id, ': new connection. (Chat)');
        socket.emit('connectSuccess');

        socket.on('disconnecting', async (reason) => {
            console.log('DISCONNECTING event : ', socket.rooms);
            const rooms: Set<string> = socket.rooms;
            console.log('saved rooms:', rooms);
            await this.chatroomService.leavePastRoom(socket, rooms, this.server);
            await this.chatroomService.deleteUser(socket);
            console.log('DISCONNECTING event :: After LeavePastRoom :  ', socket.rooms);
        });
        //test
        // socket.emit('expireToken');
    }

    async handleDisconnect(socket: Socket) {
        //     const userName = this.chatroomService.getUserId(socket);
        //     console.log('DISCONNECT ', userName);
        //     console.log('disconnection handling :: rooms : ', socket.rooms);
        //     // if (await this.chatroomService.leavePastRoom(socket, this.server) === false)
        //     this.chatroomService.deleteUser(socket);
        //     console.log(socket.id, ': lost connection. (Chat)');
    }

    // * Getter ===========================================================
    // @SubscribeMessage('getBlockUser')
    // getBlockUser(socket: Socket) {
    //     const blockList = this.chatroomService.getUserBlockList(socket);
    //     socket.emit('getBlockUser', blockList);
    // }

    @SubscribeMessage('getMyName')
    async getMyName(socket: Socket) {
        const userName = await this.chatroomService.getUserNameBySocket(socket);
        socket.emit('getMyName', userName);
    }

    @SubscribeMessage('expireToken')
    expireToken(socket: Socket, payload: string) {
        // console.log('expireToken : ', payload);
        // 프론트 소켓은 별개라 업데이트 안됨 -jaejkim
        // socket.handshake.auth.token = payload;
        // console.log('새로 들어 온 거  : ', payload);
    }

    @SubscribeMessage('getChatRoomList')
    getChatRoomList(socket: Socket) {
        // ”roomname”: string,
        // ”isLocked” : boolean,
        // ”status” : roomStatus,
        console.log('----------------------getChatRoomList');
        const chatRoomList = this.chatroomService.getChatRoomList();
        socket.emit('getChatRoomList', chatRoomList);
        // socket.emit('getChatRoomList', {'chatRoomList': {chatRoomList}});
        // Object.fromEntries(chatRoomList)
    }

    @SubscribeMessage('getChatRoomInfo')
    async getChatRoomInfo(socket: Socket, payload: JSON) {
        //roomName: string
        //ownerName: string
        //roomstatus: RoomStatus
        // requirePassword: boolean
        // operatorList: Array<string>
        // memberList: Array<string>
        const chatRoomInfo = await this.chatroomService.getChatRoomInfo(socket, payload['roomName'], payload['status']);
        socket.emit('getChatRoomInfo', chatRoomInfo);
        console.log('getChatRoomInfo :: ', chatRoomInfo);
        // Object.fromEntries(chatRoomList)
    }

    // * Message ===========================================================
    @SubscribeMessage('sendMessage')
    sendMessage(socket: Socket, payload: JSON): void {
        console.log('SEND MESSAGE payload', payload);
        this.chatroomService.sendMessage(
            socket,
            payload['roomName'],
            payload['userName'],
            payload['content'],
            payload['status'],
        );
    }

    @SubscribeMessage('receiveMessage')
    async receiveMessage(socket: Socket, payload: JSON): Promise<void> {
        const result = await this.chatroomService.receiveMessage(socket, payload['userName'], payload['content']);
        socket.emit('receiveMessage', result);
    }

    // * ChatRoom Method ===========================================================
    @SubscribeMessage('createChatRoom')
    async createChatRoom(socket: Socket, payload: JSON) {
        // console.log('createChatRoom payload : ', payload);
        console.log('CREATE CHAT ROOM ');
        await this.chatroomService.createChatRoom(socket, Object.assign(new CreateRoomDto(), payload), this.server);
        // * 프론트 요청 : create 후 새로 갱신된 리스트 전송
        const chatRoomList = this.chatroomService.getChatRoomList();
        const chatRoomInfo = await this.chatroomService.getChatRoomInfo(socket, payload['roomName'], payload['status']);
        console.log('createChatRoom :: ', chatRoomList, chatRoomInfo);
        socket.emit('createChatRoom', chatRoomInfo);
        this.server.emit('getChatRoomList', chatRoomList);
    }

    @SubscribeMessage('joinPublicChatRoom')
    async joinPublicChatRoom(socket: Socket, payload: JSON) {
        console.log('JOIN PUBLIC CHAT ROOM listen');
        await this.chatroomService.joinPublicChatRoom(socket, payload['roomName'], payload['password'], this.server);
    }

    @SubscribeMessage('joinPrivateChatRoom')
    async joinPrivateChatRoom(socket: Socket, payload: JSON) {
        await this.chatroomService.joinPrivateChatRoom(socket, payload['roomName'], this.server);
    }

    // @SubscribeMessage('exitChatRoom')
    // exitChatRoom(socket: Socket, payload: JSON) {
    //     this.exitChatRoom(socket, payload['roomName']);
    // }

    // * 채팅방 패스워드 관련 =================================================
    @SubscribeMessage('setRoomPassword')
    setRoomPassword(socket: Socket, payload: JSON) {
        console.log('SET ROOM PASSWORD');
        this.chatroomService.setRoomPassword(socket, payload['roomName'], payload['password']);
    }

    @SubscribeMessage('unsetRoomPassword')
    unsetRoomPassword(socket: Socket, payload: JSON) {
        console.log('UNSET ROOM PASSWORD');
        this.chatroomService.unsetRoomPassword(socket, payload['roomName']);
    }

    // * Owner & Operator =====================================================
    @SubscribeMessage('grantUser')
    async grantUser(socket: Socket, payload: JSON) {
        console.log('GRANT USER');
        await this.chatroomService.grantUser(socket, payload['roomName'], payload['roomStatus'], payload['targetName']);
    }

    @SubscribeMessage('ungrantUser')
    async ungrantUser(socket: Socket, payload: JSON) {
        console.log('UNGRANT USER');
        await this.chatroomService.ungrantUser(
            socket,
            payload['roomName'],
            payload['roomStatus'],
            payload['targetName'],
        );
    }

    @SubscribeMessage('kickUser')
    async kickUser(socket: Socket, payload: JSON) {
        console.log('KICK USER');
        await this.chatroomService.kickUser(socket, payload['roomName'], payload['targetName'], this.server);
    }

    @SubscribeMessage('muteUser')
    async muteUser(socket: Socket, payload: JSON) {
        console.log('MUTE USER');
        await this.chatroomService.muteUser(
            socket,
            payload['status'],
            payload['roomName'],
            payload['targetName'],
            payload['time'],
        );
    }

    @SubscribeMessage('banUser')
    async banUser(socket: Socket, payload: JSON) {
        console.log('BAN USER');
        this.chatroomService.banUser(socket, payload['roomName'], payload['roomStatus'], payload['targetName']);
    }

    @SubscribeMessage('unbanUser')
    async unbanUser(socket: Socket, payload: JSON) {
        console.log('UNBAN USER');
        this.chatroomService.unbanUser(socket, payload['roomName'], payload['roomStatus'], payload['targetName']);
    }

    // * Block & Unblock =======================================================

    @SubscribeMessage('blockUser')
    async blockUser(socket: Socket, payload: JSON) {
        console.log('BLOCK USER');
        this.chatroomService.blockUser(socket, payload['targetName']);
        this.server.serverSideEmit('blockUser', {
            userId: this.chatroomService.getUserId(socket),
            targetId: payload['targetName'],
        });
    }

    @SubscribeMessage('unBlockUser')
    async unBlockUser(socket: Socket, payload: JSON) {
        console.log('UNBLOCK USER');
        this.chatroomService.unBlockUser(socket, payload['targetName']);
        this.server.serverSideEmit('blockUser', {
            userId: this.chatroomService.getUserId(socket),
            targetId: payload['targetName'],
        });
    }

    @SubscribeMessage('inviteUser')
    async inviteUser(socket: Socket, payload: JSON) {
        console.log('INVITE USER');
        await this.chatroomService.inviteUser(socket, payload['roomName'], payload['userName']);
    }
}
