import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Friend } from './friend.entity';
import { FriendRepository } from './friend.repository';
import { FriendService } from './friend.service';

@Module({
    imports: [TypeOrmModule.forFeature([Friend]), TypeOrmModule.forFeature([FriendRepository])],
    providers: [FriendService, FriendRepository],
    exports: [FriendService, FriendRepository],
})
export class FriendModule {}
