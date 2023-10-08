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
    status: number;//어떤 status 인가요? 만약 on//offline 이라면 user가 갖고 있습니다! -ebang
}
