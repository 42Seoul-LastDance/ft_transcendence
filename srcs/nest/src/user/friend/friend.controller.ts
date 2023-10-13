import {
    Controller,
    Get,
    Put,
    Delete,
    Patch,
    Param,
    Req,
    Res,
    UseGuards,
    // NotFoundException,
    // InternalServerErrorException,
    // BadRequestException,
} from '@nestjs/common';
import { FriendService } from './friend.service';
import { JwtAuthGuard } from 'src/auth/jwtAuth.guard';
import { Response } from 'express';

@Controller('friends')
export class FriendController {
    constructor(private readonly friendService: FriendService) {}

    @Get('/getFriendList')
    @UseGuards(JwtAuthGuard)
    async getFriendList(@Req() req, @Res() res: Response) {
        console.log(req.user);
        const friendList = await this.friendService.getFriendNameList(+req.user.sub);
        console.log(friendList);
        return res.status(200).send(friendList);
    }

    @Get('/isFriend/:friendName')
    @UseGuards(JwtAuthGuard)
    async getFriendStatus(@Req() req, @Res() res: Response, @Param('friendName') friendName: string) {
        const status = await this.friendService.getFriendStatus(+req.user.sub, friendName);
        //TODO res에 status JSON으로 담아서 보내기
        return res.send({ status: status });
    }

    @Put('/request/:friendName')
    @UseGuards(JwtAuthGuard)
    async requestFriend(@Req() req, @Res() res: Response, @Param('friendName') friendName: string) {
        await this.friendService.requestFriend(+req.user.sub, friendName);
        return res.sendStatus(200);
    }

    @Delete('/delete/:friendName')
    @UseGuards(JwtAuthGuard)
    async deleteFriend(@Req() req, @Res() res: Response, @Param('friendName') friendName: string) {
        await this.friendService.deleteFriend(+req.user.sub, friendName);
        return res.sendStatus(200);
    }

    @Get('/getInvitation')
    @UseGuards(JwtAuthGuard)
    async getInvitation(@Req() req, @Res() res: Response) {
        console.log('getinveiteList called');
        const invitations = await this.friendService.getInvitation(+req.user.sub);
        return res.send(invitations);
    }

    @Patch('/saYes/:friendName')
    @UseGuards(JwtAuthGuard)
    async acceptRequest(@Req() req, @Res() res: Response, @Param('friendName') friendName: string) {
        await this.friendService.acceptRequest(+req.user.sub, friendName);
        return res.sendStatus(200);
    }

    @Delete('/decline/:friendName')
    @UseGuards(JwtAuthGuard)
    async declineRequest(@Req() req, @Res() res: Response, @Param('friendName') friendName: string) {
        await this.friendService.declineRequest(+req.user.sub, friendName);
        return res.sendStatus(200);
    }
}
