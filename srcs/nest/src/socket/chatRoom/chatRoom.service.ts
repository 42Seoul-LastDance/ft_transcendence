import { Injectable, Logger } from '@nestjs/common';
import { Socket, Server } from 'socket.io';
import { ChatRoomDto } from './dto/chatRoom.dto';
import { CreateRoomDto } from './dto/createRoom.dto';
import { RoomStatus } from './roomStatus.enum';
import { UserPermission } from './userPermission.enum';
import { SocketUsersService } from '../socketUsersService/socketUsers.service';
import { User } from 'src/user/user.entity';
/*
1. 채팅방 개설
2. 채팅방 나가기
3. 채팅방 리스트 주기
4. 채팅방 안에 있는 사람들끼리 채팅
*/
// eventFailure
interface Member {
    userName: string;
    slackId: string;
    permission: UserPermission;
}

@Injectable()
export class ChatRoomService {
    private logger = new Logger(ChatRoomService.name);
    private publicRoomList: Map<string, ChatRoomDto> = new Map<string, ChatRoomDto>();
    private privateRoomList: Map<string, ChatRoomDto> = new Map<string, ChatRoomDto>();

    constructor(private socketUsersService: SocketUsersService) {
        // console.log('🌟🌟🌟new connection!!!! 다 초기화 됨!!!!!!!🌟🌟🌟');
    }

    private async getMemberList(chatRoom: ChatRoomDto): Promise<Array<string>> {
        const memberList: Array<string> = [];
        let userName;
        for (const member of chatRoom?.memberList) {
            userName = await this.socketUsersService.getUserNameByUserId(member);
            if (userName === undefined) continue;
            memberList.push(userName);
        }
        return memberList;
    }

    private async getMuteList(chatRoom: ChatRoomDto): Promise<Array<string>> {
        const memberList: Array<string> = [];

        let userName;
        for (const member of chatRoom?.muteList) {
            userName = await this.socketUsersService.getUserNameByUserId(member);
            if (userName === undefined) continue;
            memberList.push(userName);
        }
        return memberList;
    }

    private async getBanMemberList(chatRoom: ChatRoomDto): Promise<Array<{ userName: string; slackId: string }>> {
        const memberList: Array<{ userName: string; slackId: string }> = [];

        let user: User;
        for (const memberId of chatRoom?.banList) {
            user = await this.socketUsersService.getUserByUserId(memberId);
            if (user === undefined) continue;
            memberList.push({ userName: user.userName, slackId: user.slackId });
        }
        this.logger.debug('GET BAN LIST', memberList);
        return memberList;
    }

    getUserId(socket: Socket): number | undefined {
        return this.socketUsersService.getUserIdByChatSocketId(socket.id);
    }

    async addNewUser(socket: Socket, userId: number, io: Server) {
        socket.rooms.clear();

        await this.socketUsersService.disconnectIfConnected(userId);
        this.socketUsersService.addChatRoomUser(userId, socket);
        this.socketUsersService.addChatRoomSocket(socket.id, userId);
        await this.socketUsersService.setBlockList(userId);
    }

    async deleteUser(socket: Socket) {
        const userId = this.getUserId(socket);
        //user가 속했던 방  삭제
        const publicRooms: Map<string, ChatRoomDto> = this.publicRoomList;
        const privateRooms: Map<string, ChatRoomDto> = this.privateRoomList;
        for (let [k, v] of publicRooms) {
            if (v.memberList.has(userId)) this.publicRoomList.delete(k);
        }
        for (let [k, v] of privateRooms) {
            if (v.memberList.has(userId)) this.privateRoomList.delete(k);
        }
    }
    //result, reason
    emitFailReason(socket: Socket, event: string, reason: string) {
        this.logger.log(`error in ${event} : ${reason}`);
        const response = {
            result: false,
            reason: reason,
        };
        socket.emit('eventFailure', response);
    }

    emitSuccess(socket: Socket, event: string, reason: string) {
        const response = {
            result: true,
            reason: reason,
        };
        socket.emit(event, response);
    }

    getChatRoomList(): Array<{ roomName: string; requirePassword: boolean }> {
        const keyArray = Array.from(this.publicRoomList.keys()); // keyArray:  [ 'default room', 'roomName', ... ]
        let roomList = new Array<{ roomName: string; requirePassword: boolean }>();
        for (const key of keyArray) {
            const requirePassword = this.publicRoomList.get(key)?.requirePassword;
            roomList.push({
                roomName: key,
                requirePassword: requirePassword,
            });
        }
        return roomList;
    }

