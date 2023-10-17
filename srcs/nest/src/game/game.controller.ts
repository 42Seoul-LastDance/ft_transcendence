import { Controller, Get, Put, Delete, Patch, Param, Req, Res, UseGuards, Logger } from '@nestjs/common';
import { GameService } from './game.service';
import { JwtAuthGuard } from 'src/auth/jwtAuth.guard';
import { Response } from 'express';

@Controller('games')
export class GameController {
    private logger = new Logger(GameController.name);
    constructor(private readonly gameService: GameService) {}

    @Get('/getGameData/:userName')
    @UseGuards(JwtAuthGuard)
    async getGameData(@Req() req, @Res() res: Response, @Param('userName') userName: string) {
        const gameData = await this.gameService.getGameData(userName);
        return res.send(gameData);
    }

    @Get('/getFriendGameData/:userName')
    @UseGuards(JwtAuthGuard)
    async getFriendGameData(@Req() req, @Res() res: Response, @Param('userName') userName: string) {
        const friendGameData = await this.gameService.getFriendGameData(+req.user.sub, userName);
        return res.send(friendGameData);
    }
}
