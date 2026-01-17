const mongoose = require('mongoose');

// Admin Upload Schema
const adminUploadSchema = new mongoose.Schema({
  filename: {
    type: String,
    required: true
  },
  originalName: {
    type: String,
    required: true
  },
  mimetype: {
    type: String,
    required: true
  },
  size: {
    type: Number,
    required: true
  },
  path: {
    type: String,
    required: true
  },
  fileType: {
    type: String,
    enum: ['image', 'video', 'pdf', 'document'],
    required: true
  },
  folderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CourseFolder',
    default: null
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'AdminUser',
    required: true
  },
  uploadedAt: {
    type: Date,
    default: Date.now
  }
});

// Course Schema
const courseSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    default: 0,
    min: 0
  },
  category: {
    type: String,
    trim: true,
    default: ''
  },
  difficulty: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    default: 'beginner'
  },
  duration: {
    type: String,
    trim: true,
    default: ''
  },
  thumbnail: {
    type: String, // URL or file path
    default: null
  },
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  modules: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CourseModule'
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'AdminUser',
    required: true
  },
  status: {
    type: String,
    enum: ['draft', 'published', 'archived'],
    default: 'draft'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Course Module Schema
const courseModuleSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    default: ''
  },
  order: {
    type: Number,
    default: 0
  },
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  contents: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CourseContent'
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Course Content Schema
const courseContentSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    default: ''
  },
  type: {
    type: String,
    enum: ['video', 'image', 'pdf', 'audio', 'youtube'],
    required: true
  },
  content: {
    type: String, // URL, file path, or content
    required: true
  },
  duration: {
    type: String,
    default: ''
  },
  order: {
    type: Number,
    default: 0
  },
  author: {
    type: String,
    trim: true,
    default: ''
  },
  resources: [{
    type: String // Array of resource file names or URLs
  }],
  moduleId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CourseModule',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Coach Course Assignment Schema
const coachCourseAssignmentSchema = new mongoose.Schema({
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  coachId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  permissions: {
    canModify: {
      type: Boolean,
      default: false
    },
    canSell: {
      type: Boolean,
      default: true
    },
    canView: {
      type: Boolean,
      default: true
    }
  },
  assignedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
    required: true
  },
  assignedAt: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'revoked'],
    default: 'active'
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Add indexes for better performance
courseSchema.index({ createdBy: 1, status: 1 });
courseSchema.index({ name: 'text', description: 'text' });
courseModuleSchema.index({ courseId: 1, order: 1 });
courseContentSchema.index({ moduleId: 1, order: 1 });
coachCourseAssignmentSchema.index({ coachId: 1, courseId: 1 });
adminUploadSchema.index({ uploadedBy: 1, fileType: 1 });

module.exports = {
  AdminUpload: mongoose.model('AdminUpload', adminUploadSchema),
  Course: mongoose.model('Course', courseSchema),
  CourseModule: mongoose.model('CourseModule', courseModuleSchema),
  CourseContent: mongoose.model('CourseContent', courseContentSchema),
  CoachCourseAssignment: mongoose.model('CoachCourseAssignment', coachCourseAssignmentSchema)
};
