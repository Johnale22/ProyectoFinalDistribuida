import { Controller, Get, Post, Body } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { AppService } from './app.service';

@Controller('projects')
export class AppController {
  constructor(private readonly appService: AppService) {}

  // --- HTTP (Para el Frontend) ---
  @Get()
  findAll() { return this.appService.findAll(); }

  @Post()
  create(@Body() body: any) { return this.appService.create(body); }

  // --- RABBITMQ (Interno) ---
  @EventPattern('enrollment_approved')
  handleEnrollmentApproved(@Payload() data: any) {
    // Recibimos el aviso de Enrollment y ejecutamos la lógica
    this.appService.reduceQuota(data.projectId);
  }
}