    async getUserPermission(socket: Socket, roomStatus: RoomStatus, roomName: string): Promise<UserPermission> {
        // room: ChatRoomDto, userId: number, userName: string
        let room: ChatRoomDto;
        if (roomStatus === RoomStatus.PUBLIC) room = this.publicRoomList.get(roomName);
        else if (roomStatus === RoomStatus.PRIVATE) room = this.privateRoomList.get(roomName);
        else return;

        const userId: number = this.getUserId(socket);
        const userName: string = await this.getUserNameBySocket(socket);
        let result: UserPermission;
        result = UserPermission.MEMBER;
        if (room === undefined || room === null || userName === undefined) return;
        if (room?.ownerName === userName) result = UserPermission.OWNER;
        else if (room?.operatorList) {
            for (const memberId of room.operatorList) {
                if (memberId === userId) result = UserPermission.ADMIN;
            }
        }
        return result;
    }

    async getUserNameBySocket(socket: Socket): Promise<string> {
        const userId: number = await this.socketUsersService.getUserIdByChatSocketId(socket.id);
        if (userId === undefined) return undefined;
        const userName: string = await this.socketUsersService.getUserNameByUserId(userId);
        return userName;
    }

    async getChatRoomInfo(
        socket: Socket,
        roomName: string,
        roomstatus: RoomStatus,
    ): Promise<{ roomName: string; ownerName: string; status: RoomStatus }> {
        //public/private 중 특정 방 정보를 준다.
        let chatroomDto: ChatRoomDto;
        if (roomstatus === RoomStatus.PUBLIC) {
            chatroomDto = this.publicRoomList.get(roomName);
        } else chatroomDto = this.privateRoomList.get(roomName);
        if (!chatroomDto) {
            // console.log('getChatRoomInfo :: 채팅방 정보를 찾을 수 없어요 : ', roomName);
            return undefined;
        }
        const userId = this.socketUsersService.getUserIdByChatSocketId(socket.id);

        const roomInfo = {
            roomName: chatroomDto.roomName,
            ownerName: chatroomDto.ownerName,
            status: chatroomDto.status,
        };
        return roomInfo;
    }

    async getMemberStateList(socket: Socket, roomName: string, roomStatus: RoomStatus): Promise<Array<Member>> {
        const memberStateList: Array<Member> = [];
        let room: ChatRoomDto;
        if (roomName === undefined || roomStatus === undefined) {
            this.logger.error('roomName or roomStatus undefined.');
            this.emitFailReason(socket, 'getMemberStateList', '알 수 없는 이유가 발생했어요. 새로고침 해주세요.');
            return;
        }
        if (roomName === null || roomStatus === null) {
            this.logger.error('roomName or roomStatus null');
            this.emitFailReason(socket, 'getMemberStateList', '알 수 없는 이유가 발생했어요. 새로고침 해주세요.');
            return;
        }

        if (roomStatus === RoomStatus.PUBLIC) room = this.publicRoomList.get(roomName);
        else if (roomStatus === RoomStatus.PRIVATE) {
            room = this.privateRoomList.get(roomName);
        } else return;

        if (room === undefined || room.memberList === undefined) {
            this.logger.error('room memberList undefined.');
            this.emitFailReason(socket, 'getMemberStateList', '알 수 없는 이유가 발생했어요. 새로고침 해주세요');
            return;
        }
        for (const member of room.memberList) {
            const name: string = await this.socketUsersService.getUserNameByUserId(member);
            const slackId: string = await this.socketUsersService.getSlackIdById(member);
            if (name === undefined || slackId === undefined) continue;
            let permission: UserPermission = UserPermission.MEMBER;
            if (room.operatorList.has(member)) permission = UserPermission.ADMIN;
            if (room.ownerName === name) permission = UserPermission.OWNER;
            memberStateList.push({ userName: name, slackId: slackId, permission: permission });
        }
        return memberStateList;
    }

