import { Controller, Get } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  // 1. Ver historial (HTTP)
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
    console.log('🕵️ Audit: Registrando notificación...', data);
    await this.appService.logEvent('EMAIL_SENT', data);
  }

  // 4. Escucha: Login (Este era el que faltaba) <--- ¡AQUÍ ESTÁ LA SOLUCIÓN!
  @EventPattern('audit_log') 
  async handleAuditLog(@Payload() data: any) {
    console.log('🕵️ Audit: Evento de Login recibido (audit_log)...', data);
    // Guardamos la acción como 'USER_LOGIN' o lo que venga en los datos
    const action = data.action || 'USER_LOGIN'; 
    await this.appService.logEvent(action, data);
  }
}