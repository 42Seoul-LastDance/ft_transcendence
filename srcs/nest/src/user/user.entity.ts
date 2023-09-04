import { Entity, PrimaryGeneratedColumn, Column, Unique } from 'typeorm';
import { userStatus } from './user-status.enum';
import { IsString } from 'class-validator';
import { userRole } from './user-role.enum';

@Entity({ name: 'user', schema: 'public' })
@Unique(['username']) // * username이 중복될 경우 알아서 오류를 내뱉음. : try catch 구문 사용.
export class User {
    @PrimaryGeneratedColumn('increment')
    id: number;
    
    @Column()
    @IsString()
    username: string;

    @Column()
    @IsString()
    email: string;

    @Column()
    @IsString()
    profileurl: string;

    @Column()
    @IsString()
    slackId: string;

    @Column()
    @IsString()
    role: userRole;

    @Column()
    @IsString()
    require2fa: boolean;

    @Column()
    @IsString()
    status: userStatus;

    @Column()
    @IsString()
    exp: number;

    @Column()
    @IsString()
    level: number;

    constructor(partial: Partial<User>) {
      Object.assign(this, partial);
    }
}
