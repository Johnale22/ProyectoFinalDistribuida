import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Agreement } from './agreement.entity';

@Injectable()
export class AppService {
  constructor(
    @InjectRepository(Agreement)
    private agreementRepo: Repository<Agreement>,
  ) {}

  // 1. Listar convenios
  async getAll() {
    return this.agreementRepo.find();
  }

  // 2. Crear convenio (Coordinador)
  async create(data: any) {
    const newItem = this.agreementRepo.create(data);
    return this.agreementRepo.save(newItem);
  }
}