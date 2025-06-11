import { Test, TestingModule } from '@nestjs/testing';
import { Global, Module } from '@nestjs/common';
import { DatabaseService } from 'src/database/database/database.service';
import { ProductsService } from 'src/modules/products/products.service';
import ProductsRepository from 'src/modules/products/repository/products.repository';
import * as mysql from 'mysql2/promise';
import { configDotenv } from 'dotenv';
import { createProductMock, updateProductMock } from '../../utils/productMocks';
import { GetProductsParamsDto } from 'src/modules/products/dto/get-products-pams.dto';
import { TestDatabaseModule, restartDB } from '../../utils/testDatabaseModule';

configDotenv();

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
    await restartDB(dbConnection);
  });

  beforeEach(async () => {});

  afterAll(async () => {
    await dbConnection.end();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createProduct and getBy Id', () => {
    it('should create a product and retrive it by id', async () => {
      createProductMock.company = '1';
      const result = await service.create(createProductMock);
      expect(result.affectedRows).toBe(1);
    });
  });

  describe('getProducts', () => {
    it('should return paginated products and count', async () => {
      const companyId = '1';
      const queryParams: GetProductsParamsDto = { page: 1, limit: 10, filter: 'nombre' };

      const result = await service.getProducts(companyId, queryParams);
      expect(result).toEqual({
        data: expect.arrayContaining([
          expect.objectContaining({
            producto_id: expect.any(Number),
            nombre: expect.any(String),
            precio: expect.any(Number),
            stock: expect.any(Number),
            descripcion: expect.any(String),
            categoria: expect.any(String),
            SKU: expect.any(String)
          })
        ]),
        total: expect.any(Number)
      });
    });
  });

  describe('getProductsBySearchBar', () => {
    it('using search param must return paginated products and count', async () => {
      const companyId = '1';
      const queryParams: GetProductsParamsDto = { page: 1, limit: 10, filter: 'nombre', search: 'test' };

      const result = await service.findBySearchBar(companyId, queryParams);
      expect(result).toEqual({
        data: expect.arrayContaining([
          expect.objectContaining({
            producto_id: expect.any(Number),
            nombre: expect.any(String),
            precio: expect.any(Number),
            stock: expect.any(Number),
            descripcion: expect.any(String),
            categoria: expect.any(String),
            SKU: expect.any(String)
          })
        ]),
        total: expect.any(Number)
      });
    });
  });

  describe('updateProduct and deleteProduct', () => {
    it('should update a product by id', async () => {
      const companyId = '1';
      createProductMock.company = '1';
      const productToUpdate = await service.create(createProductMock);
      const insertedProductId = String(productToUpdate.insertId);

      const updateProduct = await service.update(insertedProductId, updateProductMock, companyId);
      expect(updateProduct.affectedRows).toBe(1);

      const deleteProduct = await service.remove(insertedProductId, companyId);
      expect(deleteProduct.affectedRows).toBe(1);
    });
  });
});
