import { Repository } from 'typeorm';
import { Player } from './player.entity';
export declare class PlayersService {
    private playersRepository;
    constructor(playersRepository: Repository<Player>);
    findAll(): Promise<Player[]>;
}
