import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  
  // Simulación: Validar si un estudiante puede vincularse
  validateStudent(studentId: string, projectCode: string) {
    console.log(`🔍 Validando estudiante ${studentId} para el proyecto ${projectCode}...`);

    // LOGICA FICTICIA DE NEGOCIO:
    // 1. Si el ID termina en "000", está bloqueado por sanciones.
    if (studentId.endsWith('000')) {
      return { 
        canEnroll: false, 
        reason: 'El estudiante tiene sanciones disciplinarias pendientes.' 
      };
    }

    // 2. Si el ID termina en "111", ya completó sus horas.
    if (studentId.endsWith('111')) {
      return { 
        canEnroll: false, 
        reason: 'El estudiante ya completó el máximo de horas de vinculación.' 
      };
    }

    // 3. Caso feliz
    return { 
      canEnroll: true, 
      reason: 'Estudiante apto. Cumple con el 70% de créditos aprobados.' 
    };
  }
}