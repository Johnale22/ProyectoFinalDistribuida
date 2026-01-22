import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ClientProxy } from '@nestjs/microservices';
import { Enrollment, EnrollmentDocument } from './enrollment.schema';

@Injectable()
export class AppService {
  constructor(
    @InjectModel(Enrollment.name) private model: Model<EnrollmentDocument>,
    
    // Clientes para comunicación entre microservicios
    @Inject('PROJECT_SERVICE') private projectClient: ClientProxy, 
    @Inject('NOTIFICATION_SERVICE') private notificationClient: ClientProxy,
    @Inject('REPORTING_SERVICE') private reportingClient: ClientProxy,
  ) {}

  // ✅ 1. Crear Inscripción (CORREGIDO)
  async create(data: any) {
    // 🛠️ FIX: Aseguramos que studentId tenga un valor.
    // Si el frontend no manda 'studentId', usamos 'studentName' o 'username' como respaldo.
    const idToUse = data.studentId || data.studentName || data.username;

    if (!idToUse) {
      throw new Error("Error de Validación: Falta el ID del estudiante (studentId).");
    }

    const created = new this.model({
        ...data,
        studentId: idToUse, // ✅ Asignamos explícitamente el ID
        // Aseguramos que studentName también se guarde por si acaso
        studentName: data.studentName || idToUse, 
        status: 'PENDING', 
        date: new Date()
    });
    
    await created.save();
    return { success: true, message: 'Postulación enviada correctamente.' };
  }

  // 2. Buscar Pendientes (Para el Tutor)
  async findPending() {
    const results = await this.model.find({ status: 'PENDING' }).exec();
    return results;
  }

  // 3. Gestionar (Aprobar/Rechazar)
  async manage(id: string, status: string) {
    const enrollment = await this.model.findById(id);
    if (!enrollment) return { success: false, message: 'Inscripción no encontrada' };

    enrollment.status = status;
    await enrollment.save();

    // BLOQUE A: Si se APRUEBA
    if (status === 'APPROVED') {
        this.projectClient.emit('enrollment_approved', { 
            projectId: enrollment.projectId, 
            studentName: enrollment.studentName 
        });

        this.reportingClient.emit('enrollment_approved', {
            projectId: enrollment.projectId,
            studentId: enrollment.studentId || 'Anonimo',
            date: new Date()
        });
    }

    // BLOQUE B: Notificar siempre
    this.notificationClient.emit('notify_email', {
        studentName: enrollment.studentName,
        projectId: enrollment.projectId,
        status: status
    });

    return { success: true };
  }
  
  // ✅ 4. Mis Inscripciones (CORREGIDO)
  findMyEnrollments(username: string) {
    // Buscamos tanto por 'studentId' como por 'studentName' para asegurar compatibilidad
    return this.model.find({ 
      $or: [
        { studentId: username },
        { studentName: username }
      ]
    }).exec();
  }

  // 5. Obtener Aprobados
  async getApproved() {
    return this.model.find({ status: 'APPROVED' }).exec();
  }

  // 6. Guardar URL del reporte
  async updateReport(studentId: string, url: string) {
    console.log(`📎 Guardando reporte para ${studentId}: ${url}`);
    
    // Buscamos la inscripción activa (APPROVED)
    const enrollment = await this.model.findOne({ 
        studentId: studentId, 
        status: 'APPROVED'
    }).sort({ createdAt: -1 });

    if (!enrollment) {
        throw new NotFoundException(`No se encontró una inscripción aprobada para el estudiante: ${studentId}`);
    }

    enrollment.reportUrl = url;
    return enrollment.save();
  }
}