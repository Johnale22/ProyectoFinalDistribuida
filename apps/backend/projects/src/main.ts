import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import { Transport } from '@nestjs/microservices';
// ✅ IMPORTAR LIBRERÍAS
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 1. Configuración HTTP
  app.enableCors({ origin: '*' });

  // ✅ 2. ACTIVAR VALIDACIÓN (Blindaje de datos)
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true, // Borra datos extra que no estén en el DTO
    forbidNonWhitelisted: true, // Lanza error si envían basura
  }));

  // ✅ 3. ACTIVAR SWAGGER (Documentación individual)
  const config = new DocumentBuilder()
    .setTitle('Microservicio Projects')
    .setDescription('Gestión de proyectos y cupos')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  // 4. Configuración RabbitMQ (Esto ya lo tenías, no lo borres)
  app.connectMicroservice({
    transport: Transport.RMQ,
    options: {
      urls: ['amqp://admin:adminpassword@localhost:5672'],
      queue: 'projects_queue',
      queueOptions: { durable: false },
    },
  });

  await app.startAllMicroservices();
  await app.listen(3001);
  console.log(`🚀 PROJECTS SERVICE listo: HTTP:3001/api/docs + RabbitMQ`);
}
bootstrap();