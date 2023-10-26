import { Controller, Get, Put, Delete, Patch, Param, Req, Res, UseGuards, Logger } from '@nestjs/common';
import { GameService } from './game.service';
import { JwtAuthGuard } from 'src/auth/jwtAuth.guard';
import { Response } from 'express';

@Controller('games')
export class GameController {
    private logger = new Logger(GameController.name);
    constructor(private readonly gameService: GameService) {}

    @Get('/getGameHistory/:slackId')
    @UseGuards(JwtAuthGuard)
    async getGameHistory(@Req() req, @Res() res: Response, @Param('slackId') slackId: string) {
        try {
            const gameHistory = await this.gameService.getGameHistory(slackId);
            return res.send(gameHistory);
        } catch (error) {
            //ERROR HANDLE
            console.log('[ERROR]: getGameHistory', error);
            if (error.status === 500) return res.sendStatus(500);
            return res.sendStatus(400);
        }
    }

    @Get('/getGameData/:slackId')
    @UseGuards(JwtAuthGuard)
    async getGameData(@Req() req, @Res() res: Response, @Param('slackId') slackId: string) {
        try {
            const gameData = await this.gameService.getGameData(slackId);
            return res.send(gameData);
        } catch (error) {
            //ERROR HANDLE
            console.log('[ERROR]: getGameData', error);
            if (error.status === 500) return res.sendStatus(500);
            return res.sendStatus(400);
        }
    }

    @Get('/getFriendGameData/:slackId')
    @UseGuards(JwtAuthGuard)
    async getFriendGameData(@Req() req, @Res() res: Response, @Param('slackId') slackId: string) {
        try {
            const friendGameData = await this.gameService.getFriendGameData(+req.user.sub, slackId);
            return res.send(friendGameData);
        } catch (error) {
            //ERROR HANDLE
            console.log('[ERROR]: getFriendGameData', error);
            if (error.status === 500) return res.sendStatus(500);
            return res.sendStatus(400);
        }
    }
}
