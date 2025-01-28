const bcrypt = require('bcrypt');
module.exports = class UserManager {
  constructor({ validators, mongomodels, managers, ...deps }) {
    this.validators  = validators;
    this.mongomodels = mongomodels || require('../../_common/schema.models.js');
    this.User        = this.mongomodels.UserModel;
    this.tokenManager= managers.token;
    this.deps        = deps;

    this.httpExposed = [
      'post=createUser',  // superadmin action
      'post=login'        // any user can login
    ];
  }

   // CREATE USER - Only superadmin can create a new user (including other superadmins or schooladmins)

  async createUser({ username, email, password, role, schoolId, __longToken }) {
    if (!__longToken?.role) {
      return { error: 'Unauthorized - missing token', code: 401 };
    }
    if (__longToken.role !== 'superadmin') {
      return { error: 'Forbidden - only superadmin can create user', code: 403 };
    }

    const invalid = this.validators.user.create({ username, email, password, role });
    if (invalid) return { ...invalid, code: 400 };

    try {
        const IsUserExist = await this.User.findOne({ email }).lean();
        if (IsUserExist) {
            return { error: 'User already exist', code: 400 };
        }
      const userDoc = new this.User({
        username,
        email,
        password,
        role
      });
      if (role === 'schooladmin') {
        userDoc.schoolId = schoolId;
      }

      const savedUser = await userDoc.save();

      const token = this.tokenManager.genLongToken({
        userId: savedUser._id,
        role: savedUser.role,
        schoolId: savedUser.schoolId
      });

      return {
        user: {
          _id: savedUser._id,
          username: savedUser.username,
          email: savedUser.email,
          role: savedUser.role,
          schoolId: savedUser.schoolId
        },
        token
      };
    } catch (err) {
      return { error: err.message, code: 400 };
    }
  }

// LOGIN - Accepts email + password, returns JWT
  async login({ email, password, __longToken }) {
    const invalid = this.validators.user.login({ email, password });
    if (invalid) return { ...invalid, code: 400 };
    try {
      const user = await this.User.findOne({ email });
      if (!user) return { error: 'Invalid credentials', code: 401 };

      const match = await bcrypt.compare(password, user.password);
      if (!match) return { error: 'Invalid credentials', code: 401 };

      const token = this.tokenManager.genLongToken({
        userId: user._id,
        role: user.role,
        schoolId: user.schoolId
      });

      return {
        token,
        user: {
          _id: user._id,
          username: user.username,
          role: user.role,
          schoolId: user.schoolId
        }
      };
    } catch (err) {
      return { error: err.message, code: 400 };
    }
  }
};
