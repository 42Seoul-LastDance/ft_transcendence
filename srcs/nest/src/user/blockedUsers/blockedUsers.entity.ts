import { IsNumber } from 'class-validator';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'blockedUsers', schema: 'public' })
export class BlockedUsers {
    @PrimaryGeneratedColumn('increment')
    id: number;

    @Column()
    @IsNumber()
    requestUserId: number;

    @Column()
    @IsNumber()
    targetUserId: number;
}
