import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
// ✅ IMPORTAR LIBRERÍAS NUEVAS
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 1. CORS Activado
  app.enableCors({ origin: '*' });

  // ✅ 2. ACTIVAR VALIDACIÓN DE DATOS
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true, // Limpia datos basura
    forbidNonWhitelisted: true, // Error si envían campos extra
  }));

  // ✅ 3. ACTIVAR SWAGGER
  const config = new DocumentBuilder()
    .setTitle('Enrollment Service')
    .setDescription('Microservicio de Inscripciones y Gestión de Cupos')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  await app.listen(3002);
  console.log(`🚀 ENROLLMENT SERVICE listo en: http://localhost:3002`);
  console.log(`📄 Docs: http://localhost:3002/api/docs`);
}
bootstrap();