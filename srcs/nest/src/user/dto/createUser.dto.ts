import { IsBoolean, IsNotEmpty, IsString } from 'class-validator';

export class CreateUserDto {
    @IsNotEmpty()
    @IsString()
    username: string;

    @IsString()
    profileurl: string;

    @IsBoolean()
    @IsNotEmpty()
    require2fa: boolean;
}
