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
    status: number; //어떤 status 인가요? 만약 on//offline 이라면 user가 갖고 있습니다! -ebang
    //친구 요청인지 수락된 친구인지 확인하는 용도입니다
}
