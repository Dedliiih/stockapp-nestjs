import * as request from 'supertest';
import { Test } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { createProductMock, updateProductMock } from '../../utils/productMocks';
import { restartDB, testDatabaseProvider } from '../../utils/testDatabaseModule';
import * as mysql from 'mysql2/promise';
import { JwtService } from '@nestjs/jwt';
import { AppModule } from 'src/app.module';
import { ResponseTransformInterceptor } from 'src/common/interceptors/transform-response.interceptor';
import { Reflector } from '@nestjs/core';

async function setupTestDB(dbConnection: mysql.Connection) {
  await restartDB(dbConnection);

  await dbConnection.query(`
    INSERT INTO productos (nombre, descripcion, SKU, stock, precio, categoria, empresa_id) VALUES
    ('E2E Product 1', 'Desc 1', 'SKU-E2E-1', 10, 100, 1, 1),
    ('E2E Product 2', 'Desc 2', 'SKU-E2E-2', 20, 200, 1, 1),
    ('Other Company Product', 'Desc 3', 'SKU-E2E-3', 5, 50, 1, 1);
  `);
}

type Token = {
  userId: string;
  name: string;
  lastName: string;
  companyId: number;
  role: number;
};

describe('Products module e2e', () => {
  let app: INestApplication;
  let jwtService: JwtService;
  let dbConnection: mysql.Connection;
  let adminToken: string;
  let unauthorizedToken: string;

  let adminPayload: Token = {
    userId: '2',
    name: 'admin',
    lastName: 'admin',
    companyId: 1,
    role: 5
  };

  let unauthorizedPayload: Token = {
    userId: '2',
    name: 'unauthorized',
    lastName: 'admin',
    companyId: 1,
    role: 7
  };

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [AppModule]
    })
      .overrideProvider('DATABASE_CONNECTION')
      .useFactory({ factory: testDatabaseProvider.useFactory })
      .compile();

    app = module.createNestApplication();
    app.useGlobalInterceptors(new ResponseTransformInterceptor(app.get(Reflector)));
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }));
    await app.init();

    jwtService = module.get<JwtService>(JwtService);
    dbConnection = module.get<mysql.Connection>('DATABASE_CONNECTION');

    adminToken = jwtService.sign(adminPayload);
    unauthorizedToken = jwtService.sign(unauthorizedPayload);
  });

  beforeEach(async () => {
    await setupTestDB(dbConnection);
  });

  afterAll(async () => {
    await dbConnection.end();
    await app.close();
  });

  it('should be defined', async () => {
    expect(app).toBeDefined();
  });

  describe('GET /products', () => {
    it('should return 401 Unauthorized if no token is provided', () => {
      return request(app.getHttpServer()).get('/products').expect(401);
    });

    it('should return 401 Unauthorized if token is invalid', () => {
      return request(app.getHttpServer()).get('/products').set('Authorization', 'Bearer invalidtoken').expect(401);
    });

    it('should return 403 Forbbiden if user role is not allowed', () => {
      return request(app.getHttpServer())
        .get('/products')
        .set('Authorization', `Bearer ${unauthorizedToken}`)
        .expect(403);
    });

    it('should return 200 OK and a list of products for an authorized user', async () => {
      const response = await request(app.getHttpServer())
        .get('/products')
        .set('Authorization', `Bearer ${adminToken}`)
        .query({ page: 1, limit: 10, filter: 'nombre' })
        .expect(200);

      expect(response.body).toHaveProperty('products');
      expect(response.body).toHaveProperty('total');
      expect(response.body.products).toHaveLength(3);
      expect(response.body.total).toBe(3);
    });

    it('should reteurn 400 Bad Request for invalid query parameters', () => {
      return request(app.getHttpServer())
        .get('/products')
        .set('Authorization', `Bearer ${adminToken}`)
        .query({ page: 'not-a-number' })
        .expect(400);
    });
  });

  describe('POST /products', () => {
    it('should create a new product and return a success message', async () => {
      const response = await request(app.getHttpServer())
        .post('/products')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(createProductMock)
        .expect(201);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toEqual('Producto añadido correctamente.');
    });
  });

  describe('PUT /products', () => {
    it('should update a product by id and return a success message', async () => {
      let lastProductId: number;

      const [insertProduct]: any = await dbConnection.query(`
          INSERT INTO productos (nombre, descripcion, SKU, stock, precio, categoria, empresa_id) 
          VALUES ('E2E Product 1', 'Desc 1', 'SKU-E2E-1', 10, 100, 1, 1)
          `);

      lastProductId = insertProduct.insertId;

      const response = await request(app.getHttpServer())
        .put(`/products/${lastProductId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updateProductMock)
        .expect(200);
      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toEqual('Producto actualizado correctamente.');
    });

    it('should return a 404 not found when a product cannot be found', async () => {
      return await request(app.getHttpServer())
        .put(`/products/999999999`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updateProductMock)
        .expect(404);
    });
  });

  describe('DELETE /products', () => {
    it('should delete a product by id and return a success message', async () => {
      let lastProductId: number;

      const [insertProduct]: any = await dbConnection.query(`
          INSERT INTO productos (nombre, descripcion, SKU, stock, precio, categoria, empresa_id) 
          VALUES ('E2E Product 1', 'Desc 1', 'SKU-E2E-1', 10, 100, 1, 1)
          `);

      lastProductId = insertProduct.insertId;

      const response = await request(app.getHttpServer())
        .delete(`/products/${lastProductId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toEqual('Producto eliminado.');
    });

    it('should return a 404 not found when a product cannot be found', async () => {
      return await request(app.getHttpServer())
        .delete(`/products/999999999`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404);
    });
  });
});
