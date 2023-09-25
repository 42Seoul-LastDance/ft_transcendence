import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as express from 'express';
// import { SocketIoAdapter } from './adapters/socket-io.adapters';

async function bootstrap() {
    const app = await NestFactory.create(AppModule, { cors: true });

    app.enableCors({
        origin: true,
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
        credentials: true,
        allowedHeaders: 'Authorization, X-Requested-With, X-HTTP-Method-Override, Content-Type',
    });

    // app.useWebSocketAdapter(new SocketIoAdapter(app));

    //정적파일 미들웨어 추가
    app.use(express.static('public'));

    await app.listen(3000);
}
bootstrap();
