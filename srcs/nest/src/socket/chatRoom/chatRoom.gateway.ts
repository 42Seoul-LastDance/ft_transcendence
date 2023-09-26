import {
    OnGatewayConnection,
    OnGatewayDisconnect,
    SubscribeMessage,
    WebSocketGateway,
    WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatRoomService } from './chatRoom.service';
import { RoomInfoDto } from './dto/roominfo.dto';
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
    constructor(private chatroomService: ChatRoomService) {}

    @WebSocketServer()
    server: Server;

    // * 커넥션 핸들링 ========================================================
    handleConnection(socket: Socket) {
        console.log('token: ', socket.handshake.query['username']);
        this.chatroomService.addNewUser(socket);
        console.log(socket.id, ': new connection.');
    }

    handleDisconnect(socket: Socket) {
        this.chatroomService.leavePastRoom(socket, this.chatroomService.getUserName(socket));
        this.chatroomService.deleteUser(socket);
        console.log(socket.id, ': lost connection.');
    }

    // * Getter ===========================================================
    @SubscribeMessage('getBlockUser')
    getBlockUser(socket: Socket) {
        const blockList = this.chatroomService.getUserBlockList(socket);
        socket.emit('getBlockUser', blockList);
    }

    @SubscribeMessage('getChatRoomList')
    getChatRoomList(socket: Socket) {
        // ”roomname”: string,
        // ”isLocked” : boolean,
        // ”status” : roomStatus,
        const chatRoomList = this.chatroomService.getChatRoomList();
        socket.emit('getChatRoomList', chatRoomList);
        // Object.fromEntries(chatRoomList)
    }

    // * Message ===========================================================
    // //메시지가 전송되면 모든 유저에게 메시지 전송
    @SubscribeMessage('sendMessage')
    sendMessage(socket: Socket, payload: JSON): void {
        this.chatroomService.sendMessage(
            socket,
            payload['roomName'],
            payload['status'],
            payload['userName'],
            payload['content'],
        );
    }

    // * ChatRoom Method ===========================================================
    @SubscribeMessage('createChatRoom')
    createChatRoom(socket: Socket, payload: JSON) {
        this.chatroomService.createChatRoom(socket, Object.assign(new RoomInfoDto(), payload));
        socket.emit('createChatRoom');
    }

    @SubscribeMessage('joinPublicChatRoom')
    joinPublicChatRoom(socket: Socket, payload: JSON) {
        this.chatroomService.joinPublicChatRoom(socket, payload['roomName'], payload['password']);
    }

    // //채팅방 나가기
    // @SubscribeMessage('exitChatRoom')
    // exitChatRoom(client: Socket, roomId: string) {
    //     // if (this.rooms[+roomId].owner == client.id) {
    //     //     //방 폭!파!
    //     // }
    //     // client.join(roomId);
    // }

    // //채팅방 없애기(방장이 나감)
    // @SubscribeMessage('deleteChatRoom')
    // deleteChatRoom(client: Socket, roomId: string) {
    //     // client.join(roomId);
    // }

    // * 채팅방 패스워드 관련 =================================================
    // @SubscribeMessage('setRoomPassword')
    // setRoomPassword() {}

    // @SubscribeMessage('unsetRoomPassword')
    // unsetRoomPassword() {}

    // @SubscribeMessage('changeRoomPassword')
    // changeRoomPassword() {}

    // * Owner & Operator =====================================================
    // @SubscribeMessage('grantUser')
    // grantUser() {}

    // @SubscribeMessage('kickUser')
    // kickUser() {}

    @SubscribeMessage('muteUser')
    muteUser(socket: Socket, payload: JSON) {
        this.chatroomService.muteUser(
            socket,
            payload['status'],
            payload['roomName'],
            payload['targetName'],
            payload['time'],
        );
    }

    // @SubscribeMessage('banUser')
    // banUser() {}

    // * Block & Unblock =======================================================

    @SubscribeMessage('blockUser')
    blockUser() {}

    @SubscribeMessage('unBlockUser')
    unBlockUser() {}
}
