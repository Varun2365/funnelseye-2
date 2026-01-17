const { 
    User, 
    Coach, 
    CoachHierarchyLevel, 
    AdminRequest, 
    ExternalSponsor 
} = require('../schema');

// @desc    Get all hierarchy levels
// @route   GET /api/coach-hierarchy/levels
// @access  Public
const getHierarchyLevels = async (req, res) => {
    try {
        const levels = await CoachHierarchyLevel.find({ isActive: true })
            .sort({ level: 1 })
            .select('level name description');
        
        res.status(200).json({
            success: true,
            data: levels
        });
    } catch (error) {
        console.error('Error fetching hierarchy levels:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching hierarchy levels'
        });
    }
};

// @desc    Generate unique coach ID
// @route   POST /api/coach-hierarchy/generate-coach-id
// @access  Public
const generateCoachId = async (req, res) => {
    try {
        let coachId;
        let isUnique = false;
        
        while (!isUnique) {
            // Generate format: COACH-YYYY-XXXX (e.g., COACH-2024-0001)
            const year = new Date().getFullYear();
            const randomNum = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
            coachId = `COACH-${year}-${randomNum}`;
            
            // Check if this ID already exists
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
            data: { coachId }
        });
    } catch (error) {
        console.error('Error generating coach ID:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while generating coach ID'
        });
    }
};

// @desc    Search for sponsor by name or ID
// @route   GET /api/coach-hierarchy/search-sponsor
// @access  Public
const searchSponsor = async (req, res) => {
    try {
        const { query } = req.query;
        
        if (!query) {
            return res.status(400).json({
                success: false,
                message: 'Search query is required'
            });
        }
        
        // Search in digital system users
        const digitalSponsors = await User.find({
            role: 'coach',
            $or: [
                { name: { $regex: query, $options: 'i' } },
                { 'selfCoachId': { $regex: query, $options: 'i' } }
            ]
        }).select('_id name email selfCoachId currentLevel');
        
        // Search in external sponsors
        const externalSponsors = await ExternalSponsor.find({
            $or: [
                { name: { $regex: query, $options: 'i' } },
                { phone: { $regex: query, $options: 'i' } },
                { email: { $regex: query, $options: 'i' } }
            ]
        }).select('_id name phone email');
        
        res.status(200).json({
            success: true,
            data: {
                digitalSponsors,
                externalSponsors
            }
        });
    } catch (error) {
        console.error('Error searching sponsors:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while searching sponsors'
        });
    }
};

// @desc    Create external sponsor
// @route   POST /api/coach-hierarchy/external-sponsor
// @access  Public
const createExternalSponsor = async (req, res) => {
    try {
        const { name, phone, email, notes } = req.body;
        
        if (!name) {
            return res.status(400).json({
                success: false,
                message: 'Sponsor name is required'
            });
        }
        
        const externalSponsor = new ExternalSponsor({
            name,
            phone,
            email,
            notes,
            createdBy: req.user ? req.coachId : null
        });
        
        await externalSponsor.save();
        
        res.status(201).json({
            success: true,
            message: 'External sponsor created successfully',
            data: externalSponsor
        });
    } catch (error) {
        console.error('Error creating external sponsor:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while creating external sponsor'
        });
    }
};

