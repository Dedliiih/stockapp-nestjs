import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from 'src/database/database/database.service';
import { Product } from '../entities/product-entity';
import { ProductsRepositoryI } from './products.repository.interface';
import { CreateProductDto } from '../dto/create-product.dto';
import { UpdateProductDto } from '../dto/update-product.dto';
import { GetProductsParamsDto } from '../dto/get-products-pams.dto';
import { ResultSetHeader } from 'mysql2';

@Injectable()
class ProductsRepository implements ProductsRepositoryI {
  constructor(private readonly databaseService: DatabaseService) {}

  async getAll(companyId: string, params: GetProductsParamsDto): Promise<Product[]> {
    const itemsOffset = params.limit * (params.page - 1);
    const queryParams: Array<string | number> = [companyId, params.limit, itemsOffset];
    const query: string = `SELECT p.producto_id, p.nombre, p.descripcion, p.SKU, p.stock, p.precio, c.categoria FROM productos p
    JOIN categorias c on c.categoria_id = p.categoria WHERE empresa_id = ? ORDER BY p.${params.filter} DESC LIMIT ? OFFSET ?`;
    const results: Product[] = await this.databaseService.getData(query, queryParams);
    return results;
  }

  async getById(id: string): Promise<Product> {
    const query: string =
      'SELECT nombre, modelo, descripcion, empresa_id, SKU, stock FROM productos WHERE producto_id = ?';
    const result: Product[] = await this.databaseService.getData(query, id);

    return result.length == 0 ? null : result[0];
  }

  async getBySearchBar(companyId: string, params: GetProductsParamsDto): Promise<Product[]> {
    const itemsOffset = params.limit * (params.page - 1);
    const queryParams = [
      companyId,
      params.search,
      params.search,
      params.search,
      params.search,
      params.search,
      params.search,
      params.limit,
      itemsOffset
    ];

    const query = `
             SELECT
        p.producto_id, p.nombre, p.descripcion, p.SKU, p.stock, p.precio, c.categoria
    FROM
        productos p
    JOIN
        categorias c ON c.categoria_id = p.categoria
    WHERE
        p.empresa_id = ?
    AND (
        MATCH(p.nombre, p.SKU, p.descripcion) AGAINST (? IN NATURAL LANGUAGE MODE)
        OR p.nombre LIKE CONCAT('%', ?, '%')
        OR p.SKU LIKE CONCAT('%', ?, '%')
        OR c.categoria LIKE CONCAT('%', ?, '%')

        OR CAST(p.precio AS CHAR) LIKE CONCAT('%', ?, '%')
        OR CAST(p.stock AS CHAR) LIKE CONCAT('%', ?, '%')
    ) ORDER BY p.${params.filter} DESC LIMIT ? OFFSET ?;
    `;

    const result: Product[] = await this.databaseService.getData(query, queryParams);
    return result;
  }

  async createProduct(productData: CreateProductDto): Promise<ResultSetHeader> {
    const query: string =
      'INSERT into productos (nombre, descripcion, empresa_id, sku, stock, categoria, precio) VALUES (?, ? ,?, ?, ?, ?, ?);';
    const params = [
      productData.name,
      productData.description,
      productData.company,
      productData.sku,
      productData.stock,
      productData.category,
      productData.price
    ];
    return await this.databaseService.insertData(query, params);
  }

  async updateProduct(productId: string, productData: UpdateProductDto, companyId: string): Promise<ResultSetHeader> {
    const query: string =
      'UPDATE productos SET nombre = IFNULL(?, nombre), descripcion = IFNULL(?, descripcion), sku = IFNULL(?, sku), stock = IFNULL(?, stock), categoria = IFNULL(?, categoria), precio = IFNULL(?, precio) WHERE producto_id = ? AND empresa_id = ?';
    const params = [
      productData.name,
      productData.description,
      productData.sku,
      productData.stock,
      productData.category,
      productData.price,
      productId,
      companyId
    ];
    return await this.databaseService.insertData(query, params);
  }

  async deleteProduct(productId: string, companyId: string): Promise<ResultSetHeader> {
    const query: string = 'DELETE FROM productos WHERE producto_id = ? AND empresa_id = ?';
    const params = [productId, companyId];
    return await this.databaseService.deleteData(query, params);
  }

  async getProductsCount(companyId: string): Promise<number> {
    const query: string = 'SELECT COUNT(*) as total FROM productos p WHERE empresa_id = ?';
    const result: number = await this.databaseService.getData(query, companyId);

    return result[0].total;
  }

  async getSearchedProductsCount(companyId: string, params: GetProductsParamsDto): Promise<number> {
    const query: string = `
    SELECT 
      COUNT(*) AS total
    FROM 
      productos p
    JOIN 
      categorias c ON c.categoria_id = p.categoria
    WHERE 
      p.empresa_id = ?
    AND (
      p.nombre LIKE CONCAT('%%', ?, '%%')
      OR p.SKU LIKE CONCAT('%%', ?, '%%')
      OR c.categoria LIKE CONCAT('%%', ?, '%%')
      OR CAST(p.precio AS CHAR) LIKE CONCAT('%%', ?, '%%')
      OR CAST(p.stock AS CHAR) LIKE CONCAT('%%', ?, '%%')
  );`;

    const queryParams = [companyId, params.search, params.search, params.search, params.search, params.search];
    const result: number = await this.databaseService.getData(query, queryParams);

    return result[0].total;
  }
}

export default ProductsRepository;
