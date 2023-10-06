import { IsNotEmpty, IsString, IsNumber } from 'class-validator';

//TODO 프로필에 보여줄 내용 정해야함
export class UserProfileDto {
    @IsNotEmpty()
    @IsNumber()
    id: number;

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
