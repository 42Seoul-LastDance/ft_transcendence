import { Injectable } from '@nestjs/common';
import { SocketUsersService } from '../socketUsersService/socketUsers.service';
import { ChatRoomService } from '../chatRoom/chatRoom.service';
/*
 @Brief REST API 변동사항으로 인해 socket event를 발송하는 경우에 사용하는 서비스.
 가장 상위 개념에 위치해있다. 

*/
@Injectable()
export class SocketEventHandlerSerivce {
    constructor(
        private socketUsersSerivce: SocketUsersService,
        private chatRoomService: ChatRoomService,
    ) {}

    //userName이 업데이트 된 경우 사용하는 함수
    //들어가있는 방에서 MemberList 업데이트 (getChatRoomInfo) : 들어가있는 방 순회
    //친구 리스트에서 업데이트 (getFriendStateList)  : 친구 순회
    //getinvitationList  업데이트(updateInvitation) : 초대한 사람, 초대 받은 사람 순회
}
