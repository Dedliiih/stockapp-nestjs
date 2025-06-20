import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from 'src/modules/users/users.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { SignInDto } from './dto/sign-in.dto';
import { User } from '../users/entities/user.entity';

interface Token {
  userId: string;
  name: string;
  lastName: string;
  companyId: number;
  role: number;
}

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService
  ) {}

  private createPayload(user: User): Token {
    const payload: Token = {
      userId: user.usuario_id,
      name: user.nombre,
      lastName: user.apellidos,
      companyId: user.empresa_id,
      role: user.rol_id
    };

    return payload;
  }

  async signIn(userData: SignInDto): Promise<{ accessToken: string; nombre: string; apellidos: string; empresa_id: number; rol_id: number }> {
    const user: User = await this.usersService.findUserByEmail(userData.email);
    const isCorrect = user === null ? false : await bcrypt.compare(userData.password, user.contrasena);

    if (!(user && isCorrect)) throw new UnauthorizedException('Credenciales inválidas.');

    const payload = this.createPayload(user);

    const { nombre, apellidos, empresa_id, rol_id } = user;
    const token = await this.jwtService.signAsync(payload);
    return { accessToken: token, nombre, apellidos, empresa_id, rol_id };
  }

  async updateToken(userId: string) {
    const user: User = await this.usersService.findUserById(userId);
    const payload = this.createPayload(user);
    return { token: await this.jwtService.signAsync(payload) };
  }
}
