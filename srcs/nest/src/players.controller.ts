import { Controller, Get } from '@nestjs/common';
import { PlayersService } from './players.service';
import { Player } from './player.entity';

@Controller('players')
export class PlayersController {
  constructor(private readonly playersService: PlayersService) {}

  @Get()
  findAll(): Promise<Player[]> {
    return this.playersService.findAll();
  }
}
