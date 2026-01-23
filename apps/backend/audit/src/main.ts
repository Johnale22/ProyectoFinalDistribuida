import 'reflect-metadata'; 
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import { Transport, MicroserviceOptions } from '@nestjs/microservices';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 1. Configuración HTTP y CORS
  app.enableCors({ origin: '*' });

  app.useGlobalPipes(new ValidationPipe({
    whitelist: true, 
    forbidNonWhitelisted: true, 
  }));

  // 2. Swagger (Opcional)
  const config = new DocumentBuilder()
    .setTitle('Audit Service')
    .setDescription('Microservicio de Auditoría (MongoDB)')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  // 3. Conectar a RabbitMQ (CORREGIDO PARA DOCKER)
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: {
      // ✅ Si no hay variable, usa uce_rabbitmq
      urls: [`amqp://admin:adminpassword@${process.env.RABBIT_HOST || 'uce_rabbitmq'}:5672`],
      queue: 'audit_queue',
      queueOptions: { durable: false },
    },
  });

  await app.startAllMicroservices();
  await app.listen(3005);
  
  console.log(`🚀 AUDIT SERVICE listo en puerto 3005`);
}
bootstrap();