// @desc    Coach signup with hierarchy details
// @route   POST /api/coach-hierarchy/signup
// @access  Public
const coachSignupWithHierarchy = async (req, res) => {
    try {
        const {
            name,
            email,
            password,
            selfCoachId,
            currentLevel,
            sponsorId,
            externalSponsorId,
            teamRankName,
            presidentTeamRankName
        } = req.body;
        
        // Validate required fields
        if (!name || !email || !password || !selfCoachId || !currentLevel) {
            return res.status(400).json({
                success: false,
                message: 'Please provide all required fields: name, email, password, selfCoachId, currentLevel'
            });
        }
        
        // Validate level range
        if (currentLevel < 1 || currentLevel > 12) {
            return res.status(400).json({
                success: false,
                message: 'Current level must be between 1 and 12'
            });
        }
        
        // Check if coach ID already exists
        const existingCoachId = await User.findOne({ 
            'selfCoachId': selfCoachId,
            role: 'coach'
        });
        
        if (existingCoachId) {
            return res.status(400).json({
                success: false,
                message: 'Coach ID already exists'
            });
        }
        
        // Check if email already exists
        const existingEmail = await User.findOne({ email });
        if (existingEmail) {
            return res.status(400).json({
                success: false,
                message: 'User with this email already exists'
            });
        }
        
        // Validate sponsor if provided
        if (sponsorId) {
            const sponsor = await User.findById(sponsorId);
            if (!sponsor || sponsor.role !== 'coach') {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid sponsor ID'
                });
            }
        }
        
        // Validate external sponsor if provided
        if (externalSponsorId) {
            const externalSponsor = await ExternalSponsor.findById(externalSponsorId);
            if (!externalSponsor) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid external sponsor ID'
                });
            }
        }
        
        // Create new coach with hierarchy details
        const newCoach = new User({
            name,
            email,
            password,
            role: 'coach',
            selfCoachId,
            currentLevel,
            sponsorId: sponsorId || null,
            externalSponsorId: externalSponsorId || null,
            teamRankName: teamRankName || '',
            presidentTeamRankName: presidentTeamRankName || '',
            hierarchyLocked: false,
            isVerified: false
        });
        
        await newCoach.save();
        
        res.status(201).json({
            success: true,
            message: 'Coach registered successfully with hierarchy details',
            data: {
                coachId: newCoach._id,
                selfCoachId: newCoach.selfCoachId,
                currentLevel: newCoach.currentLevel,
                sponsorId: newCoach.sponsorId,
                externalSponsorId: newCoach.externalSponsorId
            }
        });
        
    } catch (error) {
        console.error('Error during coach signup with hierarchy:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during coach registration'
        });
    }
};

// @desc    Lock hierarchy after first login
// @route   POST /api/coach-hierarchy/lock
// @access  Private
const lockHierarchy = async (req, res) => {
    try {
        const coachId = req.coachId;
        
        const coach = await User.findById(coachId);
        if (!coach || coach.role !== 'coach') {
            return res.status(404).json({
                success: false,
                message: 'Coach not found'
            });
        }
        
        if (coach.hierarchyLocked) {
            return res.status(400).json({
                success: false,
                message: 'Hierarchy is already locked'
            });
        }
        
        coach.hierarchyLocked = true;
        coach.hierarchyLockedAt = new Date();
        await coach.save();
        
        res.status(200).json({
            success: true,
            message: 'Hierarchy locked successfully',
            data: {
                hierarchyLocked: coach.hierarchyLocked,
                hierarchyLockedAt: coach.hierarchyLockedAt
            }
        });
        
    } catch (error) {
        console.error('Error locking hierarchy:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while locking hierarchy'
        });
    }
};

// @desc    Submit admin request for hierarchy change
// @route   POST /api/coach-hierarchy/admin-request
// @access  Private
const submitAdminRequest = async (req, res) => {
    try {
        const coachId = req.coachId;
        const { requestType, requestedData, reason } = req.body;
        
        if (!requestType || !requestedData || !reason) {
            return res.status(400).json({
                success: false,
                message: 'Please provide requestType, requestedData, and reason'
            });
        }
        
        const coach = await User.findById(coachId);
        if (!coach || coach.role !== 'coach') {
            return res.status(404).json({
                success: false,
                message: 'Coach not found'
            });
        }
        
        // Get current hierarchy data
        const currentData = {
            selfCoachId: coach.selfCoachId,
            currentLevel: coach.currentLevel,
            sponsorId: coach.sponsorId,
            externalSponsorId: coach.externalSponsorId,
            teamRankName: coach.teamRankName,
            presidentTeamRankName: coach.presidentTeamRankName
        };
        
        const adminRequest = new AdminRequest({
            coachId,
            requestType,
            currentData,
            requestedData,
            reason
        });
        
        await adminRequest.save();
        
        res.status(201).json({
            success: true,
            message: 'Admin request submitted successfully',
            data: {
                requestId: adminRequest._id,
                status: adminRequest.status
            }
        });
        
    } catch (error) {
        console.error('Error submitting admin request:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while submitting admin request'
        });
    }
};

