const Staff = require('../schema/Staff');
const User = require('../schema/User');
const { validateSections: validatePermissions } = require('../utils/sectionPermissions');
const staffPerformanceService = require('../services/staffPerformanceService');

// Helpers
function ensureCoachScopeOrAdmin(req, staffDoc) {
	if (req.role === 'admin' || req.role === 'super_admin') return true;
	if (!staffDoc || String(staffDoc.coachId) !== String(req.coachId)) {
		const err = new Error('Forbidden');
		err.statusCode = 403;
		throw err;
	}
	return true;
}

// POST /api/staff
// Create a staff member under the authenticated coach (or specified coachId for admins)
exports.createStaff = async (req, res) => {
	try {
		if (!['coach', 'admin', 'super_admin'].includes(req.role)) {
			return res.status(403).json({ success: false, message: 'Only coach/admin can create staff.' });
		}
		const { name, email, password, permissions, coachId: bodyCoachId } = req.body;
		if (!name || !email || !password) {
			return res.status(400).json({ success: false, message: 'name, email, password are required.' });
		}
		const coachId = (req.role === 'coach') ? req.coachId : (bodyCoachId || req.coachId);
		if (!coachId) {
			return res.status(400).json({ success: false, message: 'coachId is required for admin.' });
		}

		// Check subscription limits for staff creation - MUST happen before any staff creation
		const SubscriptionLimitsMiddleware = require('../middleware/subscriptionLimits');
		const limitCheck = await SubscriptionLimitsMiddleware.checkStaffLimit(coachId);
		
		if (!limitCheck.allowed) {
			const { sendLimitError } = require('../utils/subscriptionLimitErrors');
			console.warn(`[StaffController] Staff creation blocked for coach ${coachId}: ${limitCheck.reason}`);
			return sendLimitError(
				res, 
				'STAFF', 
				limitCheck.reason || 'Staff limit reached', 
				limitCheck.currentCount || 0, 
				limitCheck.maxLimit || 0, 
				limitCheck.upgradeRequired !== false
			);
		}

		// Validate permissions if provided
		if (permissions && Array.isArray(permissions)) {
			const validation = validatePermissions(permissions);
			if (!validation.valid) {
				return res.status(400).json({ 
					success: false, 
					message: validation.error,
					invalidPermissions: validation.invalid
				});
			}
		}

		const existing = await User.findOne({ email });
		if (existing) {
			return res.status(409).json({ success: false, message: 'Email already in use.' });
		}

		const staff = await Staff.create({ 
			name, 
			email, 
			password, 
			permissions: permissions || [], 
			coachId,
			isVerified: false // New staff need to verify email on first login
		});
		
		const safe = staff.toObject();
		delete safe.password;
		return res.status(201).json({ 
			success: true, 
			message: 'Staff member created successfully. Email verification required on first login.',
			data: safe 
		});
	} catch (err) {
		console.error('createStaff error:', err.message);
		return res.status(err.statusCode || 500).json({ success: false, message: err.message || 'Server Error' });
	}
};

// GET /api/staff
// List staff for the authenticated coach (admin can pass coachId query)
exports.listStaff = async (req, res) => {
	try {
		const filterCoachId = (req.role === 'admin' || req.role === 'super_admin') && req.query.coachId ? req.query.coachId : req.coachId;
		const staff = await Staff.find({ coachId: filterCoachId }).select('-password');
		return res.status(200).json({ success: true, count: staff.length, data: staff });
	} catch (err) {
		console.error('listStaff error:', err.message);
		return res.status(500).json({ success: false, message: 'Server Error' });
	}
};

// GET /api/staff/:id
// Get specific staff details
exports.getStaff = async (req, res) => {
	try {
		const staff = await Staff.findById(req.params.id).select('-password');
		if (!staff) {
			return res.status(404).json({ success: false, message: 'Staff not found' });
		}
		
		ensureCoachScopeOrAdmin(req, staff);
		return res.status(200).json({ success: true, data: staff });
	} catch (err) {
		console.error('getStaff error:', err.message);
		return res.status(err.statusCode || 500).json({ success: false, message: err.message || 'Server Error' });
	}
};

