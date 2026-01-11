import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Enrollment, EnrollmentDocument } from './enrollment.schema';

@Injectable()
export class AppService {
  constructor(
    @InjectModel(Enrollment.name) private enrollmentModel: Model<EnrollmentDocument>
  ) {}

  // 1. Guardar nueva inscripción (Viene de RabbitMQ)
  async createEnrollment(data: any) {
    const createdEnrollment = new this.enrollmentModel(data);
    return createdEnrollment.save();
  }

  // 2. Listar todas las inscripciones (Para el Tutor)
  async getAllEnrollments() {
    return this.enrollmentModel.find().exec();
  }
}