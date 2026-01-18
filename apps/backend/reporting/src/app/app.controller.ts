import { Controller, Get } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { AppService } from './app.service';

// --- DEJAR VACÍO ---
// El Gateway ya convirtió "/reports" en "/"
@Controller() 
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  async getDashboardStats() {
    return this.appService.getStats();
  }

  @EventPattern('enrollment_approved')
  async handleEnrollmentApproved(@Payload() data: any) {
    console.log('⚡ Reporting: Inscripción aprobada', data);
    await this.appService.incrementApprovedStats(data);
  }
}