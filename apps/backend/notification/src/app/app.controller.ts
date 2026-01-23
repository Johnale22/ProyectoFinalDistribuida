import { Controller } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @EventPattern('notify_email')
  async handleEmail(@Payload() data: any) {
    // Recibe el evento de RabbitMQ y lo pasa al servicio
    await this.appService.sendEmail(data);
  }
}