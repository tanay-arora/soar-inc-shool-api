const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

/**
 * ========== School Schema ==========
 */
const SchoolSchema = new mongoose.Schema({
  name:        { type: String, required: [true, 'School name is required'], trim: true },
  address:     { type: String, required: [true, 'School address is required'] },
  phone:       { type: String },
  email:       { type: String },
  website:     { type: String },
  established: { type: Date },
  principal:   { type: String },
  staffCount:  { type: Number, default: 0 },
  tags:        { type: [String], default: [] },
  logoUrl:     { type: String }
}, { timestamps: true });

SchoolSchema.index({ name: 1 });
const SchoolModel = mongoose.model('School', SchoolSchema);

/**
 * ========== Classroom Schema ==========
 */
const ClassroomSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Classroom name is required'],
    trim: true
  },
  code:        { type: String },
  floor:       { type: Number },
  capacity:    { type: Number, default: 30 },
  resources:   { type: [String], default: [] },
  isLab:       { type: Boolean, default: false },
  subject:     { type: String },
  schoolId:    { type: mongoose.Schema.Types.ObjectId, ref: 'School', required: true }
}, { timestamps: true });

ClassroomSchema.index({ schoolId: 1, code: 1 });
const ClassroomModel = mongoose.model('Classroom', ClassroomSchema);

/**
 * ========== Student Schema ==========
 */
const StudentSchema = new mongoose.Schema({
  firstName:         { type: String, required: [true, 'Student firstName is required'] },
  lastName:          { type: String, required: [true, 'Student lastName is required'] },
  email:             { type: String, required: [true, 'Student email is required'], unique: true },
  phone:             { type: String },
  gender:            { type: String, enum: ['Male', 'Female', 'Other'], default: 'Other' },
  birthDate:         { type: Date },
  address:           { type: String },
  guardians: [{
    name:          { type: String },
    phone:         { type: String },
    relationship:  { type: String }
  }],
  enrollmentDate:    { type: Date, default: Date.now },
  enrollmentStatus:  { type: String, enum: ['active', 'transferred', 'graduated', 'suspended', 'inactive'], default: 'active' },
  gradeLevel:        { type: String },
  schoolId:          { type: mongoose.Schema.Types.ObjectId, ref: 'School', required: true },
  enrolledClassrooms: [{
    classroomId: { type: mongoose.Schema.Types.ObjectId, ref: 'Classroom' },
    enrolledDate: { type: Date }
  }],
}, { timestamps: true });

StudentSchema.index({ schoolId: 1, email: 1 }, { unique: false });
const StudentModel = mongoose.model('Student', StudentSchema);

/**
 * ========== User Schema ==========
 * For superadmin or schooladmin
 */
const UserSchema = new mongoose.Schema({
  username:   { type: String, required: true, unique: true, trim: true },
  email:      { type: String, required: true, unique: true },
  password:   { type: String, required: true },
  role:       { type: String, enum: ['superadmin', 'schooladmin'], default: 'schooladmin' },
  // If role=schooladmin, link to a specific school
  schoolId:   { type: mongoose.Schema.Types.ObjectId, ref: 'School' }
}, { timestamps: true });

// Hash password on save
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

const UserModel = mongoose.model('User', UserSchema);

module.exports = {
  SchoolModel,
  ClassroomModel,
  StudentModel,
  UserModel
};