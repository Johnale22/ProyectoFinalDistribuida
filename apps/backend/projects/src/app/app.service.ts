import { Injectable, Inject, BadRequestException, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ClientProxy, ClientGrpc } from '@nestjs/microservices'; // Importar ClientGrpc
import { Repository } from 'typeorm';
import { Project } from './project.entity';
import { lastValueFrom } from 'rxjs'; // Usamos lastValueFrom para gRPC

// Interfaz para el autocompletado de gRPC
interface ValidationGrpcService {
  validateStudent(data: { studentName: string }): any;
}

@Injectable()
export class AppService implements OnModuleInit {
  private validationService: ValidationGrpcService; // Aquí guardaremos la instancia gRPC

  constructor(
    @InjectRepository(Project)
    private projectRepo: Repository<Project>,
    
    @Inject('ENROLLMENT_SERVICE') private client: ClientProxy, // RabbitMQ
    @Inject('AUDIT_SERVICE') private auditClient: ClientProxy, // RabbitMQ
    
    @Inject('VALIDATION_PACKAGE') private clientGrpc: ClientGrpc, // Inyección gRPC
  ) {}

  // Se ejecuta al iniciar el módulo para conectar gRPC
  onModuleInit() {
    this.validationService = this.clientGrpc.getService<ValidationGrpcService>('ValidationService');
  }

  // 1. Listar
  async getAllProjects() {
    return this.projectRepo.find();
  }

  // 2. Crear
  async createProject(data: { title: string; description: string; max_quota: number }) {
    const newProject = this.projectRepo.create(data);
    return this.projectRepo.save(newProject);
  }

  // 3. Inscribir con gRPC
  async enrollStudent(projectId: string, studentName: string) {
    
    // --- PASO A: VALIDACIÓN EXTERNA (Vía gRPC) ---
    console.log(`📞 Llamando a Validation Service vía gRPC para ${studentName}...`);
    
    try {
      // Llamada gRPC (mucho más rápida que HTTP)
      const data = await lastValueFrom(
        this.validationService.validateStudent({ studentName })
      );

      if (!data.allowed) {
        throw new BadRequestException(`⛔ VALIDACIÓN FALLIDA: ${data.reason}`);
      }
      console.log("✅ Validación gRPC exitosa. Semestre:", data.semester);

    } catch (error) {
      // Manejo de errores
      if (error instanceof BadRequestException) throw error;
      console.error("Error gRPC:", error);
      // Si falla la conexión, puedes decidir si bloquear o dejar pasar.
      // throw new BadRequestException('Error de comunicación con validación'); 
    }

    // --- PASO B: LÓGICA DE NEGOCIO ---
    const project = await this.projectRepo.findOneBy({ id: projectId });
    if (!project) {
      throw new BadRequestException('Proyecto no encontrado');
    }

    if (project.enrolled >= project.max_quota) {
      throw new BadRequestException('❌ Lo sentimos, ya no hay cupos disponibles.');
    }

    project.enrolled += 1;
    await this.projectRepo.save(project);

    // --- PASO C: EVENTOS RABBITMQ ---
    const payload = {
      projectId: project.id,
      projectTitle: project.title,
      studentName: studentName,
      date: new Date()
    };

    this.client.emit('student_enrolled', payload);
    this.auditClient.emit('student_enrolled', payload);

    return { 
      success: true, 
      message: 'Inscripción procesada correctamente.',
      cupos_restantes: project.max_quota - project.enrolled
    };
  }
}