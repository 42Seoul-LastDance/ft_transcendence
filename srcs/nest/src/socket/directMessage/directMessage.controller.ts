import { Controller, Get, Param, ParseIntPipe, Req, Res, UseGuards } from '@nestjs/common';
import { DirectMessageService } from './directMessage.service';
import { JwtAuthGuard } from 'src/auth/jwtAuth.guard';
import { DirectMessage } from './directMessage.entity';
import { UserService } from 'src/user/user.service';

@Controller('DM')
export class DirectMessageController {
    constructor(
        private readonly directMessageService: DirectMessageService,
        private readonly userService: UserService,
    ) {}

    @Get('/with/:id')
    @UseGuards(JwtAuthGuard)
    async getLoggedDMs(@Param('id', ParseIntPipe) id: number, @Req() req, @Res() res) {
        // TODO : Jwt 토큰 정보에 맞게 수정 필요
        const userId: number = (await this.userService.getUserBySlackId(req.authDto.slackId)).id; 
        const loggedDMs: Promise<DirectMessage[]> = this.directMessageService.findRecentDMs(userId, id, 30);
        return res.status(200).json(loggedDMs);
    }
}
