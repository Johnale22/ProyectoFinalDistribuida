import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import { Transport } from '@nestjs/microservices';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 1. HTTP (Puerto 3001)
  app.enableCors({ origin: '*' });

  // 2. RabbitMQ (Escucha en la cola 'projects_queue')
  app.connectMicroservice({
    transport: Transport.RMQ,
    options: {
      urls: ['amqp://admin:adminpassword@localhost:5672'],
      queue: 'projects_queue',
      queueOptions: { durable: false },
    },
  });

  await app.startAllMicroservices();
  await app.listen(3001);
  console.log(`🚀 PROJECTS SERVICE listo: HTTP:3001 + RabbitMQ Listening`);
}
bootstrap();