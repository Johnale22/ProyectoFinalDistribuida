import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import { Transport, MicroserviceOptions } from '@nestjs/microservices';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 1. Conectar a RabbitMQ (Para escuchar eventos)
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: {
      urls: ['amqp://admin:adminpassword@localhost:5672'],
      queue: 'reporting_queue',
      queueOptions: { durable: false },
    },
  });

  // 2. Iniciar servidor HTTP en 3003
  app.enableCors();
  await app.startAllMicroservices();
  await app.listen(3003);
  
  console.log(`🚀 REPORTING SERVICE listo en puerto 3003`);
}
bootstrap();