import { Module } from '@nestjs/common';
import { CompaniesController } from './companies.controller';
import { CompaniesService } from './companies.service';
import { DatabaseService } from 'src/database/database/database.service';
import { CompaniesRepository } from './repository/companies.repository';
import { AuthService } from '../auth/auth.service';
import { UsersModule } from '../users/users.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [UsersModule, AuthModule],
  controllers: [CompaniesController],
  providers: [CompaniesService, DatabaseService, CompaniesRepository, AuthService]
})
export class CompaniesModule {}
