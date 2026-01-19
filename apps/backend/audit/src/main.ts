import 'reflect-metadata'; // <--- ¡ESTA DEBE SER LA LÍNEA 1!
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import { Transport, MicroserviceOptions } from '@nestjs/microservices';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 1. Conectar a RabbitMQ
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: {
      urls: ['amqp://admin:adminpassword@localhost:5672'],
      queue: 'audit_queue',
      queueOptions: { durable: false },
    },
  });

  // 2. Iniciar HTTP en 3005
  app.enableCors();
  await app.startAllMicroservices();
  await app.listen(3005);
  
  console.log(`🚀 AUDIT SERVICE listo en puerto 3005`);
}
bootstrap();