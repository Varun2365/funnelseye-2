const mongoose = require('mongoose');
const { 
    User, 
    CoachHierarchyLevel, 
    AdminRequest, 
    ExternalSponsor, 
    Commission, 
    CommissionSettings,
    Subscription,
    RazorpayPayment,
    CoachPerformance,
    Lead,
    Task,
    CoachReport
} = require('../schema');

// ===== HIERARCHY SETUP & INITIALIZATION =====

// @desc    Setup default hierarchy levels (Admin only)
// @route   POST /api/advanced-mlm/setup-hierarchy
// @access  Private (Admin)
const setupHierarchyLevels = async (req, res) => {
    console.log("🔧 Setting up hierarchy levels...");
    console.log("User ID:", req.user.id);
    console.log("User role:", req.role);
    
    try {
        // First, test database connection
        console.log("Testing database connection...");
        const dbState = mongoose.connection.readyState;
        console.log("Database connection state:", dbState);
        
        if (dbState !== 1) {
            return res.status(500).json({
                success: false,
                message: 'Database not connected. Please try again.',
                dbState: dbState
            });
        }
        
        // Check if levels already exist
        console.log("Checking for existing levels...");
        const existingLevels = await CoachHierarchyLevel.find({}).lean().maxTimeMS(10000);
        console.log("Found existing levels:", existingLevels.length);
        
        if (existingLevels.length > 0) {
            console.log("Levels already exist, returning existing data");
            return res.status(400).json({
                success: false,
                message: 'Hierarchy levels already exist. Use update endpoint to modify.',
                data: existingLevels
            });
        }

        // Default hierarchy levels for MLM system
        const defaultLevels = [
            { level: 1, name: 'Distributor Coach', description: 'Entry level coach' },
            { level: 2, name: 'Senior Consultant', description: 'Intermediate coach' },
            { level: 3, name: 'Success Builder', description: 'Advanced coach' },
            { level: 4, name: 'Supervisor', description: 'Expert coach' },
            { level: 5, name: 'World Team', description: 'Master coach' },
            { level: 6, name: 'G.E.T Team', description: 'Elite coach' },
            { level: 7, name: 'Get 2500 Team', description: 'Premier coach' },
            { level: 8, name: 'Millionaire Team', description: 'Distinguished coach' },
            { level: 9, name: 'Millionaire 7500 Team', description: 'Honored coach' },
            { level: 10, name: 'President\'s Team', description: 'Esteemed coach' },
            { level: 11, name: 'Chairman\'s Club', description: 'Legendary coach' },
            { level: 12, name: 'Founder\'s Circle', description: 'Ultimate coach' }
        ];

        console.log("Creating hierarchy levels...");
        
        // Prepare documents for bulk insertion
        const documentsToInsert = defaultLevels.map(levelData => ({
            ...levelData,
            createdBy: req.user.id,
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date()
        }));

        console.log("Prepared documents for insertion:", documentsToInsert.length);
        console.log("Attempting bulk insertion...");

        // Use bulk insertion for better performance with timeout
        const result = await CoachHierarchyLevel.insertMany(documentsToInsert, { 
            maxTimeMS: 15000 
        });
        
        console.log(`✅ Successfully created ${result.length} hierarchy levels`);

        res.status(201).json({
            success: true,
            message: 'Hierarchy levels setup completed successfully.',
            data: result
        });

    } catch (err) {
        console.error('❌ Error setting up hierarchy levels:', err);
        
        // Check if it's a timeout error
        if (err.message && err.message.includes('timeout')) {
            return res.status(408).json({
                success: false,
                message: 'Database operation timed out. Please try again.',
                error: err.message
            });
        }
        
        res.status(500).json({
            success: false,
            message: 'Server error while setting up hierarchy levels',
            error: err.message
        });
    }
};

// @desc    Clean up database - Fix users with null selfCoachId (Admin only)
// @route   POST /api/advanced-mlm/cleanup-database
// @access  Private (Admin)
const cleanupDatabase = async (req, res) => {
    console.log("🧹 Starting database cleanup...");
    
    try {
        // Find all users with null or undefined selfCoachId
        const usersWithNullCoachId = await User.find({
            $or: [
                { selfCoachId: null },
                { selfCoachId: { $exists: false } }
            ]
        });
        
        console.log(`Found ${usersWithNullCoachId.length} users with null selfCoachId`);
        
        if (usersWithNullCoachId.length === 0) {
            return res.json({
                success: true,
                message: 'No cleanup needed. All users have valid selfCoachId values.',
                cleanedCount: 0
            });
        }
        
        // Return information about users that need manual fixing
        res.json({
            success: false,
            message: 'Found users with missing Coach IDs. These need to be fixed manually.',
            details: 'Coaches must provide their own unique Coach ID when upgrading. Cannot auto-generate IDs.',
            usersNeedingFix: usersWithNullCoachId.map(user => ({
                id: user._id,
                email: user.email,
                name: user.name,
                role: user.role
            })),
            totalFound: usersWithNullCoachId.length,
            instructions: [
                '1. Contact each user to provide their desired Coach ID',
                '2. Use the upgrade-to-coach endpoint with their chosen ID',
                '3. Ensure each Coach ID is unique across the system'
            ]
        });
        
    } catch (err) {
        console.error('❌ Error during database cleanup:', err);
        res.status(500).json({
            success: false,
            message: 'Server error during database cleanup',
            error: err.message
        });
    }
};

// @desc    Health check for MLM system
// @route   GET /api/advanced-mlm/health
// @access  Public
const mlmHealthCheck = async (req, res) => {
    try {
        console.log("🏥 MLM Health Check...");
        
        // Check database connection
        const dbState = mongoose.connection.readyState;
        console.log("Database state:", dbState);
        
        // Test basic model operations
        const levelCount = await CoachHierarchyLevel.countDocuments({}).maxTimeMS(5000);
        console.log("Current hierarchy levels:", levelCount);
        
        res.json({
            success: true,
            message: 'MLM system is healthy',
            database: {
                connected: dbState === 1,
                state: dbState,
                hierarchyLevels: levelCount
            },
            timestamp: new Date().toISOString()
        });
        
    } catch (err) {
        console.error('❌ MLM Health Check failed:', err);
        res.status(500).json({
            success: false,
            message: 'MLM system health check failed',
            error: err.message
        });
    }
};

// @desc    Generate unique coach ID
// @route   POST /api/advanced-mlm/generate-coach-id
// @access  Public
const generateCoachId = async (req, res) => {
    try {
        let coachId;
        let isUnique = false;
        
        // Generate unique coach ID with W prefix
        while (!isUnique) {
            const randomNum = Math.floor(Math.random() * 9000000) + 1000000; // 7 digits
            coachId = `W${randomNum}`;
            
            // Check if ID already exists
            const existingCoach = await User.findOne({ 
                'selfCoachId': coachId,
                role: 'coach'
            });
            
            if (!existingCoach) {
                isUnique = true;
            }
        }

        res.status(200).json({
            success: true,
            message: 'Coach ID generated successfully.',
            data: { coachId }
        });
    } catch (err) {
        console.error('Error generating coach ID:', err);
        res.status(500).json({
            success: false,
            message: 'Server error while generating coach ID'
        });
    }
};

// @desc    Get all hierarchy levels
// @route   GET /api/advanced-mlm/hierarchy-levels
// @access  Public
const getHierarchyLevels = async (req, res) => {
    try {
        const levels = await CoachHierarchyLevel.find({ isActive: true }).sort({ level: 1 });
        
        res.status(200).json({
            success: true,
            message: 'Hierarchy levels retrieved successfully.',
            data: levels
        });

    } catch (err) {
        console.error('Error getting hierarchy levels:', err);
        res.status(500).json({
            success: false,
            message: 'Server error while retrieving hierarchy levels'
        });
    }
};

// ===== SPONSOR MANAGEMENT =====

// @desc    Search for sponsors (digital system users)
// @route   GET /api/advanced-mlm/search-sponsor
// @access  Public
const searchSponsor = async (req, res) => {
    const { query } = req.query;
    
    if (!query || query.trim().length < 2) {
        return res.status(400).json({
            success: false,
            message: 'Search query must be at least 2 characters long.'
        });
    }

    try {
        const searchRegex = new RegExp(query, 'i');
        
        // Search in digital system users
        const digitalSponsors = await User.find({
            role: 'coach',
            $or: [
                { name: searchRegex },
                { email: searchRegex },
                { phone: searchRegex },
                { selfCoachId: searchRegex }
            ],
            isActive: true
        }).select('_id name email phone selfCoachId currentLevel')
          .limit(10);

        // Search in external sponsors
        const externalSponsors = await ExternalSponsor.find({
            $or: [
                { name: searchRegex },
                { email: searchRegex },
                { phone: searchRegex }
            ],
            isActive: true
        }).select('_id name email phone company')
          .limit(10);

        res.status(200).json({
            success: true,
            message: 'Sponsor search completed successfully.',
            data: {
                digitalSponsors,
                externalSponsors
            }
        });
    } catch (err) {
        console.error('Error searching sponsors:', err);
        res.status(500).json({
            success: false,
            message: 'Server error while searching sponsors'
        });
    }
};

