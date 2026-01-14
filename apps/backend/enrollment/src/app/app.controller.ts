import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { AppService } from './app.service';

@Controller('enrollments')
export class AppController {
  constructor(private readonly appService: AppService) {}

  // 1. Estudiante se postula
  @Post()
  create(@Body() body: any) {
    return this.appService.create(body);
  }

  // 2. Tutor: Ver SOLO los Pendientes (Esta es la que te faltaba)
  @Get('pending')
  getPending() {
    return this.appService.findPending();
  }

  // 3. Tutor: Aprobar/Rechazar
  @Post('manage')
  manage(@Body() body: any) {
    return this.appService.manage(body.id, body.status);
  }

  // 4. Estudiante: Ver sus inscripciones
  @Get('student/:username')
  getMyEnrollments(@Param('username') username: string) {
    return this.appService.findMyEnrollments(username);
  }
}