import {
    Controller,
    Get,
    Put,
    Post,
    Delete,
    Patch,
    Param,
    Req,
    Res,
    UseGuards,
    Logger,
    Body,
} from '@nestjs/common';
import { FriendService } from './friend.service';
import { JwtAuthGuard } from 'src/auth/jwtAuth.guard';
import { Response } from 'express';
import { FriendStatus } from './friend.enum';

@Controller('friends')
export class FriendController {
    private logger = new Logger(FriendController.name);
    constructor(private readonly friendService: FriendService) {}

	@Post('/isFriend/')
	@UseGuards(JwtAuthGuard) //slackId 작업 완료
	async getFriendStatus(@Req() req, @Body('friendSlackId') friendSlackId: string, @Res() res: Response) {
        this.logger.debug('parsing friendSlackId : ', friendSlackId);
        const status: FriendStatus = await this.friendService.getFriendStatus(+req.user.sub, friendSlackId);
        return res.send({ status: status });
    }

    @Put('/request/')
    @UseGuards(JwtAuthGuard)
    async requestFriend(@Req() req, @Body('friendSlackId') friendSlackId, @Res() res: Response) {
        await this.friendService.requestFriend(+req.user.sub, friendSlackId);
        return res.sendStatus(200);
    }

    @Delete('/delete/:friendSlackId')
    @UseGuards(JwtAuthGuard)
    async deleteFriend(@Req() req, @Res() res: Response, @Param('friendSlackId') friendSlackId: string) {
        await this.friendService.deleteFriend(+req.user.sub, friendSlackId);
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

    @Patch('/saYes/:friendSlackId')
    @UseGuards(JwtAuthGuard)
    async acceptRequest(@Req() req, @Res() res: Response, @Param('friendSlackId') friendSlackId: string) {
        await this.friendService.acceptRequest(+req.user.sub, friendSlackId);
        return res.sendStatus(200);
    }

    @Delete('/decline/:friendSlackId')
    @UseGuards(JwtAuthGuard)
    async declineRequest(@Req() req, @Res() res: Response, @Param('friendSlackId') friendSlackId: string) {
        await this.friendService.declineRequest(+req.user.sub, friendSlackId);
        return res.sendStatus(200);
    }
}
