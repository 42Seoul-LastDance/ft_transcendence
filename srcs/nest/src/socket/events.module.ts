import { Module } from '@nestjs/common';
import { ChatRoomGateway } from './chatRoom.gateway';
import { ChatRoomService } from './chatRoom.service';

@Module({
    providers: [ChatRoomGateway, ChatRoomService],
})
export class EventsModule {}
