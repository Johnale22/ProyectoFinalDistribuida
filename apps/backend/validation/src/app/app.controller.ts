import { Controller, Post, Body, HttpCode } from '@nestjs/common';
import { AppService } from './app.service';

@Controller('validation') // Escucha en /validation
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Post('check-eligibility')
  @HttpCode(200)
  check(@Body() body: { studentId: string; projectCode: string }) {
    return this.appService.validateStudent(body.studentId, body.projectCode);
  }
}