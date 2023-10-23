import { Body, Controller, Get, Logger, Param, ParseIntPipe, Put, Req, Res, UseGuards } from '@nestjs/common';
import { DirectMessageService } from './directMessage.service';
import { JwtAuthGuard } from 'src/auth/jwtAuth.guard';
import { UserService } from 'src/user/user.service';
import { DirectMessageInfoDto } from './dto/directMessageInfo.dto';

@Controller('DM')
export class DirectMessageController {
    private logger = new Logger(DirectMessageController.name);
    constructor(
        private readonly directMessageService: DirectMessageService,
        private readonly userService: UserService,
    ) {}

    @Get('/with/:friendSlackId')
    @UseGuards(JwtAuthGuard)
    async getLoggedDMs(@Param('friendSlackId') friendSlackId: string, @Req() req, @Res() res) {
        try {
            this.logger.log('request user:', friendSlackId);
            const loggedDMs: DirectMessageInfoDto[] = await this.directMessageService.findRecentDMs(
                req.user.sub,
                friendSlackId,
                3000000, // <-- 이거 그냥 다 보내세요 ㅡ,ㅡ
            );
            return res.status(200).json(loggedDMs);
        } catch (error) {
            //ERROR HANDLE
            console.log('[ERROR]: getLoggedDMs', error);
            if (error.status === 500) res.sendStatus(500);
            return res.status(400).send({ reason: 'getLoggedDMs failed' });
        }
    }

    @Put('/send/:userName')
    @UseGuards(JwtAuthGuard)
    async sendMessage(@Param('userName') userName: string, @Body('content') content: string, @Req() req, @Res() res) {
        try {
            const receiverId: number = (await this.userService.getUserByUserName(userName)).id;
            await this.directMessageService.saveMessage(req.user.sub, receiverId, true, content);
            return res.status(200).send();
        } catch (error) {
            //ERROR HANDLE
            console.log('[ERROR]: sendMessage', error);
            if (error.status === 500) res.sendStatus(500);
            return res.status(400).send({ reason: 'sendMessage failed' });
        }
    }
}
