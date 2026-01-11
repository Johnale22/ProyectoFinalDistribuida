import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { Enrollment, EnrollmentSchema } from './enrollment.schema';

@Module({
  imports: [
    // Conexión a tu contenedor Docker de Mongo
    MongooseModule.forRoot('mongodb://admin:adminpassword@localhost:27017/vinculacion_logs?authSource=admin'),
    
    // Registramos la colección (Tabla)
    MongooseModule.forFeature([{ name: Enrollment.name, schema: EnrollmentSchema }]),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
