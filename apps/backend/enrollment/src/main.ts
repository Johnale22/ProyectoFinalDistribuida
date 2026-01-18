import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import { Transport, MicroserviceOptions } from '@nestjs/microservices';

async function bootstrap() {
  // 1. Crear App Híbrida (HTTP + Microservicio)
  const app = await NestFactory.create(AppModule);
  
  // 2. Conectar RabbitMQ
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: {
      urls: ['amqp://admin:adminpassword@localhost:5672'],
      queue: 'reporting_queue', // <--- Esta cola debe coincidir con la que definimos en Enrollment
      queueOptions: {
        durable: false,
      },
    },
  });

  // 3. Iniciar ambos
  await app.startAllMicroservices();
  await app.listen(3003);
  console.log(`🚀 REPORTING SERVICE listo en puerto 3003 y escuchando RabbitMQ`);
}
bootstrap();