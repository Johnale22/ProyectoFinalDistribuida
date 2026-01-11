import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CacheModule } from '@nestjs/cache-manager';
import { redisStore } from 'cache-manager-redis-yet'; // <--- LIBRERÍA MODERNA
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { Enrollment, EnrollmentSchema } from './reporting.schema';

@Module({
  imports: [
    MongooseModule.forRoot('mongodb://admin:adminpassword@localhost:27017/vinculacion_logs?authSource=admin'),
    MongooseModule.forFeature([{ name: Enrollment.name, schema: EnrollmentSchema }]),
    
    // --- CONFIGURACIÓN REDIS (MODERNA) ---
    CacheModule.registerAsync({
      isGlobal: true,
      useFactory: async () => ({
        store: await redisStore({
          socket: {
            host: 'localhost',
            port: 6379,
          },
          ttl: 60 * 1000, // 60 segundos (En v5 son milisegundos)
        }),
      }),
    }),
    // -------------------------------------
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}