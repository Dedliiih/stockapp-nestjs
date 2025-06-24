import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from 'src/modules/users/users.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { SignInDto } from './dto/sign-in.dto';
import { User } from '../users/entities/user.entity';
import { REFRESH_TOKEN_KEY, TOKEN_KEY } from './constants/constants';
import AuthRepository from './repository/auth.repository';

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
    private authRepository: AuthRepository,
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

  private async signTokens(payload: Token) {
    const [accessToken, refreshToken] = await Promise.all([
      await this.jwtService.signAsync(payload, { secret: TOKEN_KEY }),
      await this.jwtService.signAsync(payload, { secret: REFRESH_TOKEN_KEY })
    ]);

    return { accessToken, refreshToken };
  }

  async signIn(userData: SignInDto): Promise<{ accessToken: string; refreshToken: string; nombre: string; apellidos: string; empresa_id: number; rol_id: number }> {
    const user: User = await this.usersService.findUserByEmail(userData.email);
    const isCorrect = user === null ? false : await bcrypt.compare(userData.password, user.contrasena);

    if (!(user && isCorrect)) throw new UnauthorizedException('Credenciales inválidas.');

    const payload = this.createPayload(user);

    const { nombre, apellidos, empresa_id, rol_id } = user;
    const { accessToken, refreshToken } = await this.signTokens(payload);
    const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);

    await this.authRepository.updateRefreshToken(hashedRefreshToken, user.usuario_id);
    return { accessToken, refreshToken, nombre, apellidos, empresa_id, rol_id };
  }

  async updateToken(userId: string) {
    const user: User = await this.usersService.findUserById(userId);
    const payload = this.createPayload(user);
    return { token: await this.jwtService.signAsync(payload) };
  }

  async refreshToken(userId: string, oldRefreshToken: string) {
    const user: User = await this.usersService.findUserById(userId);
    if (!user || !user.credencial_renovacion) {
      throw new UnauthorizedException('Acceso denegado.');
    }

    const matchToken = await bcrypt.compare(oldRefreshToken, user.credencial_renovacion);
    if (!matchToken) {
      throw new UnauthorizedException('Acceso denegado');
    }

    const payload = this.createPayload(user);

    const { accessToken, refreshToken } = await this.signTokens(payload);

    const { nombre, apellidos, empresa_id, rol_id } = user;

    const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);

    await this.authRepository.updateRefreshToken(hashedRefreshToken, userId);
    return { accessToken, refreshToken, nombre, apellidos, empresa_id, rol_id };
  }
}
