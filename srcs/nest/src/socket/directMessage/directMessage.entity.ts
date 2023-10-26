import { IsBoolean, IsNumber, IsString } from 'class-validator';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { DateTime } from 'luxon';

@Entity({ name: 'DMMessages', schema: 'public' })
export class DirectMessage {
    @PrimaryGeneratedColumn('increment')
    id: number;

    @Column()
    @IsNumber()
    senderId: number;

    @Column()
    @IsNumber()
    receiverId: number;

    @Column()
    @IsBoolean()
    hasReceived: boolean;

    @Column()
    @IsString()
    content: string;

    @Column({ type: 'timestamp' })
    sentTime: Date;
}
