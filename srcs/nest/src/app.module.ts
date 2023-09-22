import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user/user.entity';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { MailModule } from './mail/mail.module';
import { EventsModule } from './socket/events.module';
import { Game } from './game/game.entity';

@Module({
    imports: [
        TypeOrmModule.forRoot({
            type: 'postgres',
            host: process.env.DB_HOST,
            port: +process.env.DB_PORT,
            username: process.env.POSTGRES_USER_ID,
            password: process.env.POSTGRES_USER_PASSWORD,
            database: process.env.DB_NAME,
            entities: [User, Game], // Your entities here
            synchronize: true,
        }),
        UserModule,
        AuthModule,
        MailModule,
        EventsModule,
    ],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule {}
