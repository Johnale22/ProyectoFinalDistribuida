import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import { Transport } from '@nestjs/microservices';

async function bootstrap() {
  // 1. Creamos la aplicación Híbrida (HTTP + Microservicio)
  const app = await NestFactory.create(AppModule);

  // 2. ACTIVAR CORS (Vital para que el Frontend no sea bloqueado)
  app.enableCors({
    origin: '*', // Permite conexiones desde cualquier lugar (Frontend)
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  // 3. Conectar Microservicio (RabbitMQ)
  app.connectMicroservice({
    transport: Transport.RMQ,
    options: {
      urls: ['amqp://admin:adminpassword@localhost:5672'],
      queue: 'auth_queue',
      queueOptions: { durable: false },
    },
  });

  // 4. Iniciar todo
  await app.startAllMicroservices();
  
  // 5. Escuchar en el puerto 3000 (HTTP)
  await app.listen(3000);
  console.log('🚀 Auth Service is ready on http://localhost:3000');
}

bootstrap();