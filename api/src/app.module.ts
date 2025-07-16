import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';

import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { CoursesModule } from './courses/courses.module';
import { CategoriesModule } from './categories/categories.module';
import { PaymentsModule } from './payments/payments.module';
import { ProgressModule } from './progress/progress.module';
import { AdminModule } from './admin/admin.module';

@Module({
  imports: [
    // Configuração de ambiente
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    
    // Rate limiting
    ThrottlerModule.forRoot([{
      ttl: 60000, // 1 minuto
      limit: 100, // 100 requests por minuto
    }]),

    // Módulos da aplicação
    PrismaModule,
    AuthModule,
    UsersModule,
    CoursesModule,
    CategoriesModule,
    PaymentsModule,
    ProgressModule,
    AdminModule,
  ],
})
export class AppModule {}
