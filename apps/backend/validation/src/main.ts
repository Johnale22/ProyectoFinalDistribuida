import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(AppModule, {
    transport: Transport.GRPC,
    options: {
      package: 'validation',
      // CORRECCIÓN AQUÍ: Apunta a la carpeta 'assets'
      protoPath: join(__dirname, 'assets/validation.proto'), 
      url: 'localhost:5000',
    },
  });

  await app.listen();
  console.log('⛔ Validation Service is listening via gRPC on port 5000');
}

bootstrap();