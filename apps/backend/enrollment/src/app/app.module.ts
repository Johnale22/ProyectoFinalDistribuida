import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { Enrollment, EnrollmentSchema } from './enrollment.schema';
// ✅ IMPORTAR RATE LIMITING
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';

@Module({
  imports: [
    // 1. Base de datos Mongo (INTACTA)
    MongooseModule.forRoot('mongodb://admin:adminpassword@localhost:27017/vinculacion_enrollment?authSource=admin'),
    MongooseModule.forFeature([{ name: Enrollment.name, schema: EnrollmentSchema }]),
    
    // 2. Clientes RabbitMQ (INTACTO)
    ClientsModule.register([
      {
        name: 'PROJECT_SERVICE',
        transport: Transport.RMQ,
        options: {
          urls: ['amqp://admin:adminpassword@localhost:5672'],
          queue: 'projects_queue',
          queueOptions: { durable: false },
        },
      },
      {
        name: 'NOTIFICATION_SERVICE',
        transport: Transport.RMQ,
        options: {
          urls: ['amqp://admin:adminpassword@localhost:5672'],
          queue: 'notification_queue',
          queueOptions: { durable: false },
        },
      },
      {
        name: 'REPORTING_SERVICE',
        transport: Transport.RMQ,
        options: {
          urls: ['amqp://admin:adminpassword@localhost:5672'],
          queue: 'reporting_queue',
          queueOptions: { durable: false },
        },
      },
    ]),

    // ✅ 3. CONFIGURACIÓN RATE LIMIT (Anti-Spam de inscripciones)
    ThrottlerModule.forRoot([{
      ttl: 60000, // 1 minuto
      limit: 100,  // Máximo 10 peticiones por minuto por IP
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