// D:\PRJ_YCT_Final\services\dailyPriorityFeedService.js

const { Lead, Appointment } = require('../schema');

// Helper function to format time
const formatTime = (date) => {
    if (!date) return null;
    const d = new Date(date);
    const hours = d.getHours();
    const minutes = d.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const hour12 = hours % 12 || 12;
    const minutesStr = minutes < 10 ? `0${minutes}` : minutes;
    return `${hour12}:${minutesStr} ${ampm}`;
};

// Helper function to format date
const formatDate = (date) => {
    if (!date) return null;
    const d = new Date(date);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    if (d.toDateString() === today.toDateString()) {
        return 'Today';
    } else if (d.toDateString() === tomorrow.toDateString()) {
        return 'Tomorrow';
    } else {
        return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: d.getFullYear() !== today.getFullYear() ? 'numeric' : undefined });
    }
};

// Helper function to get relative time
const getRelativeTime = (date) => {
    if (!date) return null;
    const d = new Date(date);
    const now = new Date();
    const diff = now - d;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    const minutes = Math.floor(diff / (1000 * 60));
    if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    return 'Just now';
};

// Helper function to get next best action
const getNextBestAction = (type, lead, appointment) => {
    const actions = {
        'Appointment': [
            'Prepare meeting materials and agenda',
            'Send appointment reminder to lead',
            'Review lead background and history'
        ],
        'Overdue Follow-up': [
            'Send follow-up message immediately',
            'Call the lead to reconnect',
            'Schedule next follow-up meeting'
        ],
        'New Lead': [
            'Send welcome message',
            'Qualify lead and assess fit',
            'Schedule initial consultation'
        ],
        'Follow-up Today': [
            'Reach out via email or phone',
            'Discuss next steps with lead',
            'Update lead status based on response'
        ],
        'New Hot Lead': [
            'Prioritize immediate outreach',
            'Prepare personalized pitch',
            'Schedule urgent follow-up call'
        ],
        'Stale Lead - Re-engage': [
            'Send re-engagement campaign message',
            'Offer special incentive or update',
            'Schedule reconnection call'
        ],
        'Recent Lead': [
            'Continue nurturing sequence',
            'Move to next funnel stage',
            'Prepare for sales conversation'
        ]
    };
    
    return actions[type] || ['Contact lead', 'Schedule follow-up', 'Update status'];
};

