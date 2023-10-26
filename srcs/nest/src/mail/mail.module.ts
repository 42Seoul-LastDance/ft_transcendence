import { Module } from '@nestjs/common';
import { MailService } from './mail.service';
import { MailController } from './mail.controller';
import { MailerModule } from '@nestjs-modules/mailer';
import { UserModule } from 'src/user/user.module';

@Module({
    imports: [MailerModule, UserModule],
    providers: [MailService],
    controllers: [MailController],
})
export class MailModule {}
