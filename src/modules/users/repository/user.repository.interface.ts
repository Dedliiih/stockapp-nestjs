import { User } from '../entities/user.entity';

export interface UserRepositoryI {
  findUserByEmail(email: string): Promise<User | null>;
  findUserByPhone(phone: string): Promise<User | null>;
  findUserById(userId: string): Promise<User | null>;
  registerUser(userData: object): Promise<object>;
}
