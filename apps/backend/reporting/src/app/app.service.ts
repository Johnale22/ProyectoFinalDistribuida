import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Report, ReportDocument } from './reporting.schema';

@Injectable()
export class AppService implements OnModuleInit {
  constructor(@InjectModel(Report.name) private reportModel: Model<ReportDocument>) {}

  async onModuleInit() {
    // Si no hay datos, creamos unos iniciales para probar
    const exists = await this.reportModel.findOne();
    if (!exists) {
      await this.reportModel.create({
        totalStudents: 100,
        totalProjects: 15,
        approvedEnrollments: 5,
        projectsByFaculty: { 'Ingeniería': 5, 'Medicina': 3 }
      });
      console.log('📊 Estadísticas iniciales creadas en Mongo');
    }
  }

  async getStats() {
    return this.reportModel.findOne().exec();
  }

  async incrementApprovedStats(data: any) {
    const stats = await this.reportModel.findOne();
    if (stats) {
        stats.approvedEnrollments += 1;
        await stats.save();
        console.log('📈 Estadísticas actualizadas (+1 Aprobado)');
    }
  }
}