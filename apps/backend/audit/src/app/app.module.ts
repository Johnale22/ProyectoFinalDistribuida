import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuditLog, AuditLogSchema } from './audit.schema';
// ✅ IMPORTAR RATE LIMITING
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';

@Module({
  imports: [
    // Base de datos dedicada para Auditoría
    MongooseModule.forRoot('mongodb://admin:adminpassword@localhost:27017/vinculacion_audit?authSource=admin'),
    MongooseModule.forFeature([{ name: AuditLog.name, schema: AuditLogSchema }]),
    
    // ✅ CONFIGURACIÓN RATE LIMIT (10 peticiones por minuto)
    ThrottlerModule.forRoot([{
      ttl: 60000,
      limit: 100,
    }]),
  ],
  controllers: [AppController],
  providers: [
    AppService,
    // ✅ ACTIVAR GUARDIÁN GLOBAL
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    }
  ],
})
export class AppModule {}