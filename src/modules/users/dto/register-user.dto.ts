import { IsEmail, IsNotEmpty, MinLength, IsPhoneNumber, Matches } from 'class-validator';

export class RegisterUserDto {
  @IsNotEmpty({ message: 'El nombre es obligatorio' })
  readonly name: string;

  @IsNotEmpty({ message: 'El apellido es obligatorio' })
  readonly lastName: string;

  @IsNotEmpty({ message: 'La contraseña es obligatoria' })
  @MinLength(7, { message: 'La contraseña debe tener al menos 7 caracteres' })
  @Matches(/[^A-Za-z0-9]/, {
    message: 'La contraseña debe incluir al menos un carácter especial',
  })
  password: string;

  @IsEmail({}, { message: 'El correo electrónico debe ser válido' })
  readonly email: string;

  @IsPhoneNumber('CL', { message: 'El número de teléfono no es válido' })
  readonly phone: string;
}
