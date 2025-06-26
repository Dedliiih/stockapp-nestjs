import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class SignInDto {
  @ApiProperty({ example: 'user@gmail.com' })
  @IsNotEmpty({ message: 'El correo electrónico es obligatorio' })
  readonly email: string;

  @ApiProperty({ example: 'user-password' })
  @IsNotEmpty({ message: 'La contraseña es obligatoria' })
  readonly password: string;
}
