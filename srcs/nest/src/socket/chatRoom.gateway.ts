import {
    MessageBody,
    OnGatewayConnection,
    OnGatewayDisconnect,
    SubscribeMessage,
    WebSocketGateway,
    WebSocketServer,
    // ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
// import { ChatroomDto } from './chatroom.dto';
import { ChatRoomService } from './chatRoom.service';
// import { SocketIoAdapter } from 'src/adapters/socket-io.adapters';
import { RoomInfoDto } from './dto/roominfo.dto';
import { ClientDto } from './dto/client.dto';
@WebSocketGateway({
    port: 3000,
    cors: {
        origin: true,
        withCredentials: true,
    },
    // query :
    namespace: 'RoomChat',
}) // 데코레이터 인자로 포트 줄 수 있음
export class ChatRoomGateway
    implements OnGatewayConnection, OnGatewayDisconnect
{
    // 생성자로 서비스 넣고 로직 분리 가능
    clientList = new Map();
    constructor(private chatroomService: ChatRoomService) {
        // this.client = new Map<string, any>();
        // this.idx_client = 0;
    }

    @WebSocketServer()
    server: Server;

    handleConnection(socket: Socket) {
        //jwt 토큰에서 가져온 정보도 추가
        // client['nickname'] = 'user ' + this.idx_client++;
        // this.clientList[socket.id] = clientDto;
        console.log('token: ', socket.handshake.query['username']);
        // [Object: null prototype] {
        //     username: 'kwsong',
        //     id: '1234',
        //     EIO: '4',
        //     transport: 'polling',
        //     t: 'OgryZ66'
        // }
        console.log(socket.id, ': new connection.');
    }

    handleDisconnect(socket: Socket) {
        this.clientList.delete(socket.id);
        console.log(socket.id, ': lost connection.');
    }

    // //메시지가 전송되면 모든 유저에게 메시지 전송
    // @SubscribeMessage('sendMessage')
    // sendMessage(client: Socket, message: string): void {
    //     console.log('function called ', this.clientList.size);
    //     //for문 어케씀
    //     this.clientList.forEach((element) => {
    //         console.log(element.nickname);
    //         if (element.connected) {
    //             element.emit('getMessage', message);
    //         }
    //     });
    // }

    //채팅방 리스트 전달
    @SubscribeMessage('getChatRoomList')
    getChatRoomList(client: Socket) {
        // ”roomname”: string,
        // ”isLocked” : boolean,
        // ”status” : roomStatus,
        const chatRoomList = this.chatroomService.getChatRoomList();
        client.emit('getChatRoomList', chatRoomList);
    }

    //채팅방 생성
    @SubscribeMessage('createChatRoom')
    createChatRoom(client: Socket, payload: JSON) {
        this.chatroomService.createChatRoom(
            client,
            Object.assign(new RoomInfoDto(), payload),
        );
        client.emit('createChatRoom');
    }

    // //채팅방 들어가기
    // @SubscribeMessage('enterChatRoom')
    // enterChatRoom(client: Socket, roomId: string) {
    //     // this.rooms[+roomId].member += client.id;
    //     // this.rooms[+roomId]['member'] = client.id;
    //     // client.rooms.clear();
    //     // client.join(roomId);
    // }

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

    // //* 채팅방 권한 설정 =========================================
    // //admin 설정 -> 책봉, 해제
    // @SubscribeMessage('updateAdmin')
    // updateAdmin(client: Socket, roomId: string) {
    //     // client.join(roomId);
    // }
}
