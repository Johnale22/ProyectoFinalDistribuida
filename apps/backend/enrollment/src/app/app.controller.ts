import { Controller, Get } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { AppService } from './app.service';

@Controller('enrollments') // Ruta HTTP: /enrollments
export class AppController {
  constructor(private readonly appService: AppService) {}

  // --- PARTE 1: RabbitMQ (Escribe) ---
  @EventPattern('student_enrolled')
  async handleStudentEnrolled(@Payload() data: any) {
    console.log('🐰 [Enrollment] Evento recibido:', data);
    // Aquí deberías guardar en MongoDB (si tienes el servicio configurado)
    // this.enrollmentService.create(data);
  }

  // --- PARTE 2: HTTP (Lee) ---
  // El Tutor usará esto para ver quién se inscribió
  @Get()
  async getEnrollments() {
    return this.appService.getAllEnrollments();
  }
}