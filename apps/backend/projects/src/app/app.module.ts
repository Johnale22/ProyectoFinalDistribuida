import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { Project } from './project.entity';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { HttpModule } from '@nestjs/axios';
import { join } from 'path'; // <--- IMPORTANTE: Faltaba este import

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'admin',
      password: 'adminpassword',
      database: 'vinculacion_db',
      autoLoadEntities: true,
      synchronize: true,
    }),
    TypeOrmModule.forFeature([Project]),

    // --- AQUÍ ESTABA EL ERROR: Todo debe ir dentro de UN solo register ---
    ClientsModule.register([
      // 1. Cliente RabbitMQ (Inscripciones)
      {
        name: 'ENROLLMENT_SERVICE',
        transport: Transport.RMQ,
        options: {
          urls: ['amqp://admin:adminpassword@localhost:5672'],
          queue: 'enrollment_queue',
          queueOptions: { durable: false },
        },
      },
      // 2. Cliente RabbitMQ (Auditoría)
      {
        name: 'AUDIT_SERVICE',
        transport: Transport.RMQ,
        options: {
          urls: ['amqp://admin:adminpassword@localhost:5672'],
          queue: 'audit_queue',
          queueOptions: { durable: false },
        },
      },
      // 3. Cliente gRPC (Validación) - ¡AHORA ESTÁ DENTRO DEL ARRAY!
      {
        name: 'VALIDATION_PACKAGE',
        transport: Transport.GRPC,
        options: {
          package: 'validation',
          protoPath: join(__dirname, 'assets/validation.proto'), // Asegúrate que el archivo esté en assets
          url: 'localhost:5000',
        },
      },
    ]),
    
    HttpModule, // (Opcional, ya no lo usamos para validar, pero lo dejamos por si acaso)
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}