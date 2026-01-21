import { IsString, IsNotEmpty, IsNumber, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateProjectDto {
  @ApiProperty({ example: 'Vinculación GAD', description: 'Título del proyecto' })
  @IsString({ message: 'El título debe ser texto' })
  @IsNotEmpty({ message: 'El título es obligatorio' })
  title: string;

  @ApiProperty({ example: 'Ayuda comunitaria...', description: 'Descripción detallada' })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({ example: 20, description: 'Cupos disponibles' })
  @IsNumber({}, { message: 'El cupo debe ser un número' })
  @Min(1, { message: 'Mínimo 1 cupo' })
  max_quota: number;
}