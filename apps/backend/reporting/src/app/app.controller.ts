import { Controller, Get, UseInterceptors } from '@nestjs/common';
import { CacheInterceptor } from '@nestjs/cache-manager'; // <--- Importante
import { AppService } from './app.service';

@Controller('reports')
@UseInterceptors(CacheInterceptor)
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('dashboard')
  getStats() {
    console.log("📊 Generando reporte desde BD...");
    return this.appService.getDashboardStats();
  }
}