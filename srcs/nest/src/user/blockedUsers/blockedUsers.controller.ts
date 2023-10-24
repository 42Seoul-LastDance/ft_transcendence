import { Controller, Get, Delete, Patch, Param, Req, Res, UseGuards, Logger } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwtAuth.guard';
import { Response } from 'express';
import { BlockedUsersService } from './blockedUsers.service';
import { UserService } from '../user.service';
import { User } from 'src/user/user.entity';

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
        try {
            const blockList: Array<{ userName: string; slackId: string }> =
                await this.blockedUsersService.getBlockUsernameAndSlackIdListById(req.user.sub);
            return res.send(blockList);
        } catch (error) {
            //ERROR HANDLE
            console.log('[ERROR]: getBlockList', error);
            if (error.status === 500) return res.sendStatus(500);
            return res.sendStatus(400);
        }
    }

    @Delete('/unblockUser/:slackId')
    @UseGuards(JwtAuthGuard) //친구가 아닐 때만 가능함.
    async unblockUser(@Req() req, @Res() res: Response, @Param('slackId') slackId: string) {
        try {
            const target: User = await this.userService.getUserBySlackId(slackId);
            if (target === undefined) return res.sendStatus(400);
            this.blockedUsersService.unblockUserById(req.user.sub, target.id);
            return res.sendStatus(200);
        } catch (error) {
            //ERROR HANDLE
            console.log('[ERROR]: unblockUser', error);
            if (error.status === 500) return res.sendStatus(500);
            return res.sendStatus(400);
        }
    }

    @Patch('/blockUser/:slackId')
    @UseGuards(JwtAuthGuard)
    async blockUser(@Req() req, @Res() res: Response, @Param('slackId') slackId: string) {
        try {
            const target: User = await this.userService.getUserBySlackId(slackId);
            if (target === undefined) return res.sendStatus(400);
            // this.logger.debug(`request sub in BLOCK USER ${req.user.sub}`);
            this.blockedUsersService.blockUserById(req.user.sub, target.id);
            return res.sendStatus(200);
        } catch (error) {
            //ERROR HANDLE
            console.log('[ERROR]: blockUser', error);
            if (error.status === 500) return res.sendStatus(500);
            return res.sendStatus(400);
        }
    }

    @Get('/isBlocked/:slackId')
    @UseGuards(JwtAuthGuard)
    async isBlocked(@Req() req, @Param('slackId') slackId: string, @Res() res: Response): Promise<any> {
        try {
            const target: User = await this.userService.getUserBySlackId(slackId);
            if (target === undefined) return res.sendStatus(400);
            // this.logger.debug(`request sub in isBlocked ${req.user.sub}`);
            const isBlocked: boolean = await this.blockedUsersService.isBlocked(req.user.sub, target.id);
            if (isBlocked) return res.send({ isBlocked: true });
            return res.send({ isBlocked: false });
        } catch (error) {
            //ERROR HANDLE
            console.log('[ERROR]: isBlocked', error);
            if (error.status === 500) return res.sendStatus(500);
            return res.sendStatus(400);
        }
    }
}
