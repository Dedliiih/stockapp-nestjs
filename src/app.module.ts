import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ProductsModule } from './modules/products/products.module';
import { DatabaseService } from './database/database/database.service';
import { DatabaseModule } from './database/database/database.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { CompaniesModule } from './modules/companies/companies.module';
import { CompanyUsersModule } from './modules/company-users/company-users.module';
import authGuard from './common/guards/auth.guard';
import rolesGuard from './common/guards/roles.guard';

@Module({
  imports: [ProductsModule, DatabaseModule, AuthModule, UsersModule, CompaniesModule, CompanyUsersModule],
  controllers: [AppController],
  providers: [AppService, DatabaseService, authGuard, rolesGuard],
  exports: [DatabaseService],
})
export class AppModule {}
