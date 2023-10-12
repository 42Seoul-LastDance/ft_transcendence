import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BlockedUsers } from './blockedUsers.entity';
import { BlockedUsersRepository } from './blockedUsers.repository';
import { BlockedUsersService } from './blockedUsers.service';
import { UserModule } from '../user.module';
import { BlockedUsersController } from './blockedUsers.controller';
import { JwtAuthGuard } from 'src/auth/jwtAuth.guard';
import { JwtModule } from '@nestjs/jwt';

@Module({
    imports: [
        TypeOrmModule.forFeature([BlockedUsers]),
        TypeOrmModule.forFeature([BlockedUsersRepository]),
        forwardRef(() => UserModule),
        JwtModule,
    ],
    controllers: [BlockedUsersController],
    providers: [BlockedUsersService, BlockedUsersRepository, JwtAuthGuard],
    exports: [BlockedUsersService, BlockedUsersRepository],
})
export class BlockedUsersModule {}
