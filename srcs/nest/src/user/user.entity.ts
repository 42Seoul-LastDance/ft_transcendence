import { Entity, PrimaryGeneratedColumn, Column, Unique } from 'typeorm';
import { userStatus } from './user-status.enum';
import { IsNumber, IsString } from 'class-validator';
import { userRole } from './user-role.enum';

@Entity({ name: 'user', schema: 'public' })
@Unique(['username']) // * username이 중복될 경우 알아서 오류를 내뱉음. : try catch 구문 사용.
export class User {
    @PrimaryGeneratedColumn('increment')
    id: number;

    @Column({ nullable: true })
    @IsString()
    username: string;

    @Column()
    @IsString()
    email: string;

    @Column({ nullable: true })
    @IsString()
    profileurl: string;

    @Column()
    @IsString()
    slackId: string;

    @Column({ default: userRole.GENERIC })
    @IsString()
    role: userRole;

    @Column({ default: true })
    @IsString()
    require2fa: boolean;

    @Column({ default: 0 })
    @IsString()
    code2fa: string;

    @Column({ default: userStatus.OFFLINE })
    @IsString()
    status: userStatus;

    @Column({ default: 0 })
    @IsString()
    exp: number;

    @Column({ default: 0 })
    @IsString()
    level: number;

    @Column({ default: 0, nullable: true })
    @IsString()
    refreshToken: string;

    constructor(partial: Partial<User>) {
        Object.assign(this, partial);
    }
}
