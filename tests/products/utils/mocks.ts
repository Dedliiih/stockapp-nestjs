import { Product } from 'src/modules/products/entities/product-entity';
import { CreateProductDto } from 'src/modules/products/dto/create-product.dto';
import { UpdateProductDto } from 'src/modules/products/dto/update-product.dto';

export const mockCountResponse = 10;
export const mockCompanyId = '94';
export const mockProductId = '108';
export const mockProductList: Product[] = [
  {
    producto_id: 1,
    nombre: 'Test Product',
    precio: 100,
    categoria: 'Test Category',
    descripcion: '',
    sku: '',
    stock: 10
  }
];

export const affectedRowsResponse = {
  affectedRows: 1,
  fieldCount: 0,
  insertId: 123,
  info: '',
  serverStatus: 2,
  warningStatus: 0,
  changedRows: 0
};

export const notAffectedRowsResponse = {
  affectedRows: 0,
  fieldCount: 0,
  insertId: 123,
  info: '',
  serverStatus: 2,
  warningStatus: 0
};

export const createProductMock: CreateProductDto = {
  name: 'Test',
  description: 'Test',
  sku: 'Test',
  stock: 2,
  category: 1,
  price: 0,
  company: null
};

export const updateProductMock: UpdateProductDto = {
  name: 'Test',
  description: 'Test',
  sku: 'Test',
  stock: 2,
  category: 1,
  price: 0
};

export const mockProductsRepository = {
  getAll: jest.fn(),
  getBySearchBar: jest.fn(),
  getProductsCount: jest.fn(),
  getSearchedProductsCount: jest.fn(),
  createProduct: jest.fn(),
  updateProduct: jest.fn(),
  deleteProduct: jest.fn()
};
