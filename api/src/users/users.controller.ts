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
  Query,
  UseInterceptors,
  UploadedFile,
  NotFoundException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';
import { join } from 'path';
import * as fs from 'fs';
import * as fsp from 'fs/promises';
import { v4 as uuidv4 } from 'uuid';
import * as sharp from 'sharp';

import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/guards/roles.guard';
import { UserRole } from '@prisma/client';

@ApiTags('Usuários')
@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Criar usuário (Admin)' })
  @ApiResponse({ status: 201, description: 'Usuário criado com sucesso' })
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todos os usuários' })
  @ApiResponse({ status: 200, description: 'Lista de usuários' })
  findAll(
    @Query('role') role?: any,
    @Query('searchTerm') searchTerm?: string,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
    @Query('isActive') isActive?: string,
  ) {
    const pageNumber = page ? parseInt(page, 10) : 1;
    const pageSizeNumber = pageSize ? parseInt(pageSize, 10) : 10;
    return this.usersService.findAll(role, searchTerm, pageNumber, pageSizeNumber, isActive);
  }

  @Get('students/count')
  @ApiOperation({ summary: 'Obter o número total de estudantes' })
  @ApiResponse({ status: 200, description: 'Número total de estudantes' })
  getTotalStudents() {
    return this.usersService.getTotalStudents();
  }

  @Get('students/new-last-month')
  @ApiOperation({ summary: 'Obter o número de novos estudantes no último mês' })
  @ApiResponse({ status: 200, description: 'Número de novos estudantes' })
  getNewStudentsLastMonth() {
    return this.usersService.getNewStudentsLastMonth();
  }

  @Get('profile')
  @ApiOperation({ summary: 'Obter perfil do usuário logado' })
  @ApiResponse({ status: 200, description: 'Dados do perfil' })
  getProfile(@Request() req) {
    return this.usersService.findById(req.user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar usuário por ID' })
  @ApiResponse({ status: 200, description: 'Dados do usuário' })
  @ApiResponse({ status: 404, description: 'Usuário não encontrado' })
  findOne(@Param('id') id: string) {
    return this.usersService.findById(id);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Atualizar usuário (Admin)' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FileInterceptor('file', {
      fileFilter: (req, file, cb) => {
        if (!file.originalname.match(/\.(jpg|png)$/i)) {
          return cb(new Error('Apenas imagens JPG e PNG são permitidas!'), false);
        }
        cb(null, true);
      },
    }),
  )
  async update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    if (file) {
      const user = await this.usersService.findById(id);
      if (!user) {
        throw new NotFoundException('Usuário não encontrado');
      }

      if (user.avatar) {
        const oldAvatarPath = join(process.cwd(), 'public', user.avatar);
        try {
          await fsp.unlink(oldAvatarPath);
        } catch (error) {
          if (error.code !== 'ENOENT') {
            console.error(`Falha ao deletar avatar antigo: ${oldAvatarPath}`, error);
          }
        }
      }
      
      const filename = `${uuidv4()}.webp`;
      const uploadPath = join(process.cwd(), 'public', 'uploads', 'avatars');

      if (!fs.existsSync(uploadPath)) {
        fs.mkdirSync(uploadPath, { recursive: true });
      }

      await sharp(file.buffer)
        .resize(200, 200)
        .webp({ quality: 80 })
        .toFile(join(uploadPath, filename));

      updateUserDto.avatar = `/uploads/avatars/${filename}`;
    }

    return this.usersService.update(id, updateUserDto);
  }

  @Patch(':id/deactivate')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Desativar usuário (Admin)' })
  @ApiResponse({ status: 200, description: 'Usuário desativado com sucesso' })
  @ApiResponse({ status: 404, description: 'Usuário não encontrado' })
  deactivate(@Param('id') id: string) {
    return this.usersService.deactivate(id);
  }

  @Patch(':id/activate')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Ativar usuário (Admin)' })
  @ApiResponse({ status: 200, description: 'Usuário ativado com sucesso' })
  @ApiResponse({ status: 404, description: 'Usuário não encontrado' })
  activate(@Param('id') id: string) {
    return this.usersService.activate(id);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Deletar usuário (Admin)' })
  @ApiResponse({ status: 200, description: 'Usuário deletado com sucesso' })
  @ApiResponse({ status: 404, description: 'Usuário não encontrado' })
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }
}
