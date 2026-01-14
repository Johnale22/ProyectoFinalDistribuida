import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Report, ReportDocument } from './report.schema';

@Injectable()
export class AppService {
  constructor(
    @InjectModel(Report.name) private reportModel: Model<ReportDocument>
  ) {}

  async getStats() {
    return this.reportModel.find().exec();
  }

  async updateStat(projectId: any) {
    const title = `Proyecto ID #${projectId}`;
    const report = await this.reportModel.findOne({ projectTitle: title });

    if (report) {
        report.approvedCount += 1;
        report.lastUpdated = new Date();
        await report.save();
    } else {
        const newReport = new this.reportModel({
            projectTitle: title,
            approvedCount: 1,
            lastUpdated: new Date()
        });
        await newReport.save();
    }
    console.log(`📈 ESTADÍSTICA ACTUALIZADA: ${title}`);
  }
}