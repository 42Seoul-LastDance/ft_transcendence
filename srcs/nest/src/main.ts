import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as express from 'express';
import * as proxy from 'express-http-proxy';
// import { HttpExceptionFilter } from './http-exception.filter';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    // // 프록시 설정
    // app.use('/auth/42login', proxy('http://10.14.9.4:3000', {
    //     // 다양한 프록시 옵션 설정 가능
    //     proxyReqPathResolver: (req) => {
    //     // 프록시 경로를 설정
    //     return '/auth/42login';
    //     },
    // }));

    app.enableCors({
        allowedHeaders:
        'Authorization, X-Requested-With, X-HTTP-Method-Override, Content-Type, Accept, Access-Control-Allow-Origin',
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