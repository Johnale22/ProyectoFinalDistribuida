import { Controller, Get } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { AppService } from './app.service';

@Controller('reports')
export class AppController {
  constructor(private readonly appService: AppService) {}

  // API: Dashboard Coordinador llama aquí
  @Get('stats')
  getStats() {
    return this.appService.getStats();
  }

  // RABBITMQ: Escucha eventos invisibles
  @EventPattern('enrollment_approved') // <--- Debe coincidir con lo que envía Enrollment
  async handleEnrollment(@Payload() data: any) {
    this.appService.handleApprovedEnrollment(data);
  }
  
  @EventPattern('project_created')
  async handleProject() {
    this.appService.incrementProjects();
  }
}