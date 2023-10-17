import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as express from 'express';
import { MyLogger } from './my-logger';

async function bootstrap() {
    // Set the defaultMaxListeners before creating the NestJS app instance

    const app = await NestFactory.create(AppModule, { cors: true, logger: new MyLogger() });
    require('events').EventEmitter.defaultMaxListeners = 0;

    app.enableCors({
        origin: true,
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
        credentials: true,
        allowedHeaders: 'Authorization, X-Requested-With, X-HTTP-Method-Override, Content-Type',
    });

    // Other app configuration and startup code...

    await app.listen(3000);
}

bootstrap();
