import { IsBoolean, IsEnum, IsString } from 'class-validator';
import { RoomStatus } from '../roomStatus.enum';

export class RoomInfoDto {
    @IsString()
    roomName: string;

    @IsString()
    username: string;

    @IsString()
    password: string | null;

    @IsBoolean()
    requirePassword: boolean;

    @IsEnum(RoomStatus)
    status: RoomStatus;
}
