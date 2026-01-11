import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices'; // <--- Importar
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  // El nombre 'ValidationService' y 'ValidateStudent' deben coincidir con el .proto
  @GrpcMethod('ValidationService', 'ValidateStudent')
  validateStudent(data: { studentName: string }) {
    console.log(`🔍 (gRPC) Validando a: ${data.studentName}`);
    return this.appService.validateStudent(data.studentName);
  }
}