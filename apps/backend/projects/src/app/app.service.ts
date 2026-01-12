import { Injectable, Inject, BadRequestException, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ClientProxy } from '@nestjs/microservices';
import type { ClientGrpc } from '@nestjs/microservices';
import { Repository } from 'typeorm';
import { Project } from './project.entity';
import { lastValueFrom, Observable } from 'rxjs'; // <--- AGREGAR OBSERVABLE AQUÍ

// Interfaz corregida: Debe devolver un Observable
interface ValidationGrpcService {
  validateStudent(data: { studentName: string }): Observable<any>; 
}

@Injectable()
export class AppService implements OnModuleInit {
  // SOLUCIÓN AQUÍ: Agregamos el signo '!' para evitar el error rojo
  private validationService!: ValidationGrpcService; 

  constructor(
    @InjectRepository(Project)
    private projectRepo: Repository<Project>,
    
    @Inject('ENROLLMENT_SERVICE') private client: ClientProxy,
    @Inject('AUDIT_SERVICE') private auditClient: ClientProxy,
    
    @Inject('VALIDATION_PACKAGE') private clientGrpc: ClientGrpc, 
  ) {}

  onModuleInit() {
    this.validationService = this.clientGrpc.getService<ValidationGrpcService>('ValidationService');
  }

  async getAllProjects() {
    return this.projectRepo.find();
  }

  async createProject(data: { title: string; description: string; max_quota: number }) {
    const newProject = this.projectRepo.create(data);
    return this.projectRepo.save(newProject);
  }

  async enrollStudent(projectId: string, studentName: string) {
    
    // --- 1. VALIDACIÓN VÍA gRPC ---
    console.log(`📞 (gRPC) Validando a ${studentName}...`);
    
    try {
      const data = await lastValueFrom(
        this.validationService.validateStudent({ studentName })
      );

      if (!data.allowed) {
        throw new BadRequestException(`⛔ VALIDACIÓN FALLIDA: ${data.reason}`);
      }
      console.log("✅ Validación gRPC exitosa. Semestre:", data.semester);

    } catch (error) {
      if (error instanceof BadRequestException) throw error;
      console.error("Error gRPC (¿Está encendido validation-service?):", error);
      // Si falla gRPC, puedes decidir si lanzar error o dejar pasar (Fail Open)
      // throw new BadRequestException('Error de conexión con validación');
    }

    // --- 2. LÓGICA DE NEGOCIO ---
    const project = await this.projectRepo.findOneBy({ id: projectId });
    if (!project) throw new BadRequestException('Proyecto no encontrado');

    if (project.enrolled >= project.max_quota) {
      throw new BadRequestException('❌ Sin cupos.');
    }

    project.enrolled += 1;
    await this.projectRepo.save(project);

    // --- 3. EVENTOS (RabbitMQ) ---
    const payload = { projectId: project.id, projectTitle: project.title, studentName, date: new Date() };
    this.client.emit('student_enrolled', payload);
    this.auditClient.emit('student_enrolled', payload);

    return { success: true, message: 'Inscripción exitosa (gRPC + RabbitMQ)' };
  }
}