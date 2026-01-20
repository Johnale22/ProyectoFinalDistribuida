import { Controller, Post, Body, UnauthorizedException, Get, Param, NotFoundException } from '@nestjs/common';
import { AppService } from './app.service';

// CAMBIO CRÍTICO: Dejamos el Controller VACÍO.
// El servicio escuchará directamente en /login y /register
@Controller() 
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
    return await this.appService.register(body);
  }

  @Get('profile/:username')
  async getProfile(@Param('username') username: string) {
    const user = await this.appService.getUser(username);
    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }
    // Quitamos la contraseña antes de enviarlo
    const { password, ...result } = user;
    return result;
  }
}