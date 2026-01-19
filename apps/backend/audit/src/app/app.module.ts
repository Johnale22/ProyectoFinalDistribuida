import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuditLog, AuditLogSchema } from './audit.schema';

@Module({
  imports: [
    // Base de datos dedicada para Auditoría
    MongooseModule.forRoot('mongodb://admin:adminpassword@localhost:27017/vinculacion_audit?authSource=admin'),
    MongooseModule.forFeature([{ name: AuditLog.name, schema: AuditLogSchema }]),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}