import { Expose } from 'class-transformer';

export class ProductDto {
  @Expose({ name: 'producto_id' })
  productId: number;

  @Expose({ name: 'nombre' })
  name: string;

  @Expose({ name: 'descripcion' })
  description: string;

  @Expose({ name: 'precio' })
  price: number;

  @Expose({ name: 'categoria' })
  category: string;

  @Expose({ name: 'SKU' })
  sku: string;

  @Expose()
  stock: number;
}
