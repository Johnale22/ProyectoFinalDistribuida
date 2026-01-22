import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Project } from './project.entity';
import { AppController } from './app.controller';
import { AppService } from './app.service';
// ✅ IMPORTAR ESTAS LIBRERÍAS FALTANTES
import { ClientsModule, Transport } from '@nestjs/microservices';

@Module({
  imports: [
    // 1. Base de Datos
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'uce_postgres',
      port: 5432,
      username: 'admin',
      password: 'adminpassword',
      database: process.env.DB_NAME || 'vinculacion_db',
      autoLoadEntities: true,
      synchronize: true,
    }),
    TypeOrmModule.forFeature([Project]),

    // ✅ 2. CLIENTE RABBITMQ (Para enviar mensajes)
    // Esto permite que 'Projects' le hable a 'Notifications' u otros
    ClientsModule.register([
      {
        name: 'NOTIFICATION_SERVICE', // Nombre para inyectar en el servicio
        transport: Transport.RMQ,
        options: {
          urls: [`amqp://admin:adminpassword@${process.env.RABBIT_HOST || 'localhost'}:5672`],
          queue: 'notification_queue', // Cola a la que enviaremos mensajes
          queueOptions: { durable: false },
        },
      },
    ]),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}