import { IsEmail, IsNotEmpty, MaxLength, IsPhoneNumber } from 'class-validator';

export class CreateCompanyDto {
  @MaxLength(30, { message: 'El nombre no debe superar los 30 caracteres' })
  @IsNotEmpty({ message: 'El nombre de la empresa es obligatorio' })
  readonly name: string;

  @IsEmail({}, { message: 'El correo electrónico debe ser válido' })
  readonly email: string;

  @IsPhoneNumber('CL', { message: 'El número de teléfono no es válido' })
  readonly phone: string;
}
