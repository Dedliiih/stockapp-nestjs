import { IsEmpty, IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateProductDto {
  @MaxLength(50, { message: 'El nombre del producto no puede superar los 50 caracteres.' })
  @IsNotEmpty({ message: 'El nombre del producto es obligatorio.' })
  readonly name: string;

  @MaxLength(300, { message: 'La descripción no puede superar los 300 caracteres.' })
  @IsString()
  readonly description: string;

  @MaxLength(15, { message: 'El SKU del producto no puede superar los 15 caracteres.' })
  @IsNotEmpty({ message: 'El SKU del producto es obligatorio.' })
  readonly sku: string | null;

  @IsNotEmpty({ message: 'Debes introducir un número de stock.' })
  readonly stock: number;

  @IsNotEmpty({ message: 'Debes introducir una categoría.' })
  readonly category: number;

  @IsNotEmpty({ message: 'Debes introducir el precio del producto.' })
  readonly price: number;

  @IsEmpty()
  company: string;
}