    async getBanList(
        socket: Socket,
        roomName: string,
        roomStatus: RoomStatus,
    ): Promise<Array<{ userName: string; slackId: string }>> {
        // chatroom dto 찾아서 getBanMemberList 리턴
        let room;
        if (roomName === undefined || roomStatus === undefined) {
            this.emitFailReason(socket, 'memberStateList', '알 수 없는 이유가 발생했어요. 새로고침 해주세요.');
            return;
        }
        if (roomName === null || roomStatus === null) {
            this.emitFailReason(socket, 'memberStateList', '알 수 없는 이유가 발생했어요. 새로고침 해주세요.');
            return;
        }
        if (roomStatus === RoomStatus.PRIVATE) room = this.privateRoomList.get(roomName);
        else if (roomStatus === RoomStatus.PUBLIC) room = this.publicRoomList.get(roomName);
        else {
            this.emitFailReason(socket, 'getBanList', `${roomName} 방을 찾을 수 없어요.`);
            return;
        }

        return await this.getBanMemberList(room);
    }

    /*
    @Brief: 중복이 있을 때 true
    */
    checkDuplicate(roomName: string): boolean {
        if (this.publicRoomList.get(roomName) !== undefined || this.privateRoomList.get(roomName) !== undefined)
            return true;
        return false;
    }

    async createChatRoom(socket: Socket, createRoomDto: CreateRoomDto, io: Server): Promise<boolean> {
        const checkDuplicate: boolean = this.checkDuplicate(createRoomDto.roomName);
        if (checkDuplicate) {
            this.logger.warn(`Create failed : chat room already exists.`);
            this.emitFailReason(socket, 'createChatRoom', `이미 존재하는 방이에요.`);
            return false;
        }

        const roomDto: ChatRoomDto = new ChatRoomDto();
        // console.log('chat room dto created🥪.'); //귀여워 🥹 `w`

        roomDto.roomName = createRoomDto.roomName;
        roomDto.ownerName = await this.socketUsersService.getUserNameByUserId(
            this.socketUsersService.getUserIdByChatSocketId(socket.id),
        );
        if (roomDto.ownerName === undefined) {
            this.emitFailReason(socket, 'createChatRoom', `방장 이름 오류.`);
            return false;
        }
        roomDto.requirePassword = createRoomDto.requirePassword;
        roomDto.status = createRoomDto.status;
        if (createRoomDto.password) {
            roomDto.password = createRoomDto.password;
        }

        if (createRoomDto.status === RoomStatus.PRIVATE) this.privateRoomList.set(createRoomDto.roomName, roomDto);
        else if (createRoomDto.status === RoomStatus.PUBLIC) this.publicRoomList.set(createRoomDto.roomName, roomDto);

        console.log('room created. check privateRoomList:', this.privateRoomList);
        if (createRoomDto.status === RoomStatus.PRIVATE) {
            await this.joinPrivateChatRoom(socket, roomDto.roomName, io);
        } else if (createRoomDto.status === RoomStatus.PUBLIC)
            await this.joinPublicChatRoom(socket, roomDto.roomName, roomDto.password, io);
        //.to('' + roomDto.id) => 글쓴 사람을 제외한 다른 사람들한테만 보이는지 확인
        return true;
    }

    explodeRoom(socket: Socket, pastRoom: ChatRoomDto, io: Server) {
        const pastRoomName = pastRoom.roomName;
        socket.to(pastRoomName).emit('explodeRoom', () => {});
        if (pastRoom.status === RoomStatus.PUBLIC) this.publicRoomList.delete(pastRoomName);
        else if (pastRoom.status === RoomStatus.PRIVATE) this.privateRoomList.delete(pastRoomName);
        this.logger.log(`ROOM ${pastRoomName} exploded.`);
        io.emit('getChatRoomList', this.getChatRoomList());
        io.socketsLeave(pastRoomName);
        // console.log('🥇이거 보내는 거임 ------ !!!!!!!!!!!!!!!!!!!!! ----------- !!!!!!!🥇 ', this.getChatRoomList());
    }

