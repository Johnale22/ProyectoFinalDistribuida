import { Injectable, Inject } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ClientProxy } from '@nestjs/microservices';
import { Enrollment, EnrollmentDocument } from './enrollment.schema';

@Injectable()
export class AppService {
  constructor(
    @InjectModel(Enrollment.name) private model: Model<EnrollmentDocument>,
    
    // Cliente 1: Projects (Gestión de cupos)
    @Inject('PROJECT_SERVICE') private projectClient: ClientProxy, 
    
    // Cliente 2: Notifications (Correos)
    @Inject('NOTIFICATION_SERVICE') private notificationClient: ClientProxy,
    
    // Cliente 3: Reporting (Estadísticas)
    @Inject('REPORTING_SERVICE') private reportingClient: ClientProxy,
  ) {}

  // Crear
  async create(data: any) {
    const created = new this.model({
        ...data,
        status: 'PENDING', 
        date: new Date()
    });
    await created.save();
    return { success: true, message: 'Postulación enviada correctamente.' };
  }

  // Buscar Pendientes (Para el Tutor)
  async findPending() {
    const results = await this.model.find({ status: 'PENDING' }).exec();
    console.log(`🔎 [Enrollment] Tutor buscó pendientes. Encontrados: ${results.length}`);
    return results;
  }

  // Aprobar/Rechazar
  async manage(id: string, status: string) {
    const enrollment = await this.model.findById(id);
    if (!enrollment) return { success: false, message: 'No encontrado' };

    enrollment.status = status;
    await enrollment.save();

    // BLOQUE 1: Acciones exclusivas cuando se APRUEBA
    if (status === 'APPROVED') {
        // A. Avisar a Projects (Restar cupo)
        this.projectClient.emit('enrollment_approved', { 
            projectId: enrollment.projectId, 
            studentName: enrollment.studentName 
        });

        // B. Avisar a Reporting (Sumar estadística)
        this.reportingClient.emit('enrollment_approved', {
            projectId: enrollment.projectId,
            studentId: enrollment.studentName || 'Anonimo', // Corregido studentId -> studentName para consistencia
            date: new Date()
        });
    }

    // BLOQUE 2: Acciones para APROBADO o RECHAZADO
    // Avisar a Notifications (Enviar correo al estudiante con el resultado)
    this.notificationClient.emit('notify_email', {
        studentName: enrollment.studentName,
        projectId: enrollment.projectId,
        status: status
    });

    return { success: true };
  }
  
  // Buscar del Estudiante
  findMyEnrollments(studentName: string) {
    return this.model.find({ studentName }).exec();
  }

  // 1. Obtener lista de aprobados (Para el Tutor)
  async getApproved() {
    // CORREGIDO: Usamos 'this.model', no 'this.enrollmentModel'
    return this.model.find({ status: 'APPROVED' }).exec();
  }

  // 2. Guardar URL del reporte (Para el Estudiante)
  async updateReport(studentId: string, url: string) {
    console.log(`📎 Guardando reporte para ${studentId}: ${url}`);
    
    // CORREGIDO: Usamos 'this.model', no 'this.enrollmentModel'
    const enrollment = await this.model.findOne({ 
        studentName: studentId,
        status: 'APPROVED'
    });

    if (!enrollment) {
        throw new Error('No se encontró una inscripción aprobada para este estudiante');
    }

    enrollment.reportUrl = url;
    return enrollment.save();
  }
}