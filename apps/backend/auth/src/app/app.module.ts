import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClientsModule, Transport } from '@nestjs/microservices'; // <--- IMPORTANTE: Nuevo import
import { User } from './user.entity';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    // 1. Configuración de Base de Datos (Postgres) - INTACTA
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'admin',
      password: 'adminpassword',
      database: 'vinculacion_auth',
      autoLoadEntities: true,
      synchronize: true,
    }),
    TypeOrmModule.forFeature([User]),

    // 2. JWT - INTACTO
    JwtModule.register({
      secret: 'SECRET_KEY_TESIS',
      signOptions: { expiresIn: '1d' },
    }),

    // 3. NUEVO: Cliente RabbitMQ para hablar con Auditoría
    ClientsModule.register([
      {
        name: 'AUDIT_SERVICE', // Nombre para inyectar en el servicio
        transport: Transport.RMQ,
        options: {
          urls: ['amqp://admin:adminpassword@localhost:5672'],
          queue: 'audit_queue', // La misma cola que escucha el Audit Service
          queueOptions: { durable: false },
        },
      },
    ]),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}