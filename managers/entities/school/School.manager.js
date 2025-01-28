module.exports = class SchoolManager {
    constructor({ validators, mongomodels, ...deps }) {
      this.validators = validators;
      this.mongomodels = mongomodels || require('../../_common/schema.models.js');
      this.School = this.mongomodels.SchoolModel; 
      this.deps = deps;
  
      // These method names map to dynamic routes
      this.httpExposed = [
        'post=createSchool',
        'get=listSchools',
        'get=getSchool',
        'put=updateSchool',
        'delete=deleteSchool'
      ];
    }

    async createSchool({ name, address, phone, email, website, established, principal, tags, logoUrl, __longToken }) {
        console.log("token", __longToken)
      if (!__longToken?.role) return { error: 'Unauthorized - no token', code: 401 };
      if (__longToken.role !== 'superadmin') {
        return { error: 'Forbidden - only superadmin can create a school', code: 403 };
      }
  
      const invalid = this.validators.school.create({ name, address });
      if (invalid) return { ...invalid, code: 400 };
  
      try {
        const newSchool = await this.School.create({
          name, address, phone, email, website, established, principal, tags, logoUrl
        });
        return newSchool; 
      } catch (err) {
        return { error: err.message, code: 400 };
      }
    }
  
    async listSchools({ __longToken }) {
      if (!__longToken?.role) return { error: 'Unauthorized', code: 401 };
      if (__longToken.role !== 'superadmin') {
        return { error: 'Forbidden - only superadmin can list schools', code: 403 };
      }
  
      try {
        return await this.School.find().sort({ createdAt: -1 });
      } catch (err) {
        return { error: err.message, code: 400 };
      }
    }
  
    async getSchool({ schoolId, __longToken }) {
      if (!__longToken?.role) return { error: 'Unauthorized', code: 401 };
      if (__longToken.role !== 'superadmin') {
        return { error: 'Forbidden - only superadmin', code: 403 };
      }
      if (!schoolId) return { error: 'schoolId is required', code: 400 };
  
      try {
        const school = await this.School.findById(schoolId);
        if (!school) return { error: 'School not found', code: 404 };
        return school;
      } catch (err) {
        return { error: err.message, code: 400 };
      }
    }
  
    async updateSchool({ schoolId, name, address, phone, email, website, established, principal, tags, logoUrl, __longToken }) {
      if (!__longToken?.role) return { error: 'Unauthorized', code: 401 };
      if (__longToken.role !== 'superadmin') {
        return { error: 'Forbidden - only superadmin', code: 403 };
      }
  
      const invalid = this.validators.school.update({ schoolId });
      if (invalid) return { ...invalid, code: 400 };
  
      try {
        const updated = await this.School.findByIdAndUpdate(
          schoolId,
          { name, address, phone, email, website, established, principal, tags, logoUrl },
          { new: true, runValidators: true }
        );
        if (!updated) return { error: 'School not found', code: 404 };
        return updated;
      } catch (err) {
        return { error: err.message, code: 400 };
      }
    }
  
    async deleteSchool({ schoolId, __longToken }) {
      if (!__longToken?.role) return { error: 'Unauthorized', code: 401 };
      if (__longToken.role !== 'superadmin') {
        return { error: 'Forbidden - only superadmin', code: 403 };
      }
      if (!schoolId) return { error: 'schoolId is required', code: 400 };
  
      try {
        const deleted = await this.School.findByIdAndDelete(schoolId);
        if (!deleted) return { error: 'School not found', code: 404 };
        return { message: `School '${deleted.name}' deleted.` };
      } catch (err) {
        return { error: err.message, code: 400 };
      }
    }
  };
  