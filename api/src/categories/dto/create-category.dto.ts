import { IsString, IsOptional, MaxLength, Matches } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCategoryDto {
  @ApiProperty({ example: 'Programação' })
  @IsString()
  @MaxLength(100)
  name: string;

  @ApiProperty({ example: 'programacao' })
  @IsString()
  @Matches(/^[a-z0-9-]+$/, { 
    message: 'Slug deve conter apenas letras minúsculas, números e hifens' 
  })
  slug: string;

  @ApiPropertyOptional({ example: 'Cursos de programação e desenvolvimento' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @ApiPropertyOptional({ example: '💻' })
  @IsOptional()
  @IsString()
  @MaxLength(10)
  icon?: string;

  @ApiPropertyOptional({ example: true, default: true })
  @IsOptional()
  isActive?: boolean;
}
