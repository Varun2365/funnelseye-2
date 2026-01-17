const Staff = require('../schema/Staff');
const User = require('../schema/User');
const Lead = require('../schema/Lead');
const Task = require('../schema/Task');

/**
 * Lead Assignment Service
 * Handles automatic staff assignment for leads based on distribution ratios
 * Uses weighted round-robin algorithm for uniform distribution
 */
class LeadAssignmentService {
    /**
     * Automatically assign a lead to staff based on distribution ratios
     * Uses weighted round-robin: assigns to staff furthest behind their expected share
     * 
     * @param {String} coachId - Coach ID
     * @param {String} leadId - Lead ID to assign
     * @returns {Object} - Assignment result with success status and assigned staff info
     */
    async autoAssignLead(coachId, leadId) {
        try {
            const lead = await Lead.findById(leadId);
            if (!lead) {
                console.error(`[Lead Assignment Service] Lead not found | Lead ID: ${leadId}`);
                return {
                    success: false,
                    message: 'Lead not found'
                };
            }

            // Check if lead is already assigned
            if (lead.assignedTo) {
                const assignedStaff = await User.findById(lead.assignedTo).select('name email');
                return {
                    success: false,
                    message: 'Lead is already assigned',
                    assignedTo: {
                        staffId: lead.assignedTo,
                        name: assignedStaff?.name || 'Unknown',
                        email: assignedStaff?.email
                    }
                };
            }

            // Get all active staff with distribution ratio > 0
            // Note: Staff extends User discriminator, so we query User with role filter
            const allStaff = await User.find({
                coachId: coachId,
                role: 'staff',
                isActive: true
            }).select('_id name email');

            if (allStaff.length === 0) {
                return {
                    success: false,
                    message: 'No active staff found for this coach',
                    noStaffAvailable: true
                };
            }

            // Get distribution ratios for each staff member
            const staffWithRatios = await Promise.all(
                allStaff.map(async (staffUser) => {
                    const staffDoc = await Staff.findOne({ 
                        _id: staffUser._id,
                        coachId: coachId
                    });
                    
                    return {
                        staffId: staffUser._id,
                        name: staffUser.name,
                        email: staffUser.email,
                        distributionRatio: staffDoc?.distributionRatio || 1
                    };
                })
            );

            // Filter to only staff with distribution ratio > 0
            const activeStaff = staffWithRatios.filter(s => s.distributionRatio > 0);

            if (activeStaff.length === 0) {
                return {
                    success: false,
                    message: 'No staff with active distribution ratio found',
                    allRatiosZero: true
                };
            }

            // Calculate total ratio for weighted round-robin
            const totalRatio = activeStaff.reduce((sum, s) => sum + s.distributionRatio, 0);
            
            // WEIGHTED ROUND-ROBIN ALGORITHM:
            // Get current lead counts and assign to staff furthest behind their expected share
            const staffWithCounts = await Promise.all(
                activeStaff.map(async (staff) => {
                    const assignedCount = await Lead.countDocuments({
                        coachId: coachId,
                        assignedTo: staff.staffId
                    });
                    
                    return {
                        ...staff,
                        assignedLeadCount: assignedCount
                    };
                })
            );

            // Get total leads assigned across all staff for this coach
            const totalLeadsAssigned = await Lead.countDocuments({
                coachId: coachId,
                assignedTo: { $in: activeStaff.map(s => s.staffId) }
            });
            
            // Calculate expected vs actual for each staff and find highest deficit
            let selectedStaff = null;
            let maxDeficit = -Infinity;

            for (const staff of staffWithCounts) {
                const expectedLeads = (totalLeadsAssigned + 1) * (staff.distributionRatio / totalRatio);
                const deficit = expectedLeads - staff.assignedLeadCount;
                
                if (deficit > maxDeficit) {
                    maxDeficit = deficit;
                    selectedStaff = staff;
                }
            }

            // Fallback: if no staff selected, pick first one
            if (!selectedStaff) {
                selectedStaff = staffWithCounts[0];
            }

            // Assign lead to selected staff
            lead.assignedTo = selectedStaff.staffId;
            await lead.save();

            // Automatically create a task for the assigned staff member
            try {
                // Calculate due date (default to 24 hours from now)
                const dueDate = new Date();
                dueDate.setHours(dueDate.getHours() + 24);

                // Create task for the assigned staff
                const task = await Task.create({
                    name: `Follow up with ${lead.name || 'Lead'}`,
                    description: `Follow up with lead: ${lead.name || 'New Lead'}${lead.email ? ` (${lead.email})` : ''}${lead.phone ? ` - ${lead.phone}` : ''}`,
                    status: 'Pending',
                    priority: 'MEDIUM',
                    stage: 'LEAD_GENERATION',
                    dueDate: dueDate,
                    assignedTo: selectedStaff.staffId,
                    relatedLead: lead._id,
                    coachId: coachId,
                    estimatedHours: 1,
                    tags: ['auto-assigned', 'lead-followup']
                });

                console.log(`[Lead Assignment Service] Task created automatically for lead ${lead._id} assigned to staff ${selectedStaff.staffId} | Task ID: ${task._id}`);
            } catch (taskError) {
                // Don't fail lead assignment if task creation fails
                console.error(`[Lead Assignment Service] Failed to create task for lead ${lead._id}:`, taskError.message);
            }

            // Log in the requested format: ["email1", "email2", "ASSIGNED : email2"]
            const staffEmails = activeStaff.map(s => s.email);
            const assignmentLog = [...staffEmails, `ASSIGNED : ${selectedStaff.email}`];
            console.log(JSON.stringify(assignmentLog));

            return {
                success: true,
                message: 'Lead assigned successfully',
                assignedTo: {
                    staffId: selectedStaff.staffId,
                    name: selectedStaff.name,
                    email: selectedStaff.email,
                    distributionRatio: selectedStaff.distributionRatio
                },
                totalStaffConsidered: activeStaff.length,
                totalRatio: totalRatio
            };
        } catch (error) {
            console.error('Error auto-assigning lead:', error);
            return {
                success: false,
                message: 'Error assigning lead to staff',
                error: error.message
            };
        }
    }

    /**
     * Get available staff members for lead assignment (for manual assignment UI)
     * @param {String} coachId - Coach ID
     * @returns {Array} - List of available staff with their distribution ratios and current lead counts
     */
    async getAvailableStaffForAssignment(coachId) {
        try {
            // Get all active staff
            const allStaff = await User.find({
                coachId: coachId,
                role: 'staff',
                isActive: true
            }).select('_id name email');

            const staffWithInfo = await Promise.all(
                allStaff.map(async (staffUser) => {
                    const staffDoc = await Staff.findOne({ 
                        _id: staffUser._id,
                        coachId: coachId
                    });

                    // Get current assigned lead count
                    const assignedLeadCount = await Lead.countDocuments({
                        coachId: coachId,
                        assignedTo: staffUser._id
                    });

                    return {
                        staffId: staffUser._id,
                        name: staffUser.name,
                        email: staffUser.email,
                        distributionRatio: staffDoc?.distributionRatio || 1,
                        assignedLeadCount: assignedLeadCount,
                        isActive: true
                    };
                })
            );

            return staffWithInfo;
        } catch (error) {
            console.error('Error getting available staff for assignment:', error);
            throw error;
        }
    }
}

module.exports = new LeadAssignmentService();

