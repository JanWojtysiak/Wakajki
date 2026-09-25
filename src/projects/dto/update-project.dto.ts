import { IsString, IsOptional, IsInt, Min } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateProjectDto {
  @ApiPropertyOptional({ 
    example: 'Smart Plant v2', 
    description: 'Zaktualizowana nazwa projektu' 
  })
  @IsString({ message: 'Nazwa musi być tekstem' })
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({ 
    example: 'Dodano funkcję powiadomień pogodowych', 
    description: 'Zaktualizowany opis' 
  })
  @IsString({ message: 'Opis musi być tekstem' })
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ 
    example: 4, 
    description: 'Zaktualizowana liczba potrzebnych osób' 
  })
  @IsInt({ message: 'Liczba osób musi być liczbą całkowitą' })
  @Min(1, { message: 'Projekt wymaga co najmniej 1 osoby' })
  @IsOptional()
  peopleNeeded?: number;
}