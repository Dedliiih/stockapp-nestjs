import { Module } from '@nestjs/common';
import { CompanyUsersController } from './company-users.controller';
import { CompanyUsersService } from './company-users.service';
import { DatabaseService } from 'src/database/database/database.service';
import { CompanyUsersRepository } from './repository/company-users.repository';

@Module({
  controllers: [CompanyUsersController],
  providers: [CompanyUsersService, DatabaseService, CompanyUsersRepository],
})
export class CompanyUsersModule {}
