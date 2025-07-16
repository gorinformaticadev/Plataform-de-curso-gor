import { Controller, Get, UseGuards } from '@nestjs/common';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('admin')
@UseGuards(JwtAuthGuard)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('dashboard')
  async getDashboardStats() {
    return this.adminService.getDashboardStats();
  }

  @Get('users/count')
  async getUsersCount() {
    return this.adminService.getUsersCount();
  }

  @Get('courses/count')
  async getCoursesCount() {
    return this.adminService.getCoursesCount();
  }

  @Get('revenue')
  async getRevenue() {
    return this.adminService.getRevenue();
  }

  @Get('recent-activity')
  async getRecentActivity() {
    return this.adminService.getRecentActivity();
  }
}