// @desc    Get coach hierarchy details
// @route   GET /api/coach-hierarchy/details
// @access  Private
const getHierarchyDetails = async (req, res) => {
    try {
        const coachId = req.coachId;
        
        const coach = await User.findById(coachId)
            .populate('sponsorId', 'name email selfCoachId currentLevel')
            .populate('externalSponsorId', 'name phone email');
        
        if (!coach || coach.role !== 'coach') {
            return res.status(404).json({
                success: false,
                message: 'Coach not found'
            });
        }
        
        // Get level name
        const levelInfo = await CoachHierarchyLevel.findOne({ level: coach.currentLevel });
        
        const hierarchyData = {
            selfCoachId: coach.selfCoachId,
            currentLevel: coach.currentLevel,
            levelName: levelInfo ? levelInfo.name : 'Unknown',
            sponsorId: coach.sponsorId,
            externalSponsorId: coach.externalSponsorId,
            teamRankName: coach.teamRankName,
            presidentTeamRankName: coach.presidentTeamRankName,
            hierarchyLocked: coach.hierarchyLocked,
            hierarchyLockedAt: coach.hierarchyLockedAt
        };
        
        res.status(200).json({
            success: true,
            data: hierarchyData
        });
        
    } catch (error) {
        console.error('Error fetching hierarchy details:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching hierarchy details'
        });
    }
};

// @desc    Get pending admin requests (Admin only)
// @route   GET /api/coach-hierarchy/admin-requests
// @access  Private (Admin)
const getAdminRequests = async (req, res) => {
    try {
        const requests = await AdminRequest.find({ status: 'pending' })
            .populate('coachId', 'name email selfCoachId')
            .sort({ createdAt: -1 });
        
        res.status(200).json({
            success: true,
            data: requests
        });
        
    } catch (error) {
        console.error('Error fetching admin requests:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching admin requests'
        });
    }
};

// @desc    Process admin request (Admin only)
// @route   PUT /api/coach-hierarchy/admin-request/:requestId
// @access  Private (Admin)
const processAdminRequest = async (req, res) => {
    try {
        const { requestId } = req.params;
        const { status, adminNotes } = req.body;
        
        if (!['approved', 'rejected'].includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Status must be either approved or rejected'
            });
        }
        
        const request = await AdminRequest.findById(requestId);
        if (!request) {
            return res.status(404).json({
                success: false,
                message: 'Admin request not found'
            });
        }
        
        if (request.status !== 'pending') {
            return res.status(400).json({
                success: false,
                message: 'Request has already been processed'
            });
        }
        
        request.status = status;
        request.adminNotes = adminNotes;
        request.processedBy = req.coachId;
        request.processedAt = new Date();
        
        // If approved, update coach hierarchy
        if (status === 'approved') {
            const coach = await User.findById(request.coachId);
            if (coach) {
                Object.assign(coach, request.requestedData);
                await coach.save();
            }
        }
        
        await request.save();
        
        res.status(200).json({
            success: true,
            message: `Admin request ${status} successfully`,
            data: request
        });
        
    } catch (error) {
        console.error('Error processing admin request:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while processing admin request'
        });
    }
};

