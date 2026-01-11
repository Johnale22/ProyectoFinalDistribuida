import { Module } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    // Esto permite que se puedan ver los archivos guardados entrando a la URL
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', '..', '..', 'uploads'), // Carpeta física donde se guardan
      serveRoot: '/files', // Prefijo de la URL (ej: localhost:3005/files/archivo.pdf)
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}