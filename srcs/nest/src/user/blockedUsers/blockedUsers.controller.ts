import { Controller, Get, Delete, Patch, Param, Req, Res, UseGuards, Logger } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwtAuth.guard';
import { Response } from 'express';
import { BlockedUsersService } from './blockedUsers.service';
import { UserService } from '../user.service';

@Controller('block')
export class BlockedUsersController {
    private logger = new Logger(BlockedUsersController.name);
    constructor(
        private userService: UserService,
        private readonly blockedUsersService: BlockedUsersService,
    ) {}

    @Get('/getBlockList')
    @UseGuards(JwtAuthGuard)
    async getBlockList(@Req() req, @Res() res: Response) {
        const blockList: Array<{ userName: string; slackId: string }> =
            await this.blockedUsersService.getBlockUsernameAndSlackIdListById(req.user.sub);
        //TODO res에 JSON 잘 가는지 확인 필요
        return res.send(blockList);
    }

    @Delete('/unblockUser/:slackId')
    @UseGuards(JwtAuthGuard) //친구가 아닐 때만 가능함.
    async unblockUser(@Req() req, @Res() res: Response, @Param('slackId') slackId: string) {
        const targetId = (await this.userService.getUserBySlackId(slackId)).id;
        this.blockedUsersService.unblockUserById(req.user.sub, targetId);
        return res.sendStatus(200);
    }

    @Patch('/blockUser/:userName')
    @UseGuards(JwtAuthGuard)
    async blockUser(@Req() req, @Res() res: Response, @Param('userName') userName: string) {
        const targetId = (await this.userService.getUserByUserName(userName)).id;
        console.log('request sub in BLOCK USER', req.user.sub);
        this.blockedUsersService.blockUserById(req.user.sub, targetId);
        return res.sendStatus(200);
    }

    @Get('/isBlocked/:userName') //?slackId로 받아야 할텐데 요청은 어디서 하지
    @UseGuards(JwtAuthGuard)
    async isBlocked(@Req() req, @Param('userName') userName: string, @Res() res: Response): Promise<void> {
        const targetId: number = (await this.userService.getUserByUserName(userName)).id;
        console.log('request sub in isBLOCKEd', req.user.sub);
        const isBlocked: boolean = await this.blockedUsersService.isBlocked(req.user.sub, targetId);
        res.send(isBlocked);
    }
}
