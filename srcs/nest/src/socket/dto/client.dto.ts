import { IsBoolean, IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class ClientDto {
    // @IsNotEmpty()
    @IsNumber()
    socketId: number;

    // @IsNotEmpty()
    @IsString()
    username: string;
}