// PUT /api/staff/:id
// Update staff (name, permissions, isActive)
exports.updateStaff = async (req, res) => {
	try {
		const staff = await Staff.findById(req.params.id);
		if (!staff) return res.status(404).json({ success: false, message: 'Staff not found' });
		ensureCoachScopeOrAdmin(req, staff);

		const updates = {};
		const allowed = ['name', 'permissions', 'isActive'];
		for (const key of allowed) if (req.body[key] !== undefined) updates[key] = req.body[key];

		// Validate permissions if updating
		if (updates.permissions && Array.isArray(updates.permissions)) {
			const validation = validatePermissions(updates.permissions);
			if (!validation.valid) {
				return res.status(400).json({ 
					success: false, 
					message: validation.error,
					invalidPermissions: validation.invalid
				});
			}
		}

		const updated = await Staff.findByIdAndUpdate(staff._id, { $set: updates }, { new: true }).select('-password');
		return res.status(200).json({ success: true, data: updated });
	} catch (err) {
		console.error('updateStaff error:', err.message);
		return res.status(err.statusCode || 500).json({ success: false, message: err.message || 'Server Error' });
	}
};

// POST /api/staff/:id/permissions
// Update staff permissions specifically
exports.updateStaffPermissions = async (req, res) => {
	try {
		const { permissions } = req.body;
		if (!permissions || !Array.isArray(permissions)) {
			return res.status(400).json({ 
				success: false, 
				message: 'permissions array is required' 
			});
		}

		// Validate permissions
		const validation = validatePermissions(permissions);
		if (!validation.valid) {
			return res.status(400).json({ 
				success: false, 
				message: validation.error,
				invalidPermissions: validation.invalid
			});
		}

		const staff = await Staff.findById(req.params.id);
		if (!staff) return res.status(404).json({ success: false, message: 'Staff not found' });
		ensureCoachScopeOrAdmin(req, staff);

		staff.permissions = permissions;
		await staff.save();

		const safe = staff.toObject();
		delete safe.password;
		
		return res.status(200).json({ 
			success: true, 
			message: 'Staff permissions updated successfully',
			data: safe 
		});
	} catch (err) {
		console.error('updateStaffPermissions error:', err.message);
		return res.status(err.statusCode || 500).json({ success: false, message: err.message || 'Server Error' });
	}
};

// DELETE /api/staff/:id
// Deactivate staff (soft delete)
exports.deactivateStaff = async (req, res) => {
	try {
		const staff = await Staff.findById(req.params.id);
		if (!staff) return res.status(404).json({ success: false, message: 'Staff not found' });
		ensureCoachScopeOrAdmin(req, staff);

		staff.isActive = false;
		await staff.save();
		return res.status(200).json({ success: true, message: 'Staff deactivated.' });
	} catch (err) {
		console.error('deactivateStaff error:', err.message);
		return res.status(err.statusCode || 500).json({ success: false, message: err.message || 'Server Error' });
	}
};

// POST /api/staff/:id/activate
// Activate staff account
exports.activateStaff = async (req, res) => {
	try {
		const staff = await Staff.findById(req.params.id);
		if (!staff) return res.status(404).json({ success: false, message: 'Staff not found' });
		ensureCoachScopeOrAdmin(req, staff);

		staff.isActive = true;
		await staff.save();
		return res.status(200).json({ success: true, message: 'Staff activated.' });
	} catch (err) {
		console.error('activateStaff error:', err.message);
		return res.status(err.statusCode || 500).json({ success: false, message: err.message || 'Server Error' });
	}
};

// GET /api/staff/:id/performance
// Get staff performance metrics
exports.getStaffPerformance = async (req, res) => {
	try {
		const staff = await Staff.findById(req.params.id);
		if (!staff) return res.status(404).json({ success: false, message: 'Staff not found' });
		ensureCoachScopeOrAdmin(req, staff);

		const { startDate, endDate, includeDetails } = req.query;
		const options = {
			startDate: startDate ? new Date(startDate) : undefined,
			endDate: endDate ? new Date(endDate) : undefined,
			includeDetails: includeDetails === 'true'
		};

		const performance = await staffPerformanceService.calculateStaffPerformance(staff._id, options);

		return res.status(200).json({ success: true, data: performance });
	} catch (err) {
		console.error('getStaffPerformance error:', err.message);
		return res.status(err.statusCode || 500).json({ success: false, message: err.message || 'Server Error' });
	}
};

