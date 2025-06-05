import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateCompanyDto } from './dto/create-company.dto';
import { CompaniesRepository } from './repository/companies.repository';
import { UpdateCompanyDto } from './dto/update-company.dto';

@Injectable()
export class CompaniesService {
  constructor(private readonly companiesRepository: CompaniesRepository) {}

  async createCompany(ownerId: string, createCompanyDto: CreateCompanyDto) {
    const verifyCompanyName = await this.companiesRepository.verifyCompanyName(createCompanyDto.name);

    if (verifyCompanyName) throw new BadRequestException('Ya existe una empresa con este nombre');

    return await this.companiesRepository.createCompany(ownerId, createCompanyDto);
  }

  async deleteCompany(companyId: string) {
    await this.companiesRepository.deleteCompany(companyId);
  }

  async updateCompany(companyId: string, companyData: UpdateCompanyDto) {
    await this.companiesRepository.updateCompany(companyId, companyData);
  }
}
