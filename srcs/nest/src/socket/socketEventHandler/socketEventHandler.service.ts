import { Inject, Injectable, forwardRef } from '@nestjs/common';
import { SocketUsersService } from '../socketUsersService/socketUsers.service';
import { ChatRoomService } from '../chatRoom/chatRoom.service';
import { Socket } from 'socket.io';
import { UserStatus } from 'src/user/user-status.enum';
/*
 @Brief REST API 변동사항으로 인해 socket event를 발송하는 경우에 사용하는 서비스.
 가장 상위 개념에 위치해있다. 

*/
@Injectable()
export class SocketEventHandlerSerivce {
    constructor(
        // @Inject(forwardRef(() => SocketUsersService))
        private socketUsersService: SocketUsersService,
        private chatRoomService: ChatRoomService,
    ) {}

    async updateUserName(userId: number) {
        const socket = this.socketUsersService.getDMSocketById(userId);
        const friendList: Array<number> = this.socketUsersService.getFriendList().get(userId);
        for (const friend of friendList) {
            const friendSocket: Socket = this.socketUsersService.getDMSocketById(friend);
            const friendName: string = await this.socketUsersService.getUserNameByUserId(friend);
            if (friendSocket) {
                const friendStateList: [string, UserStatus][] =
                    await this.socketUsersService.getFriendStateList(friendName);
                friendSocket.emit('getFriendStateList', friendStateList);
            }
        }
    }

    //userName이 업데이트 된 경우 사용하는 함수
    //들어가있는 방에서 MemberList 업데이트 (getChatRoomInfo) : 들어가있는 방 순회
    //친구 리스트에서 업데이트 (getFriendStateList)  : 친구 순회
    //getinvitationList  업데이트(updateInvitation) : 초대한 사람, 초대 받은 사람 순회
}
