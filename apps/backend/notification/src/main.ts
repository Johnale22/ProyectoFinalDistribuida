import 'reflect-metadata'; // 👈 OBLIGATORIO: Primera línea
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import { Transport, MicroserviceOptions } from '@nestjs/microservices';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: {
      // Conexión a RabbitMQ usando variables de entorno o defaults de Docker
      urls: [`amqp://admin:adminpassword@${process.env.RABBIT_HOST || 'uce_rabbitmq'}:5672`],
      queue: 'notification_queue',
      queueOptions: { durable: false },
    },
  });

  await app.startAllMicroservices();
  await app.listen(3004);
  console.log(`🚀 NOTIFICATION SERVICE listo en puerto 3004`);
}
bootstrap();