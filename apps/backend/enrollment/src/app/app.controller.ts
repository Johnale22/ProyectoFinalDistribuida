import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { AppService } from './app.service';

@Controller('enrollment') // Singular, coincide con el Gateway
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Post()
  create(@Body() body: any) {
    return this.appService.create(body);
  }

  @Get('pending')
  getPending() {
    return this.appService.findPending();
  }

  @Post('manage')
  manage(@Body() body: any) {
    return this.appService.manage(body.id, body.status);
  }

  @Get('student/:username')
  getMyEnrollments(@Param('username') username: string) {
    return this.appService.findMyEnrollments(username);
  }

  @Get('approved')
  async getApproved() {
    return this.appService.getApproved();
  }

  // ✅ ENDPOINT PARA GUARDAR EL LINK
  // Recibe { studentId: "admin", reportUrl: "http://..." }
  @Post('update-report')
  async updateReport(@Body() body: { studentId: string; reportUrl: string }) {
    try {
        const result = await this.appService.updateReport(body.studentId, body.reportUrl);
        return { success: true, data: result };
    } catch (error) {
        return { success: false, message: error.message || 'Error al guardar reporte.' };
    }
  }
}