import { Module } from '@nestjs/common';
import { ChatRoomModule } from './chatRoom/chatRoom.module';
import { DirectMessageModule } from './directMessage/directMessage.module';
import { BlockedUsersModule } from '../user/blockedUsers/blockedUsers.module';
@Module({
    imports: [ChatRoomModule, DirectMessageModule, BlockedUsersModule],
})
export class EventsModule {}
