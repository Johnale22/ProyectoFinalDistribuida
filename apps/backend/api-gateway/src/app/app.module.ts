import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
// ✅ IMPORTAR: Seguridad Rate Limit
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';

@Module({
  imports: [
    // ✅ CONFIGURACIÓN: Máximo 10 peticiones por minuto por IP
    ThrottlerModule.forRoot([{
      ttl: 60000, 
      limit: 10, 
    }]),
  ],
  controllers: [AppController],
  providers: [
    AppService,
    // ✅ ACTIVAR: Guardián global
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    }
  ],
})
export class AppModule {}