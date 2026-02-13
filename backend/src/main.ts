import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { AuditService } from './common/audit.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Global validation and XSS-safe payload handling
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  // CORS for local frontend (Phase 2: restrict to Amplify/CloudFront origin)
  app.enableCors({
    origin: process.env.FRONTEND_ORIGIN || 'http://localhost:4200',
    credentials: true,
  });

  const port = process.env.PORT || 3000;
  await app.listen(port);

  const audit = app.get(AuditService);
  audit.log('SYSTEM', 'SERVER_START', { port });
}

bootstrap();
