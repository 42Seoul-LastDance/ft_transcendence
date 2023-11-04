import { IsBoolean, IsEnum, IsString } from 'class-validator';
import { RoomStatus } from '../roomStatus.enum';

export class CreateRoomDto {
    @IsString()
    roomName: string;

    @IsString()
    password: string | null;

    @IsBoolean()
    requirePassword: boolean;

    @IsEnum(RoomStatus)
    status: RoomStatus;
}
