import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors(); // Importante
  const port = 3006;
  await app.listen(port);
  console.log(`🌍 Location Service running on port ${port}`);
}

bootstrap();