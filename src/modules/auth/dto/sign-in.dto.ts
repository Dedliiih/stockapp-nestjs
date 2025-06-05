import { IsNotEmpty } from 'class-validator';

export class SignInDto {
  @IsNotEmpty({ message: 'El correo electrónico es obligatorio' })
  readonly email: string;

  @IsNotEmpty({ message: 'La contraseña es obligatoria' })
  readonly password: string;
}
