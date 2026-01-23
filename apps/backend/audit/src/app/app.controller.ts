import { Controller, Get } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { AppService } from './app.service';

@Controller('audit') // ✅ El endpoint queda como /audit
export class AppController {
  constructor(private readonly appService: AppService) {}

  // 1. HTTP GET: Para que el Admin vea la tabla
  @Get()
  async getAuditLogs() {
    return this.appService.getLogs();
  }

  // 2. RABBITMQ: Escucha universal
  // Cualquier servicio que emita 'audit_log' caerá aquí
  @EventPattern('audit_log')
  async handleAuditLog(@Payload() data: any) {
    // data debe tener { action: "...", user: "...", ... }
    const action = data.action || 'UNKNOWN_EVENT';
    await this.appService.logEvent(action, data);
  }
}