// GET /api/staff/performance/comparison
// Get performance comparison between staff members
exports.getStaffPerformanceComparison = async (req, res) => {
	try {
		const { startDate, endDate } = req.query;
		const options = {
			startDate: startDate ? new Date(startDate) : undefined,
			endDate: endDate ? new Date(endDate) : undefined
		};

		const filterCoachId = (req.role === 'admin' || req.role === 'super_admin') && req.query.coachId ? req.query.coachId : req.coachId;
		
		const comparison = await staffPerformanceService.getStaffPerformanceComparison(filterCoachId, options);

		return res.status(200).json({ success: true, data: comparison });
	} catch (err) {
		console.error('getStaffPerformanceComparison error:', err.message);
		return res.status(500).json({ success: false, message: 'Server Error' });
	}
};

// GET /api/staff/:id/performance/trends
// Get performance trends over time
exports.getStaffPerformanceTrends = async (req, res) => {
	try {
		const staff = await Staff.findById(req.params.id);
		if (!staff) return res.status(404).json({ success: false, message: 'Staff not found' });
		ensureCoachScopeOrAdmin(req, staff);

		const { period = 'monthly', months = 6 } = req.query;
		const trends = await staffPerformanceService.getPerformanceTrends(staff._id, period, parseInt(months));

		return res.status(200).json({ success: true, data: trends });
	} catch (err) {
		console.error('getStaffPerformanceTrends error:', err.message);
		return res.status(err.statusCode || 500).json({ success: false, message: err.message || 'Server Error' });
	}
};

// POST /api/staff/bulk-actions
// Perform bulk actions on staff
exports.bulkStaffActions = async (req, res) => {
	try {
		const { staffIds, action } = req.body;
		
		if (!staffIds || !Array.isArray(staffIds) || staffIds.length === 0) {
			return res.status(400).json({ 
				success: false, 
				message: 'staffIds array is required' 
			});
		}

		if (!action || !['activate', 'deactivate', 'delete'].includes(action)) {
			return res.status(400).json({ 
				success: false, 
				message: 'action must be one of: activate, deactivate, delete' 
			});
		}

		const filterCoachId = (req.role === 'admin' || req.role === 'super_admin') && req.query.coachId ? req.query.coachId : req.coachId;
		
		let updateData = {};
		switch (action) {
			case 'activate':
				updateData = { isActive: true };
				break;
			case 'deactivate':
				updateData = { isActive: false };
				break;
			case 'delete':
				// Soft delete - just deactivate
				updateData = { isActive: false };
				break;
		}

		const result = await Staff.updateMany(
			{ _id: { $in: staffIds }, coachId: filterCoachId },
			{ $set: updateData }
		);

		return res.status(200).json({ 
			success: true, 
			message: `Bulk ${action} completed successfully`,
			modifiedCount: result.modifiedCount,
			action
		});
	} catch (err) {
		console.error('bulkStaffActions error:', err.message);
		return res.status(500).json({ success: false, message: 'Server Error' });
	}
};

// GET /api/staff/search
// Search staff members
exports.searchStaff = async (req, res) => {
	try {
		const { query, page = 1, limit = 20 } = req.query;
		const filterCoachId = (req.role === 'admin' || req.role === 'super_admin') && req.query.coachId ? req.query.coachId : req.coachId;

		let searchQuery = { coachId: filterCoachId };
		
		if (query) {
			searchQuery.$or = [
				{ name: { $regex: query, $options: 'i' } },
				{ email: { $regex: query, $options: 'i' } }
			];
		}

		const skip = (page - 1) * limit;
		const staff = await Staff.find(searchQuery)
			.select('-password')
			.sort({ name: 1 })
			.skip(skip)
			.limit(parseInt(limit));

		const total = await Staff.countDocuments(searchQuery);

		return res.status(200).json({
			success: true,
			data: staff,
			pagination: {
				page: parseInt(page),
				limit: parseInt(limit),
				total,
				pages: Math.ceil(total / limit)
			}
		});
	} catch (err) {
		console.error('searchStaff error:', err.message);
		return res.status(500).json({ success: false, message: 'Server Error' });
	}
};

