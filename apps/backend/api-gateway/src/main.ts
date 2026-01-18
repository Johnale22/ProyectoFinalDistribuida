import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import { createProxyMiddleware } from 'http-proxy-middleware';
import * as express from 'express'; 
import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  // ---------------------------------------------------------
  // A. CONFIGURACIÓN DEL CLIENTE gRPC (Location Service)
  // ---------------------------------------------------------
  const PROTO_PATH = join(__dirname, 'assets/location.proto');
  let locationClient: any = null;

  try {
    const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
      keepCase: true, longs: String, enums: String, defaults: true, oneofs: true
    });
    const locationProto = grpc.loadPackageDefinition(packageDefinition).location as any;
    locationClient = new locationProto.LocationService(
      'localhost:3007', 
      grpc.credentials.createInsecure()
    );
    console.log('✅ [Gateway] Cliente gRPC conectado a Location (3007)');
  } catch (error) {
    console.warn('⚠️ [Gateway] No se pudo cargar location.proto.');
  }

  // ---------------------------------------------------------
  // B. RUTA ESPECIAL: TRADUCTOR gRPC (Mapa)
  // ---------------------------------------------------------
  app.use('/location/calc', express.json(), (req, res, next) => {
    if (req.method !== 'POST') return next();
    
    if (!locationClient) {
        return res.status(503).json({ message: 'Servicio de ubicación apagado' });
    }

    const { lat1, lon1, lat2, lon2 } = req.body;
    
    locationClient.CalculateDistance({ lat1, lon1, lat2, lon2 }, (err: any, response: any) => {
      if (err) {
          console.error("Error gRPC:", err);
          return res.status(500).json({ error: err.message });
      }
      res.json(response);
    });
  });

  // ---------------------------------------------------------
  // C. PROXIES REST
  // ---------------------------------------------------------

  // 1. Auth (3000)
  app.use('/auth', createProxyMiddleware({ 
      target: 'http://localhost:3000', 
      changeOrigin: true 
  }));

  // 2. Projects (3001)
  app.use('/projects', createProxyMiddleware({ 
      target: 'http://localhost:3001', 
      changeOrigin: true 
  }));

  // 3. Enrollment (3002)
  app.use('/enrollment', createProxyMiddleware({ 
      target: 'http://localhost:3002', 
      changeOrigin: true,
      pathRewrite: { '^/enrollment': '/enrollments' } 
  }));

  // 4. Reports (3003) - CORREGIDO
  // Agregamos pathRewrite para borrar '/reports' antes de enviarlo
  app.use('/reports', createProxyMiddleware({ 
      target: 'http://localhost:3003', 
      changeOrigin: true,
      pathRewrite: { '^/reports': '' } // <--- ESTO ES LO QUE NECESITAS
  }));

  // 5. Audit (3005)
  app.use('/audit', createProxyMiddleware({ 
      target: 'http://localhost:3005', 
      changeOrigin: true,
      pathRewrite: { '^/audit': '' } 
  }));
  
  // 6. Storage (3006)
  app.use('/storage', createProxyMiddleware({ 
      target: 'http://localhost:3006', 
      changeOrigin: true,
  }));
  
  await app.listen(8080);
  console.log(`🚀 API GATEWAY listo en: http://localhost:8080`);
  console.log(`📡 Rutas activas: Auth, Projects, Enrollment, Reports, Audit, Storage y Location(gRPC)`);
}
bootstrap();