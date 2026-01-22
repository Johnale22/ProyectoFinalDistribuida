import { Controller, Get } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { AppService } from './app.service';

// ✅ MEJOR PRÁCTICA: Usamos el prefijo 'reports'.
// Asegúrate de quitar el 'pathRewrite' en el Gateway para este servicio.
@Controller('reports') 
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('stats') // Endpoint quedará: /reports/stats
  async getDashboardStats() {
    return this.appService.getStats();
  }

  @EventPattern('enrollment_approved')
  async handleEnrollmentApproved(@Payload() data: any) {
    console.log('⚡ Reporting: Inscripción aprobada', data);
    await this.appService.incrementApprovedStats(data);
  }
}