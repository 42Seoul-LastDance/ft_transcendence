import { Controller, Get, Put, Delete, Patch, Param, Req, Res, UseGuards, Logger } from '@nestjs/common';
import { GameService } from './game.service';
import { JwtAuthGuard } from 'src/auth/jwtAuth.guard';
import { Response } from 'express';

@Controller('games')
export class GameController {
    private logger = new Logger(GameController.name);
    constructor(private readonly gameService: GameService) {}

    @Get('/getGameData/:slackId')
    @UseGuards(JwtAuthGuard)
    async getGameData(@Req() req, @Res() res: Response, @Param('slackId') slackId: string) {
        const gameData = await this.gameService.getGameData(slackId);
        return res.send(gameData);
    }

    @Get('/getFriendGameData/:slackId')
    @UseGuards(JwtAuthGuard)
    async getFriendGameData(@Req() req, @Res() res: Response, @Param('slackId') slackId: string) {
        const friendGameData = await this.gameService.getFriendGameData(+req.user.sub, slackId);
        return res.send(friendGameData);
    }
}
