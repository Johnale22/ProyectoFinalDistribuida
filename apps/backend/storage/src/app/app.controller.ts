import { Controller, Post, UseInterceptors, UploadedFile, Body } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AppService } from './app.service';

@Controller('storage')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file')) // 'file' es el nombre del campo en el form-data
  async uploadFile(@UploadedFile() file: Express.Multer.File, @Body('studentId') studentId: string) {
    if (!file) return { success: false, message: 'No se envió ningún archivo' };
    return this.appService.uploadFile(file, studentId);
  }
}