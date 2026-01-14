import { Controller, Get } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @EventPattern('notify_email')
  handleEmailNotification(@Payload() data: any) {
    this.appService.sendEmail(data);
  }

  @Get()
  healthCheck() {
    return { status: 'Notification Service OK' };
  }
}