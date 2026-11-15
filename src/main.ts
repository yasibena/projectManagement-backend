import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import { ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const frontendOrigin = process.env.FRONTEND_ORIGIN ?? 'http://localhost:3001';
  const port = Number(process.env.PORT ?? 3000);

  app.use(cookieParser());

  app.enableCors({
    origin: frontendOrigin,
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
    }),
  );

  await app.listen(port);
}

bootstrap();
