import { Controller, Post, Body, UnauthorizedException } from '@nestjs/common';
import { AppService } from './app.service';

@Controller('auth') // <--- IMPORTANTE: prefijo 'auth'
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Post('login')
  async login(@Body() body: any) {
    console.log("📨 Petición recibida desde Frontend:", body);

    // 1. Validar credenciales
    const user = await this.appService.validateUser(body.username, body.password);
    
    if (!user) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    // 2. Generar Token
    return this.appService.login(user);
  }

  @Post('register')
  async register(@Body() body: any) {
    return this.appService.register(body);
  }
}