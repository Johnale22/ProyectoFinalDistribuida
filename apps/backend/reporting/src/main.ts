import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors(); // Vital para React
  const port = 3004;
  await app.listen(port);
  console.log(`📊 Reporting Service running on port ${port}`);
}

bootstrap();