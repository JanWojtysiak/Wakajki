import { IsString, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class RequestProjectDto {
  @ApiPropertyOptional({
    example: 'Znam Reacta i chętnie pomogę z frontendem',
    description: 'Dlaczego chcesz dołączyć do projektu',
  })
  @IsString({ message: 'Wiadomość musi być tekstem' })
  @IsOptional()
  message?: string;
}
