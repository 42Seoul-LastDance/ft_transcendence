import { IsString } from 'class-validator';

export class DirectMessageInfoDto {
    @IsString()
    userName: string;

    @IsString()
    content: string;
}
