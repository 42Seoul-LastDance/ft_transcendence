import { Entity, PrimaryGeneratedColumn, Column, Unique } from 'typeorm';
import { userStatus } from './user-status.enum';
import { IsString } from 'class-validator';
import { userRole } from './user-role.enum';

@Entity({ name: 'user', schema: 'public' })
@Unique(['username']) // * username이 중복될 경우 알아서 오류를 내뱉음. : try catch 구문 사용.
export class User {
    @PrimaryGeneratedColumn('increment')
    id: number;

    @Column({ default: 'username' + Math.random() * 100 + Math.random() })
    @IsString()
    username: string;

    @Column()
    @IsString()
    email: string;

    @Column({
        default:
            'data:image/jpeg;base64,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',
    })
    @IsString()
    profileurl: string;

    @Column()
    @IsString()
    slackId: string;

    @Column({ default: userRole.GENERIC })
    @IsString()
    role: userRole;

    @Column({ default: false })
    @IsString()
    require2fa: boolean;

    @Column({ default: userStatus.OFFLINE })
    @IsString()
    status: userStatus;

    @Column({ default: 0 })
    @IsString()
    exp: number;

    @Column({ default: 0 })
    @IsString()
    level: number;

    @Column({ default: 0 })
    @IsString()
    refreshToken: string;

    constructor(partial: Partial<User>) {
        Object.assign(this, partial);
    }
}
