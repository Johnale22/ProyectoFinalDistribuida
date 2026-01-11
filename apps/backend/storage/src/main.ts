import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors(); // VITAL: Para que el Frontend pueda subir archivos
  await app.listen(3005);
  console.log('📂 Storage Service running on port 3005');
}

bootstrap();