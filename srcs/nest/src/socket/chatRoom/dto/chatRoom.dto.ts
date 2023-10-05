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
    operatorList: Array<number> = [];

    @IsArray()
    memberList: Array<number> = [];

    @IsArray()
    inviteList: Array<number> = [];

    @IsArray()
    banList: Array<number> = [];

    @IsArray()
    muteList: Array<number> = [];
}

// myName
// myPermisson

//  enum Permission{
//     OWNER = 0,
//     MEMBER = 1,
//     ADMIN = 2,
//   }
