import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
// ✅ IMPORTAR LIBRERÍAS
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 1. CORS (Permitir acceso desde Frontend)
  app.enableCors({ origin: '*' });

  // ✅ 2. ACTIVAR VALIDACIÓN GLOBAL (Seguridad de datos)
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true, // Elimina datos extra que no estén en el DTO
    forbidNonWhitelisted: true, // Error si envían campos basura
  }));

  // ✅ 3. ACTIVAR SWAGGER (Documentación)
  const config = new DocumentBuilder()
    .setTitle('Auth Service')
    .setDescription('Microservicio de Autenticación (JWT + Usuarios)')
    .setVersion('1.0')
    .addBearerAuth() // Para probar endpoints protegidos si los tuvieras
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  await app.listen(3000);
  console.log(`🚀 AUTH SERVICE listo en: http://localhost:3000`);
  console.log(`📄 Docs: http://localhost:3000/api/docs`);
}
bootstrap();