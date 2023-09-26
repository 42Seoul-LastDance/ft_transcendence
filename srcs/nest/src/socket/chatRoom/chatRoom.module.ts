import { Module } from '@nestjs/common';
import { ChatRoomGateway } from './chatRoom.gateway';
import { ChatRoomService } from './chatRoom.service';
import { UserModule } from 'src/user/user.module';
import { JwtModule } from '@nestjs/jwt';
import { BlockedUsers } from 'src/user/blockedUsers/blockedUsers.entity';
import { BlockedUsersRepository } from 'src/user/blockedUsers/blockedUsers.repository';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
    imports: [
        TypeOrmModule.forFeature([BlockedUsers]),
        TypeOrmModule.forFeature([BlockedUsersRepository]),
        UserModule,
        JwtModule,
    ],
    providers: [ChatRoomGateway, ChatRoomService],
})
export class ChatRoomModule {}
