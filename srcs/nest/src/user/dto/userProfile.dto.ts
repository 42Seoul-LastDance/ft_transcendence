import { IsNotEmpty, IsString, IsNumber } from 'class-validator';

export class UserProfileDto {
    @IsNotEmpty()
    @IsNumber()
    slackId: string;

    @IsNotEmpty()
    @IsString()
    userName: string;

    @IsNotEmpty()
    @IsNumber()
    exp: number;

    @IsNotEmpty()
    @IsNumber()
    level: number;
}