// @desc    Create external sponsor
// @route   POST /api/advanced-mlm/external-sponsor
// @access  Public
const createExternalSponsor = async (req, res) => {
    const { name, phone, email, company, notes } = req.body;
    
    if (!name || !phone) {
        return res.status(400).json({
            success: false,
            message: 'Name and phone are required fields.'
        });
    }

    try {
        // Check if external sponsor already exists
        const existingSponsor = await ExternalSponsor.findOne({
            $or: [
                { phone: phone },
                { email: email }
            ]
        });

        if (existingSponsor) {
            return res.status(400).json({
                success: false,
                message: 'External sponsor with this phone or email already exists.'
            });
        }

        const externalSponsor = new ExternalSponsor({
            name,
            phone,
            email,
            company,
            notes,
            createdBy: req.user ? req.user._id : null
        });

        await externalSponsor.save();

        res.status(201).json({
            success: true,
            message: 'External sponsor created successfully.',
            data: externalSponsor
        });
    } catch (err) {
        console.error('Error creating external sponsor:', err);
        res.status(500).json({
            success: false,
            message: 'Server error while creating external sponsor'
        });
    }
};

// ===== HIERARCHY LOCKING =====

// @desc    Lock hierarchy after first login
// @route   POST /api/advanced-mlm/lock-hierarchy
// @access  Private (Coach)
const lockHierarchy = async (req, res) => {
    const { coachId } = req.body;
    
    if (!coachId) {
        return res.status(400).json({
            success: false,
            message: 'Coach ID is required.'
        });
    }

    try {
        const coach = await User.findById(coachId);
        if (!coach || coach.role !== 'coach') {
            return res.status(404).json({
                success: false,
                message: 'Coach not found.'
            });
        }

        if (coach.hierarchyLocked) {
            return res.status(400).json({
                success: false,
                message: 'Hierarchy is already locked.'
            });
        }

        coach.hierarchyLocked = true;
        coach.hierarchyLockedAt = new Date();
        await coach.save();

        res.status(200).json({
            success: true,
            message: 'Hierarchy locked successfully.',
            data: {
                coachId: coach._id,
                hierarchyLocked: coach.hierarchyLocked,
                hierarchyLockedAt: coach.hierarchyLockedAt
            }
        });
    } catch (err) {
        console.error('Error locking hierarchy:', err);
        res.status(500).json({
            success: false,
            message: 'Server error while locking hierarchy'
        });
    }
};

// ===== ADMIN REQUEST SYSTEM =====

// @desc    Submit admin request for hierarchy changes
// @route   POST /api/advanced-mlm/admin-request
// @access  Private (Coach)
const submitAdminRequest = async (req, res) => {
    const { 
        requestType, 
        requestedData, 
        reason, 
        supportingDocuments 
    } = req.body;
    
    const coachId = req.user._id;

    if (!requestType || !requestedData || !reason) {
        return res.status(400).json({
            success: false,
            message: 'Request type, requested data, and reason are required.'
        });
    }

    try {
        const adminRequest = new AdminRequest({
            coachId,
            requestType,
            requestedData,
            reason,
            supportingDocuments: supportingDocuments || []
        });

        await adminRequest.save();

        res.status(201).json({
            success: true,
            message: 'Admin request submitted successfully.',
            data: {
                requestId: adminRequest._id,
                status: adminRequest.status,
                submittedAt: adminRequest.createdAt
            }
        });
    } catch (err) {
        console.error('Error submitting admin request:', err);
        res.status(500).json({
            success: false,
            message: 'Server error while submitting admin request'
        });
    }
};

// @desc    Get admin requests for a coach
// @route   GET /api/advanced-mlm/admin-requests/:coachId
// @access  Private (Coach)
const getCoachAdminRequests = async (req, res) => {
    const { coachId } = req.params;
    
    try {
        const requests = await AdminRequest.find({ coachId })
            .sort({ createdAt: -1 })
            .populate('processedBy', 'name email');

        res.status(200).json({
            success: true,
            message: 'Admin requests retrieved successfully.',
            data: requests
        });
    } catch (err) {
        console.error('Error getting admin requests:', err);
        res.status(500).json({
            success: false,
            message: 'Server error while retrieving admin requests'
        });
    }
};

// ===== ADMIN FUNCTIONS =====

// @desc    Get all pending admin requests
// @route   GET /api/advanced-mlm/admin/pending-requests
// @access  Private (Admin)
const getPendingAdminRequests = async (req, res) => {
    try {
        const requests = await AdminRequest.find({ status: 'pending' })
            .populate('coachId', 'name email selfCoachId currentLevel')
            .sort({ createdAt: 1 });

        res.status(200).json({
            success: true,
            message: 'Pending admin requests retrieved successfully.',
            data: requests
        });
    } catch (err) {
        console.error('Error getting pending admin requests:', err);
        res.status(500).json({
            success: false,
            message: 'Server error while retrieving pending admin requests'
        });
    }
};

// @desc    Get all coaches for admin management
// @route   GET /api/advanced-mlm/admin/coaches
// @access  Private (Admin)
const getAdminCoaches = async (req, res) => {
    try {
        const { 
            page = 1, 
            limit = 50, 
            search,
            status,
            sortBy = 'createdAt',
            sortOrder = 'desc'
        } = req.query;

        const query = { role: 'coach' };
        
        // Add search filter
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
                { selfCoachId: { $regex: search, $options: 'i' } },
                { phone: { $regex: search, $options: 'i' } }
            ];
        }
        
        // Add status filter
        if (status) {
            query.status = status;
        }

        // Calculate pagination
        const skip = (parseInt(page) - 1) * parseInt(limit);
        
        // Build sort object
        const sort = {};
        sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

        // Get coaches with pagination
        const coaches = await User.find(query)
            .select('-password -__v')
            .populate('sponsorId', 'name email selfCoachId')
            .sort(sort)
            .skip(skip)
            .limit(parseInt(limit));

        // Calculate team size for each coach
        const coachesWithTeamSize = await Promise.all(coaches.map(async (coach) => {
            const teamSize = await User.countDocuments({ 
                sponsorId: coach._id, 
                role: 'coach' 
            });
            
            return {
                ...coach.toObject(),
                teamSize
            };
        }));

        // Get total count for pagination
        const total = await User.countDocuments(query);

        res.status(200).json({
            success: true,
            message: 'Coaches retrieved successfully.',
            data: {
                coaches: coachesWithTeamSize,
                pagination: {
                    currentPage: parseInt(page),
                    totalPages: Math.ceil(total / parseInt(limit)),
                    totalCoaches: total,
                    hasNext: skip + coachesWithTeamSize.length < total,
                    hasPrev: parseInt(page) > 1
                }
            }
        });
    } catch (err) {
        console.error('Error getting coaches:', err);
        res.status(500).json({
            success: false,
            message: 'Server error while retrieving coaches'
        });
    }
};

// @desc    Process admin request
// @route   PUT /api/advanced-mlm/admin/process-request/:requestId
// @access  Private (Admin)
const processAdminRequest = async (req, res) => {
    const { requestId } = req.params;
    const { status, adminNotes } = req.body;
    const adminId = req.admin._id;

    if (!status || !['approved', 'rejected'].includes(status)) {
        return res.status(400).json({
            success: false,
            message: 'Valid status (approved or rejected) is required.'
        });
    }

    try {
        const request = await AdminRequest.findById(requestId);
        if (!request) {
            return res.status(404).json({
                success: false,
                message: 'Admin request not found.'
            });
        }

        if (request.status !== 'pending') {
            return res.status(400).json({
                success: false,
                message: 'Request has already been processed.'
            });
        }

        request.status = status;
        request.adminNotes = adminNotes || '';
        request.processedBy = adminId;
        request.processedAt = new Date();

        await request.save();

        // If approved, apply the changes
        if (status === 'approved') {
            await applyHierarchyChanges(request);
        }

        res.status(200).json({
            success: true,
            message: `Admin request ${status} successfully.`,
            data: request
        });
    } catch (err) {
        console.error('Error processing admin request:', err);
        res.status(500).json({
            success: false,
            message: 'Server error while processing admin request'
        });
    }
};

// @desc    Change coach upline (admin function)
// @route   PUT /api/advanced-mlm/admin/change-upline
// @access  Private (Admin)
const changeCoachUpline = async (req, res) => {
    const { 
        coachId, 
        newUplineId, 
        newUplineName, 
        isExternalSponsor = false 
    } = req.body;
    
    const adminId = req.admin._id;

    if (!coachId || !newUplineName) {
        return res.status(400).json({
            success: false,
            message: 'Coach ID and new upline name are required.'
        });
    }

    try {
        const coach = await User.findById(coachId);
        if (!coach || coach.role !== 'coach') {
            return res.status(404).json({
                success: false,
                message: 'Coach not found.'
            });
        }

        let newUplineIdToSet = null;
        let externalSponsorId = null;

        if (isExternalSponsor) {
            // Create or find external sponsor
            let externalSponsor = await ExternalSponsor.findOne({ name: newUplineName });
            
            if (!externalSponsor) {
                externalSponsor = new ExternalSponsor({
                    name: newUplineName,
                    createdBy: adminId
                });
                await externalSponsor.save();
            }
            
            externalSponsorId = externalSponsor._id;
            newUplineIdToSet = null;
        } else {
            // Validate digital system upline
            if (newUplineId) {
                const upline = await User.findById(newUplineId);
                if (!upline || upline.role !== 'coach') {
                    return res.status(400).json({
                        success: false,
                        message: 'Invalid upline coach selected.'
                    });
                }
                newUplineIdToSet = newUplineId;
                externalSponsorId = null;
            }
        }

        // Update coach's upline
        coach.sponsorId = newUplineIdToSet;
        coach.externalSponsorId = externalSponsorId;
        await coach.save();

        res.status(200).json({
            success: true,
            message: 'Coach upline changed successfully.',
            data: {
                coachId: coach._id,
                newUplineId: newUplineIdToSet,
                newUplineName,
                isExternalSponsor
            }
        });
    } catch (err) {
        console.error('Error changing coach upline:', err);
        res.status(500).json({
            success: false,
            message: 'Server error while changing coach upline'
        });
    }
};