// @desc    Update coach information
// @route   PUT /api/coach-hierarchy/update-coach/:coachId
// @access  Private (Coach or Admin)
const updateCoach = async (req, res) => {
    try {
        const { coachId } = req.params;
        const updateData = req.body;
        
        // Find the coach to update
        const coach = await User.findById(coachId);
        if (!coach || coach.role !== 'coach') {
            return res.status(404).json({
                success: false,
                message: 'Coach not found'
            });
        }
        
        // Check permissions - coach can update their own profile, admin can update any
        const authenticatedCoachId = req.coachId;
        const isAdmin = req.user?.role === 'admin' || req.user?.role === 'super_admin';
        
        console.log('🔍 Update Coach Debug Info:');
        console.log('  - Authenticated Coach ID:', authenticatedCoachId);
        console.log('  - Target Coach ID:', coachId);
        console.log('  - Is Admin:', isAdmin);
        console.log('  - Is Own Profile:', authenticatedCoachId === coachId);
        console.log('  - Update Data:', JSON.stringify(updateData, null, 2));
        
        // Get the target coach to check their current sponsor
        const targetCoach = await User.findById(coachId);
        if (targetCoach) {
            console.log('  - Target Coach Name:', targetCoach.name);
            console.log('  - Target Coach Sponsor:', targetCoach.sponsorId);
            console.log('  - Target Coach Sponsor Name:', targetCoach.sponsorId?.name);
        }
        
        // If not admin, check if updating own profile
        if (!isAdmin && authenticatedCoachId !== coachId) {
            console.log('  - Not admin, checking downline relationship...');
            
            // Check if trying to update sponsorId specifically
            if (updateData.sponsorId !== undefined) {
                console.log('  - ❌ SPONSOR ID UPDATE DETECTED - This requires admin approval');
                console.log('  - Current Sponsor:', targetCoach.sponsorId);
                console.log('  - Requested Sponsor:', updateData.sponsorId);
                
                // Use the downline sponsor update endpoint
                try {
                    const response = await fetch(`${BASE_URL}/api/coach-hierarchy/update-downline-sponsor/${coachId}`, {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${req.token}`,
                            'X-Coach-Id': authenticatedCoachId
                        },
                        body: JSON.stringify({
                            sponsorId: updateData.sponsorId,
                            reason: `Sponsor change requested: ${updateData.reason || 'No reason provided'}`
                        }),
                    });

                    if (response.ok) {
                        const data = await response.json();
                        console.log('  ✅ Sponsor change request submitted:', data);
                        return res.status(200).json({
                            success: true,
                            message: 'Sponsor change request submitted for admin approval',
                            data: {
                                requestId: data.requestId,
                                status: data.status
                            }
                        });
                    } else {
                        const errorData = await response.json();
                        console.log('  ❌ Sponsor request failed:', errorData);
                        return res.status(400).json({
                            success: false,
                            message: errorData.message || 'Failed to submit sponsor change request'
                        });
                    }
                } catch (error) {
                    console.log('  ❌ Sponsor request error:', error);
                    return res.status(500).json({
                        success: false,
                        message: 'Server error while submitting sponsor change request'
                    });
                }
            }
            
            // Check if trying to update downline coach
            const isDownlineCoach = await checkIfDownlineCoach(authenticatedCoachId, coachId);
            console.log('  - Is Downline Coach:', isDownlineCoach);
            
            if (!isDownlineCoach) {
                console.log('  ❌ Not authorized - not a downline coach');
                return res.status(403).json({
                    success: false,
                    message: 'You are not authorized to update this coach. Only upline coaches can update downline coach information.'
                });
            }
            
            // For downline coaches, restrict certain sensitive fields
            const restrictedFields = ['sponsorId', 'selfCoachId', 'hierarchyLocked'];
            const hasRestrictedField = restrictedFields.some(field => updateData[field] !== undefined);
            console.log('  - Has Restricted Field:', hasRestrictedField);
            console.log('  - Restricted Fields Found:', restrictedFields.filter(field => updateData[field] !== undefined));
            
            if (hasRestrictedField) {
                console.log('  ❌ Not authorized - trying to modify restricted fields');
                return res.status(403).json({
                    success: false,
                    message: 'You are not authorized to modify sponsor or hierarchy information. Use Admin Requests tab for sponsor changes.'
                });
            }
        }
        
        // Helper function to check if coach is downline
        async function checkIfDownlineCoach(uplineCoachId, downlineCoachId) {
            try {
                console.log(`    🔍 Checking if ${downlineCoachId} is downline of ${uplineCoachId}`);
                
                // Get the upline coach
                const uplineCoach = await User.findById(uplineCoachId);
                if (!uplineCoach) {
                    console.log('    ❌ Upline coach not found');
                    return false;
                }
                
                // Get the downline coach to check
                const downlineCoach = await User.findById(downlineCoachId);
                if (!downlineCoach) {
                    console.log('    ❌ Downline coach not found');
                    return false;
                }
                
                console.log(`    📋 Upline Coach: ${uplineCoach.name} (${uplineCoach._id})`);
                console.log(`    📋 Downline Coach: ${downlineCoach.name} (${downlineCoach._id})`);
                console.log(`    📋 Downline Sponsor: ${downlineCoach.sponsorId}`);
                
                // Check if downline coach's sponsorId matches upline coach (direct downline)
                if (downlineCoach.sponsorId?.toString() === uplineCoachId.toString()) {
                    console.log('    ✅ Direct downline relationship found');
                    return true;
                }
                
                // Check for indirect downline relationship (multi-level)
                // Recursively check if upline coach is an ancestor of downline coach
                console.log('    🔍 Checking for indirect downline relationship...');
                const isAncestor = await isAncestorCoach(uplineCoachId, downlineCoachId);
                console.log(`    ${isAncestor ? '✅' : '❌'} Indirect downline relationship: ${isAncestor}`);
                return isAncestor;
            } catch (error) {
                console.error('Error checking downline relationship:', error);
                return false;
            }
        }
        
        // Helper function to check if coach A is ancestor of coach B
        async function isAncestorCoach(ancestorCoachId, descendantCoachId, visited = new Set()) {
            if (visited.has(descendantCoachId)) {
                console.log(`    🔁 Loop detected for ${descendantCoachId}`);
                return false; // Prevent infinite loops
            }
            visited.add(descendantCoachId);
            
            try {
                const descendantCoach = await User.findById(descendantCoachId);
                if (!descendantCoach) {
                    console.log(`    ❌ Descendant coach ${descendantCoachId} not found`);
                    return false;
                }
                
                console.log(`    🔍 Checking if ${ancestorCoachId} is ancestor of ${descendantCoach.name} (${descendantCoach._id})`);
                console.log(`    📋 Current sponsor: ${descendantCoach.sponsorId}`);
                
                // If direct sponsor match, return true
                if (descendantCoach.sponsorId?.toString() === ancestorCoachId.toString()) {
                    console.log(`    ✅ Direct ancestor found: ${descendantCoach.name}'s sponsor is ${ancestorCoachId}`);
                    return true;
                }
                
                // If no sponsor, can't go further up the hierarchy
                if (!descendantCoach.sponsorId) {
                    console.log(`    ❌ No sponsor found for ${descendantCoach.name}, can't go further up`);
                    return false;
                }
                
                // Recursively check up the hierarchy
                console.log(`    🔍 Going up to sponsor: ${descendantCoach.sponsorId}`);
                return await isAncestorCoach(ancestorCoachId, descendantCoach.sponsorId.toString(), visited);
            } catch (error) {
                console.error('Error checking ancestor relationship:', error);
                return false;
            }
        }
        
        // Build update object with only provided fields
        const allowedFields = [
            'name', 'email', 'phone', 'city', 'country', 'company', 
            'currentLevel', 'isActive', 'bio', 
            'teamRankName', 'presidentTeamRankName', 'experienceYears', 
            'specializations'
        ];
        
        // Add selfCoachId only for admin or own profile updates
        if (isAdmin || authenticatedCoachId === coachId) {
            allowedFields.push('selfCoachId');
        }
        
        const finalUpdateData = {};
        
        // Only include allowed fields that are provided
        allowedFields.forEach(field => {
            if (updateData[field] !== undefined) {
                finalUpdateData[field] = updateData[field];
            }
        });
        
        // Handle password update separately if provided
        if (updateData.password && updateData.password.trim()) {
            finalUpdateData.password = updateData.password;
        }
        
        // Handle specializations - convert from array to string if needed
        if (updateData.specializations && Array.isArray(updateData.specializations)) {
            finalUpdateData.specializations = updateData.specializations.join(', ');
        }
        
        // Update the coach
        const updatedCoach = await User.findByIdAndUpdate(
            coachId,
            { $set: finalUpdateData },
            { new: true, runValidators: true }
        ).select('-password');
        
        if (!updatedCoach) {
            return res.status(404).json({
                success: false,
                message: 'Coach not found or update failed'
            });
        }
        
        res.status(200).json({
            success: true,
            message: 'Coach information updated successfully',
            data: updatedCoach
        });
        
    } catch (error) {
        console.error('Error updating coach:', error);
        
        // Handle duplicate key errors
        if (error.code === 11000) {
            const field = Object.keys(error.keyPattern)[0];
            return res.status(400).json({
                success: false,
                message: `${field} already exists`
            });
        }
        
        // Handle validation errors
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({
                success: false,
                message: messages.join(', ')
            });
        }
        
        res.status(500).json({
            success: false,
            message: 'Server error while updating coach'
        });
    }
};

// @desc    Get my admin requests
// @route   GET /api/coach-hierarchy/my-requests
// @access  Private (Coach)
const getMyRequests = async (req, res) => {
    try {
        const coachId = req.coachId;
        
        const requests = await AdminRequest.find({ coachId })
            .populate('coachId', 'name email selfCoachId')
            .sort({ createdAt: -1 });
        
        res.status(200).json({
            success: true,
            data: requests
        });
        
    } catch (error) {
        console.error('Error fetching my requests:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching requests'
        });
    }
};

