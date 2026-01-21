import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';

@Injectable()
export class AppService {
  constructor(private readonly httpService: HttpService) {}

  // CAMBIA ESTO POR TU URL REAL DE N8N CUANDO LO TENGAS
  private readonly n8nWebhookUrl = process.env.N8N_WEBHOOK_URL || 'http://localhost:5678/webhook/correo-vinculacion';

  async sendWelcomeEmail(email: string, name: string) {
    console.log(`🚀 Enviando datos a n8n para dar la bienvenida a: ${email}`);
    
    try {
      await lastValueFrom(
        this.httpService.post(this.n8nWebhookUrl, {
          type: 'WELCOME',
          email: email,
          name: name,
          message: 'Bienvenido al Sistema de Vinculación UCE'
        })
      );
      console.log('✅ Webhook de n8n disparado exitosamente.');
    } catch (error) {
      console.error('❌ Error contactando a n8n. ¿Está prendido?', error.message);
    }
  }

  async sendApprovalEmail(email: string, project: string) {
    console.log(`🚀 Enviando datos a n8n para aprobación de: ${email}`);

    try {
      await lastValueFrom(
        this.httpService.post(this.n8nWebhookUrl, {
          type: 'APPROVAL',
          email: email,
          project: project,
          message: 'Tu postulación ha sido APROBADA.'
        })
      );
      console.log('✅ Webhook de n8n disparado exitosamente.');
    } catch (error) {
      console.error('❌ Error contactando a n8n:', error.message);
    }
  }
}