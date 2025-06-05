import { CreateCompanyDto } from '../dto/create-company.dto';
import { Company } from '../entities/company.entity';

export interface CompaniesRepositoryI {
  verifyCompanyName(name: string): Promise<Company | null>;
  createCompany(ownerId: string, createCompanyDto: CreateCompanyDto): Promise<void>;
  deleteCompany(companyId: string): Promise<void>;
}
