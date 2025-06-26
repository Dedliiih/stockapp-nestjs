import { Injectable } from '@nestjs/common';
import { DatabaseService } from 'src/database/database/database.service';
import { CompanyUsersRepositoryI } from './company-users.repository.interface';
import { CompanyUser } from '../entities/company-user-entitie';

@Injectable()
export class CompanyUsersRepository implements CompanyUsersRepositoryI {
  constructor(private readonly databaseService: DatabaseService) {}

  async getCompanyUsers(companyId: string): Promise<CompanyUser[]> {
    const query = 'SELECT u.nombre, u.apellidos, u.email, r.nombre as rol from USUARIOS u LEFT JOIN roles r ON u.rol_id = r.rol_id WHERE empresa_id = 94';
    const result: CompanyUser[] = await this.databaseService.getData(query, companyId);
    return result;
  }

  async deleteCompanyUser(userId: string): Promise<void> {
    const query = 'UPDATE usuarios SET empresa_id = NULL, rol_id = NULL WHERE usuario_id = ?';
    return await this.databaseService.insertData(query, [userId]);
  }

  async updateCompanyUserRole(roleId: string, userId: string): Promise<void> {
    const query = 'UPDATE usuarios SET rol_id = ? WHERE usuario_id = ?';
    const params = [roleId, userId];
    return await this.databaseService.insertData(query, params);
  }
}
