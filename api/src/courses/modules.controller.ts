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
import { CreateModuleDto } from './dto/create-module.dto';
import { UpdateModuleDto } from './dto/update-module.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Módulos')
@Controller('modules')
export class ModulesController {
  constructor(private readonly modulesService: ModulesService) {}

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
  @ApiOperation({ summary: 'Reordenar módulos' })
  @ApiResponse({ status: 200, description: 'Ordem dos módulos atualizada com sucesso' })
  @ApiResponse({ status: 403, description: 'Sem permissão para reordenar' })
  async reorder(@Body() body: { modules: { id: string; order: number }[] }, @Request() req) {
    return this.modulesService.reorderModules(body.modules, req.user.id);
  }
}