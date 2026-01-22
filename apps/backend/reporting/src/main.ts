import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import { Transport, MicroserviceOptions } from '@nestjs/microservices';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 1. Conectar a RabbitMQ (Usando variables de entorno)
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: {
      // ✅ FIX: Usa la variable RABBIT_HOST (que será 'uce_rabbitmq' en Docker)
      urls: [`amqp://admin:adminpassword@${process.env.RABBIT_HOST || 'localhost'}:5672`],
      queue: 'reporting_queue',
      queueOptions: { durable: false },
    },
  });

  // 2. Configurar HTTP
  app.enableCors({ origin: '*' }); // Habilitar CORS
  await app.startAllMicroservices();
  await app.listen(3003);
  
  console.log(`🚀 REPORTING SERVICE listo en puerto 3003`);
}
bootstrap();