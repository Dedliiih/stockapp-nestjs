import { Test, TestingModule } from '@nestjs/testing';
import { Global, Module } from '@nestjs/common';
import { DatabaseService } from 'src/database/database/database.service';
import { ProductsService } from 'src/modules/products/products.service';
import ProductsRepository from 'src/modules/products/repository/products.repository';
import * as mysql from 'mysql2/promise';
import { configDotenv } from 'dotenv';
import { createProductMock, mockCompanyId } from '../utils/mocks';
import { GetProductsParamsDto } from 'src/modules/products/dto/get-products-pams.dto';
import { PaginatedServiceResponse } from 'src/common/interceptors/transform-response.interceptor';

configDotenv();

const testDatabaseProvider = {
  provide: 'DATABASE_CONNECTION',
  useFactory: async () => {
    return mysql.createConnection({
      host: process.env.HOST,
      user: process.env.USER,
      port: parseInt(process.env.DBPORT),
      password: process.env.DBPASSWORD,
      database: process.env.TEST_DB
    });
  }
};

@Global()
@Module({
  providers: [testDatabaseProvider, DatabaseService],
  exports: ['DATABASE_CONNECTION', DatabaseService]
})
class TestDatabaseModule {}

describe('ProductsService (Integration with DB)', () => {
  let service: ProductsService;
  let dbConnection: mysql.Connection;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [TestDatabaseModule],
      providers: [ProductsService, ProductsRepository]
    }).compile();

    service = module.get<ProductsService>(ProductsService);
    dbConnection = module.get<mysql.Connection>('DATABASE_CONNECTION');
  });

  beforeEach(async () => {
    await dbConnection.query('SET FOREIGN_KEY_CHECKS = 0');
    await dbConnection.query('DELETE FROM productos');
    await dbConnection.query('DELETE FROM categorias');
    await dbConnection.query("INSERT INTO categorias (categoria_id, categoria) VALUES (1, 'Electronica'), (2, 'Ropa')");
    await dbConnection.query('SET FOREIGN_KEY_CHECKS = 1');
  });

  afterAll(async () => {
    await dbConnection.end();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  const serviceResponse: PaginatedServiceResponse<any> = {
    data: [{ producto_id: 1, nombre: 'Producto', sku: 'SKU', stock: 1, categoria: 1, precio: 100 }],
    total: 10
  };

  describe('createProduct and getBy Id', () => {
    it('should create a product and retrive it by id', async () => {
      createProductMock.company = '1';
      const result = await service.create(createProductMock);
      expect(result.affectedRows).toBe(1);
    });
  });

  describe('getProducts', () => {
    it('should return paginated products and count', async () => {
      const queryParams: GetProductsParamsDto = { page: 1, limit: 10, filter: 'nombre' };
      const result = await service.getProducts(mockCompanyId, queryParams);
      expect(result).toEqual({
        data: serviceResponse.data,
        total: serviceResponse.total
      });
    });
  });
});
