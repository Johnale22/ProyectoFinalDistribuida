import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  
  // CAMBIO: Usamos puerto 3008 (porque 3004 es Notificaciones)
  await app.listen(3008); 
  console.log(`🚀 VALIDATION SERVICE listo en puerto 3008`);
}
bootstrap();