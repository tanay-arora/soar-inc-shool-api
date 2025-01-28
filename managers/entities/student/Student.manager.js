
module.exports = class StudentManager {
    constructor({ validators, mongomodels, ...deps }) {
      this.validators = validators;
      this.mongomodels = mongomodels || require('../../_common/schema.models.js');
      this.Student = this.mongomodels.StudentModel;
      this.deps = deps;
  
      this.httpExposed = [
        'post=createStudent',
        'get=listStudents',
        'get=getStudent',
        'put=updateStudent',
        'delete=deleteStudent',
        'patch=transferStudent'
      ];
    }
  
    async createStudent({ schoolId, firstName, lastName, email, phone, gender, birthDate, address, guardians, gradeLevel, __longToken }) {
      if (!__longToken?.role) return { error: 'Unauthorized', code: 401 };
      if (__longToken.role === 'schooladmin') {

        if (__longToken.schoolId?.toString() !== schoolId) {
          return { error: 'Forbidden - not your school', code: 403 };
        }
      } else if (__longToken.role !== 'superadmin') {
        return { error: 'Forbidden', code: 403 };
      }
  
      const invalid = this.validators.student.create({ schoolId, firstName, lastName, email });
      if (invalid) return { ...invalid, code: 400 };
  
      try {
        const newStudent = await this.Student.create({
          schoolId, firstName, lastName, email, phone, gender, birthDate, address, guardians, gradeLevel
        });
        return newStudent;
      } catch (err) {
        return { error: err.message, code: 400 };
      }
    }
  
    async listStudents({ schoolId, __longToken }) {
      if (!__longToken?.role) return { error: 'Unauthorized', code: 401 };
      if (__longToken.role === 'schooladmin') {
        if (__longToken.schoolId?.toString() !== schoolId) {
          return { error: 'Forbidden', code: 403 };
        }
      } else if (__longToken.role !== 'superadmin') {
        return { error: 'Forbidden', code: 403 };
      }
  
      try {
        return await this.Student.find({ schoolId }).sort({ createdAt: -1 });
      } catch (err) {
        return { error: err.message, code: 400 };
      }
    }
  
    async getStudent({ studentId, schoolId, __longToken }) {
      if (!__longToken?.role) return { error: 'Unauthorized', code: 401 };
      if (__longToken.role === 'schooladmin') {
        if (__longToken.schoolId?.toString() !== schoolId) {
          return { error: 'Forbidden', code: 403 };
        }
      } else if (__longToken.role !== 'superadmin') {
        return { error: 'Forbidden', code: 403 };
      }
  
      if (!studentId) return { error: 'studentId is required', code: 400 };
  
      try {
        const student = await this.Student.findOne({ _id: studentId, schoolId });
        if (!student) return { error: 'Student not found', code: 404 };
        return student;
      } catch (err) {
        return { error: err.message, code: 400 };
      }
    }
  
    async updateStudent({ studentId, schoolId, firstName, lastName, email, phone, gender, birthDate, address, guardians, gradeLevel, __longToken }) {
      if (!__longToken?.role) return { error: 'Unauthorized', code: 401 };
      if (__longToken.role === 'schooladmin') {
        if (__longToken.schoolId?.toString() !== schoolId) {
          return { error: 'Forbidden', code: 403 };
        }
      } else if (__longToken.role !== 'superadmin') {
        return { error: 'Forbidden', code: 403 };
      }
  
      const invalid = this.validators.student.update({ studentId, schoolId });
      if (invalid) return { ...invalid, code: 400 };
  
      try {
        const updated = await this.Student.findOneAndUpdate(
          { _id: studentId, schoolId },
          { firstName, lastName, email, phone, gender, birthDate, address, guardians, gradeLevel },
          { new: true, runValidators: true }
        );
        if (!updated) return { error: 'Student not found', code: 404 };
        return updated;
      } catch (err) {
        return { error: err.message, code: 400 };
      }
    }
  
    async deleteStudent({ studentId, schoolId, __longToken }) {
      if (!__longToken?.role) return { error: 'Unauthorized', code: 401 };
      if (__longToken.role === 'schooladmin') {
        if (__longToken.schoolId?.toString() !== schoolId) {
          return { error: 'Forbidden', code: 403 };
        }
      } else if (__longToken.role !== 'superadmin') {
        return { error: 'Forbidden', code: 403 };
      }
  
      if (!studentId) return { error: 'studentId is required', code: 400 };
  
      try {
        const deleted = await this.Student.findOneAndDelete({ _id: studentId, schoolId });
        if (!deleted) return { error: 'Student not found', code: 404 };
        return { message: `Student '${deleted.firstName} ${deleted.lastName}' deleted` };
      } catch (err) {
        return { error: err.message, code: 400 };
      }
    }
  
    async transferStudent({ studentId, newSchoolId, __longToken }) {
      if (!__longToken?.role) return { error: 'Unauthorized', code: 401 };
      if (__longToken.role !== 'superadmin') {
        return { error: 'Forbidden - only superadmin can transfer', code: 403 };
      }
  
      const invalid = this.validators.student.transfer({ studentId, newSchoolId });
      if (invalid) return { ...invalid, code: 400 };
  
      try {
        const updated = await this.Student.findByIdAndUpdate(
          studentId,
          { schoolId: newSchoolId, enrollmentStatus: 'transferred' },
          { new: true }
        );
        if (!updated) return { error: 'Student not found', code: 404 };
        return updated;
      } catch (err) {
        return { error: err.message, code: 400 };
      }
    }
  };
  