    async leavePastRoom(socket: Socket, rooms: Set<string>, io: Server): Promise<boolean> {
        const userId = this.socketUsersService.getUserIdByChatSocketId(socket.id);
        if (userId === undefined) return false;
        const userName = await this.socketUsersService.getUserNameByUserId(userId);
        // this.logger.log('LEAVE PAST ROOM');
        const array = Array.from(rooms);
        const pastRoomName = array[0];

        socket.leave(pastRoomName); //void
        this.logger.debug(`${userName} leaves ${pastRoomName}`);

        if (pastRoomName === undefined) {
            this.logger.debug(`LEAVE PAST ROOM : ${userName} has no pastroom.`);
            return false;
        }

        //? 유저가 privateroom에 있었으면 privateRoomList에서 찾아야하지 않을까요? (1) (juhoh) -> 맞는 것 같습니다
        let pastRoom: ChatRoomDto;
        pastRoom = this.publicRoomList.get(pastRoomName);
        if (pastRoom === undefined) pastRoom = this.privateRoomList.get(pastRoomName);
        if (pastRoom === undefined) {
            this.logger.warn(`LEAVE PAST ROOM : pastroom is undefined`);
            return false;
        }
        const pastRoomStatus: RoomStatus = pastRoom?.status;
        socket.to(pastRoomName).emit('serverMessage', userName + '님이 방을 나가셨습니다.');
        if (userName === pastRoom?.ownerName) {
            // owner가 나갈 경우 방 폭파
            // socket.to(pastRoomName).emit('explodeChatRoom', '방 소유자가 나갔으므로 채팅방이 사라집니다.');
            this.explodeRoom(socket, pastRoom, io);
        } else {
            //한 유저만 chatRoom에서 삭제
            pastRoom?.memberList.delete(userId);
            pastRoom?.operatorList.delete(userId);
            pastRoom?.muteList.delete(userId);
            socket.leave(pastRoomName);
            const memberStateList = await this.getMemberStateList(socket, pastRoomName, pastRoomStatus);
            io.to(pastRoomName).emit('getMemberStateList', memberStateList);
        }
        return true;
    }

    async joinPublicChatRoom(socket: Socket, roomName: string, password: string, io: Server): Promise<boolean> {
        const targetRoom = this.publicRoomList.get(roomName);
        const userId = this.socketUsersService.getUserIdByChatSocketId(socket.id);
        if (userId === undefined) return false;
        const userName = await this.socketUsersService.getUserNameByUserId(userId);

        console.log('JOIN PUBLIC CHAT ROOM targetRoom : ', targetRoom);
        // console.log('userId: ', userId);
        if (targetRoom === undefined) {
            //NO SUCH ROOM
            this.logger.warn(`JOIN PUBLIC CHAT ROOM : ${targetRoom} does not exist.`);
            this.emitFailReason(socket, 'joinPublicChatRoom', `${userName}님, ${roomName} 방이 존재하지 않아요.`);
            return false;
        }
        //banList
        if (targetRoom.banList.has(userId)) {
            this.logger.warn(
                `JOIN PUBLIC CHAT ROOM : ${userName}을 ${targetRoom} 방에 다시 못 들어오게 했어요. 나가게 하려면 kick도 수행해주세요.`,
            );
            this.emitFailReason(
                socket,
                'joinPublicChatRoom',
                `${userName}님은 차단 되어서 ${roomName}방에 들어가지 못해요.`,
            );
            return false;
        }

        //locked ROOMMMMMMMMA
        if (targetRoom.requirePassword === true && password !== targetRoom.password) {
            this.emitFailReason(socket, 'joinPublicChatRoom', `${userName}님, 비밀번호가 틀렸어요.`);
            return false;
        }

        await this.leavePastRoom(socket, socket.rooms, io);
        socket.join(roomName);

        //user의 Channel 변경
        //ChannelList에서 user 추가
        targetRoom.memberList.add(userId);
        socket.emit('serverMessage', `"${userName}"님이 "${targetRoom.roomName}"방에 접속했습니다`);
        socket.to(roomName).emit('serverMessage', `"${userName}"님이 "${targetRoom.roomName}"방에 접속했습니다`);

        this.logger.log('PUBLIC CHAT ROOM SUCCESS, EMIT');
        this.emitSuccess(socket, 'joinPublicChatRoom', `"${targetRoom.roomName}"방에 접속했어요.`);
        return true;
    }

