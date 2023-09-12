import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as express from 'express';
// import { HttpExceptionFilter } from './http-exception.filter';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    app.enableCors({
        origin: '*',
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
        credentials: true,
    });

    //정적파일 미들웨어 추가
    app.use(express.static('public'));

    // global-scoped filter
    // app.useGlobalFilters(new HttpExceptionFilter());

    await app.listen(3000);
}
bootstrap();
