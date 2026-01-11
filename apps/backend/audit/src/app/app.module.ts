import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuditLog, AuditSchema } from './audit.schema';

@Module({
  imports: [
    // Usamos la misma base 'vinculacion_logs' o una nueva
    MongooseModule.forRoot('mongodb://admin:adminpassword@localhost:27017/vinculacion_logs?authSource=admin'),
    MongooseModule.forFeature([{ name: AuditLog.name, schema: AuditSchema }]),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}