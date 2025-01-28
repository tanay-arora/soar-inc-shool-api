/**
 * test/04_student.test.js
 *
 * Tests for:
 *   - student/createStudent
 *   - student/listStudents
 *   - student/getStudent
 *   - student/updateStudent
 *   - student/deleteStudent
 *   - student/transferStudent
 */

const request = require('supertest');
const app = require('../app');

describe('Student APIs', () => {
  let superadminToken;
  let createdSchoolId;
  let createdStudentId;
  let secondSchoolId;

  beforeAll(async () => {
    const loginRes = await request(app)
      .post('/api/user/login')
      .send({ email: 'john@mac.com', password: '123456' });
    superadminToken = loginRes.body.data.token;

    const schoolRes1 = await request(app)
      .post('/api/school/createSchool')
      .set('token', superadminToken)
      .send({ name: 'Student School #1', address: '123 Lane' });
    createdSchoolId = schoolRes1.body.data._id;

    const schoolRes2 = await request(app)
      .post('/api/school/createSchool')
      .set('token', superadminToken)
      .send({ name: 'Student School #2', address: '456 Lane' });
    secondSchoolId = schoolRes2.body.data._id;
  });

  it('should create a student in the first school', async () => {
    const res = await request(app)
      .post('/api/student/createStudent')
      .set('token', superadminToken)
      .send({
        schoolId: createdSchoolId,
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@admin.com',
        gradeLevel: '12th'
      });
    expect(res.body.ok).toBe(true);
    createdStudentId = res.body.data._id;
  });

  it('should list students in the first school', async () => {
    const res = await request(app)
      .get('/api/student/listStudents')
      .set('token', superadminToken)
      .send({ schoolId: createdSchoolId });
    expect(res.body.ok).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);
  });

  it('should get a specific student', async () => {
    const res = await request(app)
      .get('/api/student/getStudent')
      .set('token', superadminToken)
      .send({ studentId: createdStudentId, schoolId: createdSchoolId });
    expect(res.body.ok).toBe(true);
    expect(res.body.data._id).toBe(createdStudentId);
  });

  it('should update a student (new phone)', async () => {
    const res = await request(app)
      .put('/api/student/updateStudent')
      .set('token', superadminToken)
      .send({
        studentId: createdStudentId,
        schoolId: createdSchoolId,
        phone: '2222222222'
      });
    expect(res.body.ok).toBe(true);
    expect(res.body.data.phone).toBe('2222222222');
  });

  it('should transfer a student to the second school', async () => {
    const res = await request(app)
      .patch('/api/student/transferStudent')
      .set('token', superadminToken)
      .send({
        studentId: createdStudentId,
        newSchoolId: secondSchoolId
      });
    expect(res.body.ok).toBe(true);
    expect(res.body.data.schoolId).toBe(secondSchoolId);
    expect(res.body.data.enrollmentStatus).toBe('transferred');
  });

  it('should delete a student from the second school', async () => {
    const res = await request(app)
      .delete('/api/student/deleteStudent')
      .set('token', superadminToken)
      .send({ studentId: createdStudentId, schoolId: secondSchoolId });
    expect(res.body.ok).toBe(true);
    expect(res.body.data.message).toContain('deleted');
  });
});
