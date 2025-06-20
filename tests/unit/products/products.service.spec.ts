import { ServiceUnavailableException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { GetProductsParamsDto } from 'src/modules/products/dto/get-products-pams.dto';
import { ProductsService } from 'src/modules/products/products.service';
import ProductsRepository from 'src/modules/products/repository/products.repository';
import {
  mockCompanyId,
  mockCountResponse,
  mockProductList,
  affectedRowsResponse,
  notAffectedRowsResponse,
  mockProductId,
  createProductMock,
  updateProductMock,
  mockProductsRepository
} from '../../utils/productMocks';

describe('ProductsService', () => {
  let service: ProductsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsService,
        {
          provide: ProductsRepository,
          useValue: mockProductsRepository
        }
      ]
    }).compile();

    service = module.get<ProductsService>(ProductsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getProducts', () => {
    beforeEach(() => {
      mockProductsRepository.getAll.mockResolvedValue(mockProductList);
      mockProductsRepository.getProductsCount.mockResolvedValue(mockCountResponse);
    });

    it('should use "nombre" as default filter if params.filter is undefined', async () => {
      const params: GetProductsParamsDto = { page: 1, limit: 10, filter: undefined };
      const paramsForCall = { ...params };
      await service.getProducts(mockCompanyId, paramsForCall);
      expect(mockProductsRepository.getAll).toHaveBeenCalledWith(mockCompanyId, expect.objectContaining({ filter: 'nombre' }));
    });

    it('should use the provided valid filter from params', async () => {
      const params: GetProductsParamsDto = { page: 1, limit: 10, filter: 'precio' };
      const paramsForCall = { ...params };
      await service.getProducts(mockCompanyId, paramsForCall);
      expect(mockProductsRepository.getAll).toHaveBeenCalledWith(mockCompanyId, expect.objectContaining({ filter: 'precio' }));
    });

    it('should call productsRepository.getAll with correct companyId and processed params', async () => {
      const params: GetProductsParamsDto = { page: 1, limit: 10, filter: 'precio' };
      const paramsForCall = { ...params };
      const expectedParamsForRepo = { ...params };

      await service.getProducts(mockCompanyId, paramsForCall);

      expect(mockProductsRepository.getAll).toHaveBeenCalledWith(mockCompanyId, expectedParamsForRepo);
    });

    it('should call productsRepository.getAll with correct companyId and processed params to return the result', async () => {
      const params: GetProductsParamsDto = { page: 1, limit: 10, filter: 'precio' };
      const result = await service.getProducts(mockCompanyId, params);
      const productResponse = { data: mockProductList, total: mockCountResponse };
      expect(result).toEqual(productResponse);
    });
  });

  describe('getProductsBySearch', () => {
    beforeEach(() => {
      mockProductsRepository.getBySearchBar.mockResolvedValue(mockProductList);
      mockProductsRepository.getSearchedProductsCount.mockResolvedValue(mockCountResponse);
    });

    it('should return something if search is undefined', async () => {
      const params: GetProductsParamsDto = { page: 1, limit: 10, filter: 'precio', search: undefined };
      const result = await service.findBySearchBar(mockCompanyId, params);
      expect(result).toBeDefined();
    });

    it('should call productsRepository.findBySearchBar with all params and correct companyId to return the response', async () => {
      const params: GetProductsParamsDto = { page: 1, limit: 10, filter: 'precio', search: 'RAM' };
      const paramsForRepo = { ...params };
      const result = await service.findBySearchBar(mockCompanyId, params);
      const productResponse = { data: mockProductList, total: mockCountResponse };

      expect(mockProductsRepository.getBySearchBar).toHaveBeenCalledWith(mockCompanyId, paramsForRepo);
      expect(result).toEqual(productResponse);
    });
  });

  describe('createProduct', () => {
    it('should call productsRepository.createProduct and create the new product', async () => {
      mockProductsRepository.createProduct.mockResolvedValue(affectedRowsResponse);
      await service.create(createProductMock);
      expect(mockProductsRepository.createProduct).toHaveBeenCalledWith(createProductMock);
    });

    it('should call productRepository.createProduct and throw an exception if no product was created', async () => {
      mockProductsRepository.createProduct.mockResolvedValue(notAffectedRowsResponse);
      await expect(service.create(createProductMock)).rejects.toThrow(new ServiceUnavailableException('Hubo un error al crear el producto.'));
      expect(mockProductsRepository.createProduct).toHaveBeenCalledWith(createProductMock);
    });
  });

  describe('updateProduct', () => {
    it('it should call producstService.updateProduct and update a product by id', async () => {
      mockProductsRepository.updateProduct.mockResolvedValue(affectedRowsResponse);
      await service.update(mockProductId, updateProductMock, mockCompanyId);
      expect(mockProductsRepository.updateProduct).toHaveBeenCalledWith(mockProductId, updateProductMock, mockCompanyId);
    });

    it('should call productRepository.updateProduct and throw an exception if no product was updated', async () => {
      mockProductsRepository.updateProduct.mockResolvedValue(notAffectedRowsResponse);
      await expect(service.update(mockProductId, updateProductMock, mockCompanyId)).rejects.toThrow(new ServiceUnavailableException('El producto no fue encontrado.'));
      expect(mockProductsRepository.updateProduct).toHaveBeenCalledWith(mockProductId, updateProductMock, mockCompanyId);
    });
  });

  describe('deleteProduct', () => {
    it('should call productRepository.deleteProduct and delete a product by id', async () => {
      mockProductsRepository.deleteProduct.mockResolvedValue(affectedRowsResponse);

      await service.remove(mockProductId, mockCompanyId);

      expect(mockProductsRepository.deleteProduct).toHaveBeenCalledWith(mockProductId, mockCompanyId);
    });

    it('should call productRepository.deleteProduct and throw an exception if no product was deleted', async () => {
      mockProductsRepository.deleteProduct.mockResolvedValue(notAffectedRowsResponse);

      await expect(service.remove(mockProductId, mockCompanyId)).rejects.toThrow(
        new ServiceUnavailableException('El producto no ha podido ser eliminado. Intente de nuevo más tarde.')
      );
    });
  });
});