// ===== COMMISSION SYSTEM =====

// @desc    Get commission settings
// @route   GET /api/advanced-mlm/commission-settings
// @access  Private (Admin)
const getCommissionSettings = async (req, res) => {
    try {
        const settings = await CommissionSettings.findOne({ isActive: true })
            .sort({ effectiveFrom: -1 });

        res.status(200).json({
            success: true,
            message: 'Commission settings retrieved successfully.',
            data: settings
        });
    } catch (err) {
        console.error('Error getting commission settings:', err);
        res.status(500).json({
            success: false,
            message: 'Server error while retrieving commission settings'
        });
    }
};

// @desc    Update commission settings
// @route   PUT /api/advanced-mlm/commission-settings
// @access  Private (Admin)
const updateCommissionSettings = async (req, res) => {
    const { 
        commissionPercentage, 
        minimumSubscriptionAmount, 
        maximumCommissionAmount,
        notes 
    } = req.body;
    
    const adminId = req.admin._id;

    if (!commissionPercentage || commissionPercentage < 0 || commissionPercentage > 100) {
        return res.status(400).json({
            success: false,
            message: 'Valid commission percentage (0-100) is required.'
        });
    }

    try {
        // Deactivate current settings
        await CommissionSettings.updateMany(
            { isActive: true },
            { 
                isActive: false,
                effectiveTo: new Date(),
                lastModifiedBy: adminId
            }
        );

        // Create new settings
        const newSettings = new CommissionSettings({
            settingId: `SET_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            commissionPercentage,
            minimumSubscriptionAmount: minimumSubscriptionAmount || 0,
            maximumCommissionAmount: maximumCommissionAmount || null,
            effectiveFrom: new Date(),
            createdBy: adminId,
            notes: notes || ''
        });

        await newSettings.save();

        res.status(200).json({
            success: true,
            message: 'Commission settings updated successfully.',
            data: newSettings
        });
    } catch (err) {
        console.error('Error updating commission settings:', err);
        res.status(500).json({
            success: false,
            message: 'Server error while updating commission settings'
        });
    }
};

// @desc    Calculate and create commission for subscription
// @route   POST /api/advanced-mlm/calculate-commission
// @access  Private (Admin)
const calculateCommission = async (req, res) => {
    const { subscriptionId, referredBy } = req.body;

    if (!subscriptionId || !referredBy) {
        return res.status(400).json({
            success: false,
            message: 'Subscription ID and referred by coach ID are required.'
        });
    }

    try {
        // Get subscription details
        const subscription = await Subscription.findById(subscriptionId);
        if (!subscription) {
            return res.status(404).json({
                success: false,
                message: 'Subscription not found.'
            });
        }

        // Get referring coach
        const coach = await User.findById(referredBy);
        if (!coach || coach.role !== 'coach') {
            return res.status(400).json({
                success: false,
                message: 'Invalid referring coach.'
            });
        }

        // Check if coach is active
        if (!coach.isActive) {
            return res.status(400).json({
                success: false,
                message: 'Commission cannot be calculated for inactive coaches.'
            });
        }

        // Get current commission settings
        const settings = await CommissionSettings.findOne({ isActive: true });
        if (!settings) {
            return res.status(400).json({
                success: false,
                message: 'Commission settings not configured.'
            });
        }

        // Check minimum subscription amount
        if (subscription.planDetails.price < settings.minimumSubscriptionAmount) {
            return res.status(400).json({
                success: false,
                message: `Subscription amount must be at least ${settings.minimumSubscriptionAmount} to qualify for commission.`
            });
        }

        // Calculate commission
        let commissionAmount = (subscription.planDetails.price * settings.commissionPercentage) / 100;
        
        // Apply maximum commission limit if set
        if (settings.maximumCommissionAmount && commissionAmount > settings.maximumCommissionAmount) {
            commissionAmount = settings.maximumCommissionAmount;
        }

        // Check if commission already exists
        const existingCommission = await Commission.findOne({
            subscriptionId,
            referredBy
        });

        if (existingCommission) {
            return res.status(400).json({
                success: false,
                message: 'Commission for this subscription has already been calculated.'
            });
        }

        // Create commission record
        const commission = new Commission({
            commissionId: `COM_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            coachId: referredBy,
            subscriptionId,
            referredBy,
            subscriptionAmount: subscription.planDetails.price,
            commissionPercentage: settings.commissionPercentage,
            commissionAmount,
            currency: subscription.planDetails.currency,
            month: new Date().getMonth() + 1,
            year: new Date().getFullYear(),
            status: 'pending'
        });

        await commission.save();

        res.status(201).json({
            success: true,
            message: 'Commission calculated and created successfully.',
            data: {
                commissionId: commission.commissionId,
                commissionAmount,
                status: commission.status
            }
        });
    } catch (err) {
        console.error('Error calculating commission:', err);
        res.status(500).json({
            success: false,
            message: 'Server error while calculating commission'
        });
    }
};

// @desc    Calculate commission only on platform subscriptions
// @route   POST /api/advanced-mlm/calculate-subscription-commission
// @access  Private (Admin)
const calculateSubscriptionCommission = async (req, res) => {
    try {
        const { 
            subscriptionId, 
            coachId, 
            subscriptionAmount, 
            subscriptionType,
            notes 
        } = req.body;

        if (!subscriptionId || !coachId || !subscriptionAmount) {
            return res.status(400).json({
                success: false,
                message: 'Subscription ID, coach ID, and subscription amount are required.'
            });
        }

        // Find the coach
        const coach = await User.findById(coachId);
        if (!coach || coach.role !== 'coach') {
            return res.status(404).json({
                success: false,
                message: 'Coach not found.'
            });
        }

        // Get commission settings
        const commissionSettings = await CommissionSettings.findOne({ isActive: true });
        if (!commissionSettings) {
            return res.status(400).json({
                success: false,
                message: 'Commission settings not configured.'
            });
        }

        // Calculate commission based on subscription type and coach level
        let commissionPercentage = 0;
        let commissionAmount = 0;

        // Different commission rates for different subscription types
        switch (subscriptionType) {
            case 'monthly':
                commissionPercentage = commissionSettings.subscriptionCommissions?.monthly || 0.10; // 10%
                break;
            case 'yearly':
                commissionPercentage = commissionSettings.subscriptionCommissions?.yearly || 0.15; // 15%
                break;
            case 'lifetime':
                commissionPercentage = commissionSettings.subscriptionCommissions?.lifetime || 0.20; // 20%
                break;
            default:
                commissionPercentage = commissionSettings.subscriptionCommissions?.default || 0.10; // 10%
        }

        // Apply level-based multiplier
        const levelMultiplier = commissionSettings.levelMultipliers?.[coach.currentLevel] || 1.0;
        commissionPercentage *= levelMultiplier;

        commissionAmount = subscriptionAmount * commissionPercentage;

        // Create commission record
        const commission = await Commission.create({
            coachId: coach._id,
            subscriptionId: subscriptionId,
            commissionType: 'subscription',
            subscriptionType: subscriptionType,
            subscriptionAmount: subscriptionAmount,
            commissionPercentage: commissionPercentage,
            commissionAmount: commissionAmount,
            status: 'pending',
            notes: notes || `Commission for ${subscriptionType} subscription`,
            calculatedAt: new Date()
        });

        res.status(201).json({
            success: true,
            message: 'Subscription commission calculated successfully.',
            data: {
                commissionId: commission._id,
                coachId: coach._id,
                coachName: coach.name,
                coachLevel: coach.currentLevel,
                subscriptionAmount: subscriptionAmount,
                commissionPercentage: commissionPercentage,
                commissionAmount: commissionAmount,
                status: commission.status
            }
        });

    } catch (error) {
        console.error('Error calculating subscription commission:', error.message);
        res.status(500).json({ success: false, message: 'Server error calculating commission.' });
    }
};