// @desc    Get relevant admin requests (my requests + downline requests + requests affecting my hierarchy)
// @route   GET /api/coach-hierarchy/relevant-requests
// @access  Private (Coach)
const getRelevantRequests = async (req, res) => {
    try {
        // Use the authenticated coachId from the request
        const coachId = req.coachId;
        console.log('🔍 getRelevantRequests using coachId:', coachId);
        
        if (!coachId) {
            return res.status(401).json({
                success: false,
                message: 'Coach ID not found in request'
            });
        }
        
        // Get my own requests
        const myRequests = await AdminRequest.find({ coachId })
            .populate('coachId', 'name email selfCoachId')
            .sort({ createdAt: -1 });
        
        // Helper function to recursively get all downline coaches
        const getAllDownlineCoaches = async (sponsorId) => {
            const directDownline = await User.find({ 
                sponsorId: sponsorId,
                role: 'coach'
            }).select('_id name email selfCoachId sponsorId');
            
            let allDownline = [...directDownline];
            
            // Recursively get downline of each direct downline
            for (const coach of directDownline) {
                const indirectDownline = await getAllDownlineCoaches(coach._id);
                allDownline = [...allDownline, ...indirectDownline];
            }
            
            return allDownline;
        };
        
        // Get all downline coaches (direct and indirect) for the current coach
        const allDownlineCoaches = await getAllDownlineCoaches(coachId);
        
        // Get requests from all downline coaches that could affect my hierarchy
        const downlineRequests = await AdminRequest.find({
            coachId: { $in: allDownlineCoaches.map(c => c._id) },
            requestType: { $in: ['sponsor_change', 'level_change'] }
        })
            .populate('coachId', 'name email selfCoachId')
            .sort({ createdAt: -1 });
        
        // IMPORTANT: Also get sponsor change requests where I am the current or requested sponsor
        // This handles cases where a sub-coach wants to leave me or join me
        const sponsorChangeRequests = await AdminRequest.find({
            requestType: 'sponsor_change',
            $or: [
                // I am the current sponsor (someone wants to leave me)
                { 'currentData.sponsorId': coachId },
                // I am the requested sponsor (someone wants to join me)
                { 'requestedData.sponsorId': coachId }
            ]
        })
            .populate('coachId', 'name email selfCoachId')
            .sort({ createdAt: -1 });
        
        // Combine all requests and remove duplicates
        const allRequests = [...myRequests, ...downlineRequests, ...sponsorChangeRequests];
        const uniqueRequests = allRequests.filter((request, index, self) => 
            index === self.findIndex((r) => r._id.toString() === request._id.toString())
        );
        uniqueRequests.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        
        console.log(`🔍 getRelevantRequests for Coach ${coachId}:`);
        console.log(`  - My requests: ${myRequests.length}`);
        console.log(`  - Downline requests: ${downlineRequests.length}`);
        console.log(`  - Sponsor change requests: ${sponsorChangeRequests.length}`);
        console.log(`  - Total unique requests: ${uniqueRequests.length}`);
        
        res.status(200).json({
            success: true,
            data: uniqueRequests
        });
        
    } catch (error) {
        console.error('Error fetching relevant requests:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching relevant requests'
        });
    }
};

