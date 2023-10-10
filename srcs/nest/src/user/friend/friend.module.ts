import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Friend } from './friend.entity';
import { FriendRepository } from './friend.repository';
import { FriendService } from './friend.service';
import { UserModule } from '../user.module';
import { FriendController } from './friend.controller';
import { JwtService } from '@nestjs/jwt';

@Module({
    imports: [TypeOrmModule.forFeature([Friend]), TypeOrmModule.forFeature([FriendRepository]), UserModule],
    controllers: [FriendController],
    providers: [FriendService, FriendRepository, JwtService],
    exports: [FriendService, FriendRepository],
})
export class FriendModule {}
