import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { Report, ReportSchema } from './reporting.schema';

@Module({
  imports: [
    // Base de datos SOLO para reportes (CQRS Read Side)
    MongooseModule.forRoot('mongodb://admin:adminpassword@localhost:27017/vinculacion_reports?authSource=admin'),
    MongooseModule.forFeature([{ name: Report.name, schema: ReportSchema }]),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}