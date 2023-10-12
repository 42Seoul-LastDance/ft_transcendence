import { Module, UnprocessableEntityException, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { User } from './user.entity';
import { UserRepository } from './user.repository';
import { JwtAuthGuard } from 'src/auth/jwtAuth.guard';
import { JwtModule } from '@nestjs/jwt';
import { MulterModule } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { GameModule } from 'src/game/game.module';
import { GameService } from 'src/game/game.service';

@Module({
    imports: [
        TypeOrmModule.forFeature([User]),
        TypeOrmModule.forFeature([UserRepository]),
        JwtModule.register({
            secret: process.env.JWT_SECRET_KEY,
            signOptions: { expiresIn: '1h' },
        }),
        MulterModule.registerAsync({
            useFactory: () => ({
                storage: diskStorage({
                    destination: __dirname + '/../../profile',
                    filename: (req, file, callback) => {
                        const name = Date.now().toString(); // 파일 이름 -> 현재 시각 (유니크하게)
                        const mimeTypeMap = {
                            'image/jpeg': '.jpeg',
                            'image/jpg': '.jpg',
                            'image/png': '.png',
                        };
                        if (mimeTypeMap[file.mimetype]) {
                            // 확장자 체크
                            callback(null, `${name}${mimeTypeMap[file.mimetype]}`);
                        } else {
                            callback(new UnprocessableEntityException(), null);
                        }
                    },
                }),
                limits: {
                    fileSize: 2 * 1024 * 1024, // 2 MB
                },
            }),
        }),
    ],
    controllers: [UserController],
    providers: [UserService, JwtAuthGuard, UserRepository],
    exports: [UserService, UserRepository],
})
export class UserModule {}
