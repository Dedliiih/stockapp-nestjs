import { ResultSetHeader } from 'mysql2';

export interface AuthRepositoryI {
  updateRefreshToken(refreshToken: string, userId: string): Promise<ResultSetHeader>;
}
