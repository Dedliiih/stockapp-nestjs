import { BadRequestException, Injectable, NotFoundException, ServiceUnavailableException } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import ProductsRepository from './repository/products.repository';
import { Product } from './entities/product-entity';
import { GetProductsParamsDto } from './dto/get-products-pams.dto';
import { ResultSetHeader } from 'mysql2';

@Injectable()
export class ProductsService {
  constructor(private readonly productsRepository: ProductsRepository) {}

  async create(createProductDto: CreateProductDto): Promise<ResultSetHeader> {
    const result: ResultSetHeader = await this.productsRepository.createProduct(createProductDto);
    if (result.affectedRows === 0) throw new ServiceUnavailableException('Hubo un error al crear el producto.');
    return result;
  }

  async getProducts(companyId: string, params: GetProductsParamsDto): Promise<{ data: Product[]; total: number }> {
    const validFilterParams = ['nombre', 'precio', 'categoria'];
    params.filter = validFilterParams.includes(params.filter) ? params.filter : 'nombre';
    const products = await this.productsRepository.getAll(companyId, params);
    const productsTotal = await this.productsRepository.getProductsCount(companyId);
    return { data: products, total: productsTotal };
  }

  async findOne(id: string): Promise<Product> {
    const product = await this.productsRepository.getById(id);

    if (!product) {
      throw new NotFoundException('Producto no encontrado.');
    }

    return product;
  }

  async findBySearchBar(companyId: string, params: GetProductsParamsDto): Promise<{ data: Product[]; total: number }> {
    const validFilterParams = ['nombre', 'precio', 'categoria'];
    params.filter = validFilterParams.includes(params.filter) ? params.filter : 'nombre';
    const products = await this.productsRepository.getBySearchBar(companyId, params);
    const productsTotal = await this.productsRepository.getSearchedProductsCount(companyId, params);
    return { data: products, total: productsTotal };
  }

  async update(productId: string, updateProductDto: UpdateProductDto, companyId: string): Promise<ResultSetHeader> {
    const result: ResultSetHeader = await this.productsRepository.updateProduct(productId, updateProductDto, companyId);
    if (result.affectedRows === 0) throw new NotFoundException('El producto no fue encontrado.');
    return result;
  }

  async remove(productId: string, companyId: string): Promise<ResultSetHeader> {
    const result: ResultSetHeader = await this.productsRepository.deleteProduct(productId, companyId);
    if (result.affectedRows === 0)
      throw new NotFoundException('El producto no ha podido ser eliminado. Intente de nuevo más tarde.');
    return result;
  }
}
