import { DatabaseService } from 'src/database/database/database.service';
import { AuthRepositoryI } from './auth.repository.interface';
import { Injectable } from '@nestjs/common';
import { ResultSetHeader } from 'mysql2';

@Injectable()
class AuthRepository implements AuthRepositoryI {
  constructor(private readonly databaseService: DatabaseService) {}
  async updateRefreshToken(refreshToken: string, userId: string): Promise<ResultSetHeader> {
    const query = 'UPDATE usuarios SET credencial_renovacion = ? WHERE usuario_id = ?';
    const params = [refreshToken, userId];
    return await this.databaseService.transaction([[query, params]]);
  }
}

export default AuthRepository;
