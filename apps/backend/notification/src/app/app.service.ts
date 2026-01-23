import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';

@Injectable()
export class AppService {
  constructor(private readonly httpService: HttpService) {}

  // URL del Webhook (toma la variable de Docker o usa la interna por defecto)
  private readonly n8nWebhookUrl = process.env.N8N_WEBHOOK_URL || 'http://vinculacion_n8n:5678/webhook/email';

  async sendEmail(data: any) {
    console.log(`🚀 [Notification] Reenviando a n8n: ${data.email || 'Sin email'}`);
    
    try {
      // Enviamos el post a n8n
      const response = await lastValueFrom(
        this.httpService.post(this.n8nWebhookUrl, {
          ...data,
          date: new Date().toISOString(),
          source: 'System Microservices'
        })
      );

      console.log('✅ n8n Status:', response.status);
    } catch (error: any) { // 👈 'any' evita el error de tipado en .message
      console.error('❌ Error n8n:', error.message);
      
      if (error.code === 'ECONNREFUSED') {
        console.error('👉 Tip: Revisa que el contenedor vinculacion_n8n esté corriendo.');
      }
    }
  }
}