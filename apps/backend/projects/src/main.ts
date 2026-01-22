import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import { Transport } from '@nestjs/microservices';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 1. Configuración HTTP
  app.enableCors({ origin: '*' });

  // 2. Validación Global
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
  }));

  // 3. Swagger
  const config = new DocumentBuilder()
    .setTitle('Microservicio Projects')
    .setDescription('Gestión de proyectos')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  // ✅ 4. CONFIGURACIÓN RABBITMQ (LISTENER)
  // Esto hace que el servicio "escuche" en la cola 'projects_queue'
  app.connectMicroservice({
    transport: Transport.RMQ,
    options: {
      // Usa la variable de entorno o falla a localhost (para desarrollo local)
      urls: [`amqp://admin:adminpassword@${process.env.RABBIT_HOST || 'localhost'}:5672`],
      queue: 'projects_queue',
      queueOptions: { durable: false },
    },
  });

  await app.startAllMicroservices();
  await app.listen(3001);
  console.log(`🚀 PROJECTS SERVICE corriendo en puerto 3001`);
}
bootstrap();