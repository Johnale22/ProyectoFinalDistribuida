import { Controller, Get, Query } from '@nestjs/common';
import { AppService } from './app.service';

@Controller('geo')
export class AppController {
  constructor(private readonly appService: AppService) {}

  // Ejemplo de llamada: /geo/nearby?lat=-0.2&lng=-78.5
  @Get('nearby')
  getNearbyProjects(@Query('lat') lat: string, @Query('lng') lng: string) {
    return this.appService.findNearby(Number(lat), Number(lng));
  }
}