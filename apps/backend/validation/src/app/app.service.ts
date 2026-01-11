import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  
  // Lista simulada de estudiantes que NO pueden inscribirse
  private bannedStudents = [
    'Kevin Sancionado', 
    'Estudiante Irregular',
    'Bad Guy'
  ];

  validateStudent(studentName: string) {
    // 1. Verificar si está baneado
    if (this.bannedStudents.includes(studentName)) {
      return { 
        allowed: false, 
        reason: 'El estudiante tiene sanciones disciplinarias vigentes.' 
      };
    }

    // 2. Simular validación de semestre (aleatorio para demo)
    // En vida real, consultarías al sistema académico central
    const currentSemester = Math.floor(Math.random() * 10) + 1; // 1 a 10
    
    if (currentSemester < 6) {
      return {
        allowed: false,
        reason: `Estudiante en ${currentSemester}° semestre. Se requiere mínimo 6° semestre.`
      };
    }

    // 3. Si pasa todo
    return { allowed: true, semester: currentSemester };
  }
}