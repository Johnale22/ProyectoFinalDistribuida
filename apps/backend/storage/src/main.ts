import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors(); // Habilitar CORS
  await app.listen(3006);
  console.log(`🚀 STORAGE SERVICE (MinIO S3) listo en puerto 3006`);
}
bootstrap();