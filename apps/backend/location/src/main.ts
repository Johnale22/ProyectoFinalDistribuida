import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import { Transport, MicroserviceOptions } from '@nestjs/microservices';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(AppModule, {
    transport: Transport.GRPC,
    options: {
      package: 'location',
      protoPath: join(__dirname, 'assets/location.proto'),
      url: '0.0.0.0:3007', // Puerto 3007
    },
  });

  await app.listen();
  console.log(`🚀 LOCATION SERVICE (gRPC) listo en puerto 3007`);
}
bootstrap();