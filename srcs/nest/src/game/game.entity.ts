import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { IsDate, IsNumber } from 'class-validator';

@Entity({ name: 'game', schema: 'public' })
export class Game {
    @PrimaryGeneratedColumn('increment')
    gameId: number;

    @Column()
    @IsNumber()
    winnerId: number;

    @Column()
    @IsNumber()
    winnerScore: number;

    @Column()
    @IsNumber()
    winnerSide: number;

    @Column()
    @IsNumber()
    loserId: number;

    @Column()
    @IsNumber()
    loserScore: number;

    @Column()
    @IsNumber()
    loserSide: number;

    @Column()
    @IsNumber()
    gameType: number;

    @Column()
    @IsNumber()
    gameMode: number;

    @Column()
    @IsDate()
    startTime: Date;

    @Column()
    @IsDate()
    endTime: Date;

    @Column()
    @IsNumber()
    endGameStatus: number;

    constructor(partial: Partial<Game>) {
        Object.assign(this, partial);
    }
}
