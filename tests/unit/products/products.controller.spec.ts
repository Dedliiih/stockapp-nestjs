import { Test, TestingModule } from '@nestjs/testing';
import { ProductsController } from 'src/modules/products/products.controller';
import { ProductsService } from 'src/modules/products/products.service';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { GetProductsParamsDto } from 'src/modules/products/dto/get-products-pams.dto';
import { PaginatedServiceResponse } from 'src/common/interceptors/transform-response.interceptor';
import { Product } from 'src/modules/products/entities/product-entity';
import { UpdateProductDto } from 'src/modules/products/dto/update-product.dto';
import { CreateProductDto } from 'src/modules/products/dto/create-product.dto';

const mockProductsService = {
  getProducts: jest.fn(),
  findBySearchBar: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
  create: jest.fn()
};

const mockAuthGuard = { canActivate: jest.fn(() => true) };
const mockRolesGuard = { canActivate: jest.fn(() => true) };

describe('ProductsController', () => {
  let controller: ProductsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductsController],
      providers: [
        {
          provide: ProductsService,
          useValue: mockProductsService
        }
      ]
    })
      .overrideGuard(AuthGuard)
      .useValue(mockAuthGuard)
      .overrideGuard(RolesGuard)
      .useValue(mockRolesGuard)
      .compile();

    controller = module.get<ProductsController>(ProductsController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should call productsService.getProducts with companyId from req.user and params, and return the result', async () => {
      const mockCompanyId = '94';
      const mockUser = { companyId: mockCompanyId };
      const mockReq = { user: mockUser } as any;

      const mockParams: GetProductsParamsDto = {
        page: 1,
        limit: 10
      };

      const mockServiceResponse: PaginatedServiceResponse<Product> = {
        data: [
          {
            producto_id: 1,
            nombre: 'Test Product',
            descripcion: 'Product description',
            precio: 100,
            categoria: 'Electronica',
            sku: 'SKU',
            stock: 10
          }
        ],
        total: 1
      };

      mockProductsService.getProducts.mockResolvedValue(mockServiceResponse);

      const result = await controller.findAll(mockReq, mockParams);

      expect(mockProductsService.getProducts).toHaveBeenCalledWith(mockCompanyId, mockParams);
      expect(result).toEqual(mockServiceResponse);
    });
  });

  describe('findBySearchBar', () => {
    it('should call productsService.getProducts with companyId from req.user and params including search, and return the result', async () => {
      const mockCompanyId = '94';
      const mockUser = { companyId: mockCompanyId };
      const mockReq = { user: mockUser } as any;

      const mockParams: GetProductsParamsDto = {
        search: 'Electrónica',
        page: 1,
        limit: 10
      };

      const mockServiceResponse: PaginatedServiceResponse<Product> = {
        data: [
          {
            producto_id: 1,
            nombre: 'Test Product',
            descripcion: 'Product description',
            precio: 100,
            categoria: 'Electronica',
            sku: 'SKU',
            stock: 10
          }
        ],
        total: 1
      };

      mockProductsService.findBySearchBar.mockResolvedValue(mockServiceResponse);

      const result = await controller.findBySearchBar(mockReq, mockParams);

      expect(mockProductsService.findBySearchBar).toHaveBeenCalledWith(mockCompanyId, mockParams);
      expect(result).toEqual(mockServiceResponse);
    });
  });

  describe('updateProduct', () => {
    it('should call productsService.update with companyId from req.user and productId param, and update the specified product returning the result', async () => {
      const mockCompanyId = '94';
      const mockUser = { companyId: mockCompanyId };
      const mockReq = { user: mockUser } as any;

      const mockProductId = '108';

      const mockServiceResponse: { message: string } = {
        message: 'Producto actualizado correctamente.'
      };

      const updateProductMock: UpdateProductDto = {
        name: 'New Product Name',
        description: 'New description product',
        price: 120,
        category: 2,
        sku: 'new sku',
        stock: 10
      };

      mockProductsService.update.mockResolvedValue(mockServiceResponse);

      const result = await controller.update(mockReq, mockProductId, updateProductMock);

      expect(mockProductsService.update).toHaveBeenCalledWith(mockProductId, updateProductMock, mockCompanyId);
      expect(result).toEqual(mockServiceResponse);
    });
  });

  describe('deleteProduct', () => {
    it('should call productsService.remove with companyId from req.user and productId param, and remove the specified product returning the result', async () => {
      const mockCompanyId = '94';
      const mockUser = { companyId: mockCompanyId };
      const mockReq = { user: mockUser } as any;

      const mockProductId = '108';

      const mockServiceResponse: { message: string } = {
        message: 'Producto eliminado.'
      };

      mockProductsService.remove.mockResolvedValue(mockServiceResponse);

      const result = await controller.remove(mockReq, mockProductId);

      expect(mockProductsService.remove).toHaveBeenCalledWith(mockProductId, mockCompanyId);
      expect(result).toEqual(mockServiceResponse);
    });
  });

  describe('createProduct', () => {
    it('should call productsService.create with companyId and create a new product returning the response.', async () => {
      const mockCompanyId = '94';
      const mockUser = { companyId: mockCompanyId };
      const mockReq = { user: mockUser } as any;

      const createProductMock: CreateProductDto = {
        name: 'New Product Name',
        description: 'New description product',
        price: 120,
        category: 2,
        sku: 'new sku',
        stock: 10,
        company: '94'
      };

      const mockServiceResponse: { message: string } = {
        message: 'Producto añadido correctamente.'
      };

      mockProductsService.create.mockResolvedValue(mockServiceResponse);

      const result = await controller.create(mockReq, createProductMock);

      expect(mockProductsService.create).toHaveBeenCalledWith(createProductMock);
      expect(result).toEqual(mockServiceResponse);
    });
  });
});