    async joinPrivateChatRoom(socket: Socket, roomName: string, io: Server): Promise<boolean> {
        const targetRoom = this.privateRoomList.get(roomName);
        const userId = this.socketUsersService.getUserIdByChatSocketId(socket.id);
        if (userId === undefined) return false;
        const userName = await this.socketUsersService.getUserNameByUserId(userId);
        this.logger.log('JOIN PRIVATE CHAT ROOM called.');

        if (targetRoom === undefined) {
            this.logger.warn(`JOIN PRIVATE CHAT ROOM : ${roomName} does not exist.`);
            this.emitFailReason(socket, 'joinPrivateChatRoom', `${userName}님, ${roomName} 방이 존재하지 않아요.`);
            return false;
        }
        if (targetRoom.banList.has(userId)) {
            this.logger.warn(`JOIN PRIVATE CHAT ROOM : ${userId} is banned from ${targetRoom.roomName}`);
            this.emitFailReason(
                socket,
                'joinPrivateChatRoom',
                `${userName}님은 차단 되어서 ${roomName}방 에 들어가지 못해요.`,
            );
            return false;
        }

        if (targetRoom.memberList.size !== 0 && targetRoom.inviteList.has(userId) === false) {
            this.emitFailReason(
                socket,
                'joinPrivateChatRoom',
                `${roomName}방 은 ${userName}님이 초대되지 않은 방이에요.`,
            );
            return false;
        }

        await this.leavePastRoom(socket, socket.rooms, io);
        //user의 Channel 변경
        socket.join(roomName);
        //ChannelList에서 user 추가
        targetRoom.memberList.add(userId);
        this.logger.debug('target room added memberList: ', targetRoom.memberList);

        console.log('targetroom in PRIVATE ROOM', targetRoom);
        socket.emit('serverMessage', `"${userName}"님이 "${targetRoom.roomName}"방에 접속했습니다`);
        socket.to(roomName).emit('serverMessage', `"${userName}"님이 "${targetRoom.roomName}"방에 접속했습니다`);

        this.emitSuccess(socket, 'joinPrivateChatRoom', `"${targetRoom.roomName}"방에 접속했어요.`);
        targetRoom.inviteList.delete(userId); // 입장 성공 시 inviteList에서 입장한 유저 지워주기
        return true;
    }

    async kickUser(socket: Socket, roomName: string, targetName: string, io: Server) {
        // Kick을 시도하는 룸에 타겟 유저가 존재하는지 검사
        const userId = this.socketUsersService.getUserIdByChatSocketId(socket.id);
        //!test
        if (socket.rooms[0] !== roomName) this.logger.warn(`roomName 검사 실패 : ${socket.rooms[0]}`);
        const userName = await this.socketUsersService.getUserNameByUserId(userId);
        socket.to(roomName).emit('serverMessage', `"${userName}"님이 "${targetName}"님을 강퇴하였습니다.`);
        const targetId = await this.socketUsersService.getUserIdByUserName(targetName);
        if (targetId === undefined) return;
        const targetSocket = this.socketUsersService.getChatSocketById(targetId);
        this.logger.log(`targetSocketrooms ${targetSocket.rooms}`);
        if (targetSocket !== undefined) await this.leavePastRoom(targetSocket, targetSocket.rooms, io);
        this.emitSuccess(targetSocket, 'kickUser', `${targetName}님을 강퇴했어요.`);
    }

    private checkOperator(roomName: string, roomStatus: RoomStatus, userId: number): boolean {
        let room;
        if (roomStatus === RoomStatus.PUBLIC) room = this.publicRoomList.get(roomName);
        else room = this.privateRoomList.get(roomName);
        if (room.operatorList.has(userId) === -1) return false;
        return true;
    }

    async muteUser(
        socket: Socket,
        status: RoomStatus,
        roomName: string,
        targetName: string,
        time: number,
    ): Promise<void> {
        //! test  : op가 아니어도 된다면?! (front에서 혹시 잘못 띄우는지 확인)
        const userId = this.getUserId(socket);
        const userName = await this.socketUsersService.getUserNameByUserId(userId);
        if (this.checkOperator(roomName, status, userId) === false) {
            this.logger.error(`User ${userId} is not an operator.`);
            return;
        }

        if (status === undefined || roomName === undefined || targetName === undefined || time === undefined) {
            this.logger.error('undefined error in MuteUser');
            this.emitFailReason(socket, 'muteUser', '알 수 없는 이유가 발생했어요. 새로고침 해주세요.');
            return;
        }
        if (status === null || roomName === null || targetName === null || time === null) {
            this.logger.error('null error in MuteUser');
            this.emitFailReason(socket, 'muteUser', '알 수 없는 이유가 발생했어요. 새로고침 해주세요.');
            return;
        }

        //TODO : test . mute  가 잘 사라지나.
        let room: ChatRoomDto;

        if (status === RoomStatus.PRIVATE) room = this.privateRoomList.get(roomName);
        else room = this.publicRoomList.get(roomName);

        const targetId = await this.socketUsersService.getUserIdByUserName(targetName);
        if (targetId === undefined) return;
        room.muteList.add(targetId);

        const removeMuteUser = (targetId: number, roomDto: ChatRoomDto) => {
            roomDto.muteList.delete(targetId);
            this.logger.debug(`${roomName} mute list changed : ${roomDto.muteList}`);
        };

        setTimeout(async () => {
            // const targetId: number = await this.socketUsersService.getUserIdByUserName(targetName);
            removeMuteUser(targetId, room);
            this.logger.debug(`UNMUTE : ${targetName} in ${roomName}`);
        }, time * 1000);

        socket.emit('serverMessage', `"${userName}"님이 "${targetName}"님을 ${time}초간 mute하였습니다.`);
        socket.to(roomName).emit('serverMessage', `"${userName}"님이 "${targetName}"님을 ${time}초간 mute하였습니다.`);
    }

