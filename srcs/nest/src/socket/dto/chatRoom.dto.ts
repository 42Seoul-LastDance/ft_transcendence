import { IsBoolean, IsString, IsArray, IsEnum } from 'class-validator';
import { roomStatus } from '../room.enum';

export class ChatRoomDto {
    @IsString()
    roomName: string;

    @IsString()
    ownerName: string;

    @IsEnum(roomStatus)
    status: roomStatus;

    @IsString()
    password: string;

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
