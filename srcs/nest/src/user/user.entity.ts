import { Entity, PrimaryGeneratedColumn, Column, Unique } from 'typeorm';
import { UserStatus } from './user-status.enum';
import { IsEnum, IsNumber, IsString } from 'class-validator';
import { userRole } from './user-role.enum';

@Entity({ name: 'user', schema: 'public' })
@Unique(['userName']) // * userName이 중복될 경우 알아서 오류를 내뱉음. : try catch 구문 사용.
export class User {
    @PrimaryGeneratedColumn('increment')
    id: number;

    @Column({ nullable: true })
    @IsString()
    userName: string;

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

    @Column({ default: '' })
    @IsString()
    code2fa: string;

    @Column({ default: UserStatus.OFFLINE })
    @IsEnum(UserStatus)
    status: UserStatus;

    @Column({ default: 0 })
    @IsNumber()
    exp: number;

    @Column({ default: 0 })
    @IsNumber()
    level: number;

    @Column({ default: 0, nullable: true })
    @IsString()
    refreshToken: string;

    constructor(partial: Partial<User>) {
        Object.assign(this, partial);
    }
}
