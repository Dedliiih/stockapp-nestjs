import { Injectable } from '@nestjs/common';
import { CompaniesRepositoryI } from './companies.repository.interface';
import { Company } from '../entities/company.entity';
import { DatabaseService } from 'src/database/database/database.service';
import { CreateCompanyDto } from '../dto/create-company.dto';
import { Role } from 'src/common/enums/role.enum';
import { UpdateCompanyDto } from '../dto/update-company.dto';

@Injectable()
export class CompaniesRepository implements CompaniesRepositoryI {
  constructor(private readonly databaseService: DatabaseService) {}

  async verifyCompanyName(name: string): Promise<Company | null> {
    const query: string = 'SELECT nombre FROM empresas WHERE nombre = ?';
    const result: Company[] = await this.databaseService.getData(query, name);
    return result.length == 0 ? null : result[0];
  }

  async createCompany(ownerId: string, createCompanyDto: CreateCompanyDto): Promise<any> {
    const creationDate = new Date();
    const ownerRol = Role.Ceo;
    const queries: any[] = [
      [
        'INSERT into empresas (nombre, fecha, email, telefono, creador_id) VALUES (?, ?, ?, ?, ?)',
        [createCompanyDto.name, creationDate, createCompanyDto.email, createCompanyDto.phone, ownerId],
      ],
      ['UPDATE usuarios set rol_id = ? WHERE usuario_id = ?', [ownerRol, ownerId]],
      ['UPDATE usuarios set empresa_id = ? WHERE usuario_id = ?', [':lastInsertId', ownerId]],
    ];
    return await this.databaseService.transaction(queries);
  }

  async deleteCompany(companyId: string): Promise<void> {
    const queries: any[] = [
      ['UPDATE usuarios SET rol_id = NULL, empresa_id = NULL WHERE empresa_id = ?', [companyId]],
      ['DELETE FROM productos WHERE empresa_id = ?', [companyId]],
      ['DELETE FROM empresas WHERE empresa_id = ?', [companyId]],
    ];
    return await this.databaseService.transaction(queries);
  }

  async updateCompany(companyId: string, companyData: UpdateCompanyDto): Promise<void> {
    const query: string =
      'UPDATE empresas SET nombre = IFNULL(?, nombre), email = IFNULL(?, email), telefono = IFNULL(?, telefono) WHERE empresa_id = ?';
    const params = [companyData.name, companyData.email, companyData.phone, companyId];

    return await this.databaseService.insertData(query, params);
  }
}
