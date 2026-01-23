import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    HttpModule, // 👈 Necesario para poder hacer peticiones a n8n
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}