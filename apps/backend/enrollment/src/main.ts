import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({ origin: '*' });
  await app.listen(3002);
  console.log(`🚀 ENROLLMENT SERVICE listo en: http://localhost:3002`);
}
bootstrap();