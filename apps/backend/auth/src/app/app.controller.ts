import { Controller, Get, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';

@Controller()
export class AppController {
  // Inyectamos el cliente que configuramos en el Module
  constructor(@Inject('ENROLLMENT_SERVICE') private client: ClientProxy) {}

  @Get()
  getData() {
    // 1. Enviamos el mensaje a la cola (Event Pattern)
    // El primer argumento 'nuevo_usuario' es el "Asunto" del mensaje
    // El segundo argumento es el "Cuerpo" (los datos)
    this.client.emit('nuevo_usuario', { 
      nombre: 'John Doe', 
      email: 'john@uce.edu.ec',
      fecha: new Date() 
    });

    return { message: 'Mensaje enviado a RabbitMQ. ¡Revisa la otra terminal!' };
  }
}