import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Report, ReportDocument } from './reporting.schema';

@Injectable()
export class AppService implements OnModuleInit {
  constructor(@InjectModel(Report.name) private reportModel: Model<ReportDocument>) {}

  async onModuleInit() {
    // Inicializar datos base si está vacío
    const exists = await this.reportModel.findOne();
    if (!exists) {
      await this.reportModel.create({
        totalStudents: 100, // Datos simulados iniciales
        totalProjects: 15,
        approvedEnrollments: 0,
        projectsByFaculty: { 'Ingeniería': 5, 'Medicina': 3 }
      });
      console.log('📊 Estadísticas iniciales creadas en Mongo');
    }
  }

  async getStats() {
    return this.reportModel.findOne().exec();
  }

  // Lógica para incrementar el contador cuando llega un evento
  async incrementApprovedStats(data: any) {
    // Buscamos el documento de estadísticas (asumimos que solo hay uno global)
    const stats = await this.reportModel.findOne();
    if (stats) {
        stats.approvedEnrollments += 1;
        await stats.save();
        console.log('📈 Estadísticas actualizadas (+1 Aprobado)');
    }
  }
}