const generateDailyPriorityFeed = async (coachId) => {
    const feedItems = [];
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endOfToday = new Date(startOfToday.getTime() + (24 * 60 * 60 * 1000));
    const twentyFourHoursAgo = new Date(now.getTime() - (24 * 60 * 60 * 1000));
    const seventyTwoHoursAgo = new Date(now.getTime() - (72 * 60 * 60 * 1000));
    const fifteenDaysAgo = new Date(now.getTime() - (15 * 24 * 60 * 60 * 1000));

    // Priority 0: Today's Appointments (New)
    try {
        const todayAppointments = await Appointment.find({
            coachId: coachId,
            startTime: { $gte: startOfToday, $lt: endOfToday }
        })
        .populate('leadId', 'name email phone')
        .sort('startTime');

        todayAppointments.forEach(appt => {
            const lead = appt.leadId;
            feedItems.push({
                type: 'Appointment',
                priority: 0,
                title: lead ? `Appointment with ${lead.name}` : 'Appointment',
                description: appt.summary || 'No summary provided',
                leadId: appt.leadId?._id || appt.leadId,
                appointmentId: appt._id,
                startTime: appt.startTime,
                duration: appt.duration,
                // Display fields
                leadName: lead?.name || 'Unknown',
                leadEmail: lead?.email || null,
                leadPhone: lead?.phone || null,
                formattedTime: formatTime(appt.startTime),
                formattedDate: formatDate(appt.startTime),
                appointmentType: appt.appointmentType || 'online',
                notes: appt.notes || null,
                zoomMeeting: appt.zoomMeeting || null,
                nextBestActions: getNextBestAction('Appointment')
            });
        });
    } catch (error) {
        console.error('[DailyPriorityFeedService] Error fetching today\'s appointments:', error.message);
    }
    
    // Priority 1: Overdue Lead Follow-ups
    try {
        const overdueFollowUps = await Lead.find({
            coachId: coachId,
            status: { $in: ['New', 'Contacted', 'Follow-up', 'Qualified'] },
            nextFollowUpAt: { $lt: startOfToday, $ne: null }
        }).sort('nextFollowUpAt');

        overdueFollowUps.forEach(lead => {
            feedItems.push({
                type: 'Overdue Follow-up',
                priority: 1,
                title: `Follow-up overdue for ${lead.name}`,
                description: `Status: ${lead.status} • Temperature: ${lead.leadTemperature || 'Warm'}`,
                leadId: lead._id,
                leadName: lead.name,
                leadEmail: lead.email || null,
                leadPhone: lead.phone || null,
                nextFollowUpAt: lead.nextFollowUpAt,
                formattedTime: formatTime(lead.nextFollowUpAt),
                formattedDate: formatDate(lead.nextFollowUpAt),
                overdueBy: getRelativeTime(lead.nextFollowUpAt),
                status: lead.status,
                leadTemperature: lead.leadTemperature || 'Warm',
                source: lead.source || 'Unknown',
                nextBestActions: getNextBestAction('Overdue Follow-up')
            });
        });
    } catch (error) {
        console.error('[DailyPriorityFeedService] Error fetching overdue follow-ups:', error.message);
    }

    // Priority 1.5: New Leads (Created in last 24 hours)
    try {
        const newLeads = await Lead.find({
            coachId: coachId,
            status: 'New',
            createdAt: { $gte: twentyFourHoursAgo }
        }).sort('-createdAt');

        newLeads.forEach(lead => {
            feedItems.push({
                type: 'New Lead',
                priority: 1.5,
                title: `New lead: ${lead.name}`,
                description: `From ${lead.source || 'Unknown source'}`,
                leadId: lead._id,
                leadName: lead.name,
                leadEmail: lead.email || null,
                leadPhone: lead.phone || null,
                createdAt: lead.createdAt,
                createdAgo: getRelativeTime(lead.createdAt),
                formattedTime: formatTime(lead.createdAt),
                formattedDate: formatDate(lead.createdAt),
                status: lead.status,
                leadTemperature: lead.leadTemperature || 'Warm',
                source: lead.source || 'Unknown',
                city: lead.city || null,
                country: lead.country || null,
                nextBestActions: getNextBestAction('New Lead')
            });
        });
    } catch (error) {
        console.error('[DailyPriorityFeedService] Error fetching new leads:', error.message);
    }

    // Priority 2: Leads Requiring Immediate Follow-up Today
    try {
        const todayFollowUps = await Lead.find({
            coachId: coachId,
            status: { $in: ['New', 'Contacted', 'Follow-up', 'Qualified'] },
            nextFollowUpAt: { $gte: startOfToday, $lt: endOfToday, $ne: null }
        }).sort('nextFollowUpAt');

        todayFollowUps.forEach(lead => {
            feedItems.push({
                type: 'Follow-up Today',
                priority: 2,
                title: `Follow-up scheduled for ${lead.name}`,
                description: `Status: ${lead.status} • Temperature: ${lead.leadTemperature || 'Warm'}`,
                leadId: lead._id,
                leadName: lead.name,
                leadEmail: lead.email || null,
                leadPhone: lead.phone || null,
                nextFollowUpAt: lead.nextFollowUpAt,
                formattedTime: formatTime(lead.nextFollowUpAt),
                formattedDate: formatDate(lead.nextFollowUpAt),
                status: lead.status,
                leadTemperature: lead.leadTemperature || 'Warm',
                source: lead.source || 'Unknown',
                nextBestActions: getNextBestAction('Follow-up Today')
            });
        });
    } catch (error) {
        console.error('[DailyPriorityFeedService] Error fetching today\'s follow-ups:', error.message);
    }
    
    // ... (rest of the code for Priority 3 and 4 remains the same) ...

    // Priority 3: New "Hot" Leads (Created/Updated recently)
    try {
        const newHotLeads = await Lead.find({
            coachId: coachId,
            leadTemperature: 'Hot',
            status: { $in: ['New', 'Contacted'] },
            $or: [
                { createdAt: { $gte: seventyTwoHoursAgo } },
                { updatedAt: { $gte: twentyFourHoursAgo } }
            ]
        }).sort('-createdAt');

        newHotLeads.forEach(lead => {
            feedItems.push({
                type: 'New Hot Lead',
                priority: 3,
                title: `🔥 Hot lead: ${lead.name}`,
                description: `From ${lead.source || 'Unknown source'} • Status: ${lead.status}`,
                leadId: lead._id,
                leadName: lead.name,
                leadEmail: lead.email || null,
                leadPhone: lead.phone || null,
                createdAt: lead.createdAt,
                createdAgo: getRelativeTime(lead.createdAt),
                formattedTime: formatTime(lead.createdAt),
                formattedDate: formatDate(lead.createdAt),
                status: lead.status,
                leadTemperature: 'Hot',
                source: lead.source || 'Unknown',
                city: lead.city || null,
                country: lead.country || null,
                nextBestActions: getNextBestAction('New Hot Lead')
            });
        });
    } catch (error) {
        console.error('[DailyPriorityFeedService] Error fetching new hot leads:', error.message);
    }

    // Priority 4: Stale "Hot" or "Warm" Leads Needing Re-engagement
    try {
        const staleLeads = await Lead.find({
            coachId: coachId,
            leadTemperature: { $in: ['Hot', 'Warm'] },
            status: { $nin: ['Converted', 'Unqualified'] },
            updatedAt: { $lt: fifteenDaysAgo }
        }).sort('updatedAt');

        staleLeads.forEach(lead => {
            feedItems.push({
                type: 'Stale Lead - Re-engage',
                priority: 4,
                title: `Re-engage ${lead.name}`,
                description: `Last activity: ${getRelativeTime(lead.updatedAt)} • Status: ${lead.status}`,
                leadId: lead._id,
                leadName: lead.name,
                leadEmail: lead.email || null,
                leadPhone: lead.phone || null,
                lastActivityAt: lead.updatedAt,
                lastActivityAgo: getRelativeTime(lead.updatedAt),
                formattedTime: formatTime(lead.updatedAt),
                formattedDate: formatDate(lead.updatedAt),
                status: lead.status,
                leadTemperature: lead.leadTemperature || 'Warm',
                source: lead.source || 'Unknown',
                nextBestActions: getNextBestAction('Stale Lead - Re-engage')
            });
        });
    } catch (error) {
        console.error('[DailyPriorityFeedService] Error fetching stale leads:', error.message);
    }

    // Priority 5: All Recent Leads (Fallback for when other criteria don't match)
    try {
        const recentLeads = await Lead.find({
            coachId: coachId,
            status: { $nin: ['Converted', 'Unqualified'] },
            createdAt: { $gte: seventyTwoHoursAgo }
        }).sort('-createdAt').limit(10);

        recentLeads.forEach(lead => {
            feedItems.push({
                type: 'Recent Lead',
                priority: 5,
                title: `Recent lead: ${lead.name}`,
                description: `From ${lead.source || 'Unknown source'} • Status: ${lead.status}`,
                leadId: lead._id,
                leadName: lead.name,
                leadEmail: lead.email || null,
                leadPhone: lead.phone || null,
                createdAt: lead.createdAt,
                createdAgo: getRelativeTime(lead.createdAt),
                formattedTime: formatTime(lead.createdAt),
                formattedDate: formatDate(lead.createdAt),
                status: lead.status,
                leadTemperature: lead.leadTemperature || 'Warm',
                source: lead.source || 'Unknown',
                city: lead.city || null,
                country: lead.country || null,
                nextBestActions: getNextBestAction('Recent Lead')
            });
        });
    } catch (error) {
        console.error('[DailyPriorityFeedService] Error fetching recent leads:', error.message);
    }

    feedItems.sort((a, b) => a.priority - b.priority);

    return feedItems;
};

module.exports = {
    generateDailyPriorityFeed
};