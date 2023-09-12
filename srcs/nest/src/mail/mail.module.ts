import { Module } from '@nestjs/common';
import { MailService } from './mail.service';
import { MailController } from './mail.controller';
import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
// import { UserService } from 'src/user/user.service';
// import { UserRepository } from 'src/user/user.repository';
// import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from 'src/user/user.module';

@Module({
    imports: [
        MailerModule.forRoot({
            transport: {
                host: 'smtp.gmail.com',
                port: 587,
                auth: {
                    user: process.env.GMAIL_USER_ID,
                    pass: process.env.GMAIL_USER_PASSWORD,
                },
            },
            defaults: {
                from: '"ebangBot" <ebangBot@intra.42.fr>',
            },
            template: {
                dir: __dirname + '/templates',
                adapter: new HandlebarsAdapter(),
                options: {
                    strict: true,
                },
            },
        }),
        UserModule,
    ],
    providers: [MailService],
    controllers: [MailController],
})
export class MailModule {}
