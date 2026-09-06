import { IsString, IsNotEmpty, IsOptional, IsInt, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateProjectDto {
  @ApiProperty({ 
    example: 'Botanika - Smart Plant', 
    description: 'Nazwa tworzonego projektu' 
  })
  @IsString({ message: 'Nazwa musi być tekstem' })
  @IsNotEmpty({ message: 'Nazwa nie może być pusta' })
  name: string;

  @ApiPropertyOptional({ 
    example: 'Aplikacja do zarządzania nawodnieniem kwiatów domowych', 
    description: 'Krótki opis pomysłu na projekt' 
  })
  @IsString({ message: 'Opis musi być tekstem' })
  @IsOptional()
  description?: string;

  @ApiProperty({ 
    example: 3, 
    description: 'Liczba potrzebnych osób do zespołu' 
  })
  @IsInt({ message: 'Liczba osób musi być liczbą całkowitą' })
  @Min(1, { message: 'Projekt wymaga co najmniej 1 osoby' })
  peopleNeeded: number;
}