    async blockUser(socket: Socket, targetName: string): Promise<void> {
        //1. map에서 가져옴
        //2. 추가후 다시 갱신
        //! test
        const userId = this.getUserId(socket);
        const targetId = await this.socketUsersService.getUserIdByUserName(targetName);
        if (targetId === undefined) return;
        await this.socketUsersService.blockUser(userId, targetId);
        this.emitSuccess(socket, 'blockUser', `"${targetName}"님을 차단했어요.`);
    }

    async unBlockUser(socket: Socket, targetName: string): Promise<void> {
        const userId = this.getUserId(socket);
        const targetId = await this.socketUsersService.getUserIdByUserName(targetName);
        if (targetId === undefined) return;
        await this.socketUsersService.unBlockUser(userId, targetId);
        this.emitSuccess(socket, 'unBlockUser', `${targetName}님을 차단해제 했어요.`);
    }

    sendMessage(socket: Socket, roomName: string, userName: string, content: string, status: RoomStatus): boolean {
        let room: ChatRoomDto;
        const userId = this.getUserId(socket);
        if (roomName === undefined || roomName === null) {
            this.logger.error('roomName undefined or null');
            this.emitFailReason(socket, 'eventFailure', '알 수 없는 이유가 발생했어요. 새로고침 해주세요.');
            return;
        }

        if (userName === undefined || userName === null) {
            this.logger.error('userName undefined or null');
            this.emitFailReason(socket, 'eventFailure', '알 수 없는 이유가 발생했어요. 새로고침 해주세요.');
            return;
        }

        if (status === RoomStatus.PRIVATE) {
            room = this.privateRoomList.get(roomName);
        } else if (status === RoomStatus.PUBLIC) {
            room = this.publicRoomList.get(roomName);
        }
        if (room === undefined || room === null) {
            this.logger.error('room undefined or null');
            this.emitFailReason(socket, 'eventFailure', `이미 사라진 방이에요.`);
            return;
        }

        // userName in room? ->> return
        if (room.muteList.has(userId) === true) {
            this.logger.log(`${userName} is muted. ${room.muteList}`);
            return;
        }

        this.logger.log(`send event to room ${room.roomName}`);
        socket.emit('sendMessage', { userName: userName, content: content }); //sender
        socket.to(room.roomName).emit('sendMessage', { userName: userName, content: content }); //members
        this.logger.log(`Successfully sent message. ${userName} in ${roomName} : ${content}`);
    }

    /**
    socket 친구가 userName 친구의 메시지를 받아도 될까요?
    A가 B의 메시지를 받아도 되는가? A->B B->A 둘 다 검사??
    @Brief userName이 보낸 메시지를 socket의 front 에게 렌더링 할지 말지 알려줍니다.
    */
    async receiveMessage(socket: Socket, userName: string, content: string): Promise<void> {
        this.logger.log('RECEIVE MESSAGE CALLED');
        const userId: number = this.getUserId(socket);
        const targetId: number = await this.socketUsersService.getUserIdByUserName(userName);
        if (targetId === undefined) return;
        const isBlocked: boolean = await this.socketUsersService.isBlocked(userId, targetId);
        this.logger.debug(`${userId} blocks ${targetId} : ${isBlocked}`);
        const result = {
            canReceive: !isBlocked,
            userName: userName,
            content: content,
        };
        this.logger.debug('result:', result);
        socket.emit('receiveMessage', result);
    }

