import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user/user.entity';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { MailModule } from './mail/mail.module';
import { EventsModule } from './socket/events.module';
import { BlockedUsersModule } from './user/blockedUsers/blockedUsers.module';
import { DirectMessageModule } from './socket/directMessage/directMessage.module';
import { BlockedUsers } from './user/blockedUsers/blockedUsers.entity';
import { DirectMessage } from './socket/directMessage/directMessage.entity';
import { FriendModule } from './user/friend/friend.module';
import { Friend } from './user/friend/friend.entity';
import { SocketUsersModule } from './socket/socketUsersService/socketUsers.module';

@Module({
    imports: [
        TypeOrmModule.forRoot({
            type: 'postgres',
            host: process.env.DB_HOST,
            port: +process.env.DB_PORT,
            username: process.env.POSTGRES_USER_ID,
            password: process.env.POSTGRES_USER_PASSWORD,
            database: process.env.DB_NAME,
            entities: [User, BlockedUsers, DirectMessage, Friend],
            synchronize: true,
        }),
        UserModule,
        AuthModule,
        MailModule,
        EventsModule,
        BlockedUsersModule,
        DirectMessageModule,
        FriendModule,
        SocketUsersModule,
    ],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule {}
