import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

import { ModulesService } from './modules.service';
import { LessonsService } from './lessons.service';
import { CreateModuleDto } from './dto/create-module.dto';
import { UpdateModuleDto } from './dto/update-module.dto';
import { ReorderModulesDto } from './dto/reorder-module.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Módulos')
@Controller('modules')
export class ModulesController {
  constructor(
    private readonly modulesService: ModulesService,
    private readonly lessonsService: LessonsService
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Criar novo módulo' })
  @ApiResponse({ status: 201, description: 'Módulo criado com sucesso' })
  create(@Body() createModuleDto: CreateModuleDto, @Request() req) {
    return this.modulesService.create(createModuleDto, req.user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar módulo por ID' })
  @ApiResponse({ status: 200, description: 'Dados do módulo' })
  @ApiResponse({ status: 404, description: 'Módulo não encontrado' })
  findOne(@Param('id') id: string) {
    return this.modulesService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Atualizar módulo' })
  @ApiResponse({ status: 200, description: 'Módulo atualizado com sucesso' })
  @ApiResponse({ status: 404, description: 'Módulo não encontrado' })
  @ApiResponse({ status: 403, description: 'Sem permissão para editar' })
  update(
    @Param('id') id: string,
    @Body() updateModuleDto: UpdateModuleDto,
    @Request() req,
  ) {
    return this.modulesService.update(id, updateModuleDto, req.user.id);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Deletar módulo' })
  @ApiResponse({ status: 200, description: 'Módulo deletado com sucesso' })
  @ApiResponse({ status: 404, description: 'Módulo não encontrado' })
  @ApiResponse({ status: 403, description: 'Sem permissão para deletar' })
  remove(@Param('id') id: string, @Request() req) {
    return this.modulesService.remove(id, req.user.id);
  }

  @Patch('reorder')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Reordenar módulos de um curso' })
  @ApiResponse({ 
    status: 200, 
    description: 'Módulos reordenados com sucesso',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: 'Módulos reordenados com sucesso' },
        modules: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              title: { type: 'string' },
              order: { type: 'number' },
              courseId: { type: 'string' }
            }
          }
        }
      }
    }
  })
  @ApiResponse({ status: 403, description: 'Sem permissão para reordenar' })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  @ApiResponse({ status: 404, description: 'Módulo não encontrado' })
  reorder(@Body() reorderModulesDto: ReorderModulesDto, @Request() req) {
    return this.modulesService.reorderModules(reorderModulesDto, req.user.id);
  }

  @Get(':id/lessons')
  @ApiOperation({ summary: 'Buscar aulas de um módulo' })
  @ApiResponse({ status: 200, description: 'Lista de aulas do módulo' })
  @ApiResponse({ status: 404, description: 'Módulo não encontrado' })
  async getModuleLessons(@Param('id') moduleId: string) {
    return this.lessonsService.findByModule(moduleId);
  }
}
