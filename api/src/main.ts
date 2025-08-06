import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Servir arquivos estáticos
  app.useStaticAssets(join(__dirname, '..', 'public'));

  // Configuração global de validação
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // CORS
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  });

  // TODO: Reimplement Swagger documentation after resolving dependency issues
  // Prefixo global para todas as rotas
  app.setGlobalPrefix('api');

  const port = process.env.PORT || 3001;
  await app.listen(port);
  
  console.log(`🚀 API rodando em: http://localhost:${port}`);
  console.log(`📚 Documentação: http://localhost:${port}/api/docs`);
}

bootstrap();
