import { Body, Controller, Get, Post } from '@nestjs/common';
import { AppService } from './app.service';

@Controller('agreements')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getData() {
    return this.appService.getAll();
  }

  @Post()
  create(@Body() body: any) {
    return this.appService.create(body);
  }
}