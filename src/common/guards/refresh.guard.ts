import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { REFRESH_TOKEN_KEY } from 'src/modules/auth/constants/constants';

@Injectable()
export class RefreshTokenGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromCookie(request);

    if (!token) {
      throw new UnauthorizedException('Credenciales de renovación no encontradas.');
    }

    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: REFRESH_TOKEN_KEY
      });

      request['user'] = { ...payload, refreshToken: token };
    } catch {
      throw new UnauthorizedException('Credenciales de renovación inválidas o expiradas');
    }

    return true;
  }

  extractTokenFromCookie(request: any) {
    return request.cookies?.refresh_token;
  }
}
