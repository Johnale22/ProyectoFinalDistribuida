import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  // Coincide con 'service LocationService' y rpc 'CalculateDistance' del proto
  @GrpcMethod('LocationService', 'CalculateDistance')
  calculateDistance(data: any) {
    return this.appService.calculateDistance(data);
  }
}