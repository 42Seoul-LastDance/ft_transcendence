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

    @IsArray()
    operatorList: Array<string> = [];

    @IsArray()
    memberList: Array<string> = [];

    @IsArray()
    inviteList: Array<string> = [];

    @IsArray()
    banList: Array<string> = [];

    @IsArray()
    muteList: Array<string> = [];
}
