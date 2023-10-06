import {
    Controller,
    Get,
    Param,
    UseGuards,
    Patch,
    Post,
    Req,
    Body,
    UseInterceptors,
    UploadedFile,
    Res,
    NotFoundException,
    InternalServerErrorException,
    BadRequestException,
    ParseIntPipe,
} from '@nestjs/common';
import { FriendService } from './friend.service';
import { JwtAuthGuard } from 'src/auth/jwtAuth.guard';
import { Response } from 'express';

@Controller('friend')
export class FriendController {
    constructor(private readonly friendService: FriendService) {}

    // @Post('/signup')
    // // @UseGuards(JwtEnrollGuard)
    // @UseInterceptors(FileInterceptor('profileImage'))
    // async signup(
    //     // @Req() req,
    //     // @Res() res: Response,
    //     @UploadedFile() profileImage: Express.Multer.File, // TODO -> 테스트 필요 : 프론트에서 파일을 Body에 묶어서 보낼 수 있는지 확인
    //     @Body('') : string, // * -> 프론트에서 Content-type 헤더를 multipart/form-data 로 설정하면 된다네요 by GPT ->great!!!
    // ) {
    //     const user = await this.userService.getUserByUserName();
    //     if (user) throw new BadRequestException('already used ');

    //     console.log(profileImage.filename);
    // }
}
