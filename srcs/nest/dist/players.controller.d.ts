import { PlayersService } from './players.service';
import { Player } from './player.entity';
export declare class PlayersController {
    private readonly playersService;
    constructor(playersService: PlayersService);
    findAll(): Promise<Player[]>;
}
