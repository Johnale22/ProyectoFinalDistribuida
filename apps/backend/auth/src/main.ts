import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({ origin: '*' });
  await app.listen(3000);
  console.log(`🚀 AUTH SERVICE listo en: http://localhost:3000`);
}
bootstrap();