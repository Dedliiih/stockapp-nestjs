import { CompanyUser } from '../entities/company-user-entitie';

export interface CompanyUsersRepositoryI {
  getCompanyUsers(companyId: string): Promise<CompanyUser[]>;
  deleteCompanyUser(userId: string): Promise<void>;
  updateCompanyUserRole(roleId: string, userId: string): Promise<void>;
}
