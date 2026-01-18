import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  
  async sendEmail(data: any) {
    console.log('--------------------------------------------------');
    console.log(`📧 ENVIANDO CORREO A: ${data.studentName}@uce.edu.ec`);
    
    if (data.status === 'APPROVED') {
        console.log(`✅ ASUNTO: ¡Felicidades! Aceptado en ${data.projectTitle}`);
        console.log(`📝 MENSAJE: Estimado estudiante, su solicitud ha sido aprobada. Por favor suba su hoja de registro.`);
    } else {
        console.log(`❌ ASUNTO: Actualización de su solicitud`);
        console.log(`📝 MENSAJE: Lo sentimos, su solicitud para ${data.projectTitle} no fue aceptada.`);
    }
    console.log('--------------------------------------------------');
    
    return { success: true };
  }
}