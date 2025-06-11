import { Test, TestingModule } from '@nestjs/testing';
import { DatabaseService } from 'src/database/database/database.service';
import { GetProductsParamsDto } from 'src/modules/products/dto/get-products-pams.dto';
import {
  mockCountResponse,
  mockCompanyId,
  mockProductId,
  mockProductList,
  affectedRowsResponse,
  createProductMock,
  updateProductMock
} from '../../utils/productMocks';
import ProductsRepository from 'src/modules/products/repository/products.repository';

const mockDatabaseService = {
  insertData: jest.fn(),
  getData: jest.fn(),
  deleteData: jest.fn()
};

describe('ProductsRepository', () => {
  let repository: ProductsRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsRepository,
        {
          provide: DatabaseService,
          useValue: mockDatabaseService
        }
      ]
    }).compile();

    repository = module.get<ProductsRepository>(ProductsRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('ProductRepository layer should be defined', async () => {
    expect(repository).toBeDefined();
  });

  describe('getAll', () => {
    it('should call databaseService.getData and return all products using params and companyId', async () => {
      const mockParams: GetProductsParamsDto = { page: 1, limit: 10, filter: 'precio' };
      const mockItemsOffset = mockParams.limit * (mockParams.page - 1);
      const expectedQueryParams: Array<string | number> = [mockCompanyId, mockParams.limit, mockItemsOffset];
      const expectedQuery: string = `SELECT p.producto_id, p.nombre, p.descripcion, p.SKU, p.stock, p.precio, c.categoria FROM productos p
    JOIN categorias c on c.categoria_id = p.categoria WHERE empresa_id = ? ORDER BY p.${mockParams.filter} DESC LIMIT ? OFFSET ?`;

      mockDatabaseService.getData.mockResolvedValue(mockProductList);

      const result = await repository.getAll(mockCompanyId, mockParams);
      expect(mockDatabaseService.getData).toHaveBeenCalledWith(expectedQuery, expectedQueryParams);
      expect(result).toEqual(mockProductList);
    });
  });

  describe('getBySearchBar', () => {
    it('should call databaseService.getData and return all products using params including search and companyId', async () => {
      const mockParams: GetProductsParamsDto = { page: 1, limit: 10, filter: 'precio', search: 'some' };

      const expectedQuery = `
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
    ) ORDER BY p.${mockParams.filter} DESC LIMIT ? OFFSET ?;
    `;

      const mockItemsOffset = mockParams.limit * (mockParams.page - 1);

      const expectedQueryParams = [
        mockCompanyId,
        mockParams.search,
        mockParams.search,
        mockParams.search,
        mockParams.search,
        mockParams.search,
        mockParams.search,
        mockParams.limit,
        mockItemsOffset
      ];
      mockDatabaseService.getData.mockResolvedValue(mockProductList);
      const result = await repository.getBySearchBar(mockCompanyId, mockParams);
      expect(result).toEqual(mockProductList);
      expect(mockDatabaseService.getData).toHaveBeenCalledWith(expectedQuery, expectedQueryParams);
    });
  });

  describe('createProduct', () => {
    it('should call databaseService.insertData and return a response from database', async () => {
      const expectedQuery =
        'INSERT into productos (nombre, descripcion, empresa_id, sku, stock, categoria, precio) VALUES (?, ? ,?, ?, ?, ?, ?);';

      const expectedParams = [
        createProductMock.name,
        createProductMock.description,
        createProductMock.company,
        createProductMock.sku,
        createProductMock.stock,
        createProductMock.category,
        createProductMock.price
      ];

      mockDatabaseService.insertData.mockResolvedValue(affectedRowsResponse);
      const response = await repository.createProduct(createProductMock);
      expect(response).toEqual(affectedRowsResponse);
      expect(mockDatabaseService.insertData).toHaveBeenCalledWith(expectedQuery, expectedParams);
    });
  });

  describe('updateProduct', () => {
    it('should call databaseService.insertData and update a product in database by id', async () => {
      const expectedQuery: string =
        'UPDATE productos SET nombre = IFNULL(?, nombre), descripcion = IFNULL(?, descripcion), sku = IFNULL(?, sku), stock = IFNULL(?, stock), categoria = IFNULL(?, categoria), precio = IFNULL(?, precio) WHERE producto_id = ? AND empresa_id = ?';

      const expectedParams = [
        updateProductMock.name,
        updateProductMock.description,
        updateProductMock.sku,
        updateProductMock.stock,
        updateProductMock.category,
        updateProductMock.price,
        mockProductId,
        mockCompanyId
      ];

      mockDatabaseService.insertData.mockResolvedValue(affectedRowsResponse);

      const result = await repository.updateProduct(mockProductId, updateProductMock, mockCompanyId);
      expect(result).toEqual(affectedRowsResponse);
      expect(mockDatabaseService.insertData).toHaveBeenCalledWith(expectedQuery, expectedParams);
    });
  });

  describe('deleteProduct', () => {
    it('should call databaseService.deleteData and delete a product by id', async () => {
      const expectedParams = [mockProductId, mockCompanyId];
      const expectedQuery: string = 'DELETE FROM productos WHERE producto_id = ? AND empresa_id = ?';

      mockDatabaseService.deleteData.mockResolvedValue(affectedRowsResponse);
      const result = await repository.deleteProduct(mockProductId, mockCompanyId);
      expect(result).toEqual(affectedRowsResponse);
      expect(mockDatabaseService.deleteData).toHaveBeenCalledWith(expectedQuery, expectedParams);
    });
  });

  describe('getProductsCount', () => {
    it('should call productsRepository.getProductsCount and return the products count by companyId', async () => {
      const expectedQuery: string = 'SELECT COUNT(*) as total FROM productos p WHERE empresa_id = ?';

      mockDatabaseService.getData.mockResolvedValue([{ total: mockCountResponse }]);
      const result = await repository.getProductsCount(mockCompanyId);
      expect(result).toEqual(mockCountResponse);
      expect(mockDatabaseService.getData).toHaveBeenCalledWith(expectedQuery, mockCompanyId);
    });
  });

  describe('getSearchedProductsCount', () => {
    it('should call productsRepository.getSearchedProductsCount and return the count of searched products', async () => {
      const mockParams: GetProductsParamsDto = { page: 1, limit: 10, filter: 'precio', search: 'some' };

      mockDatabaseService.getData.mockResolvedValue([{ total: mockCountResponse }]);
      const result = await repository.getSearchedProductsCount(mockCompanyId, mockParams);
      expect(result).toEqual(mockCountResponse);
    });
  });
});
