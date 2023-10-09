import { Controller, Get, Put, Delete, Patch, Param, Req, Res, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwtAuth.guard';
import { Response } from 'express';
import { BlockedUsersService } from './blockedUsers.service';
import { UserService } from '../user.service';

@Controller('block')
export class BlockedUsersController {
    constructor(
        private userService: UserService,
        private readonly blockedUsersService: BlockedUsersService,
    ) {}

    @Get('/getBlockList')
    // @UseGuards(JwtAuthGuard)
    async getBlockList(@Req() req, @Res() res: Response) {
        const blockList = await this.blockedUsersService.getBlockUsernameListById(+req.user.id);
        //TODO res에 JSON 잘 가는지 확인 필요
        return res.send(blockList);
    }

    @Delete('/unblock/:blockName')
    // @UseGuards(JwtAuthGuard)//친구가 아닐 때만 가능함.
    async unblockUser(@Req() req, @Res() res: Response, @Param('blockName') blockName: string) {
        const targetId = (await this.userService.getUserByUserName(blockName)).id;
        this.blockedUsersService.unblockUserById(req.user.sub, targetId);
        return res.sendStatus(200);
    }

    @Patch('/blockUser/:blockName')
    @UseGuards(JwtAuthGuard)
    async blockUser(@Req() req, @Res() res: Response, @Param('blockName') blockName: string) {
        const targetId = (await this.userService.getUserByUserName(blockName)).id;
        this.blockedUsersService.blockUserById(req.user.id, targetId);
        return res.sendStatus(200);
    }
}
