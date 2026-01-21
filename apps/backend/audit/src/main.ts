import 'reflect-metadata'; 
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import { Transport, MicroserviceOptions } from '@nestjs/microservices';
// ✅ IMPORTAR LIBRERÍAS NUEVAS
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 1. Configuración HTTP y CORS
  app.enableCors({ origin: '*' });

  // ✅ 2. ACTIVAR VALIDACIÓN GLOBAL
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true, 
    forbidNonWhitelisted: true, 
  }));

  // ✅ 3. ACTIVAR SWAGGER
  const config = new DocumentBuilder()
    .setTitle('Audit Service')
    .setDescription('Microservicio de Auditoría y Logs (MongoDB)')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  // 4. Conectar a RabbitMQ
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: {
      urls: ['amqp://admin:adminpassword@localhost:5672'],
      queue: 'audit_queue',
      queueOptions: { durable: false },
    },
  });

  await app.startAllMicroservices();
  await app.listen(3005);
  
  console.log(`🚀 AUDIT SERVICE listo en puerto 3005`);
  console.log(`📄 Docs: http://localhost:3005/api/docs`);
}
bootstrap();