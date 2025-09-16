'use strict';

const request = require('supertest');
const app = require('../../server');

describe('Auth Endpoints', () => {
  describe('POST /api/auth/login', () => {
    it('should login with valid credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          username: 'jrodriguez',
          password: '123456'
        });

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('SUCCESS');
      expect(response.body.data).toHaveProperty('token');
      expect(response.body.data).toHaveProperty('policia');
    });

    it('should return error with invalid credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          username: 'invalid',
          password: 'invalid'
        });

      expect(response.status).toBe(401);
      expect(response.body.status).toBe('ERROR');
    });

    it('should return error with missing credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.status).toBe('ERROR');
    });
  });

  describe('GET /api/auth/perfil', () => {
    let token;

    beforeAll(async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          username: 'jrodriguez',
          password: '123456'
        });
      
      token = response.body.data.token;
    });

    it('should get profile with valid token', async () => {
      const response = await request(app)
        .get('/api/auth/perfil')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('SUCCESS');
      expect(response.body.data).toHaveProperty('nombres');
      expect(response.body.data).toHaveProperty('apellidos');
    });

    it('should return error without token', async () => {
      const response = await request(app)
        .get('/api/auth/perfil');

      expect(response.status).toBe(401);
      expect(response.body.status).toBe('ERROR');
    });
  });
});
