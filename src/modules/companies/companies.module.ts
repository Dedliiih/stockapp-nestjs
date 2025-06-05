import { Module } from '@nestjs/common';
import { CompaniesController } from './companies.controller';
import { CompaniesService } from './companies.service';
import { DatabaseService } from 'src/database/database/database.service';
import { CompaniesRepository } from './repository/companies.repository';
import { AuthService } from '../auth/auth.service';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [UsersModule],
  controllers: [CompaniesController],
  providers: [CompaniesService, DatabaseService, CompaniesRepository, AuthService],
})
export class CompaniesModule {}
