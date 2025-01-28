/**
 * test/01_user.test.js
 *
 * Tests for:
 * - user/login
 * - user/createUser
 */

const { faker } = require('@faker-js/faker');
const request = require('supertest');

const app = require('../app');  

describe('User APIs', () => {
  let superadminToken;
  const superadminEmail = 'john@mac.com';
  const superadminPass  = '123456';

  it('should login as superadmin and get a token', async () => {
    const res = await request(app)
      .post('/api/user/login')
      .send({ email: superadminEmail, password: superadminPass });
    
    expect(res.body.ok).toBe(true);
    expect(res.body.data).toHaveProperty('token');
    superadminToken = res.body.data.token;
  });

  it('should create a new user (schooladmin) using superadmin token', async () => {
    const res = await request(app)
      .post('/api/user/createUser')
      .set('token', superadminToken)
      .send({
        username: faker.internet.userName(),
        email: faker.internet.email(),
        password: faker.internet.password(8),
        role: 'schooladmin', 
      });
    
    expect(res.body.ok).toBe(true);
    expect(res.body.data.user.role).toBe('schooladmin');
  });

  it('should fail to create a user if missing data', async () => {
    const res = await request(app)
      .post('/api/user/createUser')
      .set('token', superadminToken)
      .send({
        username: 'noEmail'
      });
    
    expect(res.body.ok).toBe(false);
    expect(res.statusCode).toBe(400);
  });

  it('should fail to login with invalid credentials', async () => {
    const res = await request(app)
      .post('/api/user/login')
      .send({ email: 'test@admin.com', password: 'nothing' });
    expect(res.body.ok).toBe(false);
    expect(res.statusCode).toBe(400);
  });
});
