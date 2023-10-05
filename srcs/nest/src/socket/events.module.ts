import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatRoomGateway } from './chatRoom.gateway';
import { ChatRoomService } from './chatRoom.service';
import { GameGateway } from '../game/game.gateway';
import { GameService } from '../game/game.service';
import { Game } from 'src/game/game.entity';
import { UserService } from 'src/user/user.service';
import { UserModule } from 'src/user/user.module';
import { UserRepository } from 'src/user/user.repository';
import { User } from 'src/user/user.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Game, User]), UserModule],
    providers: [
        ChatRoomGateway,
        ChatRoomService,
        GameGateway,
        GameService,
        UserService,
        UserRepository,
    ],
})
export class EventsModule {}
