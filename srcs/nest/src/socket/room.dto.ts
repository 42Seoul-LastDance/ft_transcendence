import { IsBoolean, IsNumber, IsString } from 'class-validator';
// import { ClientDto } from './client.dto';

export class RoomDto {
    // @IsNotEmpty()
    @IsNumber()
    id: number;

    // @IsNotEmpty()
    @IsString()
    roomname: string;

    // @IsNotEmpty()
    @IsString()
    owner: string;

    @IsString()
    password: string;

    @IsBoolean()
    isLocked: boolean;

    admin: Array<string> = [];

    member: Array<string> = [];

    ban: Array<string> = [];
}