// GET /api/staff/stats
// Get staff statistics
exports.getStaffStats = async (req, res) => {
	try {
		const filterCoachId = (req.role === 'admin' || req.role === 'super_admin') && req.query.coachId ? req.query.coachId : req.coachId;

		const [
			totalStaff,
			activeStaff,
			inactiveStaff,
			verifiedStaff,
			unverifiedStaff
		] = await Promise.all([
			Staff.countDocuments({ coachId: filterCoachId }),
			Staff.countDocuments({ coachId: filterCoachId, isActive: true }),
			Staff.countDocuments({ coachId: filterCoachId, isActive: false }),
			Staff.countDocuments({ coachId: filterCoachId, isVerified: true }),
			Staff.countDocuments({ coachId: filterCoachId, isVerified: false })
		]);

		const stats = {
			total: totalStaff,
			active: activeStaff,
			inactive: inactiveStaff,
			verified: verifiedStaff,
			unverified: unverifiedStaff,
			activePercentage: totalStaff > 0 ? Math.round((activeStaff / totalStaff) * 100) : 0,
			verifiedPercentage: totalStaff > 0 ? Math.round((verifiedStaff / totalStaff) * 100) : 0
		};

		return res.status(200).json({
			success: true,
			data: stats
		});
	} catch (err) {
		console.error('getStaffStats error:', err.message);
		return res.status(500).json({ success: false, message: 'Server Error' });
	}
};

// POST /api/staff/:id/reset-password
// Reset staff password
exports.resetStaffPassword = async (req, res) => {
	try {
		const { newPassword } = req.body;
		
		if (!newPassword || newPassword.length < 6) {
			return res.status(400).json({
				success: false,
				message: 'New password is required and must be at least 6 characters'
			});
		}

		const staff = await Staff.findById(req.params.id);
		if (!staff) {
			return res.status(404).json({ success: false, message: 'Staff not found' });
		}
		
		ensureCoachScopeOrAdmin(req, staff);

		// Update password
		staff.password = newPassword;
		await staff.save();

		return res.status(200).json({
			success: true,
			message: 'Staff password reset successfully'
		});
	} catch (err) {
		console.error('resetStaffPassword error:', err.message);
		return res.status(err.statusCode || 500).json({ success: false, message: err.message || 'Server Error' });
	}
};

// GET /api/staff/:id/profile
// Get staff profile with additional details
exports.getStaffProfile = async (req, res) => {
	try {
		const staff = await Staff.findById(req.params.id)
			.select('-password')
			.populate('coachId', 'name email');

		if (!staff) {
			return res.status(404).json({ success: false, message: 'Staff not found' });
		}
		
		ensureCoachScopeOrAdmin(req, staff);

		// Get additional profile data
		const Task = require('../schema/Task');
		const Lead = require('../schema/Lead');
		const StaffCalendar = require('../schema/StaffCalendar');

		const [
			totalTasks,
			completedTasks,
			totalLeads,
			managedLeads,
			totalEvents,
			completedEvents
		] = await Promise.all([
			Task.countDocuments({ assignedTo: staff._id }),
			Task.countDocuments({ assignedTo: staff._id, status: 'Completed' }),
			Lead.countDocuments({ assignedTo: staff._id }),
			Lead.countDocuments({ assignedTo: staff._id, status: { $in: ['Qualified', 'Proposal', 'Closed'] } }),
			StaffCalendar.countDocuments({ staffId: staff._id }),
			StaffCalendar.countDocuments({ staffId: staff._id, status: 'completed' })
		]);

		const profile = {
			...staff.toObject(),
			stats: {
				totalTasks,
				completedTasks,
				taskCompletionRate: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
				totalLeads,
				managedLeads,
				leadManagementRate: totalLeads > 0 ? Math.round((managedLeads / totalLeads) * 100) : 0,
				totalEvents,
				completedEvents,
				eventCompletionRate: totalEvents > 0 ? Math.round((completedEvents / totalEvents) * 100) : 0
			}
		};

		return res.status(200).json({ success: true, data: profile });
	} catch (err) {
		console.error('getStaffProfile error:', err.message);
		return res.status(err.statusCode || 500).json({ success: false, message: err.message || 'Server Error' });
	}
};

