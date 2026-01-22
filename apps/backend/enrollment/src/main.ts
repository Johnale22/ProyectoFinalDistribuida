import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import { Transport } from '@nestjs/microservices';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 1. Configuración HTTP
  app.enableCors({ origin: '*' });

  // 2. Validación Global
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
  }));

  // 3. Swagger
  const config = new DocumentBuilder()
    .setTitle('Microservicio Enrollment')
    .setDescription('Gestión de Matrículas (MongoDB)')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  // ✅ 4. CONFIGURACIÓN RABBITMQ (LISTENER)
  // Escucha mensajes dirigidos a 'enrollment_queue'
  app.connectMicroservice({
    transport: Transport.RMQ,
    options: {
      urls: [`amqp://admin:adminpassword@${process.env.RABBIT_HOST || 'localhost'}:5672`],
      queue: 'enrollment_queue',
      queueOptions: { durable: false },
    },
  });

  await app.startAllMicroservices();
  await app.listen(3002);
  console.log(`🚀 ENROLLMENT SERVICE corriendo en puerto 3002`);
}
bootstrap();