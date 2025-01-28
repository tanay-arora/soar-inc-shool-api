/**
 * test/02_school.test.js
 *
 * Tests for:
 *  - school/createSchool
 *  - school/listSchools
 *  - school/getSchool
 *  - school/updateSchool
 *  - school/deleteSchool
 */

const { faker } = require('@faker-js/faker');
const request = require('supertest');
const app = require('../app');

describe('School APIs', () => {
  let superadminToken;
  let createdSchoolId;

  beforeAll(async () => {
    const loginRes = await request(app)
      .post('/api/user/login')
      .send({ email: 'john@mac.com', password: '123456' });
    superadminToken = loginRes.body.data.token;
  });

  it('should create a school (superadmin)', async () => {
    const res = await request(app)
      .post('/api/school/createSchool')
      .set('token', superadminToken)
      .send({
        name: faker.company.name(), 
        address: faker.location.streetAddress(true) + ', ' + faker.location.city() + ', ' + faker.location.country(), 
        phone: faker.phone.number('(###) ###-####'), 
        principal: faker.person.fullName()
      });
    expect(res.body.ok).toBe(true);
    createdSchoolId = res.body.data._id;
  });

  it('should list all schools (superadmin)', async () => {
    const res = await request(app)
      .get('/api/school/listSchools')
      .set('token', superadminToken);
    expect(res.body.ok).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('should get a single school by ID', async () => {
    const res = await request(app)
      .get('/api/school/getSchool')
      .set('token', superadminToken)
      .send({ schoolId: createdSchoolId });
    expect(res.body.ok).toBe(true);
    expect(res.body.data._id).toBe(createdSchoolId);
  });

  it('should update a school', async () => {
    const res = await request(app)
      .put('/api/school/updateSchool')
      .set('token', superadminToken)
      .send({
        schoolId: createdSchoolId,
        phone: '2222222222'
      });
    expect(res.body.ok).toBe(true);
    expect(res.body.data.phone).toBe('2222222222');
  });

  it('should delete a school', async () => {
    const res = await request(app)
      .delete('/api/school/deleteSchool')
      .set('token', superadminToken)
      .send({ schoolId: createdSchoolId });
    expect(res.body.ok).toBe(true);
    expect(res.body.data.message).toContain('deleted');
  });
});
