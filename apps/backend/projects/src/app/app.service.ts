import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Project } from './project.entity';

@Injectable()
export class AppService {
  constructor(
    @InjectRepository(Project) private projectRepo: Repository<Project>
  ) {}

  // HTTP: Listar
  findAll() { return this.projectRepo.find(); }

  // HTTP: Crear
  create(data: any) { 
    console.log("💾 [Projects] Guardando nuevo proyecto:", data.title);
    return this.projectRepo.save(this.projectRepo.create(data)); 
  }

  // RABBITMQ: Reducir Cupo
  async reduceQuota(projectId: number) {
    const id = Number(projectId);
    const project = await this.projectRepo.findOneBy({ id });
    if (project) {
        project.enrolled += 1;
        await this.projectRepo.save(project);
        console.log(`🐰 [Projects] Cupo actualizado. Proyecto #${id} tiene ${project.enrolled} inscritos.`);
    }
  }
}