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

    @Patch('/blockUser/:slackId')
    @UseGuards(JwtAuthGuard)
    async blockUser(@Req() req, @Res() res: Response, @Param('slackId') slackId: string) {
        const targetId = (await this.userService.getUserBySlackId(slackId)).id;
        this.logger.debug(`request sub in BLOCK USER ${req.user.sub}`);
        this.blockedUsersService.blockUserById(req.user.sub, targetId);
        return res.sendStatus(200);
    }

    @Get('/isBlocked/:slackId')
    @UseGuards(JwtAuthGuard)
    async isBlocked(@Req() req, @Param('slackId') slackId: string, @Res() res: Response): Promise<any> {
        const targetId: number = (await this.userService.getUserBySlackId(slackId)).id;
        this.logger.debug(`request sub in isBlocked ${req.user.sub}`);
        const isBlocked: boolean = await this.blockedUsersService.isBlocked(req.user.sub, targetId);
        if (isBlocked) return res.send({ isBlocked: true });
        return res.send({ isBlocked: false });
    }
}
