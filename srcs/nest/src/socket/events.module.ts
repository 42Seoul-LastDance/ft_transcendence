import { Module } from '@nestjs/common';
import { ChatRoomGateway } from './chatRoom/chatRoom.gateway';
import { ChatRoomService } from './chatRoom/chatRoom.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DirectMessage } from './directMessage/directMessage.entity';
import { DirectMessageRepository } from './directMessage/directMessage.repository';
import { DirectMessageGateway } from './directMessage/directMessage.gateway';
import { DirectMessageService } from './directMessage/directMessage.service';

@Module({
    imports: [TypeOrmModule.forFeature([DirectMessage]), TypeOrmModule.forFeature([DirectMessageRepository])],
    providers: [ChatRoomGateway, ChatRoomService, DirectMessageGateway, DirectMessageService],
})
export class EventsModule {}
