import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // Habilitar CORS para que el Frontend pueda enviar archivos
  app.enableCors();
  await app.listen(3006);
  console.log(`🚀 STORAGE SERVICE listo en puerto 3006`);
}
bootstrap();