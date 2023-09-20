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
import { RoomDto } from './room.dto';
import { RoomInfoDto } from './roominfo.dto';
import { ClientDto } from './client.dto';
@WebSocketGateway({
    port: 3000,
    cors: {
        origin: true,
        withCredentials: true,
    },
    namespace: 'RoomChat',
}) // 데코레이터 인자로 포트 줄 수 있음
export class ChatRoomGateway
    implements OnGatewayConnection, OnGatewayDisconnect
{
    // 생성자로 서비스 넣고 로직 분리 가능
    // client: Map<string, any>;

    // connectedClients: { [socketId: string]: boolean } = {};
    clientList = new Map();
    // Map<number, ClientDto>;
    privateRoomList = Array<RoomDto>;
    publicRoomList = Array<RoomDto>;
    constructor(private chatroomService: ChatRoomService) {
        // this.client = new Map<string, any>();
        // // this.rooms = new Map<number, any>();
        // this.idx_client = 0;
        // // this.idx_room = 0;
    }

    @WebSocketServer()
    server: Server;

    handleConnection(socket: Socket, clientDto: ClientDto) {
        //jwt 토큰에서 가져온 정보도 추가
        // client['nickname'] = 'user ' + this.idx_client++;
        this.clientList[socket.id] = clientDto;
        console.log(socket.id, ': new connection.');
    }

    handleDisconnect(socket: Socket) {
        this.clientList.delete(socket.id);
        console.log(socket.id, ': lost connection.');
    }

    // //events라는 유형의 message를 받게되면 handleEvent 함수를 작동시킨다
    // //return 을 통해 응답할 수 있다.
    // @SubscribeMessage('events')
    // handleEvent(@MessageBody() data: number): number {
    //     return data;
    // }

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
        this.chatroomService.getChatRoomList();
        client.emit('getChatRoomList');
    }

    //채팅방 생성
    @SubscribeMessage('createChatRoom')
    createChatRoom(client: Socket, json: JSON) {
        this.chatroomService.createChatRoom(
            client,
            Object.assign(new RoomInfoDto(), json),
        );
        client.emit('create ChatRoom');
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
