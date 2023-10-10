import { Module } from '@nestjs/common';
import { ChatRoomModule } from './chatRoom/chatRoom.module';
import { DirectMessageModule } from './directMessage/directMessage.module';
import { BlockedUsersModule } from '../user/blockedUsers/blockedUsers.module';
import { SocketUsersModule } from './socketUsersService/socketUsers.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GameGateway } from '../game/game.gateway';
import { GameService } from '../game/game.service';
import { Game } from 'src/game/game.entity';
import { UserService } from 'src/user/user.service';
import { User } from 'src/user/user.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Game, User]), UserModule, ChatRoomModule, DirectMessageModule, BlockedUsersModule, SocketUsersModule],
    providers: [ // TODO : 게임을 모듈로 분리
        GameGateway,
        GameService,
    ],
})
export class EventsModule {}
