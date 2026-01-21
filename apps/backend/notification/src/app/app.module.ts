import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios'; // <--- IMPORTAR ESTO
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [HttpModule], // <--- AGREGAR AQUÍ
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}