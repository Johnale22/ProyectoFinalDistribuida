import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Report, ReportDocument } from './report.schema';

@Injectable()
export class AppService {
  constructor(@InjectModel(Report.name) private reportModel: Model<ReportDocument>) {}

  // Inicializar contadores si no existen
  async onModuleInit() {
    const exists = await this.reportModel.findOne({ type: 'GLOBAL_STATS' });
    if (!exists) {
      await this.reportModel.create({ type: 'GLOBAL_STATS' });
      console.log('📊 Estadísticas inicializadas en 0');
    }
  }

  // 1. Obtener Stats (Para el Dashboard)
  async getStats() {
    return this.reportModel.findOne({ type: 'GLOBAL_STATS' });
  }

  // 2. Evento: Alguien creó un proyecto
  async incrementProjects() {
    await this.reportModel.updateOne({ type: 'GLOBAL_STATS' }, { $inc: { totalProjects: 1 } });
    console.log('📈 Reportes: +1 Proyecto');
  }

  // 3. Evento: Alguien fue aprobado (Viene de Enrollment)
  async handleApprovedEnrollment(data: any) {
    console.log(`📨 Evento Recibido: Estudiante aprobado en proyecto ${data.projectId}`);
    // Sumamos 1 inscripción y (por ejemplo) 160 horas por defecto
    await this.reportModel.updateOne(
        { type: 'GLOBAL_STATS' }, 
        { $inc: { totalEnrollments: 1, totalHours: 160 } }
    );
  }
}