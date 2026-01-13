import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { User } from './user.entity';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    // 1. Base de Datos (Postgres)
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'admin',
      password: 'adminpassword',
      database: 'vinculacion_auth', // Asegúrate de que esta BD exista (ya la creamos)
      autoLoadEntities: true,
      synchronize: true,
    }),
    TypeOrmModule.forFeature([User]),

    // 2. Comunicación con Microservicios (RabbitMQ)
    ClientsModule.register([
      // Este servicio (Auth) escuchando su propia cola
      {
        name: 'AUTH_SERVICE',
        transport: Transport.RMQ,
        options: {
          urls: ['amqp://admin:adminpassword@localhost:5672'],
          queue: 'auth_queue',
          queueOptions: { durable: false },
        },
      },
      // --- CORRECCIÓN AQUÍ ---
      // Agregamos ENROLLMENT_SERVICE porque tu Controller lo está pidiendo
      {
        name: 'ENROLLMENT_SERVICE',
        transport: Transport.RMQ,
        options: {
          urls: ['amqp://admin:adminpassword@localhost:5672'],
          queue: 'enrollment_queue',
          queueOptions: { durable: false },
        },
      },
      // -----------------------
    ]),

    // 3. Seguridad (JWT)
    PassportModule,
    JwtModule.register({
      secret: 'secretKey', // En prod usar variables de entorno
      signOptions: { expiresIn: '60m' },
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}