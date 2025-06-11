import { ExecutionContext, INestApplication, NotFoundException, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { PaginatedServiceResponse } from 'src/common/interceptors/transform-response.interceptor';
import { GetProductsParamsDto } from 'src/modules/products/dto/get-products-pams.dto';
import { ProductsController } from 'src/modules/products/products.controller';
import { ProductsService } from 'src/modules/products/products.service';
import ProductsRepository from 'src/modules/products/repository/products.repository';
import {
  createProductMock,
  updateProductMock,
  mockCompanyId,
  mockProductId,
  affectedRowsResponse
} from '../../utils/productMocks';
import { CreateProductDto } from 'src/modules/products/dto/create-product.dto';
import { mockProductsRepository } from '../../utils/productMocks';
import { ResultSetHeader } from 'mysql2';

const MOCK_USER_PAYLOAD = {
  id: '29',
  username: 'mock',
  companyId: '94',
  role: 'Mockrole'
};

const mockAuthGuard = {
  canActivate: jest.fn((context: ExecutionContext) => {
    const req = context.switchToHttp().getRequest();
    req.user = MOCK_USER_PAYLOAD;
    return true;
  })
};
const mockRolesGuard = { canActivate: jest.fn(() => true) };

describe('ProductsController (Integration)', () => {
  let app: INestApplication;
  let productsService: ProductsService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductsController],
      providers: [ProductsService, { provide: ProductsRepository, useValue: mockProductsRepository }]
    })
      .overrideGuard(AuthGuard)
      .useValue(mockAuthGuard)
      .overrideGuard(RolesGuard)
      .useValue(mockRolesGuard)
      .compile();

    app = module.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }));
    await app.init();

    productsService = module.get<ProductsService>(ProductsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  afterAll(async () => {
    await app.close();
  });

  const serviceResponse: PaginatedServiceResponse<any> = {
    data: [{ producto_id: 1, nombre: 'Producto', sku: 'SKU', stock: 1, categoria: 1, precio: 100 }],
    total: 10
  };

  describe('GET /products (findAll)', () => {
    it('should return paginated products and total count', async () => {
      const queryParams: GetProductsParamsDto = { page: 1, limit: 10, filter: 'nombre' };

      const getProductsSpy = jest.spyOn(productsService, 'getProducts').mockImplementation(async () => {
        return serviceResponse;
      });

      const response = await request(app.getHttpServer()).get('/products').query(queryParams).expect(200);

      expect(getProductsSpy).toHaveBeenCalledWith(MOCK_USER_PAYLOAD.companyId, queryParams);
      expect(response.body).toEqual({
        data: serviceResponse.data,
        total: serviceResponse.total
      });
    });
  });

  describe('GET /products/search (findBySearch)', () => {
    it('The search parameter should be used to return paginated products and their count', async () => {
      const queryParams: GetProductsParamsDto = { page: 1, limit: 10, filter: 'nombre', search: 'RAM' };

      const getProductsSpy = jest.spyOn(productsService, 'findBySearchBar').mockImplementation(async () => {
        return serviceResponse;
      });

      const response = await request(app.getHttpServer()).get('/products/search').query(queryParams).expect(200);

      expect(getProductsSpy).toHaveBeenCalledWith(MOCK_USER_PAYLOAD.companyId, queryParams);
      expect(response.body).toEqual({
        data: serviceResponse.data,
        total: serviceResponse.total
      });
    });
  });

  describe('POST /products (createProduct)', () => {
    it('A new product should be created using productsService, with the new product data sent', async () => {
      const createProductSpy = jest
        .spyOn(productsService, 'create')
        .mockImplementation(async (): Promise<ResultSetHeader> => {
          const mockResponse = affectedRowsResponse as ResultSetHeader;
          return mockResponse;
        });

      const expectedProduct: CreateProductDto = {
        ...createProductMock,
        company: MOCK_USER_PAYLOAD.companyId
      };

      const response = await request(app.getHttpServer()).post('/products').send(createProductMock).expect(201);

      expect(createProductSpy).toHaveBeenCalledWith(expectedProduct);
      expect(response.body).toEqual({ message: 'Producto añadido correctamente.' });
    });
  });

  describe('PUT /products (updateProduct)', () => {
    it('A product should be updated using productsService with the new data to overwrite an existing product by id', async () => {
      const updateProductSpy = jest.spyOn(productsService, 'update').mockImplementation(async () => {
        const mockResponse = affectedRowsResponse as ResultSetHeader;
        return mockResponse;
      });

      const response = await request(app.getHttpServer())
        .put(`/products/${mockProductId}`)
        .send(updateProductMock)
        .expect(200);

      expect(updateProductSpy).toHaveBeenCalledWith(mockProductId, updateProductMock, mockCompanyId);
      expect(response.body).toEqual({ message: 'Producto actualizado correctamente.' });
    });

    it('If a product cannot be found, productsService throws an exception', async () => {
      const productId = 'non-existing-id';

      const updateProductSpy = jest
        .spyOn(productsService, 'update')
        .mockRejectedValue(new NotFoundException('El producto no fue encontrado.'));

      const response = await request(app.getHttpServer())
        .put(`/products/${productId}`)
        .send(updateProductMock)
        .expect(404);

      expect(updateProductSpy).toHaveBeenCalledWith(productId, updateProductMock, mockCompanyId);
      expect(response.body.message).toContain('El producto no fue encontrado.');
    });
  });

  describe('DELETE /products (deleteProduct)', () => {
    it('The productsService should delete a product by id', async () => {
      const deleteProductSpy = jest.spyOn(productsService, 'remove').mockImplementation(async () => {
        const mockResponse = affectedRowsResponse as ResultSetHeader;
        return mockResponse;
      });

      const response = await request(app.getHttpServer()).delete(`/products/${mockProductId}`).expect(200);

      expect(deleteProductSpy).toHaveBeenCalledWith(mockProductId, mockCompanyId);
      expect(response.body).toEqual({ message: 'Producto eliminado.' });
    });

    it('If a product cannot be deleted or found, the productsService throws an exception', async () => {
      const productId = 'non-existing-id';

      const deleteProductSpy = jest
        .spyOn(productsService, 'remove')
        .mockRejectedValue(
          new NotFoundException('El producto no ha podido ser eliminado. Intente de nuevo más tarde.')
        );

      const response = await request(app.getHttpServer()).delete(`/products/${productId}`).expect(404);

      expect(deleteProductSpy).toHaveBeenCalledWith(productId, mockCompanyId);
      expect(response.body.message).toContain('El producto no ha podido ser eliminado. Intente de nuevo más tarde.');
    });
  });
});
