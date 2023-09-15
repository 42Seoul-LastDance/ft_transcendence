import { IsNotEmpty, IsString } from 'class-validator';

export class Auth42Dto {
    @IsString()
    @IsNotEmpty()
    email: string;

    @IsString()
    @IsNotEmpty()
    slackId: string;

    @IsString()
    @IsNotEmpty()
    image_url: string;

    @IsString()
    @IsNotEmpty()
    displayname: string;

    @IsString()
    @IsNotEmpty()
    accesstoken: string;
}
