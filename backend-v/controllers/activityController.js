const asyncHandler = require('../middleware/async');
const { Task, Lead, Appointment, Staff, User, Funnel } = require('../schema');
const mongoose = require('mongoose');

/**
 * Get recent activities across the system
 * Includes: tasks, leads, appointments, staff activities
 */
exports.getRecentActivities = asyncHandler(async (req, res) => {
    const coachId = req.coachId || req.user?._id;
    const { limit = 50, type, days = 7 } = req.query;
    
    if (!coachId) {
        return res.status(401).json({
            success: false,
            message: 'Authentication required'
        });
    }
    
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));
    
    const activities = [];
    
    // Get recent tasks
    if (!type || type === 'task') {
        const tasks = await Task.find({
            coachId,
            updatedAt: { $gte: startDate }
        })
        .populate('assignedTo', 'firstName lastName email role')
        .populate('relatedLead', 'name email phone')
        .sort({ updatedAt: -1 })
        .limit(parseInt(limit));
        
        tasks.forEach(task => {
            activities.push({
                id: task._id,
                type: 'task',
                title: task.name,
                description: task.description || `Task ${task.status}`,
                status: task.status,
                priority: task.priority,
                actor: task.assignedTo,
                relatedEntity: task.relatedLead,
                timestamp: task.updatedAt,
                metadata: {
                    stage: task.stage,
                    dueDate: task.dueDate
                }
            });
        });
    }
    
    // Get recent leads
    if (!type || type === 'lead') {
        const leads = await Lead.find({
            coachId,
            updatedAt: { $gte: startDate }
        })
        .populate('assignedTo', 'firstName lastName email')
        .sort({ updatedAt: -1 })
        .limit(parseInt(limit));
        
        leads.forEach(lead => {
            activities.push({
                id: lead._id,
                type: 'lead',
                title: `Lead: ${lead.name}`,
                description: `Lead status changed to ${lead.status}`,
                status: lead.status,
                actor: lead.assignedTo,
                relatedEntity: lead,
                timestamp: lead.updatedAt,
                metadata: {
                    source: lead.source,
                    email: lead.email,
                    phone: lead.phone
                }
            });
        });
    }
    
    // Get recent appointments
    if (!type || type === 'appointment') {
        const appointments = await Appointment.find({
            coachId,
            updatedAt: { $gte: startDate }
        })
        .populate('leadId', 'name email phone')
        .sort({ updatedAt: -1 })
        .limit(parseInt(limit));
        
        appointments.forEach(appointment => {
            activities.push({
                id: appointment._id,
                type: 'appointment',
                title: `Appointment: ${appointment.summary || 'Scheduled'}`,
                description: `Appointment with ${appointment.leadId?.name || 'Lead'}`,
                status: appointment.status || 'scheduled',
                actor: null,
                relatedEntity: appointment.leadId,
                timestamp: appointment.updatedAt || appointment.startTime,
                metadata: {
                    startTime: appointment.startTime,
                    duration: appointment.duration
                }
            });
        });
    }
    
    // Get staff activities (recent staff updates)
    if (!type || type === 'staff') {
        const staffMembers = await Staff.find({
            coachId,
            updatedAt: { $gte: startDate }
        })
        .populate('userId', 'firstName lastName email')
        .sort({ updatedAt: -1 })
        .limit(parseInt(limit));
        
        staffMembers.forEach(staff => {
            activities.push({
                id: staff._id,
                type: 'staff',
                title: `Staff: ${staff.userId?.firstName || ''} ${staff.userId?.lastName || ''}`,
                description: `Staff member ${staff.isActive ? 'activated' : 'deactivated'}`,
                status: staff.isActive ? 'active' : 'inactive',
                actor: staff.userId,
                relatedEntity: staff,
                timestamp: staff.updatedAt,
                metadata: {
                    role: staff.role,
                    performance: staff.performance
                }
            });
        });
    }
    
    // Get funnel activities
    if (!type || type === 'funnel') {
        const funnels = await Funnel.find({
            coachId,
            updatedAt: { $gte: startDate }
        })
        .sort({ updatedAt: -1 })
        .limit(parseInt(limit));
        
        funnels.forEach(funnel => {
            activities.push({
                id: funnel._id,
                type: 'funnel',
                title: `Funnel: ${funnel.name}`,
                description: `Funnel ${funnel.isActive ? 'activated' : 'deactivated'}`,
                status: funnel.isActive ? 'active' : 'inactive',
                actor: null,
                relatedEntity: funnel,
                timestamp: funnel.updatedAt,
                metadata: {
                    stages: funnel.stages?.length || 0
                }
            });
        });
    }
    
    // Sort all activities by timestamp
    activities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    // Limit results
    const limitedActivities = activities.slice(0, parseInt(limit));
    
    res.json({
        success: true,
        data: limitedActivities,
        count: limitedActivities.length,
        filters: {
            type,
            days: parseInt(days),
            limit: parseInt(limit)
        }
    });
});

/**
 * Get activity statistics
 */
exports.getActivityStats = asyncHandler(async (req, res) => {
    const coachId = req.coachId || req.user?._id;
    const { days = 7 } = req.query;
    
    if (!coachId) {
        return res.status(401).json({
            success: false,
            message: 'Authentication required'
        });
    }
    
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));
    
    const [taskCount, leadCount, appointmentCount, staffCount, funnelCount] = await Promise.all([
        Task.countDocuments({ coachId, updatedAt: { $gte: startDate } }),
        Lead.countDocuments({ coachId, updatedAt: { $gte: startDate } }),
        Appointment.countDocuments({ coachId, updatedAt: { $gte: startDate } }),
        Staff.countDocuments({ coachId, updatedAt: { $gte: startDate } }),
        Funnel.countDocuments({ coachId, updatedAt: { $gte: startDate } })
    ]);
    
    const stats = {
        tasks: taskCount,
        leads: leadCount,
        appointments: appointmentCount,
        staff: staffCount,
        funnels: funnelCount,
        total: taskCount + leadCount + appointmentCount + staffCount + funnelCount
    };
    
    res.json({
        success: true,
        data: stats
    });
});

/**
 * Get ongoing tasks and activities
 */
exports.getOngoingActivities = asyncHandler(async (req, res) => {
    const coachId = req.coachId || req.user?._id;
    
    if (!coachId) {
        return res.status(401).json({
            success: false,
            message: 'Authentication required'
        });
    }
    
    // Get in-progress tasks
    const inProgressTasks = await Task.find({
        coachId,
        status: { $in: ['In Progress', 'Pending'] }
    })
    .populate('assignedTo', 'firstName lastName email role')
    .populate('relatedLead', 'name email phone')
    .sort({ dueDate: 1 })
    .limit(20);
    
    // Get upcoming appointments
    const upcomingAppointments = await Appointment.find({
        coachId,
        startTime: { $gte: new Date() },
        status: { $ne: 'cancelled' }
    })
    .populate('leadId', 'name email phone')
    .sort({ startTime: 1 })
    .limit(10);
    
    // Get active staff
    const activeStaff = await Staff.find({
        coachId,
        isActive: true
    })
    .populate('userId', 'firstName lastName email')
    .limit(10);
    
    res.json({
        success: true,
        data: {
            tasks: inProgressTasks,
            appointments: upcomingAppointments,
            staff: activeStaff
        }
    });
});

