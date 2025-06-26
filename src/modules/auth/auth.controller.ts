import { Body, Controller, Post, HttpCode, HttpStatus, Res, Req, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignInDto } from './dto/sign-in.dto';
import { Public } from 'src/common/decorators/public.decorator';
import { FastifyReply } from 'fastify';
import { RefreshTokenGuard } from 'src/common/guards/refresh.guard';
import { ApiBadRequestResponse, ApiOkResponse, ApiOperation, ApiTags, ApiBody } from '@nestjs/swagger';
import { AuthSuccessResponseDto } from './dto/auth-success-response.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @ApiBody({ type: SignInDto })
  @ApiOperation({
    summary: 'Inicio de sesión para usuarios.',
    description: 'El usuario enviará su email y contraseñas para iniciar sesión, en caso de ser exitosas se retornará una cookie con un token de acceso y renovación.'
  })
  @ApiOkResponse({ description: 'Inicio de sesión exitoso.', type: AuthSuccessResponseDto })
  @ApiBadRequestResponse({ description: 'Error al iniciar sesión. Posible error en las credenciales enviadas.' })
  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('login')
  async signIn(@Body() signInDto: SignInDto, @Res({ passthrough: true }) response: FastifyReply): Promise<AuthSuccessResponseDto> {
    const userProfile = await this.authService.signIn(signInDto, response);

    return {
      message: 'Sesión iniciada correctamente.',
      userProfile
    };
  }

  @ApiOperation({
    summary: 'Renovación de credenciales para usuarios.',
    description: 'Cuando la credencial de acceso de un usuario caduque, se llamará a este endpoint para hacer su renovación y se retornarán nuevas cookies con tokens renovados.'
  })
  @ApiOkResponse({ description: 'Sesión actualizada correctamente.', type: AuthSuccessResponseDto })
  @ApiBadRequestResponse({ description: 'Error al renovar las credenciales. Posible error en la credencial de renovación.' })
  @UseGuards(RefreshTokenGuard)
  @HttpCode(HttpStatus.OK)
  @Post('refresh')
  async refreshToken(@Req() req: any, @Res({ passthrough: true }) response: FastifyReply): Promise<AuthSuccessResponseDto> {
    const userId = req.user.userId;
    const oldRefreshToken = req.user.refreshToken;
    const userProfile = await this.authService.refreshToken(userId, oldRefreshToken, response);
    return {
      message: 'Sesión actualizada correctamente.',
      userProfile
    };
  }
}
