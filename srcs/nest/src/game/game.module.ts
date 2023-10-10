import { Module } from '@nestjs/common';
import { UserModule } from 'src/user/user.module';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GameService } from './game.service';
import { Game } from './game.entity';
import { User } from 'src/user/user.entity';
import { UserService } from 'src/user/user.service';
import { GameGateway } from './game.gateway';

@Module({
    imports: [TypeOrmModule.forFeature([Game, User]), UserModule, JwtModule],
    providers: [GameGateway, GameService, UserService],
})
export class GameModule {}