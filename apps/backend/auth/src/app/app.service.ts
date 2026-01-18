import { Injectable, OnModuleInit, Inject } from '@nestjs/common'; // <--- Agregamos Inject
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { JwtService } from '@nestjs/jwt';
import { ClientProxy } from '@nestjs/microservices'; // <--- Importante para RabbitMQ

@Injectable()
export class AppService implements OnModuleInit {
  constructor(
    @InjectRepository(User) private userRepo: Repository<User>,
    private jwtService: JwtService,
    
    // --- NUEVO: Inyectamos el servicio de Auditoría ---
    @Inject('AUDIT_SERVICE') private auditClient: ClientProxy
  ) {}

  // 1. SEMILLA DE DATOS (INTACTO)
  async onModuleInit() {
    console.log('🌱 Iniciando Siembra de Datos (Seeding)...');

    // Admin
    await this.seedUser({
      username: 'admin', 
      password: 'admin123', 
      role: 'ADMIN', 
      fullName: 'Super Administrador',
      email: 'admin@uce.edu.ec',
      phone: '0999999999',
      address: 'Quito Norte',
      faculty: 'DTIC',
      career: 'Sistemas'
    });

    // Coordinador
    await this.seedUser({
      username: 'coordinador',
      password: 'coord123',
      role: 'COORDINATOR',
      fullName: 'Ing. Carlos Coordinador',
      email: 'coord@uce.edu.ec',
      phone: '0988888888',
      address: 'Centro Histórico',
      faculty: 'Vinculación General',
      career: 'Todas'
    });

    // Tutor
    await this.seedUser({
      username: 'tutor',
      password: 'tutor123',
      role: 'TUTOR',
      fullName: 'Dr. Juan Docente',
      email: 'jdocente@uce.edu.ec',
      phone: '0977777777',
      address: 'Cumbayá',
      faculty: 'Ingeniería y Ciencias Aplicadas',
      career: 'Sistemas de Información'
    });

    // Estudiante
    await this.seedUser({
      username: '1720000001',
      password: '123',
      role: 'STUDENT',
      fullName: 'Juan Fernando Pérez',
      email: 'jperez@uce.edu.ec',
      phone: '0966666666',
      address: 'Carcelén',
      faculty: 'Ingeniería y Ciencias Aplicadas',
      career: 'Sistemas de Información'
    });

    console.log('✅ Base de datos actualizada con usuarios nuevos.');
  }

  private async seedUser(data: any) {
    const exists = await this.userRepo.findOneBy({ username: data.username });
    if (!exists) {
      const newUser = this.userRepo.create(data);
      await this.userRepo.save(newUser);
      console.log(`👤 Usuario creado: ${data.username} (${data.role})`);
    }
  }

  // 2. VALIDACIÓN (INTACTO)
  async validateUser(username: string, pass: string) {
    console.log(`🔍 INTENTO LOGIN: Buscando usuario '${username}'...`);
    const user = await this.userRepo.findOneBy({ username });
    
    if (!user) {
      console.log("❌ Usuario NO encontrado.");
      return null;
    }

    if (user.password === pass) {
      console.log("✅ ¡Contraseña CORRECTA!");
      const { password, ...result } = user;
      return result;
    }
    
    console.log("❌ Contraseña INCORRECTA.");
    return null;
  }

  // 3. LOGIN (AQUÍ ESTÁ LA MAGIA)
  async login(user: any) {
    // Generar Token
    const payload = { username: user.username, sub: user.id, role: user.role };
    
    // --- ENVIAR LOG DE AUDITORÍA A REDIS ---
    // Esto envía un mensaje a la cola 'audit_queue' sin detener el login
    this.auditClient.emit('audit_log', {
        user: user.username,
        action: 'LOGIN_EXITOSO',
        role: user.role,
        timestamp: new Date(),
        details: 'Inicio de sesión vía Auth Service'
    });
    console.log(`📡 Evento de auditoría enviado para: ${user.username}`);
    // ---------------------------------------

    return {
      access_token: this.jwtService.sign(payload),
      role: user.role,
      username: user.username
    };
  }

  // 4. REGISTRO (INTACTO)
  async register(body: any) {
     const existing = await this.userRepo.findOneBy({ username: body.username });
     if (existing) return { message: 'El usuario ya existe', success: false };

     let finalPassword = body.password;
     if (!finalPassword || finalPassword.trim() === '') {
        finalPassword = body.username;
     }

     console.log(`🛠️ Creando usuario: ${body.username} | Pass asignada: ${finalPassword}`);

     const newUser = this.userRepo.create({
       username: body.username,
       password: finalPassword,
       role: body.role || 'STUDENT',
       fullName: body.fullName,
       email: body.email,
       phone: body.phone,
       address: body.address || body.barrio || body.sector, 
       faculty: body.faculty,
       career: body.career,
       semester: body.semester
     });

     try {
        await this.userRepo.save(newUser);
        
        // OPCIONAL: También puedes auditar el registro de usuarios
        this.auditClient.emit('audit_log', {
            user: 'SISTEMA',
            action: 'NUEVO_USUARIO',
            details: `Se registró el usuario ${body.username}`
        });

        return { message: 'Usuario creado con éxito', success: true };
     } catch (error) {
        console.error("Error al guardar usuario:", error);
        return { message: 'Error al guardar en base de datos', success: false };
     }
  }
  
  async getUser(username: string) {
    return this.userRepo.findOneBy({ username });
  }
}