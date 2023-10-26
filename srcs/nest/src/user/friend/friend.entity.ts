import { IsNumber, IsEnum } from 'class-validator';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { FriendStatus } from './friend.enum';

@Entity({ name: 'friend', schema: 'public' })
export class Friend {
    @PrimaryGeneratedColumn('increment')
    id: number;

    @Column()
    @IsNumber()
    requestUserId: number;

    @Column()
    @IsNumber()
    targetUserId: number;

    @Column()
    @IsEnum(FriendStatus)
    status: FriendStatus;
}
