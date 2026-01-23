import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuditLog, AuditLogSchema } from './audit.schema';

@Module({
  imports: [
    // ✅ CONEXIÓN ROBUSTA A MONGO (Para Docker)
    MongooseModule.forRoot(
      process.env.MONGO_URI || 'mongodb://admin:adminpassword@uce_mongo:27017/vinculacion_audit?authSource=admin'
    ),
    MongooseModule.forFeature([{ name: AuditLog.name, schema: AuditLogSchema }]),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}