// @desc    Get coach commissions
// @route   GET /api/advanced-mlm/commissions/:coachId
// @access  Private (Coach)
const getCoachCommissions = async (req, res) => {
    const { coachId } = req.params;
    const { status, month, year } = req.query;

    try {
        let query = { coachId };
        
        if (status) query.status = status;
        if (month) query.month = parseInt(month);
        if (year) query.year = parseInt(year);

        const commissions = await Commission.find(query)
            .populate('subscriptionId', 'planDetails')
            .sort({ createdAt: -1 });

        // Calculate totals
        const totalEarned = commissions
            .filter(c => c.status === 'paid')
            .reduce((sum, c) => sum + c.commissionAmount, 0);

        const pendingAmount = commissions
            .filter(c => c.status === 'pending')
            .reduce((sum, c) => sum + c.commissionAmount, 0);

        res.status(200).json({
            success: true,
            message: 'Commissions retrieved successfully.',
            data: {
                commissions,
                summary: {
                    totalEarned,
                    pendingAmount,
                    totalCommissions: commissions.length
                }
            }
        });
    } catch (err) {
        console.error('Error getting coach commissions:', err);
        res.status(500).json({
            success: false,
            message: 'Server error while retrieving commissions'
        });
    }
};

// @desc    Process monthly commission payments
// @route   POST /api/advanced-mlm/process-monthly-commissions
// @access  Private (Admin)
const processMonthlyCommissions = async (req, res) => {
    const { month, year } = req.body;
    const adminId = req.admin._id;

    if (!month || !year) {
        return res.status(400).json({
            success: false,
            message: 'Month and year are required.'
        });
    }

    try {
        // Get all pending commissions for the month
        const pendingCommissions = await Commission.find({
            month: parseInt(month),
            year: parseInt(year),
            status: 'pending'
        }).populate('coachId', 'name email isActive');

        if (pendingCommissions.length === 0) {
            return res.status(200).json({
                success: true,
                message: 'No pending commissions found for the specified month.',
                data: { processedCount: 0 }
            });
        }

        let processedCount = 0;
        let platformRevenue = 0;

        for (const commission of pendingCommissions) {
            const coach = commission.coachId;
            
            if (coach.isActive) {
                // Mark commission as approved for active coaches
                commission.status = 'approved';
                commission.paymentDate = new Date();
                await commission.save();
                processedCount++;
            } else {
                // For inactive coaches, transfer commission to platform
                commission.status = 'cancelled';
                commission.notes = 'Commission transferred to platform due to inactive coach';
                await commission.save();
                platformRevenue += commission.commissionAmount;
            }
        }

        res.status(200).json({
            success: true,
            message: 'Monthly commissions processed successfully.',
            data: {
                processedCount,
                platformRevenue,
                totalCommissions: pendingCommissions.length
            }
        });
    } catch (err) {
        console.error('Error processing monthly commissions:', err);
        res.status(500).json({
            success: false,
            message: 'Server error while processing monthly commissions'
        });
    }
};

// ===== INTEGRATED EXISTING MLM FUNCTIONALITY =====

// @desc    Add a new coach to downline
// @route   POST /api/advanced-mlm/downline
// @access  Private
const addDownline = async (req, res) => {
    console.log('[Advanced MLM Controller] Request body:', req.body);
    
    const { name, email, password, sponsorId, selfCoachId } = req.body;

    if (!email || !password || !name || !sponsorId || !selfCoachId) {
        return res.status(400).json({ 
            success: false,
            message: 'Please enter all required fields: name, email, password, sponsorId, and selfCoachId.' 
        });
    }

    try {
        const sponsor = await User.findById(sponsorId);
        if (!sponsor) {
            return res.status(404).json({ 
                success: false,
                message: 'Sponsor not found. Cannot add to downline.' 
            });
        }
        
        let coach = await User.findOne({ email, role: 'coach' });
        if (coach) {
            return res.status(400).json({ 
                success: false,
                message: 'Coach with this email already exists.' 
            });
        }

        // Check if selfCoachId is already taken
        const existingCoachWithId = await User.findOne({ selfCoachId });
        if (existingCoachWithId) {
            return res.status(400).json({ 
                success: false,
                message: 'Coach ID already taken. Please choose a different one.' 
            });
        }

        // Create coach using User model with role discriminator
        const newCoach = new User({
            name,
            email,
            password,
            role: 'coach',
            sponsorId,
            selfCoachId, // Use the provided selfCoachId
            currentLevel: 1, // Default to level 1
            hierarchyLocked: false,
            isVerified: false
        });
        
        await newCoach.save();

        // Initialize performance tracking for new coach
        const performanceRecord = new CoachPerformance({
            coachId: newCoach._id,
            sponsorId: sponsorId
        });
        await performanceRecord.save();

        res.status(201).json({
            success: true,
            message: 'Coach successfully added to downline! Email verification required on first login.',
            data: {
                coachId: newCoach._id,
                sponsorId: newCoach.sponsorId,
                selfCoachId: newCoach.selfCoachId,
                name: newCoach.name,
                email: newCoach.email
            }
        });

    } catch (err) {
        console.error('Error adding downline:', err);
        res.status(500).json({
            success: false,
            message: 'Server error while adding coach to downline'
        });
    }
};

// @desc    Get direct downline of a coach
// @route   GET /api/advanced-mlm/downline/:sponsorId
// @access  Private
const getDownline = async (req, res) => {
    const { sponsorId } = req.params;
    const { includePerformance = 'false' } = req.query;

    try {
        const downline = await User.find({ sponsorId, role: 'coach' })
            .select('_id name email profilePictureUrl selfCoachId currentLevel teamRankName presidentTeamRankName phone city country company isActive sponsorId createdAt')
            .lean();
        
        if (downline.length === 0) {
            return res.status(404).json({ 
                success: false,
                message: 'No downline found for this coach.' 
            });
        }

        let result = { downline: downline };

        // Include performance data if requested
        if (includePerformance === 'true') {
            const performanceData = await CoachPerformance.find({ 
                coachId: { $in: downline.map(d => d._id) } 
            }).lean();
            
            result.downlineWithPerformance = downline.map(coach => {
                const performance = performanceData.find(p => p.coachId && p.coachId.toString() === coach._id.toString());
                return {
                    ...coach,
                    performance: performance && performance.performanceRating ? {
                        currentLevel: performance.performanceRating.level || 'Beginner',
                        performanceScore: performance.performanceRating.score || 0,
                        isActive: performance.isActive !== false,
                        lastActivity: performance.lastActivity || new Date(),
                        activityStreak: performance.activityStreak || 0
                    } : {
                        currentLevel: 'Beginner',
                        performanceScore: 0,
                        isActive: coach.isActive !== false,
                        lastActivity: new Date(),
                        activityStreak: 0
                    }
                };
            });
        } else {
            // Even without performance, ensure all fields are included
            result.downlineWithPerformance = downline.map(coach => ({
                ...coach,
                performance: null
            }));
        }

        res.status(200).json({
            success: true,
            message: 'Downline retrieved successfully.',
            data: result
        });

    } catch (err) {
        console.error('Error getting downline:', err);
        res.status(500).json({
            success: false,
            message: 'Server error while retrieving downline'
        });
    }
};

