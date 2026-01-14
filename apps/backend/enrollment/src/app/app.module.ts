import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { Enrollment, EnrollmentSchema } from './enrollment.schema';

@Module({
  imports: [
    // Mongo
    MongooseModule.forRoot('mongodb://admin:adminpassword@localhost:27017/vinculacion_enrollment?authSource=admin'),
    MongooseModule.forFeature([{ name: Enrollment.name, schema: EnrollmentSchema }]),
    
    // Cliente RabbitMQ (EMISOR)
    ClientsModule.register([
      {
        name: 'PROJECT_SERVICE',
        transport: Transport.RMQ,
        options: {
          urls: ['amqp://admin:adminpassword@localhost:5672'],
          queue: 'projects_queue', // Debe ser la misma cola que escucha Projects
          queueOptions: { durable: false },
        },
      },
      
      {
        name: 'NOTIFICATION_SERVICE',
        transport: Transport.RMQ,
        options: {
          urls: ['amqp://admin:adminpassword@localhost:5672'],
          queue: 'notification_queue', // Debe coincidir con el main.ts de Notification
          queueOptions: { durable: false },
        },
      },
      {
        name: 'REPORTING_SERVICE', // <--- NUEVO CLIENTE PARA REPORTES
        transport: Transport.RMQ,
        options: {
          urls: ['amqp://admin:adminpassword@localhost:5672'],
          queue: 'reporting_queue', // <--- Importante: Apunta a la cola de reporting
          queueOptions: { durable: false },
        },
      },
    ]),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}