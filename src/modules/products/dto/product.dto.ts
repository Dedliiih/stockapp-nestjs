import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

// This DTO is passed to the interceptor for transformation.

export class ProductDto {
  @ApiProperty()
  @Expose({ name: 'producto_id' })
  productId: number;

  @ApiProperty()
  @Expose({ name: 'nombre' })
  name: string;

  @ApiProperty()
  @Expose({ name: 'descripcion' })
  description: string;

  @ApiProperty()
  @Expose({ name: 'precio' })
  price: number;

  @ApiProperty()
  @Expose({ name: 'categoria' })
  category: string;

  @ApiProperty()
  @Expose({ name: 'SKU' })
  sku: string;

  @ApiProperty()
  @Expose()
  stock: number;
}
