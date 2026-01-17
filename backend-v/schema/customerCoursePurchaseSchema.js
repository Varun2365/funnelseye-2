const mongoose = require('mongoose');

// Customer Course Purchase Schema
const customerCoursePurchaseSchema = new mongoose.Schema({
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ContentCourse',
    required: true,
    index: true
  },
  customerId: {
    type: String, // Will be linked to customer system when implemented
    required: true,
    index: true
  },
  customerEmail: {
    type: String,
    required: true,
    index: true
  },
  customerName: {
    type: String,
    default: ''
  },
  customerPhone: {
    type: String,
    default: ''
  },
  // Payment details
  razorpayOrderId: {
    type: String,
    default: null,
    index: true
  },
  razorpayPaymentId: {
    type: String,
    default: null,
    index: true
  },
  razorpaySignature: {
    type: String,
    default: null
  },
  amount: {
    type: Number,
    required: true
  },
  currency: {
    type: String,
    required: true,
    default: 'INR'
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'refunded'],
    default: 'pending',
    index: true
  },
  // Access details
  accessGranted: {
    type: Boolean,
    default: false,
    index: true
  },
  accessGrantedAt: {
    type: Date,
    default: null
  },
  // Course details snapshot (for historical reference)
  courseSnapshot: {
    title: String,
    description: String,
    courseType: String,
    price: Number,
    currency: String,
    thumbnail: String
  },
  // Metadata
  purchasedAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  expiresAt: {
    type: Date,
    default: null // null means lifetime access
  },
  notes: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

// Indexes for efficient queries
customerCoursePurchaseSchema.index({ customerId: 1, courseId: 1 });
customerCoursePurchaseSchema.index({ paymentStatus: 1, accessGranted: 1 });

// Method to check if customer has access to a course
customerCoursePurchaseSchema.statics.hasAccess = async function(customerId, courseId) {
  const purchase = await this.findOne({
    customerId,
    courseId,
    paymentStatus: 'completed',
    accessGranted: true,
    $or: [
      { expiresAt: null },
      { expiresAt: { $gt: new Date() } }
    ]
  });
  return !!purchase;
};

// Method to get all courses a customer has access to
customerCoursePurchaseSchema.statics.getCustomerCourses = async function(customerId) {
  return await this.find({
    customerId,
    paymentStatus: 'completed',
    accessGranted: true,
    $or: [
      { expiresAt: null },
      { expiresAt: { $gt: new Date() } }
    ]
  }).populate('courseId').sort({ purchasedAt: -1 });
};

const CustomerCoursePurchase = mongoose.model('CustomerCoursePurchase', customerCoursePurchaseSchema);

module.exports = CustomerCoursePurchase;

