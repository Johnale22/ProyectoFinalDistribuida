import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

async function bootstrap() {
  // 1. Creamos una app HTTP normal primero (puerto 3002 para no chocar)
  const app = await NestFactory.create(AppModule);
  app.enableCors(); // Importante para el Frontend
  
  // 2. Le conectamos el Microservicio RabbitMQ
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: {
      urls: ['amqp://admin:adminpassword@localhost:5672'],
      queue: 'enrollment_queue',
      queueOptions: { durable: false },
    },
  });

  // 3. Iniciamos ambos
  await app.startAllMicroservices();
  await app.listen(3002); // Puerto HTTP del Enrollment Service
  console.log('🚀 Enrollment Service (Hybrid) listening on HTTP:3002 and RabbitMQ');
}

bootstrap();