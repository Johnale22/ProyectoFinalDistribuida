import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  sendEmail(data: any) {
    console.log("=================================================");
    console.log("📧 [NOTIFICATION] SIMULANDO ENVÍO DE CORREO");
    console.log(`👤 Para: ${data.studentName}`);
    console.log(`📢 Estado: ${data.status}`);
    console.log("=================================================");
  }
}