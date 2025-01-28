/**
 * test/03_classroom.test.js
 *
 * Tests for:
 *  - classroom/createClassroom
 *  - classroom/listClassrooms
 *  - classroom/getClassroom
 *  - classroom/updateClassroom
 *  - classroom/deleteClassroom
 *  - classroom/enrollStudentInClassroom (optional)
 */

const { faker } = require('@faker-js/faker');

const request = require('supertest');
const app = require('../app');

describe('Classroom APIs', () => {
  let superadminToken;
  let createdSchoolId;
  let createdClassroomId;

  beforeAll(async () => {
    // Login as superadmin
    const loginRes = await request(app)
      .post('/api/user/login')
      .send({ email: 'john@mac.com', password: '123456' });
    superadminToken = loginRes.body.data.token;

    const schoolRes = await request(app)
      .post('/api/school/createSchool')
      .set('token', superadminToken)
      .send({ name: faker.company.name(), address:  faker.location.streetAddress(true) + ', ' + faker.location.city() + ', ' + faker.location.country() });
    createdSchoolId = schoolRes.body.data._id;
  });

  it('should create a classroom', async () => {
    let roomName = faker.company.name()
    const res = await request(app)
      .post('/api/classroom/createClassroom')
      .set('token', superadminToken)
      .send({
        schoolId: createdSchoolId,
        name: roomName,
        capacity: Math.floor(Math.random() * 100),
        isLab: false
      });
    expect(res.body.ok).toBe(true);
    expect(res.body.data.name).toBe(roomName);
    createdClassroomId = res.body.data._id;
  });

  it('should list classrooms for that school', async () => {
    const res = await request(app)
      .get('/api/classroom/listClassrooms')
      .set('token', superadminToken)
      .send({ schoolId: createdSchoolId });
    expect(res.body.ok).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);
  });

  it('should get a specific classroom by ID', async () => {
    const res = await request(app)
      .get('/api/classroom/getClassroom')
      .set('token', superadminToken)
      .send({ classroomId: createdClassroomId, schoolId: createdSchoolId });
    expect(res.body.ok).toBe(true);
    expect(res.body.data._id).toBe(createdClassroomId);
  });

  it('should update a classroom', async () => {
    const res = await request(app)
      .put('/api/classroom/updateClassroom')
      .set('token', superadminToken)
      .send({
        classroomId: createdClassroomId,
        schoolId: createdSchoolId,
        isLab: true
      });
    expect(res.body.ok).toBe(true);
    expect(res.body.data.isLab).toBe(true);
  });

  it('should delete the classroom', async () => {
    const res = await request(app)
      .delete('/api/classroom/deleteClassroom')
      .set('token', superadminToken)
      .send({ classroomId: createdClassroomId, schoolId: createdSchoolId });
    expect(res.body.ok).toBe(true);
    expect(res.body.data.message).toContain('deleted');
  });
});
