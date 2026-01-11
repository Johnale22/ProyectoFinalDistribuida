import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { join } from 'path';

async function bootstrap() {
  // Creamos el microservicio gRPC
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(AppModule, {
    transport: Transport.GRPC,
    options: {
      package: 'validation', // Debe coincidir con el .proto
      protoPath: join(__dirname, 'app/validation.proto'), // Ruta al archivo
      url: 'localhost:5000', // Puerto gRPC (diferente al HTTP)
    },
  });

  await app.listen();
  console.log('⛔ Validation Service is listening via gRPC on port 5000');
}

bootstrap();