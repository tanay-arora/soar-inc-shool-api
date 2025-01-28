
module.exports = class ClassroomManager {
    constructor({ validators, mongomodels, ...deps }) {
      this.validators    = validators;
      this.mongomodels   = mongomodels || require('../../_common/schema.models.js');
      this.Classroom     = this.mongomodels.ClassroomModel;
      this.Student       = this.mongomodels.StudentModel; 
      this.deps          = deps;
  
      this.httpExposed = [
        'post=createClassroom',
        'get=listClassrooms',
        'get=getClassroom',
        'put=updateClassroom',
        'delete=deleteClassroom',
        'post=enrollStudentInClassroom'  
      ];
    }
  
    async createClassroom({ schoolId, name, code, floor, capacity, resources, isLab, subject, __longToken }) {
      if (!__longToken?.role) return { error: 'Unauthorized', code: 401 };
      if (__longToken.role === 'schooladmin') {
        if (__longToken.schoolId?.toString() !== schoolId) {
          return { error: 'Forbidden - not your school', code: 403 };
        }
      } else if (__longToken.role !== 'superadmin') {
        return { error: 'Forbidden', code: 403 };
      }
  
      const invalid = this.validators.classroom.create({ schoolId, name });
      if (invalid) return { ...invalid, code: 400 };
  
      try {
        const newClassroom = await this.Classroom.create({
          schoolId,
          name,
          code,
          floor,
          capacity,
          resources,
          isLab,
          subject
        });
        return newClassroom;
      } catch (err) {
        return { error: err.message, code: 400 };
      }
    }
  
    async listClassrooms({ schoolId, __longToken }) {
      if (!__longToken?.role) return { error: 'Unauthorized', code: 401 };
      if (__longToken.role === 'schooladmin') {
        if (__longToken.schoolId?.toString() !== schoolId) {
          return { error: 'Forbidden', code: 403 };
        }
      } else if (__longToken.role !== 'superadmin') {
        return { error: 'Forbidden', code: 403 };
      }
  
      try {
        return await this.Classroom.find({ schoolId }).sort({ createdAt: -1 });
      } catch (err) {
        return { error: err.message, code: 400 };
      }
    }
  
    async getClassroom({ classroomId, schoolId, __longToken }) {
      if (!__longToken?.role) return { error: 'Unauthorized', code: 401 };
      if (__longToken.role === 'schooladmin') {
        if (__longToken.schoolId?.toString() !== schoolId) {
          return { error: 'Forbidden', code: 403 };
        }
      } else if (__longToken.role !== 'superadmin') {
        return { error: 'Forbidden', code: 403 };
      }
  
      if (!classroomId) return { error: 'classroomId is required', code: 400 };
  
      try {
        const classroom = await this.Classroom.findOne({ _id: classroomId, schoolId });
        if (!classroom) return { error: 'Classroom not found', code: 404 };
        return classroom;
      } catch (err) {
        return { error: err.message, code: 400 };
      }
    }
  
    async updateClassroom({ classroomId, schoolId, name, code, floor, capacity, resources, isLab, subject, __longToken }) {
      if (!__longToken?.role) return { error: 'Unauthorized', code: 401 };
      if (__longToken.role === 'schooladmin') {
        if (__longToken.schoolId?.toString() !== schoolId) {
          return { error: 'Forbidden', code: 403 };
        }
      } else if (__longToken.role !== 'superadmin') {
        return { error: 'Forbidden', code: 403 };
      }
  
      const invalid = this.validators.classroom.update({ classroomId, schoolId });
      if (invalid) return { ...invalid, code: 400 };
  
      try {
        const updated = await this.Classroom.findOneAndUpdate(
          { _id: classroomId, schoolId },
          { name, code, floor, capacity, resources, isLab, subject },
          { new: true, runValidators: true }
        );
        if (!updated) return { error: 'Classroom not found', code: 404 };
        return updated;
      } catch (err) {
        return { error: err.message, code: 400 };
      }
    }
  
    async deleteClassroom({ classroomId, schoolId, __longToken }) {
      if (!__longToken?.role) return { error: 'Unauthorized', code: 401 };
      if (__longToken.role === 'schooladmin') {
        if (__longToken.schoolId?.toString() !== schoolId) {
          return { error: 'Forbidden', code: 403 };
        }
      } else if (__longToken.role !== 'superadmin') {
        return { error: 'Forbidden', code: 403 };
      }
  
      if (!classroomId) return { error: 'classroomId is required', code: 400 };
  
      try {
        const deleted = await this.Classroom.findOneAndDelete({ _id: classroomId, schoolId });
        if (!deleted) return { error: 'Classroom not found', code: 404 };
        return { message: `Classroom '${deleted.name}' deleted.` };
      } catch (err) {
        return { error: err.message, code: 400 };
      }
    }
  
    async enrollStudentInClassroom({ classroomId, schoolId, studentId, __longToken }) {
      if (!__longToken?.role) return { error: 'Unauthorized', code: 401 };
      if (__longToken.role === 'schooladmin') {
        if (__longToken.schoolId?.toString() !== schoolId) {
          return { error: 'Forbidden - not your school', code: 403 };
        }
      } else if (__longToken.role !== 'superadmin') {
        return { error: 'Forbidden', code: 403 };
      }
  
      if (!classroomId || !studentId) {
        return { error: 'classroomId and studentId are required', code: 400 };
      }
  
      try {
        const classroom = await this.Classroom.findOne({ _id: classroomId, schoolId });
        if (!classroom) return { error: 'Classroom not found', code: 404 };
  
        const count = await this.Student.countDocuments({ 'enrolledClassrooms.classroomId': classroomId });
        if (count >= classroom.capacity) {
          return { error: 'Classroom is at full capacity', code: 400 };
        }
  
        const student = await this.Student.findById(studentId);
        if (!student) return { error: 'Student not found', code: 404 };
  
        const isAlreadyEnrolled = student.enrolledClassrooms?.some(c => c.classroomId.toString() === classroomId);
        if (isAlreadyEnrolled) {
          return { error: 'Student already enrolled in this classroom', code: 400 };
        }
  
        if (!student.enrolledClassrooms) student.enrolledClassrooms = [];
        student.enrolledClassrooms.push({
          classroomId,
          enrolledDate: new Date()
        });
        await student.save();
  
        return { message: `Student enrolled in classroom '${classroom.name}'.` };
      } catch (err) {
        return { error: err.message, code: 400 };
      }
    }
  };
  