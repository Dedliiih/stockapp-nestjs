import { Injectable } from '@nestjs/common';
import { UserRepositoryI } from './user.repository.interface';
import { DatabaseService } from 'src/database/database/database.service';
import { User } from '../entities/user.entity';
import { RegisterUserDto } from '../dto/register-user.dto';

@Injectable()
class UserRepository implements UserRepositoryI {
  constructor(private readonly databaseService: DatabaseService) {}

  async findUserByEmail(email: string): Promise<User | null> {
    const query: string = 'SELECT usuario_id, nombre, apellidos, email, rol_id, empresa_id, contrasena FROM usuarios WHERE email = ?';
    const result: User[] = await this.databaseService.getData(query, [email]);
    return result.length == 0 ? null : result[0];
  }

  async findUserByPhone(phone: string): Promise<User | null> {
    const query: string = 'SELECT usuario_id, nombre, apellidos, email, rol_id, empresa_id, contrasena FROM usuarios WHERE telefono = ?';
    const result: User[] = await this.databaseService.getData(query, [phone]);
    return result.length == 0 ? null : result[0];
  }

  async findUserById(userId: string): Promise<User | null> {
    const query: string = 'SELECT usuario_id, nombre, apellidos, email, rol_id, empresa_id, contrasena FROM usuarios WHERE usuario_id = ?';
    const result: User[] = await this.databaseService.getData(query, [userId]);
    return result.length == 0 ? null : result[0];
  }

  async registerUser(userData: RegisterUserDto): Promise<object> {
    const query: string = 'INSERT INTO usuarios (nombre, apellidos, contrasena, email, telefono, fecha) VALUES (?, ?, ?, ?, ?, ?)';

    const date = new Date();

    return await this.databaseService.insertData(query, [userData.name, userData.lastName, userData.password, userData.email, userData.phone, date]);
  }
}

export default UserRepository;
