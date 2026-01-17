const mongoose = require('mongoose');

// Course Folder Schema
const courseFolderSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    default: ''
  },
  parentFolder: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CourseFolder',
    default: null
  },
  path: {
    type: String,
    required: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'AdminUser',
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

// Add indexes for better performance
courseFolderSchema.index({ parentFolder: 1, name: 1 });
courseFolderSchema.index({ createdBy: 1 });
courseFolderSchema.index({ path: 1 });

module.exports = mongoose.model('CourseFolder', courseFolderSchema);
