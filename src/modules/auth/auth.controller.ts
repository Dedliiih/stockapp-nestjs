import { Body, Controller, Post, HttpCode, HttpStatus, Res, Req, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignInDto } from './dto/sign-in.dto';
import { Public } from 'src/common/decorators/public.decorator';
import { FastifyReply } from 'fastify';
import { RefreshTokenGuard } from 'src/common/guards/refresh.guard';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('login')
  async signIn(@Body() signInDto: SignInDto, @Res({ passthrough: true }) response: FastifyReply) {
    const result = await this.authService.signIn(signInDto);

    response.setCookie('access_token', result.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: 16 * 60 * 1000
    });

    response.setCookie('refresh_token', result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/auth/refresh',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    return { message: 'Sesión iniciada correctamente.', userData: { name: result.nombre, lastName: result.apellidos, companyId: result.empresa_id, rolId: result.rol_id } };
  }

  @Public()
  @UseGuards(RefreshTokenGuard)
  @HttpCode(HttpStatus.OK)
  @Post('refresh')
  async refreshToken(@Req() req: any, @Res({ passthrough: true }) response: FastifyReply) {
    const userId = req.user.userId;
    const oldRefreshToken = req.user.refreshToken;
    const result = await this.authService.refreshToken(userId, oldRefreshToken);

    response.setCookie('access_token', result.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: 16 * 60 * 1000
    });

    response.setCookie('refresh_token', result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/auth/refresh',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    return { message: 'Sesión actualizada correctamente.', userData: { name: result.nombre, lastName: result.apellidos, companyId: result.empresa_id, rolId: result.rol_id } };
  }
}
