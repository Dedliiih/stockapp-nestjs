import * as request from 'supertest';
import { Test } from '@nestjs/testing';
import { AppModule } from 'src/app.module';
import { testDatabaseProvider } from '../../utils/testDatabaseModule';
import { INestApplication } from '@nestjs/common';
import { FastifyAdapter } from '@nestjs/platform-fastify';
import { FastifyInstance } from 'fastify';
import fastifyCookie from '@fastify/cookie';
import cookieConfig from 'src/config/fastify.cookies.config';

describe('Auth module E2E', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const module = await Test.createTestingModule({ imports: [AppModule] })
      .overrideProvider('DATABASE_CONNECTION')
      .useFactory({ factory: testDatabaseProvider.useFactory })
      .compile();

    app = module.createNestApplication(new FastifyAdapter());

    const fastifyInstance: FastifyInstance = app.getHttpAdapter().getInstance() as FastifyInstance;
    await fastifyInstance.register(fastifyCookie, cookieConfig);

    await app.init();
    await app.getHttpAdapter().getInstance().ready();
  });

  afterAll(async () => {
    await app.close();
  });

  it('should be defined', () => {
    expect(app).toBeDefined();
  });

  describe('POST /auth/login', () => {
    it('It should return a 401 error if the user sends incorrect login data', async () => {
      const incorrectCredentials = { email: 'incorrectuser@gmail.com', password: 'incorrect-password' };
      const result = await request(app.getHttpServer()).post('/auth/login').send(incorrectCredentials).expect(401);

      expect(result.body).toHaveProperty('message');
      expect(result.body.message).toEqual('Credenciales inválidas.');
      expect(result.headers['set-cookie']).toBeUndefined();
    });

    it('If the login is successful, the response should be a 200 success status code and a cookie will be set.', async () => {
      const userCredentials = { password: 'testuser!', email: 'testuser@gmail.com' };
      const result = await request(app.getHttpServer()).post('/auth/login').send(userCredentials).expect(200);

      expect(result.body).toHaveProperty('message');
      expect(result.body).toHaveProperty('userProfile');
      expect(result.body.message).toEqual('Sesión iniciada correctamente.');
      expect(result.headers['set-cookie']).toBeDefined();
    });
  });

  describe('POST /auth/refresh', () => {
    it('It should return a 200 success status code if the refreshed tokens are returned.', async () => {
      const userCredentials = { password: 'testuser!', email: 'testuser@gmail.com' };
      const loginWithCredentials = await request(app.getHttpServer()).post('/auth/login').send(userCredentials).expect(200);
      const userCookie = loginWithCredentials.headers['set-cookie'];

      const result = await request(app.getHttpServer()).post('/auth/refresh').set('Cookie', userCookie).expect(200);

      expect(result.body).toHaveProperty('message');
      expect(result.body).toHaveProperty('userProfile');
      expect(result.body.message).toEqual('Sesión actualizada correctamente.');
      expect(result.headers['set-cookie']).toBeDefined();
    });
  });

  describe('GET /auth/me', () => {
    it('It should return a 200 success status code if the user profile data is returned correctly.', async () => {
      const userCredentials = { password: 'testuser!', email: 'testuser@gmail.com' };
      const loginWithCredentials = await request(app.getHttpServer()).post('/auth/login').send(userCredentials).expect(200);
      const userCookie = loginWithCredentials.headers['set-cookie'];

      const result = await request(app.getHttpServer()).get('/auth/me').set('Cookie', userCookie).expect(200);

      expect(result.body).toHaveProperty('message');
      expect(result.body).toHaveProperty('userProfile');
      expect(result.body.message).toEqual('Perfil del usuario obtenido correctamente.');
      expect(result.body.userProfile).toHaveProperty('userId');
      expect(result.body.userProfile).toHaveProperty('name');
      expect(result.body.userProfile).toHaveProperty('lastName');
      expect(result.body.userProfile).toHaveProperty('companyId');
      expect(result.body.userProfile).toHaveProperty('rolId');
    });

    it('It should return a 401 unauthorized status code if the user is not authenticated correctly.', async () => {
      await request(app.getHttpServer()).get('/auth/me').expect(401);
    });
  });
});
