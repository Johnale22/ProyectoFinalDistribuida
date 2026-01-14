import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import { createProxyMiddleware } from 'http-proxy-middleware';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Habilitar CORS para que el Frontend (React) pueda entrar
  app.enableCors({
    origin: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  // ---------------------------------------------------------
  // CONFIGURACIÓN DE RUTAS (ROUTING)
  // ---------------------------------------------------------

  // 1. Redirigir /auth -> Microservicio AUTH (Puerto 3000)
  app.use(
    '/auth',
    createProxyMiddleware({
      target: 'http://localhost:3000/auth',
      changeOrigin: true,
    })
  );

  // 2. Redirigir /projects -> Microservicio PROJECTS (Puerto 3001)
  app.use(
    '/projects',
    createProxyMiddleware({
      target: 'http://localhost:3001/projects',
      changeOrigin: true,
    })
  );

  // 3. Redirigir /enrollment -> Microservicio ENROLLMENT (Puerto 3002)
  app.use(
    '/enrollment',
    createProxyMiddleware({
      target: 'http://localhost:3002/enrollment',
      changeOrigin: true,
    })
  );

  // 4. Redirigir /reports -> Microservicio REPORTING (Puerto 3003)
  app.use(
    '/reports',
    createProxyMiddleware({
      target: 'http://localhost:3003/reports',
      changeOrigin: true,
    })
  );

  // 5. Audit: Gateway (/audit) -> Microservicio (3005/audit)
  app.use(
    '/audit',
    createProxyMiddleware({
      target: 'http://localhost:3005',
      changeOrigin: true,
    })
  );
  
  // Iniciar Gateway en Puerto 8080
  await app.listen(8080);
  console.log(`🚀 API GATEWAY listo en: http://localhost:8080`);
  console.log(`🚦 Rutas activas: Auth(3000), Projects(3001), Enrollment(3002), Reports(3003), Audit(3005)`);
}
bootstrap();