import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { Enrollment, EnrollmentSchema } from './enrollment.schema';

@Module({
  imports: [
    // Base de datos Mongo
    MongooseModule.forRoot('mongodb://admin:adminpassword@localhost:27017/vinculacion_enrollment?authSource=admin'),
    MongooseModule.forFeature([{ name: Enrollment.name, schema: EnrollmentSchema }]),
    
    // Clientes RabbitMQ (Para enviar mensajes a otros servicios)
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
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}