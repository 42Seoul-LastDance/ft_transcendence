import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatRoomGateway } from './chatRoom.gateway';
import { ChatRoomService } from './chatRoom.service';
import { GameGateway } from '../game/game.gateway';
import { GameService } from '../game/game.service';
import { Game } from 'src/game/game.entity';
import { UserService } from 'src/user/user.service';
import { UserModule } from 'src/user/user.module';

@Module({
    imports: [TypeOrmModule.forFeature([Game]), UserModule],
    providers: [
        ChatRoomGateway,
        ChatRoomService,
        GameGateway,
        GameService,
        UserService,
    ],
})
export class EventsModule {}
