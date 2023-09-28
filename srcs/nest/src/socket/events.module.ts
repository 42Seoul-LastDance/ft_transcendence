import { Module } from '@nestjs/common';
import { ChatRoomModule } from './chatRoom/chatRoom.module';
import { DirectMessageModule } from './directMessage/directMessage.module';

@Module({
    imports: [ChatRoomModule, DirectMessageModule],
})
export class EventsModule {}