    async banUser(socket: Socket, roomName: string, roomStatus: RoomStatus, targetSlackId: string) {
        let room: ChatRoomDto;
        if (roomStatus === RoomStatus.PRIVATE) room = this.privateRoomList.get(roomName);
        else room = this.publicRoomList.get(roomName);

        const userName: string = await this.getUserNameBySocket(socket);
        if (userName === undefined) return;
        const target: User = await this.socketUsersService.getUserBySlackId(targetSlackId);
        if (target === undefined) return;
        if (room.banList.has(target.id)) {
            this.emitFailReason(socket, 'banUser', `${target.userName}님은 이미 ban 되어 있어요.`);
            return;
        }
        room.banList.add(target.id);
        this.emitSuccess(socket, 'banUser', `"${target.userName}"님을 ban했어요.`);
        socket.emit('serverMessage', `"${userName}"님이 "${target.userName}"님을 ban하였습니다.`);
        socket.to(roomName).emit('serverMessage', `"${userName}"님이 "${target.userName}"님을 ban하였습니다.`);

        const memberStateList = await this.getMemberStateList(socket, roomName, roomStatus);
        socket.emit('getMemberStateList', memberStateList);
        socket.to(roomName).emit('getMemberStateList', memberStateList);

        const banList = await this.getBanList(socket, roomName, roomStatus);
        socket.emit('getBanList', banList);
        socket.to(roomName).emit('getBanList', banList);
    }

    async unbanUser(socket: Socket, roomName: string, roomStatus: RoomStatus, targetSlackId: string) {
        let room: ChatRoomDto;
        const userName: string = await this.getUserNameBySocket(socket);
        if (userName === undefined) return;
        if (roomStatus === RoomStatus.PRIVATE) room = this.privateRoomList.get(roomName);
        else room = this.publicRoomList.get(roomName);

        const target: User = await this.socketUsersService.getUserBySlackId(targetSlackId);
        if (target === undefined) return;
        room.banList.delete(target.id);
        this.emitSuccess(socket, 'unbanUser', `"${target.userName}"님을 unban했어요.`);
        socket.emit('serverMessage', `"${userName}"님이 "${target.userName}"님을 unban하였습니다.`);
        socket.to(roomName).emit('serverMessage', `"${userName}"님이 "${target.userName}"님을 unban하였습니다.`);

        const memberStateList = await this.getMemberStateList(socket, roomName, roomStatus);
        socket.emit('getMemberStateList', memberStateList);
        socket.to(roomName).emit('getMemberStateList', memberStateList);

        const banList = await this.getBanList(socket, roomName, roomStatus);
        socket.emit('getBanList', banList);
        socket.to(roomName).emit('getBanList', banList);
    }

    async grantUser(socket: Socket, roomName: string, roomStatus: RoomStatus, targetName: string) {
        let room: ChatRoomDto;
        if (roomStatus === RoomStatus.PRIVATE) room = this.privateRoomList.get(roomName);
        else room = this.publicRoomList.get(roomName);
        if (room === undefined) {
            this.logger.error(`${roomName} does not exists`);
            this.emitFailReason(socket, 'grantUser', '알 수 없는 이유가 발생했어요. 새로고침 해주세요.');
            return;
        }

        const userName: string = await this.socketUsersService.getUserNameByUserId(this.getUserId(socket));
        const targetId: number = await this.socketUsersService.getUserIdByUserName(targetName);
        if (userName === undefined || targetId === undefined) return;

        //! test
        if (room.operatorList === undefined) {
            this.logger.error('test failed. operatorList is undefined.');
            this.emitFailReason(socket, 'grantUser', `알 수 없는 오류가 발생했어요. 새로고침 해주세요`);
            return;
        } else if (room.operatorList.has(targetId)) {
            this.logger.warn(`User ${targetId} is already operator in ${roomName}`);
            this.emitFailReason(socket, 'grantUser', `${targetName}님은 이미 관리자에요.`);
            return;
        }

        //operatorList append
        room.operatorList.add(targetId);
        this.emitSuccess(socket, 'grantUser', `${targetName}님을 관리자로 만들었어요!`);

        const memberStateList = await this.getMemberStateList(socket, roomName, roomStatus);
        this.logger.debug(`grant user memberStateList: ${memberStateList}`);
        if (memberStateList === undefined) {
            this.logger.error('');
            this.emitFailReason(socket, 'getMemberStateList', '알 수 없는 이유가 발생했어요. 새로고침 해주세요.');
            return;
        }
        socket.emit('serverMessage', `"${userName}"님이 "${targetName}"님을 관리자로 승격하였습니다.`);
        socket.to(roomName).emit('serverMessage', `"${userName}"님이 "${targetName}"님을 관리자로 승격하였습니다.`);
        socket.emit('getMemberStateList', memberStateList);
    }

