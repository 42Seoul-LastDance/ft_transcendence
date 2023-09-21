import { IsBoolean, IsNumber, IsString, IsArray } from 'class-validator';
import { ClientDto } from './client.dto';

export class ChatRoomDto {
    // @IsNotEmpty()
    @IsNumber()
    id: number;

    // @IsNotEmpty()
    @IsString()
    roomname: string;

    // @IsNotEmpty()
    @IsString()
    ownername: string;

    @IsString()
    password: string;

    @IsBoolean()
    requirePassword: boolean;

    @IsArray()
    operatorList: Array<string> = [];

    @IsArray()
    memberList: Array<string> = [];

    @IsArray()
    banList: Array<string> = [];

    @IsArray()
    muteList: Map<string, Date> = [];
}
