import { Module, forwardRef } from '@nestjs/common';
import { SocketUsersModule } from '../socketUsersService/socketUsers.module';
import { SocketEventHandlerSerivce } from './socketEventHandler.service';
import { ChatRoomModule } from '../chatRoom/chatRoom.module';

@Module({
    imports: [SocketUsersModule, ChatRoomModule],
    providers: [SocketEventHandlerSerivce],
    exports: [SocketEventHandlerSerivce],
})
export class SocketEventHandlerModule {}
