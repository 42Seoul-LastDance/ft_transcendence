import { Module, forwardRef } from '@nestjs/common';
import { SocketUsersModule } from '../socketUsersService/socketUsers.module';
import { SocketEventHandlerSerivce } from './socketEventHandler.service';
import { ChatRoomModule } from '../chatRoom/chatRoom.module';
import { SocketUsersService } from '../socketUsersService/socketUsers.service';

@Module({
    imports: [SocketUsersModule],
    providers: [SocketEventHandlerSerivce],
    exports: [SocketEventHandlerSerivce],
})
export class SocketEventHandlerModule {}
