import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { Report, ReportSchema } from './report.schema';

@Module({
  imports: [
    // Base de datos propia para reportes
    MongooseModule.forRoot('mongodb://admin:adminpassword@localhost:27017/vinculacion_reports?authSource=admin'),
    MongooseModule.forFeature([{ name: Report.name, schema: ReportSchema }]),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}