import { IsBoolean, IsString, IsArray, IsEnum } from 'class-validator';
import { RoomStatus } from '../roomStatus.enum';

export class ChatRoomDto {
    @IsString()
    roomName: string;

    @IsString()
    ownerName: string;

    @IsEnum(RoomStatus)
    status: RoomStatus;

    @IsString()
    password: string | null;

    @IsBoolean()
    requirePassword: boolean;

    // TODO : 리스트들 다 set으로 관리하기

    @IsArray()
    operatorList: Set<number> = new Set();

    @IsArray()
    memberList: Set<number> = new Set();

    @IsArray()
    inviteList: Set<number> = new Set();

    @IsArray()
    banList: Set<number> = new Set();

    @IsArray()
    muteList: Set<number> = new Set();
}