// @desc    Update downline coach sponsor (through admin request)
// @route   PUT /api/coach-hierarchy/update-downline-sponsor/:coachId
// @access  Private (Coach or Admin)
const updateDownlineCoachSponsor = async (req, res) => {
    try {
        const { coachId } = req.params;
        const { sponsorId, reason } = req.body;
        const authenticatedCoachId = req.coachId;
        const isAdmin = req.user?.role === 'admin' || req.user?.role === 'super_admin';
        
        if (!sponsorId || !reason) {
            return res.status(400).json({
                success: false,
                message: 'Sponsor ID and reason are required'
            });
        }
        
        // Find the coach to update
        const coach = await User.findById(coachId);
        if (!coach || coach.role !== 'coach') {
            return res.status(404).json({
                success: false,
                message: 'Coach not found'
            });
        }
        
        // Check permissions
        if (!isAdmin) {
            // Check if this is a downline coach of the authenticated coach (multi-level)
            const isDownlineCoach = await checkIfDownlineCoach(authenticatedCoachId, coachId);
            if (!isDownlineCoach) {
                return res.status(403).json({
                    success: false,
                    message: 'You are not authorized to update this coach. Only upline coaches can update downline coach information.'
                });
            }
        }
        
        // Get current sponsor details for proper record keeping
        const currentSponsor = coach.sponsorId ? await User.findById(coach.sponsorId).select('name email selfCoachId') : null;
        const requestedSponsor = await User.findById(sponsorId).select('name email selfCoachId');
        
        if (!requestedSponsor) {
            return res.status(404).json({
                success: false,
                message: 'Requested sponsor not found'
            });
        }
        
        // Create admin request for sponsor change
        const adminRequest = new AdminRequest({
            coachId: coachId,
            requestType: 'sponsor_change',
            currentData: {
                sponsorId: coach.sponsorId,
                sponsorName: currentSponsor?.name || 'Unknown',
                sponsorEmail: currentSponsor?.email || 'Unknown',
                sponsorCoachId: currentSponsor?.selfCoachId || 'Unknown'
            },
            requestedData: {
                sponsorId: sponsorId,
                sponsorName: requestedSponsor.name,
                sponsorEmail: requestedSponsor.email,
                sponsorCoachId: requestedSponsor.selfCoachId,
                requestedBy: authenticatedCoachId,
                reason: reason
            },
            reason: `Sponsor change requested by upline coach: ${reason}`
        });
        
        await adminRequest.save();
        
        res.status(201).json({
            success: true,
            message: 'Sponsor change request submitted for admin approval',
            data: {
                requestId: adminRequest._id,
                status: adminRequest.status
            }
        });
        
    } catch (error) {
        console.error('Error updating downline coach sponsor:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while updating sponsor'
        });
    }
};

module.exports = {
    getHierarchyLevels,
    generateCoachId,
    searchSponsor,
    createExternalSponsor,
    coachSignupWithHierarchy,
    lockHierarchy,
    submitAdminRequest,
    getHierarchyDetails,
    getAdminRequests,
    processAdminRequest,
    updateCoach,
    getMyRequests,
    getRelevantRequests,
    updateDownlineCoachSponsor
};
