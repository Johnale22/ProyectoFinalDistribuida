import { Body, Controller, Get, Post, Param } from '@nestjs/common';
import { AppService } from './app.service';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger'; // <--- IMPORTAR

@ApiTags('Projects') // Agrupa los endpoints
@Controller('projects')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @ApiOperation({ summary: 'Listar proyectos disponibles' }) // Descripción del botón
  @ApiResponse({ status: 200, description: 'Devuelve array de proyectos.' })
  getData() {
    return this.appService.getAllProjects();
  }

  @Post()
  @ApiOperation({ summary: 'Crear nuevo proyecto (Solo Tutores)' })
  create(@Body() body: any) {
    return this.appService.createProject(body);
  }

  @Post(':id/enroll')
  @ApiOperation({ summary: 'Inscribir estudiante en un proyecto' })
  enroll(@Param('id') id: string, @Body() body: { studentName: string }) {
    return this.appService.enrollStudent(id, body.studentName || 'Estudiante Anónimo');
  }
}