import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserRepository } from 'src/user/user.repository';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { ConfigModule } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';
import { FortytwoAuthGuard } from './fortytwo.guard';
import { FortytwoStrategy } from './fortyTwo.strategy';

@Module({
    imports: [
        ConfigModule.forRoot({
            cache: true,
            isGlobal: true,
        }),        
        TypeOrmModule.forFeature([UserRepository]),
        PassportModule.register({defaultStrategy : 'fortytwo'}),
    ],
    controllers: [AuthController],
    providers: [AuthService, FortytwoAuthGuard, FortytwoStrategy],
})
export class AuthModule {}