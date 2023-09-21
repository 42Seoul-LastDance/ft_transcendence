import { Module } from '@nestjs/common';
import { ChatRoomGateway } from './chatRoom.gateway';
import { ChatRoomService } from './chatRoom.service';
import { GameGateway } from '../game/game.gateway';
import { GameService } from '../game/game.service';

@Module({
    providers: [ChatRoomGateway, ChatRoomService, GameGateway, GameService],
})
export class EventsModule {}
