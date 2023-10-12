import { Module, forwardRef } from '@nestjs/common';
import { UserModule } from 'src/user/user.module';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GameService } from './game.service';
import { Game } from './game.entity';
import { User } from 'src/user/user.entity';
import { UserService } from 'src/user/user.service';
import { GameGateway } from './game.gateway';
import { SocketUsersModule } from 'src/socket/socketUsersService/socketUsers.module';
import { GameController } from './game.controller';

@Module({
    imports: [TypeOrmModule.forFeature([Game, User]), UserModule, JwtModule, SocketUsersModule],
    controllers: [GameController],
    providers: [GameGateway, GameService, UserService],
})
export class GameModule {}
