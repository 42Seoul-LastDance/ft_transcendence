import { IsBoolean, IsNumber, IsString } from 'class-validator';
import { ClientDto } from './client.dto';

export class RoomDto {
    // @IsNotEmpty()
    @IsNumber()
    id: number;

    // @IsNotEmpty()
    @IsString()
    roomname: string;

    // @IsNotEmpty()
    owner: ClientDto;

    @IsString()
    password: string;

    @IsBoolean()
    isLocked: boolean;

    admin: Array<ClientDto>;

    member: Array<ClientDto>;

    ban: Array<ClientDto>;
}
