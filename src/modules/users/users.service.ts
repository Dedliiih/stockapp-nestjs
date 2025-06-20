import { BadRequestException, Injectable } from '@nestjs/common';
import { User } from './entities/user.entity';
import UserRepository from './repository/user.repository';
import { RegisterUserDto } from './dto/register-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(private readonly userRepository: UserRepository) {}

  async findUserByEmail(email: string): Promise<User | null> {
    return await this.userRepository.findUserByEmail(email);
  }

  async findUserByPhone(phone: string): Promise<User | null> {
    return await this.userRepository.findUserByPhone(phone);
  }

  async findUserById(userId: string): Promise<User | null> {
    return await this.userRepository.findUserById(userId);
  }

  async registerUser(userData: RegisterUserDto) {
    const [verifyEmail, verifyPhoneNumber] = await Promise.all([this.findUserByEmail(userData.email), this.findUserByPhone(userData.phone)]);

    if (verifyEmail) throw new BadRequestException('El correo electrónico ya se encuentra registrado');
    if (verifyPhoneNumber) throw new BadRequestException('El número de teléfono ya se encuentra registrado');

    const hashPassword = await bcrypt.hash(userData.password, 10);
    userData.password = hashPassword;

    return await this.userRepository.registerUser(userData);
  }
}
