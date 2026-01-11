import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { User } from './user.entity';

@Module({
  imports: [
    // Configuración de la Base de Datos
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',      // Porque Docker corre en tu máquina
      port: 5432,             // Puerto por defecto de Postgres
      username: 'admin',      // Definido en docker-compose
      password: 'adminpassword', // Definido en docker-compose
      database: 'vinculacion_db', // Definido en docker-compose
      autoLoadEntities: true, // Carga automática de tablas
      synchronize: true,      // ¡SOLO EN DEV! Crea las tablas automáticamente
      entities: [User],
    }),
    TypeOrmModule.forFeature([User]),
    ClientsModule.register([
      {
        name: 'ENROLLMENT_SERVICE', // Nombre para inyectarlo luego
        transport: Transport.RMQ,
        options: {
          urls: ['amqp://admin:adminpassword@localhost:5672'],
          queue: 'enrollment_queue', // Debe coincidir con la cola del otro servicio
          queueOptions: {
            durable: false
          },
        },
      },
    ]),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}