import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BlockedUsers } from './blockedUsers.entity';
import { BlockedUsersRepository } from './blockedUsers.repository';
import { BlockedUsersService } from './blockedUsers.service';

@Module({
    imports: [TypeOrmModule.forFeature([BlockedUsers]), TypeOrmModule.forFeature([BlockedUsersRepository])],
    providers: [BlockedUsersService, BlockedUsersRepository],
    exports: [BlockedUsersService, BlockedUsersRepository],
})
export class BlockedUsersModule {}
