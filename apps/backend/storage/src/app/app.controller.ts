import { Controller, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { mkdirSync } from 'fs';

@Controller('storage')
export class AppController {

  @Post('upload')
  @UseInterceptors(FileInterceptor('file', {
    storage: diskStorage({
      // 1. Definir dónde guardar
      destination: (req, file, cb) => {
        const uploadPath = './uploads';
        // Creamos la carpeta si no existe
        try { mkdirSync(uploadPath); } catch (e) {}
        cb(null, uploadPath);
      },
      // 2. Definir nombre del archivo (para que no se repitan)
      filename: (req, file, cb) => {
        const randomName = Array(32).fill(null).map(() => (Math.round(Math.random() * 16)).toString(16)).join('');
        cb(null, `${randomName}${extname(file.originalname)}`);
      }
    })
  }))
  uploadFile(@UploadedFile() file: Express.Multer.File) {
    // 3. Devolver la URL pública
    return {
      originalName: file.originalname,
      filename: file.filename,
      url: `http://localhost:3005/files/${file.filename}` // Esta URL se guardaría en la BD
    };
  }
}