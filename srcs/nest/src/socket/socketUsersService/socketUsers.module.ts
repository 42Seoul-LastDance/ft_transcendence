import { Module } from '@nestjs/common';
import { BlockedUsersModule } from 'src/user/blockedUsers/blockedUsers.module';
import { SocketUsersService } from './socketUsers.service';
import { UserModule } from 'src/user/user.module';

@Module({
    imports: [BlockedUsersModule, UserModule],
    providers: [SocketUsersService],
    exports: [SocketUsersService],
})
export class SocketUsersModule {}
