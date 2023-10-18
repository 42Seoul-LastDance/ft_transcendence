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
    Logger,
    // NotFoundException,
    // InternalServerErrorException,
    // BadRequestException,
} from '@nestjs/common';
import { FriendService } from './friend.service';
import { JwtAuthGuard } from 'src/auth/jwtAuth.guard';
import { Response } from 'express';

@Controller('friends')
export class FriendController {
    private logger = new Logger(FriendController.name);
    constructor(private readonly friendService: FriendService) {}

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

    @Delete('/delete/:slackId')
    @UseGuards(JwtAuthGuard)
    async deleteFriend(@Req() req, @Res() res: Response, @Param('slackId') slackId: string) {
        await this.friendService.deleteFriend(+req.user.sub, slackId);
        return res.sendStatus(200);
    }

    @Get('/getInvitation')
    @UseGuards(JwtAuthGuard)
    async getInvitation(@Req() req, @Res() res: Response) {
        this.logger.log('getinviteList called');
        const invitations: Array<{ userName: string; slackId: string }> = await this.friendService.getInvitation(
            +req.user.sub,
        );
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
