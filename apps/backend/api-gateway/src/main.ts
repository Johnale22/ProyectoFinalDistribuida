import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import { createProxyMiddleware } from 'http-proxy-middleware';
import * as express from 'express';
import { Request, Response, NextFunction } from 'express'; 
import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
import { join } from 'path';
// ✅ IMPORTAR: Librerías nuevas
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  // ✅ SEGURIDAD: Validación Global
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
  }));

  // ✅ DOCUMENTACIÓN: Swagger
  const config = new DocumentBuilder()
    .setTitle('API Gateway - Sistema Vinculación')
    .setDescription('Documentación unificada de los microservicios')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  // --- A. gRPC MAPA (LOCATION SERVICE) ---
  const PROTO_PATH = join(__dirname, 'assets/location.proto');
  let locationClient: any = null;

  try {
    const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
      keepCase: true, longs: String, enums: String, defaults: true, oneofs: true
    });
    const locationProto = grpc.loadPackageDefinition(packageDefinition).location as any;
    
    // 🐳 DOCKER CHANGE: Usamos variable de entorno para el Host de Location
    const LOCATION_HOST = process.env.LOCATION_HOST || 'localhost';
    
    locationClient = new locationProto.LocationService(
      `${LOCATION_HOST}:3007`, // Se conecta a 'location-service:3007' en Docker
      grpc.credentials.createInsecure()
    );
    console.log(`✅ [Gateway] Cliente gRPC conectado a Location (${LOCATION_HOST}:3007)`);
  } catch (error) {
    console.warn('⚠️ [Gateway] No se pudo cargar location.proto.');
  }

  // --- B. PROXIES REST (DOCKER READY) ---
  // Usamos variables de entorno. Si no existen, usa localhost (fallback para desarrollo local)

  // 1. AUTH
  const AUTH_URL = process.env.AUTH_URL || 'http://localhost:3000';
  app.use('/auth', createProxyMiddleware({ target: AUTH_URL, changeOrigin: true }));

  // 2. PROJECTS
  const PROJECTS_URL = process.env.PROJECTS_URL || 'http://localhost:3001';
  app.use('/projects', createProxyMiddleware({ target: PROJECTS_URL, changeOrigin: true }));

  // 3. ENROLLMENT (Con Rewrite)
  const ENROLLMENT_URL = process.env.ENROLLMENT_URL || 'http://localhost:3002';
  app.use('/enrollment', createProxyMiddleware({ 
    target: ENROLLMENT_URL, 
    changeOrigin: true, 
    pathRewrite: { '^/enrollment': '/enrollments' } 
  }));

  // 4. REPORTS
  const REPORTS_URL = process.env.REPORTS_URL || 'http://localhost:3003';
  app.use('/reports', createProxyMiddleware({ target: REPORTS_URL, changeOrigin: true }));

  // 5. AUDIT
  const AUDIT_URL = process.env.AUDIT_URL || 'http://localhost:3005';
  app.use('/audit', createProxyMiddleware({ target: AUDIT_URL, changeOrigin: true }));

  // 6. STORAGE
  const STORAGE_URL = process.env.STORAGE_URL || 'http://localhost:3006';
  app.use('/storage', createProxyMiddleware({ target: STORAGE_URL, changeOrigin: true }));

  // 7. VALIDATION
  const VALIDATION_URL = process.env.VALIDATION_URL || 'http://localhost:3008';
  app.use('/validation', createProxyMiddleware({ target: VALIDATION_URL, changeOrigin: true }));

  // Endpoint gRPC manual
  app.use('/location/calc', express.json(), (req: Request, res: Response, next: NextFunction) => {
    if (req.method !== 'POST') return next();
    if (!locationClient) return res.status(503).json({ message: 'Location Service off' });
    const { lat1, lon1, lat2, lon2 } = req.body;
    locationClient.CalculateDistance({ lat1, lon1, lat2, lon2 }, (err: any, response: any) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(response);
    });
  });
  
  await app.listen(8080);
  console.log(`🚀 API GATEWAY listo en: http://localhost:8080`);
  console.log(`📄 Documentación en: http://localhost:8080/api/docs`);
}
bootstrap();