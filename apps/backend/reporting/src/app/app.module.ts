import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { Report, ReportSchema } from './reporting.schema';

@Module({
  imports: [
    // ✅ FIX: Conexión dinámica (En Docker usará 'uce_mongo')
    MongooseModule.forRoot(
      process.env.MONGO_URI || 'mongodb://admin:adminpassword@localhost:27017/vinculacion_reports?authSource=admin'
    ),
    MongooseModule.forFeature([{ name: Report.name, schema: ReportSchema }]),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}