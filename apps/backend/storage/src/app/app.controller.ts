import { Controller, Post, UseInterceptors, UploadedFile, Body } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AppService } from './app.service';

@Controller('storage') // <--- Prefijo que coincide con Gateway
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file')) // Sin diskStorage = Memoria (Buffer disponible)
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Body('studentId') studentId: string // Recibimos el ID del estudiante
  ) {
    if (!file) {
      return { success: false, message: 'No se recibió ningún archivo' };
    }

    // Llamamos a TU servicio de MinIO
    const id = studentId || 'anonimo';
    return await this.appService.uploadFile(file, id);
  }
}