const mongoose = require('mongoose');
const User = require('./User');

// Staff model extends User discriminator with linkage to owning coach and permissions
const Staff = User.discriminator('staff', new mongoose.Schema({
	coachId: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'User', // coach user
		required: true
	},
	permissions: {
		type: [String],
		default: [], // e.g., ['leads:read', 'leads:update', 'calendar:manage']
	},
	isActive: {
		type: Boolean,
		default: true
	},
	distributionRatio: {
		type: Number,
		default: 1, // Distribution weight for automatic lead assignment (1 = normal, 2 = double, etc.)
		min: 0,
		max: 10
	},
	lastActive: {
		type: Date,
		default: Date.now
	}
}, { timestamps: true }));

module.exports = Staff;
