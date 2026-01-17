// schema/File.js (Updated)
const mongoose = require('mongoose');

const fileSchema = new mongoose.Schema({
  originalName: { type: String, required: true },
  storedFileName: { type: String, required: true, unique: true },
  fileUrl: { type: String, required: true },
  mimeType: { type: String, required: true },
  size: { type: Number, required: true },
  fileHash: { type: String, required: true, unique: true, sparse: true }, // <--- NEW FIELD: File content hash
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  uploadDate: { type: Date, default: Date.now },
  associatedEntity: {
    id: { type: mongoose.Schema.Types.ObjectId, refPath: 'associatedEntityType' },
    type: { type: String, enum: ['Lead', 'Funnel', 'CoachProfile'] }
  }
}, { timestamps: true });

module.exports = mongoose.model('File', fileSchema);