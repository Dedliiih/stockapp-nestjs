import { IsOptional, IsInt, Min, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class GetProductsParamsDto {
  @ApiPropertyOptional({ description: 'Tipo de filtro', default: 'nombre' })
  @IsOptional()
  filter?: string;

  @ApiPropertyOptional({ description: 'Límite de productos obtenidos', default: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit: number = 10;

  @ApiPropertyOptional({ description: 'Número de página', default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page: number = 1;

  @ApiPropertyOptional({ description: 'Parámetro de búsqueda' })
  @IsOptional()
  @IsString()
  search?: string;
}
