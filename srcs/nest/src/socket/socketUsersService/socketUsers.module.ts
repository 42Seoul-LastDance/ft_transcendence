import { Module, forwardRef } from '@nestjs/common';
import { BlockedUsersModule } from 'src/user/blockedUsers/blockedUsers.module';
import { SocketUsersService } from './socketUsers.service';
import { UserModule } from 'src/user/user.module';
import { FriendModule } from 'src/user/friend/friend.module';

@Module({
    imports: [BlockedUsersModule, UserModule, FriendModule],
    providers: [SocketUsersService],
    exports: [SocketUsersService],
})
export class SocketUsersModule {}
