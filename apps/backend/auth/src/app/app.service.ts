import { Injectable, OnModuleInit } from '@nestjs/common'; // <--- Importar OnModuleInit
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AppService implements OnModuleInit { // <--- Implementar interfaz
  constructor(
    @InjectRepository(User) private userRepo: Repository<User>,
    private jwtService: JwtService
  ) {}

  // ESTO SE EJECUTA APENAS INICIA EL MICROSERVICIO
  async onModuleInit() {
    await this.seedUser('admin', 'admin123', 'ADMIN', 'Administrador General');
    await this.seedUser('coordinador', 'coord123', 'COORDINATOR', 'Coord. Vinculación');
    await this.seedUser('tutor', 'tutor123', 'TUTOR', 'Docente Tutor');
    await this.seedUser('estudiante', 'estud123', 'STUDENT', 'Estudiante Prueba');
    console.log('🌱 Base de datos sembrada con usuarios de prueba');
  }

  private async seedUser(username: string, pass: string, role: string, fullName: string) {
    const exists = await this.userRepo.findOneBy({ username });
    if (!exists) {
      const user = this.userRepo.create({ 
        username, 
        password: pass, // En prod: bcrypt.hash
        role,
        fullName,
        phone: '0999999999',
        sector: 'Campus UCE'
      });
      await this.userRepo.save(user);
    }
  }

  // ... (El resto de tus métodos login/register/validate siguen igual abajo) ...
  
  async validateUser(username: string, pass: string) {
    console.log(`🔍 INTENTO LOGIN: Buscando usuario '${username}'...`);
    
    const user = await this.userRepo.findOneBy({ username });
    
    if (!user) {
      console.log("❌ Usuario NO encontrado en la base de datos.");
      return null;
    }

    console.log(`📂 Usuario encontrado: ${user.username} | Pass en BD: '${user.password}' | Pass ingresada: '${pass}'`);

    // COMPARACIÓN DIRECTA (Solo para desarrollo, sin encriptar)
    if (user.password === pass) {
      console.log("✅ ¡Contraseña CORRECTA!");
      const { password, ...result } = user;
      return result;
    }
    
    console.log("❌ Contraseña INCORRECTA.");
    return null;
  }

  async login(user: any) {
    const payload = { username: user.username, sub: user.id, role: user.role };
    return {
      access_token: this.jwtService.sign(payload),
      role: user.role, // Devolvemos el rol para que el frontend sepa dónde navegar
      username: user.username
    };
  }

  // Mantenemos el register por si el Admin lo usa desde su panel
  async register(body: any) {
     const existing = await this.userRepo.findOneBy({ username: body.username });
     if (existing) return { message: 'El usuario ya existe', success: false };

     const newUser = this.userRepo.create({
       username: body.username,
       password: body.password,
       role: body.role || 'STUDENT',
       fullName: body.fullName,
       phone: body.phone,
       sector: body.sector
     });
     await this.userRepo.save(newUser);
     return { message: 'Usuario creado', success: true };
  }
  

}