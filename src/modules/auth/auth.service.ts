import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from 'src/modules/users/users.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { SignInDto } from './dto/sign-in.dto';
import { User } from '../users/entities/user.entity';
import { REFRESH_TOKEN_KEY, TOKEN_KEY } from './constants/constants';
import AuthRepository from './repository/auth.repository';
import { FastifyReply } from 'fastify';
import { UserPublicProfileDto } from './dto/user-public-profile.dto';
import { Token } from 'src/common/interfaces/token';

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

  createAccessTokenCookie(response: FastifyReply, accessToken: string) {
    return response.setCookie('access_token', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 16 * 60 * 1000
    });
  }

  createRefreshTokenCookie(response: FastifyReply, refreshToken: string) {
    return response.setCookie('refresh_token', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/auth/refresh',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });
  }

  private async signTokens(payload: Token) {
    const [accessToken, refreshToken] = await Promise.all([
      await this.jwtService.signAsync(payload, { secret: TOKEN_KEY }),
      await this.jwtService.signAsync(payload, { secret: REFRESH_TOKEN_KEY })
    ]);

    return { accessToken, refreshToken };
  }

  async signIn(userData: SignInDto, response: FastifyReply): Promise<UserPublicProfileDto> {
    const user: User = await this.usersService.findUserByEmail(userData.email);
    const isCorrect = user === null ? false : await bcrypt.compare(userData.password, user.contrasena);

    if (!(user && isCorrect)) throw new UnauthorizedException('Credenciales inválidas.');

    const payload = this.createPayload(user);

    const userProfile: UserPublicProfileDto = {
      userId: user.usuario_id,
      name: user.nombre,
      lastName: user.apellidos,
      companyId: user.empresa_id,
      rolId: user.rol_id
    };

    const { accessToken, refreshToken } = await this.signTokens(payload);
    const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);

    await this.authRepository.updateRefreshToken(hashedRefreshToken, user.usuario_id);

    this.createAccessTokenCookie(response, accessToken);
    this.createRefreshTokenCookie(response, refreshToken);

    return userProfile;
  }

  async updateToken(userId: string) {
    const user: User = await this.usersService.findUserById(userId);
    const payload = this.createPayload(user);
    return { token: await this.jwtService.signAsync(payload) };
  }

  async refreshToken(userId: string, oldRefreshToken: string, response: FastifyReply): Promise<UserPublicProfileDto> {
    const user: User = await this.usersService.findUserById(userId);
    if (!user || !user.credencial_renovacion) {
      throw new UnauthorizedException('Acceso denegado.');
    }

    const matchToken = await bcrypt.compare(oldRefreshToken, user.credencial_renovacion);
    if (!matchToken) {
      await this.authRepository.updateRefreshToken(null, userId);
      throw new UnauthorizedException('Acceso denegado');
    }

    const payload = this.createPayload(user);
    const userProfile: UserPublicProfileDto = {
      userId: user.usuario_id,
      name: user.nombre,
      lastName: user.apellidos,
      companyId: user.empresa_id,
      rolId: user.rol_id
    };

    const { accessToken, refreshToken } = await this.signTokens(payload);
    const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);

    await this.authRepository.updateRefreshToken(hashedRefreshToken, userId);

    this.createAccessTokenCookie(response, accessToken);
    this.createRefreshTokenCookie(response, refreshToken);

    return userProfile;
  }

  async getProfile(userId: string): Promise<UserPublicProfileDto> {
    const user: User = await this.usersService.findUserById(userId);

    const userProfile: UserPublicProfileDto = {
      userId: user.usuario_id,
      name: user.nombre,
      lastName: user.apellidos,
      companyId: user.empresa_id,
      rolId: user.rol_id
    };

    return userProfile;
  }
}
