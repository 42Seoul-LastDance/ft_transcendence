import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DirectMessage } from './directMessage/directMessage.entity';
import { DirectMessageRepository } from './directMessage/directMessage.repository';
import { ChatRoomModule } from './chatRoom/chatRoom.module';
import { DirectMessageModule } from './directMessage/directMessage.module';

@Module({
    imports: [
        ChatRoomModule,
        DirectMessageModule,
    ],
})
export class EventsModule {}
