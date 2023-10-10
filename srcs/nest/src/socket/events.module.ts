import { Module } from '@nestjs/common';
import { ChatRoomModule } from './chatRoom/chatRoom.module';
import { DirectMessageModule } from './directMessage/directMessage.module';
import { BlockedUsersModule } from '../user/blockedUsers/blockedUsers.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GameGateway } from '../game/game.gateway';
import { GameService } from '../game/game.service';
import { Game } from 'src/game/game.entity';
import { UserService } from 'src/user/user.service';
import { User } from 'src/user/user.entity';
import { UserModule } from 'src/user/user.module';
import { GameModule } from 'src/game/game.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([Game, User]),
        UserModule,
        ChatRoomModule,
        DirectMessageModule,
        BlockedUsersModule,
        GameModule,
    ],
})
export class EventsModule {}