// PUT /api/staff/:id/profile
// Update staff profile
exports.updateStaffProfile = async (req, res) => {
	try {
		const staff = await Staff.findById(req.params.id);
		if (!staff) {
			return res.status(404).json({ success: false, message: 'Staff not found' });
		}
		
		ensureCoachScopeOrAdmin(req, staff);

		const updates = {};
		const allowed = ['name', 'email', 'permissions', 'isActive', 'isVerified'];
		for (const key of allowed) {
			if (req.body[key] !== undefined) {
				updates[key] = req.body[key];
			}
		}

		// Validate permissions if updating
		if (updates.permissions && Array.isArray(updates.permissions)) {
			const validation = validatePermissions(updates.permissions);
			if (!validation.valid) {
				return res.status(400).json({ 
					success: false, 
					message: validation.error,
					invalidPermissions: validation.invalid
				});
			}
		}

		// Check email uniqueness if updating email
		if (updates.email && updates.email !== staff.email) {
			const existing = await User.findOne({ email: updates.email });
			if (existing) {
				return res.status(409).json({ success: false, message: 'Email already in use' });
			}
		}

		const updated = await Staff.findByIdAndUpdate(
			staff._id, 
			{ $set: updates }, 
			{ new: true }
		).select('-password');

		return res.status(200).json({ 
			success: true, 
			message: 'Staff profile updated successfully',
			data: updated 
		});
	} catch (err) {
		console.error('updateStaffProfile error:', err.message);
		return res.status(err.statusCode || 500).json({ success: false, message: err.message || 'Server Error' });
	}
};

// GET /api/staff/:id/activity
// Get staff activity log
exports.getStaffActivity = async (req, res) => {
	try {
		const { page = 1, limit = 20 } = req.query;
		const staff = await Staff.findById(req.params.id);
		
		if (!staff) {
			return res.status(404).json({ success: false, message: 'Staff not found' });
		}
		
		ensureCoachScopeOrAdmin(req, staff);

		// Get recent tasks
		const Task = require('../schema/Task');
		const skip = (page - 1) * limit;
		
		const tasks = await Task.find({ assignedTo: staff._id })
			.sort({ updatedAt: -1 })
			.skip(skip)
			.limit(parseInt(limit))
			.populate('relatedLead', 'name email');

		const total = await Task.countDocuments({ assignedTo: staff._id });

		return res.status(200).json({
			success: true,
			data: tasks,
			pagination: {
				page: parseInt(page),
				limit: parseInt(limit),
				total,
				pages: Math.ceil(total / limit)
			}
		});
	} catch (err) {
		console.error('getStaffActivity error:', err.message);
		return res.status(err.statusCode || 500).json({ success: false, message: err.message || 'Server Error' });
	}
};

// POST /api/staff/:id/send-invitation
// Send invitation email to staff member
exports.sendStaffInvitation = async (req, res) => {
	try {
		const staff = await Staff.findById(req.params.id);
		if (!staff) {
			return res.status(404).json({ success: false, message: 'Staff not found' });
		}
		
		ensureCoachScopeOrAdmin(req, staff);

		// Generate invitation token
		const crypto = require('crypto');
		const invitationToken = crypto.randomBytes(32).toString('hex');
		const invitationExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

		// Update staff with invitation details
		staff.invitationToken = invitationToken;
		staff.invitationExpiry = invitationExpiry;
		await staff.save();

		// TODO: Send invitation email
		// This would integrate with your email service
		console.log(`Invitation sent to ${staff.email} with token: ${invitationToken}`);

		return res.status(200).json({
			success: true,
			message: 'Staff invitation sent successfully',
			data: {
				email: staff.email,
				invitationExpiry
			}
		});
	} catch (err) {
		console.error('sendStaffInvitation error:', err.message);
		return res.status(err.statusCode || 500).json({ success: false, message: err.message || 'Server Error' });
	}
};


