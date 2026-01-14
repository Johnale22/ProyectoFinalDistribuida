import { Controller, Get } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { AppService } from './app.service';

@Controller('audit') // <--- IMPORTANTE: Prefijo 'audit'
export class AppController {
  constructor(private readonly appService: AppService) {}

  // 1. ESTO ES LO QUE TE FALTA (Para leer los datos)
  @Get()
  async getAuditLogs() {
    return this.appService.getLogs();
  }

  // 2. Esto ya lo tienes (Para guardar los datos)
  @EventPattern('audit_log')
  handleAuditLog(@Payload() data: any) {
    this.appService.logAction(data);
  }
}