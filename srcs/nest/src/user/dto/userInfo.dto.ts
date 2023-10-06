import { IsBoolean, IsNotEmpty, IsString } from 'class-validator';

export class UserInfoDto {
    @IsNotEmpty()
    @IsString()
    userName: string;

    @IsString()
    profileurl: string;

    @IsBoolean()
    @IsNotEmpty()
    require2fa: boolean;
}
