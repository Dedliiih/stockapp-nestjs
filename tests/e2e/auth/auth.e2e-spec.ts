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
      expect(result.body['set-cookie']).toBeUndefined();
    });

    it('If the login is successful, the response should be a 200 success status code and a cookie will be set.', async () => {
      const userCredentials = { password: 'testuser!', email: 'testuser@gmail.com' };
      const result = await request(app.getHttpServer()).post('/auth/login').send(userCredentials).expect(200);

      expect(result.body).toHaveProperty('message');
      expect(result.body.message).toEqual('Sesión iniciada correctamente.');
      expect(result.headers['set-cookie']).toBeDefined();
    });
  });
});
