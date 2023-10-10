import { Module } from '@nestjs/common';
import { ChatRoomModule } from './chatRoom/chatRoom.module';
import { DirectMessageModule } from './directMessage/directMessage.module';
import { BlockedUsersModule } from '../user/blockedUsers/blockedUsers.module';
import { SocketUsersModule } from './socketUsersService/socketUsers.module';

@Module({
    imports: [ChatRoomModule, DirectMessageModule, BlockedUsersModule, SocketUsersModule],
})
export class EventsModule {}
