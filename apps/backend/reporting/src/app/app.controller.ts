import { Controller, Get } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { AppService } from './app.service';

@Controller('reports')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getStats() {
    return this.appService.getStats();
  }

  @EventPattern('enrollment_approved')
  handleEnrollmentApproved(@Payload() data: any) {
    this.appService.updateStat(data.projectId);
  }
}