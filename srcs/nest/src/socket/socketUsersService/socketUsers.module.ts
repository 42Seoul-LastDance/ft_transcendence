import { Module } from '@nestjs/common';
import { BlockedUsersModule } from 'src/user/blockedUsers/blockedUsers.module';
import { SocketUsersService } from './socketUsers.service';
import { UserModule } from 'src/user/user.module';
import { FriendModule } from 'src/user/friend/friend.module';

@Module({
    imports: [BlockedUsersModule, FriendModule, UserModule],
    providers: [SocketUsersService],
    exports: [SocketUsersService],
})
export class SocketUsersModule {}
