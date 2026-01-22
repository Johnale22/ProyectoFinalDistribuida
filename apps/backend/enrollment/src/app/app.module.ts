import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { Enrollment, EnrollmentSchema } from './enrollment.schema';
// Rate Limiting para seguridad
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';

@Module({
  imports: [
    // 1. Base de datos Mongo
    MongooseModule.forRoot(
      process.env.MONGO_URI || 'mongodb://admin:adminpassword@localhost:27017/vinculacion_enrollment?authSource=admin'
    ),
    
    // Esquema
    MongooseModule.forFeature([{ name: Enrollment.name, schema: EnrollmentSchema }]),
    
    // 2. Clientes RabbitMQ
    ClientsModule.register([
      {
        name: 'PROJECT_SERVICE',
        transport: Transport.RMQ,
        options: {
          urls: [`amqp://admin:adminpassword@${process.env.RABBIT_HOST || 'localhost'}:5672`],
          queue: 'projects_queue',
          queueOptions: { durable: false },
        },
      },
      {
        name: 'NOTIFICATION_SERVICE',
        transport: Transport.RMQ,
        options: {
          urls: [`amqp://admin:adminpassword@${process.env.RABBIT_HOST || 'localhost'}:5672`],
          queue: 'notification_queue',
          queueOptions: { durable: false },
        },
      },
      {
        name: 'REPORTING_SERVICE',
        transport: Transport.RMQ,
        options: {
          urls: [`amqp://admin:adminpassword@${process.env.RABBIT_HOST || 'localhost'}:5672`],
          queue: 'reporting_queue',
          queueOptions: { durable: false },
        },
      },
    ]),

    // 3. Rate Limit (Seguridad básica)
    ThrottlerModule.forRoot([{
      ttl: 60000,
      limit: 100,
    }]),
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    }
  ],
})
export class AppModule {}