// @desc    Get complete downline hierarchy
// @route   GET /api/advanced-mlm/hierarchy/:coachId
// @access  Private
const getDownlineHierarchy = async (req, res) => {
    const { coachId } = req.params;
    const { levels = 5, includePerformance = 'false' } = req.query;

    try {
        const sponsor = await User.findById(coachId);
        if (!sponsor) {
            return res.status(404).json({ 
                success: false,
                message: 'Sponsor not found.' 
            });
        }

        const hierarchy = await User.aggregate([
            { $match: { _id: sponsor._id, role: 'coach' } },
            {
                $graphLookup: {
                    from: 'users',
                    startWith: '$_id',
                    connectFromField: '_id',
                    connectToField: 'sponsorId',
                    as: 'downlineHierarchy',
                    depthField: 'level',
                    maxDepth: parseInt(levels)
                }
            },
            {
                $project: {
                    _id: 1,
                    name: 1,
                    email: 1,
                    profilePictureUrl: 1,
                    selfCoachId: 1,
                    currentLevel: 1,
                    teamRankName: 1,
                    presidentTeamRankName: 1,
                    phone: 1,
                    city: 1,
                    country: 1,
                    company: 1,
                    isActive: 1,
                    lastActiveAt: 1,
                    downlineHierarchy: {
                        $map: {
                            input: "$downlineHierarchy",
                            as: "downlineMember",
                            in: {
                                _id: "$$downlineMember._id",
                                name: "$$downlineMember.name",
                                email: "$$downlineMember.email",
                                profilePictureUrl: "$$downlineMember.profilePictureUrl",
                                selfCoachId: "$$downlineMember.selfCoachId",
                                currentLevel: "$$downlineMember.currentLevel",
                                teamRankName: "$$downlineMember.teamRankName",
                                presidentTeamRankName: "$$downlineMember.presidentTeamRankName",
                                phone: "$$downlineMember.phone",
                                city: "$$downlineMember.city",
                                country: "$$downlineMember.country",
                                company: "$$downlineMember.company",
                                level: "$$downlineMember.level",
                                isActive: "$$downlineMember.isActive",
                                lastActiveAt: "$$downlineMember.lastActiveAt"
                            }
                        }
                    }
                }
            }
        ]);

        if (!hierarchy || hierarchy.length === 0) {
            return res.status(404).json({ 
                success: false,
                message: 'No downline hierarchy found.' 
            });
        }

        let result = hierarchy[0];

        // Performance data will be included in buildTree function below

        // Get all downline members with their sponsorId for building tree
        const downlineHierarchy = result.downlineHierarchy || [];
        const allDownlineIds = downlineHierarchy.map(d => d._id);
        
        let downlineWithSponsors = [];
        if (allDownlineIds.length > 0) {
            downlineWithSponsors = await User.find({
                _id: { $in: allDownlineIds },
                role: 'coach'
            }).select('_id name email profilePictureUrl selfCoachId currentLevel teamRankName presidentTeamRankName phone city country company isActive sponsorId').lean();
        }

        // Get performance data for all downline members if requested
        let performanceMap = new Map();
        if (includePerformance === 'true' && allDownlineIds.length > 0) {
            const performanceData = await CoachPerformance.find({ 
                coachId: { $in: allDownlineIds } 
            }).lean();
            
            performanceData.forEach(perf => {
                if (perf.coachId) {
                    performanceMap.set(perf.coachId.toString(), {
                        currentLevel: perf.performanceRating?.level || 'Beginner',
                        performanceScore: perf.performanceRating?.score || 0,
                        isActive: perf.isActive !== false,
                        lastActivity: perf.lastActivity,
                        activityStreak: perf.activityStreak || 0
                    });
                }
            });
        }

        // Create a map for quick lookup with level info
        const memberMap = new Map();
        downlineWithSponsors.forEach(member => {
            const hierarchyInfo = downlineHierarchy.find(d => d._id.toString() === member._id.toString());
            memberMap.set(member._id.toString(), {
                ...member,
                level: hierarchyInfo?.level || 1,
                performance: performanceMap.get(member._id.toString()) || null
            });
        });

        // Build recursive tree structure
        const buildTree = (parentId) => {
            const children = [];
            memberMap.forEach((member) => {
                if (member.sponsorId && member.sponsorId.toString() === parentId.toString()) {
                    const childNode = {
                        ...member,
                        currentLevel: member.level || member.currentLevel || 1,
                        downline: buildTree(member._id),
                        downlineHierarchy: buildTree(member._id)
                    };
                    children.push(childNode);
                }
            });
            return children;
        };

        // Transform data structure for frontend
        const rootData = {
            _id: result._id || sponsor._id,
            name: result.name || sponsor.name,
            email: result.email || sponsor.email,
            profilePictureUrl: result.profilePictureUrl || sponsor.profilePictureUrl,
            selfCoachId: sponsor.selfCoachId,
            currentLevel: sponsor.currentLevel || 0,
            teamRankName: sponsor.teamRankName,
            presidentTeamRankName: sponsor.presidentTeamRankName,
            phone: sponsor.phone,
            city: sponsor.city,
            country: sponsor.country,
            company: sponsor.company,
            isActive: sponsor.isActive !== false,
            downline: buildTree(sponsor._id),
            downlineHierarchy: buildTree(sponsor._id)
        };

        // Calculate summary stats
        const allMembers = [rootData];
        const collectAllMembers = (node) => {
            if (node.downline && Array.isArray(node.downline)) {
                node.downline.forEach(child => {
                    allMembers.push(child);
                    collectAllMembers(child);
                });
            }
        };
        collectAllMembers(rootData);

        // Calculate total revenue
        let totalRevenue = 0;
        if (allMembers.length > 1) {
            const revenueData = await RazorpayPayment.aggregate([
                {
                    $match: {
                        coachId: { $in: allMembers.map(m => m._id) },
                        status: 'captured'
                    }
                },
                {
                    $group: {
                        _id: null,
                        total: { $sum: { $ifNull: ['$amount', 0] } }
                    }
                }
            ]).catch(() => [{ total: 0 }]);
            totalRevenue = revenueData[0]?.total || 0;
        }

        const transformedData = {
            ...rootData,
            summary: {
                totalCoaches: allMembers.length,
                maxDepth: downlineHierarchy.length > 0 ? Math.max(...downlineHierarchy.map(d => d.level || 0), 0) : 0,
                activeCoaches: allMembers.filter(d => d.isActive !== false).length,
                totalRevenue: totalRevenue
            }
        };

        res.status(200).json({
            success: true,
            message: 'Downline hierarchy retrieved successfully.',
            data: transformedData
        });

    } catch (err) {
        console.error('Error getting hierarchy:', err);
        res.status(500).json({
            success: false,
            message: 'Server error while retrieving hierarchy'
        });
    }
};

// @desc    Get team performance summary
// @route   GET /api/advanced-mlm/team-performance/:sponsorId
// @access  Private
const getTeamPerformance = async (req, res) => {
    const { sponsorId } = req.params;
    const { period = 'monthly', startDate, endDate } = req.query;

    try {
        // Get all downline coaches
        const downline = await User.find({ sponsorId, role: 'coach' }).select('_id name email');
        
        if (downline.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'No team members found.'
            });
        }

        const downlineIds = downline.map(d => d._id);

        // Calculate date range
        let dateFilter = {};
        if (startDate && endDate) {
            dateFilter = {
                createdAt: {
                    $gte: new Date(startDate),
                    $lte: new Date(endDate)
                }
            };
        } else {
            // Default to current month
            const now = new Date();
            const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
            const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
            dateFilter = {
                createdAt: {
                    $gte: startOfMonth,
                    $lte: endOfMonth
                }
            };
        }

        // Get performance data
        const performanceData = await CoachPerformance.find({ 
            coachId: { $in: downlineIds } 
        }).lean();

        // Build match conditions for aggregates
        const leadsMatch = {
            coachId: { $in: downlineIds },
            ...dateFilter
        };

        const tasksMatch = {
            assignedTo: { $in: downlineIds },
            ...dateFilter
        };

        // Get leads data
        const leadsData = await Lead.aggregate([
            { $match: leadsMatch },
            {
                $group: {
                    _id: '$coachId',
                    totalLeads: { $sum: 1 },
                    qualifiedLeads: { 
                        $sum: { 
                            $cond: [{ $eq: ['$status', 'Qualified'] }, 1, 0] 
                        } 
                    },
                    convertedLeads: { 
                        $sum: { 
                            $cond: [{ $eq: ['$status', 'Converted'] }, 1, 0] 
                        } 
                    }
                }
            }
        ]).catch(err => {
            console.error('Error aggregating leads data:', err);
            return [];
        });

        // Get sales data - Use RazorpayPayment which has coachId field
        const salesData = await RazorpayPayment.aggregate([
            { $match: { 
                coachId: { $in: downlineIds },
                status: 'captured', // RazorpayPayment uses 'captured' instead of 'completed'
                ...dateFilter
            }},
            {
                $group: {
                    _id: '$coachId',
                    totalSales: { $sum: 1 },
                    totalRevenue: { $sum: { $ifNull: ['$amount', 0] } },
                    averageDealSize: { $avg: '$amount' }
                }
            }
        ]).catch(err => {
            console.error('Error aggregating sales data:', err);
            return [];
        });

        // Get tasks data
        const tasksData = await Task.aggregate([
            { $match: tasksMatch },
            {
                $group: {
                    _id: '$assignedTo',
                    totalTasks: { $sum: 1 },
                    completedTasks: { 
                        $sum: { 
                            $cond: { 
                                if: { $eq: ['$status', 'Completed'] }, 
                                then: 1, 
                                else: 0 
                            } 
                        } 
                    }
                }
            }
        ]).catch(err => {
            console.error('Error aggregating tasks data:', err);
            return [];
        });

        // Compile team performance summary
        const teamSummary = {
            teamSize: downline.length,
            totalLeads: 0,
            totalSales: 0,
            totalRevenue: 0,
            averageConversionRate: 0,
            topPerformers: [],
            underPerformers: [],
            memberDetails: []
        };

        downline.forEach(member => {
            const leads = leadsData.find(l => l._id && l._id.toString() === member._id.toString()) || { totalLeads: 0, qualifiedLeads: 0, convertedLeads: 0 };
            const sales = salesData.find(s => s._id && s._id.toString() === member._id.toString()) || { totalSales: 0, totalRevenue: 0, averageDealSize: 0 };
            const tasks = tasksData.find(t => t._id && t._id.toString() === member._id.toString()) || { totalTasks: 0, completedTasks: 0 };
            const performance = performanceData.find(p => p.coachId && p.coachId.toString() === member._id.toString());

            const conversionRate = leads.totalLeads > 0 ? (leads.convertedLeads / leads.totalLeads) * 100 : 0;
            const taskCompletionRate = tasks.totalTasks > 0 ? (tasks.completedTasks / tasks.totalTasks) * 100 : 0;

            const memberDetail = {
                coachId: member._id,
                name: member.name || 'Unknown',
                email: member.email || 'N/A',
                leads: {
                    total: leads.totalLeads || 0,
                    qualified: leads.qualifiedLeads || 0,
                    converted: leads.convertedLeads || 0,
                    conversionRate: conversionRate || 0
                },
                sales: {
                    total: sales.totalSales || 0,
                    revenue: sales.totalRevenue || 0,
                    averageDealSize: sales.averageDealSize || 0
                },
                tasks: {
                    total: tasks.totalTasks || 0,
                    completed: tasks.completedTasks || 0,
                    completionRate: taskCompletionRate || 0
                },
                performance: performance && performance.performanceRating ? {
                    level: performance.performanceRating.level || 'Beginner',
                    score: performance.performanceRating.score || 0,
                    isActive: performance.isActive !== undefined ? performance.isActive : true,
                    lastActivity: performance.lastActivity || new Date()
                } : {
                    level: 'Beginner',
                    score: 0,
                    isActive: true,
                    lastActivity: new Date()
                }
            };

            teamSummary.memberDetails.push(memberDetail);
            teamSummary.totalLeads += (leads.totalLeads || 0);
            teamSummary.totalSales += (sales.totalSales || 0);
            teamSummary.totalRevenue += (sales.totalRevenue || 0);
        });

        // Calculate averages and identify top/under performers
        teamSummary.averageConversionRate = teamSummary.totalLeads > 0 ? 
            (teamSummary.memberDetails.reduce((sum, m) => sum + m.leads.converted, 0) / teamSummary.totalLeads) * 100 : 0;

        // Sort by performance score for top/under performers
        const sortedMembers = teamSummary.memberDetails.sort((a, b) => 
            (b.performance?.score || 0) - (a.performance?.score || 0)
        );

        teamSummary.topPerformers = sortedMembers.slice(0, 3);
        teamSummary.underPerformers = sortedMembers.slice(-3).reverse();

        res.status(200).json({
            success: true,
            message: 'Team performance summary retrieved successfully.',
            data: {
                period,
                dateRange: dateFilter,
                summary: teamSummary
            }
        });

    } catch (err) {
        console.error('Error getting team performance:', err);
        console.error('Error stack:', err.stack);
        res.status(500).json({
            success: false,
            message: 'Server error while retrieving team performance',
            error: process.env.NODE_ENV === 'development' ? err.message : undefined
        });
    }
};

