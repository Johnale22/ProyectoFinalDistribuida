import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

async function bootstrap() {
  // App HTTP en puerto 3003
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  
  // Conexión RabbitMQ
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: {
      urls: ['amqp://admin:adminpassword@localhost:5672'],
      // TRUCO: Usamos una cola PROPIA para que reciba su propia copia del mensaje
      // Si usáramos la misma cola que 'enrollment', se pelearían por el mensaje.
      queue: 'audit_queue', 
      queueOptions: { durable: false },
    },
  });

  await app.startAllMicroservices();
  await app.listen(3003); // Puerto 3003
  console.log('🕵️ Audit Service listening on HTTP:3003 and RabbitMQ');
}

bootstrap();