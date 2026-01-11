import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { Agreement } from './agreement.entity'; // Lo creamos en el paso 3

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'admin',
      password: 'adminpassword',
      database: 'vinculacion_db', // Misma DB, diferente tabla
      autoLoadEntities: true,
      synchronize: true,
    }),
    TypeOrmModule.forFeature([Agreement]),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}