import { Controller, Get } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { AppService } from './app.service';

@Controller() // Escucha en la raíz (El gateway ya le quita el /audit si usas pathRewrite)
export class AppController {
  constructor(private readonly appService: AppService) {}

  // 1. Endpoint para ver el historial (GET http://localhost:8080/audit)
  @Get()
  async getAuditLogs() {
    return this.appService.getLogs();
  }

  // 2. Escucha: Inscripción Aprobada
  @EventPattern('enrollment_approved')
  async handleEnrollmentApproved(@Payload() data: any) {
    console.log('🕵️ Audit: Registrando aprobación...', data);
    await this.appService.logEvent('ENROLLMENT_APPROVED', data);
  }

  // 3. Escucha: Notificación Enviada
  @EventPattern('notify_email')
  async handleNotificationSent(@Payload() data: any) {
    console.log('🕵️ Audit: Registrando envío de correo...', data);
    await this.appService.logEvent('EMAIL_SENT', data);
  }
}