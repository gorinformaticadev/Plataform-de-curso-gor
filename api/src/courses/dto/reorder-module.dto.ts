import { IsString, IsNumber, IsArray, ValidateNested, ArrayMinSize, IsInt, Min, IsNotEmpty } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class ModuleReorderDto {
  @ApiProperty({ 
    example: 'uuid-do-modulo',
    description: 'ID único do módulo'
  })
  @IsString()
  @IsNotEmpty()
  id: string;

  @ApiProperty({ 
    example: 0,
    description: 'Nova posição do módulo (começando em 0)'
  })
  @IsNumber()
  @IsInt()
  @Min(0)
  order: number;
}

export class ReorderModulesDto {
  @ApiProperty({ 
    type: [ModuleReorderDto],
    description: 'Lista de módulos com suas novas posições',
    example: [
      { id: 'uuid-modulo-1', order: 0 },
      { id: 'uuid-modulo-2', order: 1 },
      { id: 'uuid-modulo-3', order: 2 }
    ]
  })
  @IsArray()
  @ArrayMinSize(1, { message: 'Lista de módulos não pode estar vazia' })
  @ValidateNested({ each: true })
  @Type(() => ModuleReorderDto)
  modules: ModuleReorderDto[];
}