    async ungrantUser(socket: Socket, roomName: string, roomStatus: RoomStatus, targetName: string) {
        let room: ChatRoomDto;
        if (roomStatus === RoomStatus.PRIVATE) room = this.privateRoomList.get(roomName);
        else room = this.publicRoomList.get(roomName);

        if (room === undefined) {
            this.logger.error('room is undefined');
            this.emitFailReason(socket, 'ungrantUser', '알 수 없는 이유가 발생했어요. 새로고침 해주세요.');
            return;
        }
        if (room.operatorList === undefined) {
            this.logger.error('test failed. operatorList is undefined.');
            this.emitFailReason(socket, 'ungrantUser', '알 수 없는 이유가 발생했어요. 새로고침 해주세요.');
            return;
        }

        const userName: string = await this.socketUsersService.getUserNameByUserId(this.getUserId(socket));
        const targetId = await this.socketUsersService.getUserIdByUserName(targetName);
        if (userName === undefined || targetId === undefined) return;
        room.operatorList.delete(targetId);
        this.emitSuccess(socket, 'ungrantUser', `"${targetName}"님의 관리자 자격을 빼았았어요.`);

        const memberStateList = await this.getMemberStateList(socket, roomName, roomStatus);
        this.logger.debug(`ungrantUser memberStateList : ${memberStateList}`);
        socket.emit('serverMessage', `"${userName}"님이 "${targetName}"님의 관리자 자격을 빼앗았습니다.`);
        socket.to(roomName).emit('serverMessage', `"${userName}"님이 "${targetName}"님의 관리자 자격을 빼앗았습니다.`);
        socket.emit('getMemberStateList', memberStateList);
    }

    async setRoomPassword(socket: Socket, roomName: string, password: string) {
        this.logger.log('SET ROOM PASSWORD');
        const userName = await this.getUserNameBySocket(socket);
        const room = this.publicRoomList.get(roomName);
        if (room === undefined || userName === undefined) {
            this.emitFailReason(socket, 'setRoomPassword', `${roomName} 방이 존재하지 않아요.`);
            return;
        }
        room.requirePassword = true;
        room.password = password;
        this.emitSuccess(socket, 'setRoomPassword', `${roomName} 방을 잠궜어요.`);
        socket.emit('getChatRoomInfo', await this.getChatRoomInfo(socket, roomName, RoomStatus.PUBLIC));
        socket.emit('serverMessage', `"${userName}"님이 방 비밀번호를 설정하였습니다.`);
        socket.to(roomName).emit('serverMessage', `"${userName}"님이 방 비밀번호를 설정하였습니다.`);
    }

    async unsetRoomPassword(socket: Socket, roomName: string) {
        this.logger.log('UNSET ROOM PASSWORD');
        const userName = await this.getUserNameBySocket(socket);
        const room = this.publicRoomList.get(roomName);
        if (room === undefined || userName === undefined) {
            this.emitFailReason(socket, 'unsetRoomPassword', `${roomName} 방이 존재하지 않아요.`);
            return;
        }
        room.requirePassword = false;
        room.password = null;
        this.emitSuccess(socket, 'unsetRoomPassword', `${roomName} 방의 잠금을 해제했어요.`);
        socket.emit('getChatRoomInfo', await this.getChatRoomInfo(socket, roomName, RoomStatus.PUBLIC));
        socket.emit('serverMessage', `"${userName}"님이 방 비밀번호를 해제하였습니다.`);
        socket.to(roomName).emit('serverMessage', `"${userName}"님이 방 비밀번호를 해제하였습니다.`);
    }

    async addInvitation(socket: Socket, roomName: string, roomStatus: RoomStatus, slackId: string): Promise<boolean> {
        // slackId -> userId 로 바꿔서
        // roomName 으로 RoomDto 찾아서 InviteList에 넣어주기
        if (roomStatus !== RoomStatus.PRIVATE) {
            this.logger.error('Invalid RoomStatus in addInvite Event');
            this.emitFailReason(socket, 'addInvite', '초대에 오류가 생겼어요');
            return false;
        }
        const user: User = await this.socketUsersService.getUserBySlackId(slackId);
        const room = this.privateRoomList.get(roomName);
        if (user === undefined || room === undefined) {
            this.logger.error('');
            this.emitFailReason(socket, 'addInvite', '초대에 오류가 생겼어요');
            return false;
        }
        room.inviteList.add(user.id);
        return true;
    }
}
