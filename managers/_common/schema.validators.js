
module.exports = {
    user: {
      create({ username, email, password, role }) {
        if (!username) return { error: 'username is required' };
        if (!email)    return { error: 'email is required' };
        if (!password) return { error: 'password is required' };
        if (!role)     return { error: 'role is required (superadmin or schooladmin)' };
        return null;
      },
      login({ email, password }) {
        if (!email)    return { error: 'email is required' };
        if (!password) return { error: 'password is required' };
        return null;
      }
    },
  
    school: {
      create({ name, address }) {
        if (!name)    return { error: 'School name is required' };
        if (!address) return { error: 'School address is required' };
        return null;
      },
      update({ schoolId }) {
        if (!schoolId) return { error: 'schoolId is required' };
        return null;
      }
    },
  
    classroom: {
      create({ schoolId, name }) {
        if (!schoolId) return { error: 'schoolId is required' };
        if (!name)     return { error: 'Classroom name is required' };
        return null;
      },
      update({ classroomId, schoolId }) {
        if (!classroomId) return { error: 'classroomId is required' };
        if (!schoolId)    return { error: 'schoolId is required' };
        return null;
      }
    },
  
    student: {
      create({ schoolId, firstName, lastName, email }) {
        if (!schoolId)  return { error: 'schoolId is required' };
        if (!firstName) return { error: 'Student firstName is required' };
        if (!lastName)  return { error: 'Student lastName is required' };
        if (!email)     return { error: 'Student email is required' };
        return null;
      },
      update({ studentId, schoolId }) {
        if (!studentId) return { error: 'studentId is required' };
        if (!schoolId)  return { error: 'schoolId is required' };
        return null;
      },
      transfer({ studentId, newSchoolId }) {
        if (!studentId)   return { error: 'studentId is required' };
        if (!newSchoolId) return { error: 'newSchoolId is required' };
        return null;
      }
    }
  };
  