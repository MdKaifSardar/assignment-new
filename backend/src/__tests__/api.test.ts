import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../app';

describe('API Integration Test Suite', () => {
  describe('GET /api/health', () => {
    it('should return 200 OK with health status', async () => {
      const response = await request(app).get('/api/health');
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('status', 'ok');
    });
  });

  describe('POST /api/auth/login', () => {
    it('should authenticate valid admin user and return JWT token', async () => {
      const response = await request(app).post('/api/auth/login').send({
        email: 'admin@storeratings.com',
        password: 'AdminPass123!1',
      });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('token');
      expect(response.body.user).toHaveProperty('role', 'ADMIN');
    });

    it('should reject invalid password with 401 status', async () => {
      const response = await request(app).post('/api/auth/login').send({
        email: 'admin@storeratings.com',
        password: 'WrongPassword999!',
      });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('Validation & Security Middleware', () => {
    it('should reject signup with Name shorter than 20 characters', async () => {
      const response = await request(app).post('/api/auth/signup').send({
        name: 'Short Name',
        email: 'short.test@example.com',
        address: '123 Test St',
        password: 'UserPass123!',
      });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('20');
    });

    it('should reject unauthorized admin route access without bearer token', async () => {
      const response = await request(app).get('/api/admin/users');
      expect(response.status).toBe(401);
      expect(response.body.error).toBe('Access token required');
    });
  });
});