// @desc    Generate comprehensive team report
// @route   POST /api/advanced-mlm/generate-report
// @access  Private
const generateTeamReport = async (req, res) => {
    const { sponsorId, reportType, period, startDate, endDate, config } = req.body;

    try {
        const reportId = `REP_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        // Create report record
        const report = new CoachReport({
            reportId,
            generatedBy: sponsorId,
            reportType,
            reportPeriod: {
                startDate: new Date(startDate),
                endDate: new Date(endDate),
                period
            },
            config: config || {}
        });

        await report.save();

        // Generate report data asynchronously
        setTimeout(async () => {
            try {
                await generateReportData(reportId, sponsorId, reportType, startDate, endDate);
                
                // Update report status
                await CoachReport.findOneAndUpdate(
                    { reportId },
                    { status: 'completed' }
                );
            } catch (error) {
                console.error('Error generating report data:', error);
                await CoachReport.findOneAndUpdate(
                    { reportId },
                    { status: 'failed' }
                );
            }
        }, 100);

        res.status(201).json({
            success: true,
            message: 'Report generation started successfully.',
            data: {
                reportId,
                status: 'generating',
                estimatedCompletion: '2-5 minutes'
            }
        });

    } catch (err) {
        console.error('Error generating report:', err);
        res.status(500).json({
            success: false,
            message: 'Server error while generating report'
        });
    }
};

// @desc    Get generated reports
// @route   GET /api/advanced-mlm/reports/:sponsorId
// @access  Private
const getReports = async (req, res) => {
    const { sponsorId } = req.params;
    const { status, reportType, limit = 10 } = req.query;

    try {
        let query = { generatedBy: sponsorId };
        
        if (status) query.status = status;
        if (reportType) query.reportType = reportType;

        const reports = await CoachReport.find(query)
            .sort({ generatedAt: -1 })
            .limit(parseInt(limit))
            .select('-reportData');

        res.status(200).json({
            success: true,
            message: 'Reports retrieved successfully.',
            data: reports
        });

    } catch (err) {
        console.error('Error getting reports:', err);
        res.status(500).json({
            success: false,
            message: 'Server error while retrieving reports'
        });
    }
};

// @desc    Get specific report details
// @route   GET /api/advanced-mlm/reports/detail/:reportId
// @access  Private
const getReportDetail = async (req, res) => {
    const { reportId } = req.params;

    try {
        const report = await CoachReport.findOne({ reportId });
        
        if (!report) {
            return res.status(404).json({
                success: false,
                message: 'Report not found.'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Report details retrieved successfully.',
            data: report
        });

    } catch (err) {
        console.error('Error getting report detail:', err);
        res.status(500).json({
            success: false,
            message: 'Server error while retrieving report details'
        });
    }
};

// Helper function to generate report data
async function generateReportData(reportId, sponsorId, reportType, startDate, endDate) {
    try {
        console.log(`Generating report data for ${reportId}`);
        
        // Calculate date range filter
        const dateFilter = {
            createdAt: {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            }
        };

        const coachId = new mongoose.Types.ObjectId(sponsorId);

        // Run aggregations in parallel
        const [
            performanceRecord,
            leadsStats,
            salesStats,
            clientStats,
            commissionStats,
            downlineStats,
            tasksStats
        ] = await Promise.all([
            // Performance record
            CoachPerformance.findOne({ coachId }),
            
            // Leads statistics
            Lead.aggregate([
                { $match: { coachId, ...dateFilter } },
                {
                    $group: {
                        _id: null,
                        totalLeads: { $sum: 1 },
                        convertedLeads: { $sum: { $cond: [{ $eq: ['$status', 'converted'] }, 1, 0] } },
                        activeLeads: { $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] } },
                        avgLeadValue: { $avg: '$estimatedValue' }
                    }
                }
            ]),
            
            // Sales statistics
            RazorpayPayment.aggregate([
                { $match: { coachId, status: 'captured', ...dateFilter } },
                {
                    $group: {
                        _id: null,
                        totalSales: { $sum: '$amount' },
                        totalTransactions: { $sum: 1 },
                        avgTransactionValue: { $avg: '$amount' }
                    }
                }
            ]),
            
            // Client statistics
            User.aggregate([
                { $match: { sponsorId: coachId, role: 'customer', ...dateFilter } },
                {
                    $group: {
                        _id: null,
                        totalClients: { $sum: 1 },
                        activeClients: { $sum: { $cond: [{ $eq: ['$isActive', true] }, 1, 0] } }
                    }
                }
            ]),
            
            // Commission statistics
            Commission.aggregate([
                { $match: { coachId, ...dateFilter } },
                {
                    $group: {
                        _id: null,
                        totalCommissions: { $sum: '$amount' },
                        totalCommissionCount: { $sum: 1 },
                        avgCommission: { $avg: '$amount' }
                    }
                }
            ]),
            
            // Downline statistics
            User.aggregate([
                { $match: { sponsorId: coachId, role: 'coach' } },
                {
                    $group: {
                        _id: null,
                        totalDownline: { $sum: 1 },
                        activeDownline: { $sum: { $cond: [{ $eq: ['$isActive', true] }, 1, 0] } }
                    }
                }
            ]),

             // Task statistics
             Task.aggregate([
                { $match: { assignedTo: coachId, ...dateFilter } },
                {
                    $group: {
                        _id: null,
                        totalTasks: { $sum: 1 },
                        completedTasks: { $sum: { $cond: [{ $eq: ['$status', 'Completed'] }, 1, 0] } }
                    }
                }
            ])
        ]);

        const leads = leadsStats[0] || {};
        const sales = salesStats[0] || {};
        const clients = clientStats[0] || {};
        const commissions = commissionStats[0] || {};
        const downline = downlineStats[0] || {};
        const tasks = tasksStats[0] || {};

        // Construct report data matching CoachReport schema
        const reportData = {
            individualMetrics: {
                leadsGenerated: leads.totalLeads || 0,
                leadsConverted: leads.convertedLeads || 0,
                conversionRate: leads.totalLeads ? (leads.convertedLeads / leads.totalLeads) * 100 : 0,
                salesClosed: sales.totalTransactions || 0,
                revenueGenerated: sales.totalSales || 0,
                averageDealSize: sales.avgTransactionValue || 0,
                tasksCompleted: tasks.completedTasks || 0,
                clientSatisfaction: 0 // Placeholder as strictly review data isn't aggregated yet
            },
            teamMetrics: {
                teamSize: downline.totalDownline || 0,
                teamLeads: 0, // Would require deep aggregation of downline
                teamSales: 0, // Would require deep aggregation of downline
                teamRevenue: 0, // Would require deep aggregation of downline
                teamConversionRate: 0,
                averageTeamPerformance: 0
            },
            comparisons: {
                previousPeriod: {
                    leadsGrowth: 0, // Requires previous period calculation
                    salesGrowth: 0,
                    revenueGrowth: 0,
                    conversionChange: 0
                },
                teamAverage: {
                    leadsVsTeam: 0,
                    salesVsTeam: 0,
                    revenueVsTeam: 0,
                    conversionVsTeam: 0
                }
            },
            trends: {
                leadTrend: 'stable',
                salesTrend: 'stable',
                revenueTrend: 'stable',
                conversionTrend: 'stable'
            },
            goalProgress: {
                leadsGoal: { achieved: leads.totalLeads || 0, target: 100, percentage: (leads.totalLeads / 100) * 100 },
                salesGoal: { achieved: sales.totalTransactions || 0, target: 50, percentage: (sales.totalTransactions / 50) * 100 },
                revenueGoal: { achieved: sales.totalSales || 0, target: 50000, percentage: (sales.totalSales / 50000) * 100 },
                conversionGoal: { achieved: leads.totalLeads ? (leads.convertedLeads / leads.totalLeads) * 100 : 0, target: 20, percentage: 0 }
            },
            breakdown: {
                leadSources: {
                    website: 0,
                    socialMedia: 0,
                    referrals: 0,
                    ads: 0,
                    other: leads.totalLeads || 0
                },
                monthlyPerformance: [],
                teamBreakdown: []
            },
            insights: [
                'Report generated successfully based on real-time data.',
                `Total Revenue: $${sales.totalSales || 0}`,
                `Active Team Members: ${downline.activeDownline || 0}`
            ]
        };

        await CoachReport.findOneAndUpdate(
            { reportId },
            { 
                reportData,
                status: 'completed'
            }
        );
        
        console.log(`Report ${reportId} generated successfully`);

    } catch (error) {
        console.error(`Error generating report ${reportId}:`, error);
        await CoachReport.findOneAndUpdate(
            { reportId },
            { status: 'failed', error: error.message }
        );
    }
}

// ===== HELPER FUNCTIONS =====

// Apply hierarchy changes when admin request is approved
async function applyHierarchyChanges(request) {
    try {
        const coach = await User.findById(request.coachId);
        if (!coach) return;

        const { requestedData } = request;

        switch (request.requestType) {
            case 'level_change':
                if (requestedData.currentLevel) {
                    coach.currentLevel = requestedData.currentLevel;
                }
                break;
            case 'sponsor_change':
                if (requestedData.sponsorId) {
                    coach.sponsorId = requestedData.sponsorId;
                    coach.externalSponsorId = null;
                }
                if (requestedData.externalSponsorId) {
                    coach.externalSponsorId = requestedData.externalSponsorId;
                    coach.sponsorId = null;
                }
                break;
            case 'team_rank_change':
                if (requestedData.teamRankName !== undefined) {
                    coach.teamRankName = requestedData.teamRankName;
                }
                break;
            case 'president_team_rank_change':
                if (requestedData.presidentTeamRankName !== undefined) {
                    coach.presidentTeamRankName = requestedData.presidentTeamRankName;
                }
                break;
        }

        await coach.save();
    } catch (error) {
        console.error('Error applying hierarchy changes:', error);
    }
}

// ===== ENHANCED PERFORMANCE TRACKING METHODS =====

// @desc    Get detailed performance metrics for a specific coach
// @route   GET /api/advanced-mlm/coach-performance/:coachId
// @access  Private
const getCoachPerformance = async (req, res) => {
    const { coachId } = req.params;
    const { period = 'monthly', startDate, endDate } = req.query;

    try {
        // Verify coach exists
        const coach = await User.findById(coachId).select('_id name email role currentLevel');
        if (!coach) {
            return res.status(404).json({
                success: false,
                message: 'Coach not found.'
            });
        }

        // Calculate date range
        let dateFilter = {};
        if (startDate && endDate) {
            dateFilter = {
                createdAt: {
                    $gte: new Date(startDate),
                    $lte: new Date(endDate)
                }
            };
        } else {
            const now = new Date();
            const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
            const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
            dateFilter = {
                createdAt: {
                    $gte: startOfMonth,
                    $lte: endOfMonth
                }
            };
        }

        // Get comprehensive performance data
        const [
            performanceRecord,
            leadsStats,
            salesStats,
            clientStats,
            commissionStats,
            downlineStats
        ] = await Promise.all([
            // Performance record
            CoachPerformance.findOne({ coachId }),
            
            // Leads statistics
            Lead.aggregate([
                { $match: { coachId: new mongoose.Types.ObjectId(coachId), ...dateFilter } },
                {
                    $group: {
                        _id: null,
                        totalLeads: { $sum: 1 },
                        convertedLeads: { $sum: { $cond: [{ $eq: ['$status', 'converted'] }, 1, 0] } },
                        activeLeads: { $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] } },
                        avgLeadValue: { $avg: '$estimatedValue' }
                    }
                }
            ]),
            
            // Sales statistics
            RazorpayPayment.aggregate([
                { $match: { coachId: new mongoose.Types.ObjectId(coachId), status: 'completed', ...dateFilter } },
                {
                    $group: {
                        _id: null,
                        totalSales: { $sum: '$amount' },
                        totalTransactions: { $sum: 1 },
                        avgTransactionValue: { $avg: '$amount' }
                    }
                }
            ]),
            
            // Client statistics
            User.aggregate([
                { $match: { sponsorId: new mongoose.Types.ObjectId(coachId), role: 'customer', ...dateFilter } },
                {
                    $group: {
                        _id: null,
                        totalClients: { $sum: 1 },
                        activeClients: { $sum: { $cond: [{ $eq: ['$isActive', true] }, 1, 0] } }
                    }
                }
            ]),
            
            // Commission statistics
            Commission.aggregate([
                { $match: { coachId: new mongoose.Types.ObjectId(coachId), ...dateFilter } },
                {
                    $group: {
                        _id: null,
                        totalCommissions: { $sum: '$amount' },
                        totalCommissionCount: { $sum: 1 },
                        avgCommission: { $avg: '$amount' }
                    }
                }
            ]),
            
            // Downline statistics
            User.aggregate([
                { $match: { sponsorId: new mongoose.Types.ObjectId(coachId), role: 'coach' } },
                {
                    $group: {
                        _id: null,
                        totalDownline: { $sum: 1 },
                        activeDownline: { $sum: { $cond: [{ $eq: ['$isActive', true] }, 1, 0] } }
                    }
                }
            ])
        ]);

        // Format response data
        const performanceData = {
            coach: {
                id: coach._id,
                name: coach.name,
                email: coach.email,
                currentLevel: coach.currentLevel
            },
            performance: performanceRecord ? {
                currentLevel: performanceRecord.performanceRating.level,
                performanceScore: performanceRecord.performanceRating.score,
                isActive: performanceRecord.isActive,
                lastActivity: performanceRecord.lastActivity,
                activityStreak: performanceRecord.activityStreak
            } : null,
            leads: leadsStats[0] || {
                totalLeads: 0,
                convertedLeads: 0,
                activeLeads: 0,
                avgLeadValue: 0
            },
            sales: salesStats[0] || {
                totalSales: 0,
                totalTransactions: 0,
                avgTransactionValue: 0
            },
            clients: clientStats[0] || {
                totalClients: 0,
                activeClients: 0
            },
            commissions: commissionStats[0] || {
                totalCommissions: 0,
                totalCommissionCount: 0,
                avgCommission: 0
            },
            downline: downlineStats[0] || {
                totalDownline: 0,
                activeDownline: 0
            },
            period: period,
            dateRange: {
                startDate: dateFilter.createdAt?.$gte || null,
                endDate: dateFilter.createdAt?.$lte || null
            }
        };

        res.status(200).json({
            success: true,
            message: 'Coach performance data retrieved successfully.',
            data: performanceData
        });

    } catch (err) {
        console.error('Error getting coach performance:', err);
        res.status(500).json({
            success: false,
            message: 'Server error while retrieving coach performance'
        });
    }
};

// @desc    Get sales performance for downline coaches
// @route   GET /api/advanced-mlm/sales-performance/:sponsorId
// @access  Private
const getSalesPerformance = async (req, res) => {
    const { sponsorId } = req.params;
    const { period = 'monthly', startDate, endDate } = req.query;

    try {
        // Get all downline coaches
        const downline = await User.find({ sponsorId, role: 'coach' }).select('_id name email currentLevel');
        
        if (downline.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'No downline coaches found.'
            });
        }

        const downlineIds = downline.map(d => d._id);

        // Calculate date range
        let dateFilter = {};
        if (startDate && endDate) {
            dateFilter = {
                createdAt: {
                    $gte: new Date(startDate),
                    $lte: new Date(endDate)
                }
            };
        } else {
            const now = new Date();
            const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
            const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
            dateFilter = {
                createdAt: {
                    $gte: startOfMonth,
                    $lte: endOfMonth
                }
            };
        }

        // Get sales data for all downline coaches
        const salesData = await RazorpayPayment.aggregate([
            { $match: { coachId: { $in: downlineIds }, status: 'completed', ...dateFilter } },
            {
                $group: {
                    _id: '$coachId',
                    totalSales: { $sum: '$amount' },
                    totalTransactions: { $sum: 1 },
                    avgTransactionValue: { $avg: '$amount' },
                    maxTransaction: { $max: '$amount' },
                    minTransaction: { $min: '$amount' }
                }
            },
            {
                $lookup: {
                    from: 'users',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'coach'
                }
            },
            {
                $unwind: '$coach'
            },
            {
                $project: {
                    coachId: '$_id',
                    coachName: '$coach.name',
                    coachEmail: '$coach.email',
                    coachLevel: '$coach.currentLevel',
                    totalSales: 1,
                    totalTransactions: 1,
                    avgTransactionValue: 1,
                    maxTransaction: 1,
                    minTransaction: 1
                }
            },
            {
                $sort: { totalSales: -1 }
            }
        ]);

        // Calculate summary statistics
        const summary = {
            totalTeamSales: salesData.reduce((sum, coach) => sum + coach.totalSales, 0),
            totalTeamTransactions: salesData.reduce((sum, coach) => sum + coach.totalTransactions, 0),
            avgTeamTransactionValue: salesData.length > 0 ? 
                salesData.reduce((sum, coach) => sum + coach.totalSales, 0) / 
                salesData.reduce((sum, coach) => sum + coach.totalTransactions, 0) : 0,
            topPerformer: salesData[0] || null,
            activeCoaches: salesData.length,
            totalDownline: downline.length
        };

        res.status(200).json({
            success: true,
            message: 'Sales performance data retrieved successfully.',
            data: {
                summary,
                coachSales: salesData,
                period: period,
                dateRange: {
                    startDate: dateFilter.createdAt?.$gte || null,
                    endDate: dateFilter.createdAt?.$lte || null
                }
            }
        });

    } catch (err) {
        console.error('Error getting sales performance:', err);
        res.status(500).json({
            success: false,
            message: 'Server error while retrieving sales performance'
        });
    }
};

// @desc    Get client acquisition performance for downline coaches
// @route   GET /api/advanced-mlm/client-performance/:sponsorId
// @access  Private
const getClientPerformance = async (req, res) => {
    const { sponsorId } = req.params;
    const { period = 'monthly', startDate, endDate } = req.query;

    try {
        // Get all downline coaches
        const downline = await User.find({ sponsorId, role: 'coach' }).select('_id name email currentLevel');
        
        if (downline.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'No downline coaches found.'
            });
        }

        const downlineIds = downline.map(d => d._id);

        // Calculate date range
        let dateFilter = {};
        if (startDate && endDate) {
            dateFilter = {
                createdAt: {
                    $gte: new Date(startDate),
                    $lte: new Date(endDate)
                }
            };
        } else {
            const now = new Date();
            const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
            const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
            dateFilter = {
                createdAt: {
                    $gte: startOfMonth,
                    $lte: endOfMonth
                }
            };
        }

        // Get client data for all downline coaches
        const clientData = await User.aggregate([
            { $match: { sponsorId: { $in: downlineIds }, role: 'customer', ...dateFilter } },
            {
                $group: {
                    _id: '$sponsorId',
                    totalClients: { $sum: 1 },
                    activeClients: { $sum: { $cond: [{ $eq: ['$isActive', true] }, 1, 0] } },
                    newClients: { $sum: { $cond: [{ $gte: ['$createdAt', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)] }, 1, 0] } }
                }
            },
            {
                $lookup: {
                    from: 'users',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'coach'
                }
            },
            {
                $unwind: '$coach'
            },
            {
                $project: {
                    coachId: '$_id',
                    coachName: '$coach.name',
                    coachEmail: '$coach.email',
                    coachLevel: '$coach.currentLevel',
                    totalClients: 1,
                    activeClients: 1,
                    newClients: 1,
                    clientRetentionRate: {
                        $cond: [
                            { $gt: ['$totalClients', 0] },
                            { $multiply: [{ $divide: ['$activeClients', '$totalClients'] }, 100] },
                            0
                        ]
                    }
                }
            },
            {
                $sort: { totalClients: -1 }
            }
        ]);

        // Calculate summary statistics
        const summary = {
            totalTeamClients: clientData.reduce((sum, coach) => sum + coach.totalClients, 0),
            totalActiveClients: clientData.reduce((sum, coach) => sum + coach.activeClients, 0),
            totalNewClients: clientData.reduce((sum, coach) => sum + coach.newClients, 0),
            avgRetentionRate: clientData.length > 0 ? 
                clientData.reduce((sum, coach) => sum + coach.clientRetentionRate, 0) / clientData.length : 0,
            topClientAcquirer: clientData[0] || null,
            activeCoaches: clientData.length,
            totalDownline: downline.length
        };

        res.status(200).json({
            success: true,
            message: 'Client performance data retrieved successfully.',
            data: {
                summary,
                coachClients: clientData,
                period: period,
                dateRange: {
                    startDate: dateFilter.createdAt?.$gte || null,
                    endDate: dateFilter.createdAt?.$lte || null
                }
            }
        });

    } catch (err) {
        console.error('Error getting client performance:', err);
        res.status(500).json({
            success: false,
            message: 'Server error while retrieving client performance'
        });
    }
};

// @desc    Get lead generation performance for downline coaches
// @route   GET /api/advanced-mlm/lead-performance/:sponsorId
// @access  Private
const getLeadPerformance = async (req, res) => {
    const { sponsorId } = req.params;
    const { period = 'monthly', startDate, endDate } = req.query;

    try {
        // Get all downline coaches
        const downline = await User.find({ sponsorId, role: 'coach' }).select('_id name email currentLevel');
        
        if (downline.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'No downline coaches found.'
            });
        }

        const downlineIds = downline.map(d => d._id);

        // Calculate date range
        let dateFilter = {};
        if (startDate && endDate) {
            dateFilter = {
                createdAt: {
                    $gte: new Date(startDate),
                    $lte: new Date(endDate)
                }
            };
        } else {
            const now = new Date();
            const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
            const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
            dateFilter = {
                createdAt: {
                    $gte: startOfMonth,
                    $lte: endOfMonth
                }
            };
        }

        // Get lead data for all downline coaches
        const leadData = await Lead.aggregate([
            { $match: { coachId: { $in: downlineIds }, ...dateFilter } },
            {
                $group: {
                    _id: '$coachId',
                    totalLeads: { $sum: 1 },
                    convertedLeads: { $sum: { $cond: [{ $eq: ['$status', 'converted'] }, 1, 0] } },
                    activeLeads: { $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] } },
                    qualifiedLeads: { $sum: { $cond: [{ $eq: ['$status', 'qualified'] }, 1, 0] } },
                    avgLeadValue: { $avg: '$estimatedValue' },
                    totalLeadValue: { $sum: '$estimatedValue' }
                }
            },
            {
                $lookup: {
                    from: 'users',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'coach'
                }
            },
            {
                $unwind: '$coach'
            },
            {
                $project: {
                    coachId: '$_id',
                    coachName: '$coach.name',
                    coachEmail: '$coach.email',
                    coachLevel: '$coach.currentLevel',
                    totalLeads: 1,
                    convertedLeads: 1,
                    activeLeads: 1,
                    qualifiedLeads: 1,
                    avgLeadValue: 1,
                    totalLeadValue: 1,
                    conversionRate: {
                        $cond: [
                            { $gt: ['$totalLeads', 0] },
                            { $multiply: [{ $divide: ['$convertedLeads', '$totalLeads'] }, 100] },
                            0
                        ]
                    }
                }
            },
            {
                $sort: { totalLeads: -1 }
            }
        ]);

        // Calculate summary statistics
        const summary = {
            totalTeamLeads: leadData.reduce((sum, coach) => sum + coach.totalLeads, 0),
            totalConvertedLeads: leadData.reduce((sum, coach) => sum + coach.convertedLeads, 0),
            totalActiveLeads: leadData.reduce((sum, coach) => sum + coach.activeLeads, 0),
            totalLeadValue: leadData.reduce((sum, coach) => sum + coach.totalLeadValue, 0),
            avgConversionRate: leadData.length > 0 ? 
                leadData.reduce((sum, coach) => sum + coach.conversionRate, 0) / leadData.length : 0,
            topLeadGenerator: leadData[0] || null,
            activeCoaches: leadData.length,
            totalDownline: downline.length
        };

        res.status(200).json({
            success: true,
            message: 'Lead performance data retrieved successfully.',
            data: {
                summary,
                coachLeads: leadData,
                period: period,
                dateRange: {
                    startDate: dateFilter.createdAt?.$gte || null,
                    endDate: dateFilter.createdAt?.$lte || null
                }
            }
        });

    } catch (err) {
        console.error('Error getting lead performance:', err);
        res.status(500).json({
            success: false,
            message: 'Server error while retrieving lead performance'
        });
    }
};

module.exports = {
    // Health Check
    mlmHealthCheck,
    
    // Coach Rank Management
    setupHierarchyLevels,
    getHierarchyLevels,
    generateCoachId,
    
    // Sponsor Management
    searchSponsor,
    createExternalSponsor,
    
    // Hierarchy Locking
    lockHierarchy,
    
    // Admin Request System
    submitAdminRequest,
    getCoachAdminRequests,
    
    // Admin Functions
    getPendingAdminRequests,
    getAdminCoaches,
    processAdminRequest,
    changeCoachUpline,
    
    // Commission System
    getCommissionSettings,
    updateCommissionSettings,
    calculateCommission,
    calculateSubscriptionCommission,
    getCoachCommissions,
    processMonthlyCommissions,
    
    // ===== INTEGRATED EXISTING MLM FUNCTIONALITY =====
    addDownline,
    getDownline,
    getDownlineHierarchy,
    getTeamPerformance,
    generateTeamReport,
    getReports,
    getReportDetail,
    
    // ===== ENHANCED PERFORMANCE TRACKING =====
    getCoachPerformance,
    getSalesPerformance,
    getClientPerformance,
    getLeadPerformance
};
