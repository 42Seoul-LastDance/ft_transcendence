import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as express from 'express';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    app.enableCors();

    //정적파일 미들웨어 추가
    app.use(express.static('public'));

    await app.listen(3000);
}
bootstrap();
