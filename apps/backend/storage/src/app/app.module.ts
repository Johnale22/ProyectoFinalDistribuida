import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
// ✅ Importamos ClientsModule para conectarnos a RabbitMQ
import { ClientsModule, Transport } from '@nestjs/microservices';

@Module({
  imports: [
    // ✅ Cliente RabbitMQ (Para hablar con Notification Service)
    ClientsModule.register([
      {
        name: 'NOTIFICATION_SERVICE',
        transport: Transport.RMQ,
        options: {
          urls: [`amqp://admin:adminpassword@${process.env.RABBIT_HOST || 'localhost'}:5672`],
          queue: 'notification_queue',
          queueOptions: { durable: false },
        },
      },
    ]),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}