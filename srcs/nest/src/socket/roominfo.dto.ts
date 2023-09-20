import { IsBoolean, IsEnum, IsString } from 'class-validator';
import { roomStatus } from './room.enum';

export class RoomInfoDto {
    @IsString()
    roomname: string;

    @IsString()
    username: string;

    @IsString()
    password: string | null;

    @IsBoolean()
    isLocked: boolean;

    @IsEnum(roomStatus)
    status: roomStatus;
}
