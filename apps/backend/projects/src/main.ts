import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  const globalPrefix = 'api';
  app.setGlobalPrefix(globalPrefix);

  const config = new DocumentBuilder()
    .setTitle('UCE Vinculación API')
    .setDescription('Microservicio de gestión de Proyectos y Cupos')
    .setVersion('1.0')
    .addTag('projects')
    .build();
  
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document); // La documentación estará en /api/docs
  
  const port = process.env.PORT || 3001;
  await app.listen(port);
  console.log(`🚀 Project Service running on: http://localhost:${port}/${globalPrefix}`);
  console.log(`📄 Swagger Docs available at: http://localhost:${port}/api/docs`);

  Logger.log(
    `🚀 Application is running on: http://localhost:${port}/${globalPrefix}`
  );
}

bootstrap();
