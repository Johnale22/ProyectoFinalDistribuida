import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Enrollment, EnrollmentDocument } from './reporting.schema';

@Injectable()
export class AppService {
  constructor(@InjectModel(Enrollment.name) private enrollmentModel: Model<EnrollmentDocument>) {}

  async getDashboardStats() {
    // 1. Contar total
    const total = await this.enrollmentModel.countDocuments();

    // 2. Agrupar por Proyecto (Cuántos alumnos tiene cada uno)
    const byProject = await this.enrollmentModel.aggregate([
      { $group: { _id: "$projectTitle", count: { $sum: 1 } } }
    ]);

    // 3. Agrupar por Estado (Cuántos PENDIENTES vs APROBADOS)
    const byStatus = await this.enrollmentModel.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } }
    ]);

    return {
      total_inscripciones: total,
      por_proyecto: byProject,
      estados: byStatus,
      generated_at: new Date()
    };
  }
}