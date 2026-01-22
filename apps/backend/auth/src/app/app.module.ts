import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { User } from './user.entity';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { JwtModule } from '@nestjs/jwt';
// ✅ IMPORTAR RATE LIMITING
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';

@Module({
  imports: [
    // 1. Base de Datos (CORREGIDA PARA DOCKER)
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost', // Docker usa 'uce_postgres'
      port: 5432,
      username: 'admin',
      password: 'adminpassword',
      // ⚠️ CAMBIO CRÍTICO: Usamos la DB que crea Docker por defecto o variable de entorno
      database: process.env.DB_NAME || 'vinculacion_db', 
      autoLoadEntities: true,
      synchronize: true,
    }),
    TypeOrmModule.forFeature([User]),

    // 2. JWT (INTACTO)
    JwtModule.register({
      secret: 'SECRET_KEY_TESIS',
      signOptions: { expiresIn: '1d' },
    }),

    // 3. Cliente RabbitMQ (DINÁMICO)
    ClientsModule.register([
      {
        name: 'AUDIT_SERVICE',
        transport: Transport.RMQ,
        options: {
          // ⚠️ CAMBIO CRÍTICO: Inyectamos el host dinámicamente
          // Si estás en Docker usa 'uce_rabbitmq', si estás local usa 'localhost'
          urls: [`amqp://admin:adminpassword@${process.env.RABBIT_HOST || 'localhost'}:5672`],
          queue: 'audit_queue',
          queueOptions: { durable: false },
        },
      },
    ]),

    // ✅ 4. CONFIGURACIÓN RATE LIMIT (Anti-Fuerza Bruta)
    ThrottlerModule.forRoot([{
      ttl: 60000, // 1 minuto
      limit: 10,  // Máximo 10 intentos de login/registro por IP
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