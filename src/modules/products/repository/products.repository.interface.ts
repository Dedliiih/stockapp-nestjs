import { CreateProductDto } from '../dto/create-product.dto';
import { UpdateProductDto } from '../dto/update-product.dto';
import { Product } from '../entities/product-entity';
import { GetProductsParamsDto } from '../dto/get-products-pams.dto';
import { ResultSetHeader } from 'mysql2';

export interface ProductsRepositoryI {
  getAll(companyId: string, params: GetProductsParamsDto): Promise<Product[] | null>;
  getById(id: string): Promise<Product | null>;
  getBySearchBar(companyId: string, params: GetProductsParamsDto): Promise<Product[] | null>;
  createProduct(productData: CreateProductDto, companyId: number): Promise<ResultSetHeader>;
  updateProduct(productId: string, productData: UpdateProductDto, companyId: string): Promise<ResultSetHeader>;
  deleteProduct(productId: string, companyId: string): Promise<ResultSetHeader>;
  getProductsCount(companyId: string): Promise<number>;
  getSearchedProductsCount(companyId: string, params: GetProductsParamsDto): Promise<number>;
}
