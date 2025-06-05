import { Injectable } from '@nestjs/common';
import { CompanyUsersRepository } from './repository/company-users.repository';

@Injectable()
export class CompanyUsersService {
  constructor(private readonly companyUsersRepository: CompanyUsersRepository) {}
  async getCompanyUsers(companyId: string) {
    return await this.companyUsersRepository.getCompanyUsers(companyId);
  }

  async deleteCompanyUser(userId: string) {
    return await this.companyUsersRepository.deleteCompanyUser(userId);
  }

  async updateCompanyUserRole(roleId: string, userId: string) {
    return await this.companyUsersRepository.updateCompanyUserRole(roleId, userId);
  }
}
