import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import { Transport } from '@nestjs/microservices';
// ✅ Importamos tipos para Swagger y documentación
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // 1. Habilitar CORS
  app.enableCors({ origin: '*' });

  // 2. Configurar Swagger
  const config = new DocumentBuilder()
    .setTitle('Microservicio Storage')
    .setDescription('Gestión de Archivos (MinIO S3)')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  // ✅ 3. CONEXIÓN A RABBITMQ (Listener)
  app.connectMicroservice({
    transport: Transport.RMQ,
    options: {
      urls: [`amqp://admin:adminpassword@${process.env.RABBIT_HOST || 'localhost'}:5672`],
      queue: 'storage_queue',
      queueOptions: { durable: false },
    },
  });

  await app.startAllMicroservices();
  await app.listen(3006);
  console.log(`🚀 STORAGE SERVICE corriendo en puerto 3006`);
}
bootstrap();