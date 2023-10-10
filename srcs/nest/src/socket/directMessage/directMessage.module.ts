import { Module } from '@nestjs/common';
import { DirectMessageGateway } from './directMessage.gateway';
import { DirectMessageService } from './directMessage.service';
import { JwtModule } from '@nestjs/jwt';
import { DirectMessageRepository } from './directMessage.repository';
import { DirectMessage } from './directMessage.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DirectMessageController } from './directMessage.controller';
import { UserModule } from 'src/user/user.module';
import { BlockedUsersModule } from 'src/user/blockedUsers/blockedUsers.module';
import { SocketUsersService } from '../socketUsersService/socketUsers.service';
import { SocketUsersModule } from '../socketUsersService/socketUsers.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([DirectMessage]),
        TypeOrmModule.forFeature([DirectMessageRepository]),
        JwtModule,
        UserModule,
        SocketUsersModule,
        BlockedUsersModule,
    ],
    controllers: [DirectMessageController],
    providers: [DirectMessageGateway, DirectMessageService, DirectMessageRepository, SocketUsersService],
})
export class DirectMessageModule {}
