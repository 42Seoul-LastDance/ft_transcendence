import { IsBoolean, IsEnum, IsString } from 'class-validator';
import { roomStatus } from '../room.enum';

export class RoomInfoDto {
    @IsString()
    roomName: string;

    @IsString()
    username: string;

    @IsString()
    password: string | null;

    @IsBoolean()
    requirePassword: boolean;

    @IsEnum(roomStatus)
    status: roomStatus;
}
