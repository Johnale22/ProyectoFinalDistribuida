import { Controller, Get } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { AppService } from './app.service';

@Controller('audit')
export class AppController {
  constructor(private readonly appService: AppService) {}

  // Escuchamos el mismo evento que los otros servicios
  @EventPattern('student_enrolled')
  handleEnrollmentEvent(@Payload() data: any) {
    console.log('🕵️ Audit Service: Registrando evento...');
    this.appService.logEvent('NUEVA_INSCRIPCION', data);
  }

  // Endpoint para el Dashboard del Coordinador
  @Get()
  getData() {
    return this.appService.getAuditHistory();
  }
}