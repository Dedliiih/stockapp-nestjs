import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from 'src/modules/users/users.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { SignInDto } from './dto/sign-in.dto';

type Token = {
  userId: string;
  name: string;
  lastName: string;
  companyId: number;
  role: number;
};

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async signIn(userData: SignInDto): Promise<{ message: string; token: string }> {
    const user = await this.usersService.findUserByEmail(userData.email);
    const isCorrect = user === null ? false : await bcrypt.compare(userData.password, user.contrasena);

    if (!(user && isCorrect)) throw new UnauthorizedException();

    const payload: Token = {
      userId: user.usuario_id,
      name: user.nombre,
      lastName: user.apellidos,
      companyId: user.empresa_id,
      role: user.rol_id,
    };

    return {
      message: 'Sesión iniciada correctamente.',
      token: await this.jwtService.signAsync(payload),
    };
  }

  async updateToken(userId: string) {
    const user = await this.usersService.findUserById(userId);

    const payload: Token = {
      userId: user.usuario_id,
      name: user.nombre,
      lastName: user.apellidos,
      companyId: user.empresa_id,
      role: user.rol_id,
    };

    return {
      token: await this.jwtService.signAsync(payload),
    };
  }
}
