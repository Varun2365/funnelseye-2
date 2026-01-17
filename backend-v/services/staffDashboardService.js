const Lead = require('../schema/Lead');
const WhatsAppMessage = require('../schema/WhatsAppMessage');
const EmailMessage = require('../schema/EmailMessage');
const Appointment = require('../schema/Appointment');
const Staff = require('../schema/Staff');
const Task = require('../schema/Task');
const CoachStaffService = require('./coachStaffService');
const { SECTIONS } = require('../utils/sectionPermissions');

/**
 * Staff Dashboard Service
 * Provides personalized dashboard data for staff members
 * Each staff member sees only their own stats and assigned data
 */
class StaffDashboardService {
    
    /**
     * Get complete personalized dashboard data for staff
     * @param {string} coachId - Coach ID
     * @param {string} staffId - Staff member ID
     * @param {Object} req - Request object for permission checking
     * @param {number} timeRange - Time range in days (default 30)
     * @returns {Object} - Personalized staff dashboard data
     */
    async getStaffDashboardData(coachId, staffId, req, timeRange = 30) {
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - timeRange);
        
        const userContext = CoachStaffService.getUserContext(req);
        const dashboardData = {};
        
        // Get overview metrics (comprehensive stats)
        dashboardData.overview = await this.getStaffOverview(coachId, staffId, startDate, req);
        
        // Get leads data if staff has permission
        if (CoachStaffService.hasPermission(req, SECTIONS.LEADS.VIEW)) {
            dashboardData.leads = await this.getStaffLeadsData(coachId, staffId, startDate, req);
            dashboardData.leadsBySource = await this.getLeadsBySource(coachId, staffId);
            dashboardData.leadConversionFunnel = await this.getLeadConversionFunnel(coachId, staffId);
            dashboardData.topPerformingLeads = await this.getTopPerformingLeads(coachId, staffId);
        }
        
        // Get messaging data if staff has permission
        if (CoachStaffService.hasPermission(req, SECTIONS.MESSAGING.VIEW)) {
            dashboardData.messaging = await this.getStaffMessagingData(coachId, staffId, startDate, req);
            dashboardData.messagingTrends = await this.getMessagingTrends(coachId, staffId, startDate);
            dashboardData.mostContactedLeads = await this.getMostContactedLeads(coachId, staffId);
        }
        
        // Get calendar/appointments data if staff has permission
        if (CoachStaffService.hasPermission(req, SECTIONS.CALENDAR.VIEW)) {
            dashboardData.appointments = await this.getStaffAppointmentsData(coachId, staffId, startDate, req);
            dashboardData.appointmentStats = await this.getAppointmentStats(coachId, staffId, startDate);
            dashboardData.upcomingWeekSchedule = await this.getUpcomingWeekSchedule(coachId, staffId);
        }
        
        // Performance metrics
        dashboardData.performanceMetrics = await this.getPerformanceMetrics(coachId, staffId, startDate, req);
        
        // MY PERFORMANCE SCORE (visible to coach as well)
        dashboardData.myPerformanceScore = await this.calculatePerformanceScore(coachId, staffId, req);
        
        // TEAM PERFORMANCE (compare with colleagues)
        dashboardData.teamPerformance = await this.getTeamPerformance(coachId, staffId, req);
        
        // MY TASKS (assigned to me)
        dashboardData.myTasks = await this.getMyTasks(coachId, staffId, req);
        
        // Weekly trends
        dashboardData.weeklyTrends = await this.getWeeklyTrends(coachId, staffId, req);
        
        // Get recent activity
        dashboardData.recentActivity = await this.getStaffRecentActivity(coachId, staffId, startDate, req);
        
        // Get daily priority tasks
        dashboardData.dailyTasks = await this.getStaffDailyTasks(coachId, staffId, req);
        
        // Pending actions
        dashboardData.pendingActions = await this.getPendingActions(coachId, staffId, req);
        
        // Get today's appointments
        if (CoachStaffService.hasPermission(req, SECTIONS.CALENDAR.VIEW)) {
            dashboardData.todayAppointments = await this.getTodayAppointments(coachId, staffId);
        }
        
        // Quick stats card
        dashboardData.quickStats = await this.getQuickStats(coachId, staffId, req);
        
        // Achievements and milestones
        dashboardData.achievements = await this.getAchievements(coachId, staffId, req);
        
        // This week summary
        dashboardData.weekSummary = await this.getWeekSummary(coachId, staffId, req);
        
        return dashboardData;
    }
    
    /**
     * Get staff overview metrics (COMPREHENSIVE)
     */
    async getStaffOverview(coachId, staffId, startDate, req) {
        const overview = {
            staffName: req.staffInfo?.name || 'Staff Member',
            staffEmail: req.staffInfo?.email || '',
            period: `Last ${Math.ceil((new Date() - startDate) / (1000 * 60 * 60 * 24))} days`,
            lastActive: new Date()
        };
        
        // MY LEADS STATS (Comprehensive)
        if (CoachStaffService.hasPermission(req, SECTIONS.LEADS.VIEW)) {
            const myLeads = await Lead.find({
                coachId,
                $or: [
                    { assignedTo: staffId },
                    { 'appointment.assignedStaffId': staffId }
                ],
                createdAt: { $gte: startDate }
            });
            
            const allMyLeads = await Lead.find({
                coachId,
                $or: [
                    { assignedTo: staffId },
                    { 'appointment.assignedStaffId': staffId }
                ]
            });
            
            // Today's leads
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const todayLeads = await Lead.countDocuments({
                coachId,
                $or: [
                    { assignedTo: staffId },
                    { 'appointment.assignedStaffId': staffId }
                ],
                createdAt: { $gte: today }
            });
            
            overview.myAssignedLeads = allMyLeads.length;
            overview.myNewLeadsThisPeriod = myLeads.length;
            overview.myNewLeadsToday = todayLeads;
            overview.myLeadsConverted = allMyLeads.filter(l => l.status === 'Converted').length;
            overview.myLeadsLost = allMyLeads.filter(l => l.status === 'Lost').length;
            overview.myConversionRate = allMyLeads.length > 0 
                ? ((overview.myLeadsConverted / allMyLeads.length) * 100).toFixed(1) 
                : 0;
            overview.myLossRate = allMyLeads.length > 0
                ? ((overview.myLeadsLost / allMyLeads.length) * 100).toFixed(1)
                : 0;
            
            // Lead status breakdown
            overview.myLeadsByStatus = {
                new: allMyLeads.filter(l => l.status === 'New').length,
                contacted: allMyLeads.filter(l => l.status === 'Contacted').length,
                qualified: allMyLeads.filter(l => l.status === 'Qualified').length,
                inProgress: allMyLeads.filter(l => l.status === 'In Progress').length,
                converted: allMyLeads.filter(l => l.status === 'Converted').length,
                lost: allMyLeads.filter(l => l.status === 'Lost').length
            };
            
            // Average lead score
            overview.myAverageLeadScore = allMyLeads.length > 0
                ? (allMyLeads.reduce((sum, l) => sum + (l.leadScore || 0), 0) / allMyLeads.length).toFixed(1)
                : 0;
            
            // Hot leads (score > 70)
            overview.myHotLeads = allMyLeads.filter(l => (l.leadScore || 0) > 70).length;
            
            // Leads needing follow-up
            overview.myLeadsNeedingFollowUp = allMyLeads.filter(l => 
                l.status === 'Contacted' && 
                (!l.lastContactedAt || (new Date() - new Date(l.lastContactedAt)) > 24 * 60 * 60 * 1000)
            ).length;
        }
        
        // MY APPOINTMENTS STATS (Comprehensive)
        if (CoachStaffService.hasPermission(req, SECTIONS.CALENDAR.VIEW)) {
            const myAppointments = await Appointment.find({
                coachId,
                assignedStaffId: staffId,
                startTime: { $gte: startDate }
            });
            
            const allMyAppointments = await Appointment.find({
                coachId,
                assignedStaffId: staffId
            });
            
            const todayAppointments = await Appointment.countDocuments({
                coachId,
                assignedStaffId: staffId,
                startTime: { 
                    $gte: new Date(new Date().setHours(0, 0, 0, 0)),
                    $lt: new Date(new Date().setHours(23, 59, 59, 999))
                }
            });
            
            overview.myTotalAppointments = allMyAppointments.length;
            overview.myAppointmentsThisPeriod = myAppointments.length;
            overview.myAppointmentsToday = todayAppointments;
            overview.myCompletedAppointments = allMyAppointments.filter(a => a.status === 'completed').length;
            overview.myCancelledAppointments = allMyAppointments.filter(a => a.status === 'cancelled').length;
            overview.myNoShowAppointments = allMyAppointments.filter(a => a.status === 'no-show').length;
            overview.myUpcomingAppointments = allMyAppointments.filter(a => 
                a.status === 'scheduled' && new Date(a.startTime) > new Date()
            ).length;
            overview.myAppointmentCompletionRate = allMyAppointments.length > 0
                ? ((overview.myCompletedAppointments / allMyAppointments.length) * 100).toFixed(1)
                : 0;
            overview.myAppointmentNoShowRate = allMyAppointments.length > 0
                ? ((overview.myNoShowAppointments / allMyAppointments.length) * 100).toFixed(1)
                : 0;
        }
        
        // MY MESSAGING STATS (Comprehensive)
        if (CoachStaffService.hasPermission(req, SECTIONS.MESSAGING.VIEW)) {
            const myWhatsAppMessages = await WhatsAppMessage.find({
                coachId,
                senderId: staffId,
                senderType: 'staff',
                timestamp: { $gte: startDate }
            });
            
            const allMyWhatsAppMessages = await WhatsAppMessage.find({
                coachId,
                senderId: staffId,
                senderType: 'staff'
            });
            
            const myEmailMessages = await EmailMessage.find({
                coachId,
                senderId: staffId,
                senderType: 'staff',
                sentAt: { $gte: startDate }
            });
            
            const allMyEmailMessages = await EmailMessage.find({
                coachId,
                senderId: staffId,
                senderType: 'staff'
            });
            
            const todayMessages = await WhatsAppMessage.countDocuments({
                coachId,
                senderId: staffId,
                senderType: 'staff',
                timestamp: { 
                    $gte: new Date(new Date().setHours(0, 0, 0, 0))
                }
            });
            
            overview.myTotalMessagesSent = allMyWhatsAppMessages.length + allMyEmailMessages.length;
            overview.myMessagesSentThisPeriod = myWhatsAppMessages.length + myEmailMessages.length;
            overview.myMessagesToday = todayMessages;
            overview.myWhatsAppMessages = myWhatsAppMessages.length;
            overview.myEmailMessages = myEmailMessages.length;
            overview.myTotalWhatsAppMessages = allMyWhatsAppMessages.length;
            overview.myTotalEmailMessages = allMyEmailMessages.length;
            
            // Get unique conversations
            const uniqueContacts = new Set([
                ...myWhatsAppMessages.map(m => m.to),
                ...myEmailMessages.map(m => m.to)
            ]);
            overview.myActiveConversations = uniqueContacts.size;
            
            // Get all-time unique contacts
            const allUniqueContacts = new Set([
                ...allMyWhatsAppMessages.map(m => m.to),
                ...allMyEmailMessages.map(m => m.to)
            ]);
            overview.myTotalContactsMessaged = allUniqueContacts.size;
            
            // Average messages per day
            const daysInPeriod = Math.ceil((new Date() - startDate) / (1000 * 60 * 60 * 24));
            overview.myAverageMessagesPerDay = daysInPeriod > 0
                ? ((myWhatsAppMessages.length + myEmailMessages.length) / daysInPeriod).toFixed(1)
                : 0;
        }
        
        return overview;
    }
    
    /**
     * Get staff leads data
     */
    async getStaffLeadsData(coachId, staffId, startDate, req) {
        const leads = await Lead.find({
            coachId,
            $or: [
                { assignedTo: staffId },
                { 'appointment.assignedStaffId': staffId }
            ],
            createdAt: { $gte: startDate }
        }).sort({ createdAt: -1 }).limit(10);
        
        const totalLeads = await Lead.countDocuments({
            coachId,
            $or: [
                { assignedTo: staffId },
                { 'appointment.assignedStaffId': staffId }
            ]
        });
        
        return {
            recentLeads: leads,
            totalAssigned: totalLeads,
            newThisPeriod: leads.length,
            avgLeadScore: leads.reduce((sum, l) => sum + (l.leadScore || 0), 0) / (leads.length || 1)
        };
    }
    
    /**
     * Get staff messaging data
     */
    async getStaffMessagingData(coachId, staffId, startDate, req) {
        const whatsappMessages = await WhatsAppMessage.find({
            coachId,
            senderId: staffId,
            senderType: 'staff',
            timestamp: { $gte: startDate }
        }).sort({ timestamp: -1 }).limit(10);
        
        const emailMessages = await EmailMessage.find({
            coachId,
            senderId: staffId,
            senderType: 'staff',
            sentAt: { $gte: startDate }
        }).sort({ sentAt: -1 }).limit(10);

        return {
            recentWhatsAppMessages: whatsappMessages,
            recentEmailMessages: emailMessages,
            totalSent: whatsappMessages.length + emailMessages.length
        };
    }

    /**
     * Get staff appointments data
     */
    async getStaffAppointmentsData(coachId, staffId, startDate, req) {
        const appointments = await Appointment.find({
            coachId,
            assignedStaffId: staffId,
            startTime: { $gte: startDate }
        }).sort({ startTime: -1 }).populate('leadId', 'name phone email');
        
        const upcoming = await Appointment.find({
            coachId,
            assignedStaffId: staffId,
            startTime: { $gte: new Date() },
            status: 'scheduled'
        }).sort({ startTime: 1 }).limit(5).populate('leadId', 'name phone email');

        return {
            recentAppointments: appointments,
            upcomingAppointments: upcoming,
            totalThisPeriod: appointments.length
        };
    }

    /**
     * Get staff recent activity
     */
    async getStaffRecentActivity(coachId, staffId, startDate, req) {
        const activity = [];
        
        // Recent leads activity
        if (CoachStaffService.hasPermission(req, SECTIONS.LEADS.VIEW)) {
            const recentLeads = await Lead.find({
                coachId,
                $or: [
                    { assignedTo: staffId },
                    { 'appointment.assignedStaffId': staffId }
                ],
                updatedAt: { $gte: startDate }
            }).sort({ updatedAt: -1 }).limit(5);
            
            recentLeads.forEach(lead => {
                activity.push({
                    type: 'lead_updated',
                    leadName: lead.name,
                    leadId: lead._id,
                    status: lead.status,
                    time: lead.updatedAt
                });
            });
        }
        
        // Recent messages
        if (CoachStaffService.hasPermission(req, SECTIONS.MESSAGING.VIEW)) {
            const recentMessages = await WhatsAppMessage.find({
                coachId,
                senderId: staffId,
                senderType: 'staff',
                timestamp: { $gte: startDate }
            }).sort({ timestamp: -1 }).limit(5);
            
            recentMessages.forEach(msg => {
                activity.push({
                    type: 'message_sent',
                    contact: msg.to,
                    messageType: 'whatsapp',
                    time: msg.timestamp
                });
            });
        }
        
        // Recent appointments
        if (CoachStaffService.hasPermission(req, SECTIONS.CALENDAR.VIEW)) {
            const recentAppointments = await Appointment.find({
                coachId,
                assignedStaffId: staffId,
                createdAt: { $gte: startDate }
            }).sort({ createdAt: -1 }).limit(5).populate('leadId', 'name');
            
            recentAppointments.forEach(apt => {
                activity.push({
                    type: 'appointment_booked',
                    leadName: apt.leadId?.name || 'Unknown',
                    appointmentTime: apt.startTime,
                    time: apt.createdAt
                });
            });
        }
        
        // Sort all activity by time and return top 10
        return activity.sort((a, b) => new Date(b.time) - new Date(a.time)).slice(0, 10);
    }
    
    /**
     * Get staff daily tasks
     */
    async getStaffDailyTasks(coachId, staffId, req) {
        const tasks = [];
        
        // Follow-up tasks from leads
        if (CoachStaffService.hasPermission(req, SECTIONS.LEADS.VIEW)) {
            const leadsNeedingFollowup = await Lead.find({
                coachId,
                $or: [
                    { assignedTo: staffId },
                    { 'appointment.assignedStaffId': staffId }
                ],
                status: { $in: ['New', 'Contacted'] },
                lastContactedAt: { $lt: new Date(Date.now() - 24 * 60 * 60 * 1000) } // Not contacted in 24h
            }).limit(5);
            
            leadsNeedingFollowup.forEach(lead => {
                tasks.push({
                    type: 'follow_up',
                    priority: 'high',
                    leadName: lead.name,
                    leadId: lead._id,
                    description: `Follow up with ${lead.name}`,
                    dueTime: 'Today'
                });
            });
        }
        
        // Today's appointments
        if (CoachStaffService.hasPermission(req, SECTIONS.CALENDAR.VIEW)) {
            const todayStart = new Date();
            todayStart.setHours(0, 0, 0, 0);
            const todayEnd = new Date();
            todayEnd.setHours(23, 59, 59, 999);
            
            const todayAppointments = await Appointment.find({
                coachId,
                assignedStaffId: staffId,
                startTime: { $gte: todayStart, $lte: todayEnd },
                status: 'scheduled'
            }).populate('leadId', 'name');
            
            todayAppointments.forEach(apt => {
                tasks.push({
                    type: 'appointment',
                    priority: 'high',
                    leadName: apt.leadId?.name || 'Unknown',
                    description: `Appointment with ${apt.leadId?.name || 'client'}`,
                    dueTime: new Date(apt.startTime).toLocaleTimeString('en-US', { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                    })
                });
            });
        }
        
        return tasks.sort((a, b) => {
            const priorityOrder = { high: 0, medium: 1, low: 2 };
            return priorityOrder[a.priority] - priorityOrder[b.priority];
        });
    }
    
    /**
     * Get today's appointments for staff
     */
    async getTodayAppointments(coachId, staffId) {
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);
        const todayEnd = new Date();
        todayEnd.setHours(23, 59, 59, 999);
        
        return await Appointment.find({
            coachId,
            assignedStaffId: staffId,
            startTime: { $gte: todayStart, $lte: todayEnd }
        }).sort({ startTime: 1 }).populate('leadId', 'name phone email');
    }
    
    /**
     * Get leads by source
     */
    async getLeadsBySource(coachId, staffId) {
        const leads = await Lead.find({
            coachId,
            $or: [
                { assignedTo: staffId },
                { 'appointment.assignedStaffId': staffId }
            ]
        });
        
        const sourceBreakdown = {};
        leads.forEach(lead => {
            const source = lead.source || 'Unknown';
            sourceBreakdown[source] = (sourceBreakdown[source] || 0) + 1;
        });
        
        return Object.entries(sourceBreakdown).map(([source, count]) => ({
            source,
            count,
            percentage: ((count / leads.length) * 100).toFixed(1)
        })).sort((a, b) => b.count - a.count);
    }
    
    /**
     * Get lead conversion funnel
     */
    async getLeadConversionFunnel(coachId, staffId) {
        const leads = await Lead.find({
            coachId,
            $or: [
                { assignedTo: staffId },
                { 'appointment.assignedStaffId': staffId }
            ]
        });

        return {
            total: leads.length,
            new: leads.filter(l => l.status === 'New').length,
            contacted: leads.filter(l => l.status === 'Contacted').length,
            qualified: leads.filter(l => l.status === 'Qualified').length,
            converted: leads.filter(l => l.status === 'Converted').length,
            conversionRate: leads.length > 0 
                ? ((leads.filter(l => l.status === 'Converted').length / leads.length) * 100).toFixed(1)
                : 0
        };
    }

    /**
     * Get top performing leads
     */
    async getTopPerformingLeads(coachId, staffId) {
        return await Lead.find({
            coachId,
            $or: [
                { assignedTo: staffId },
                { 'appointment.assignedStaffId': staffId }
            ],
            leadScore: { $exists: true, $gt: 70 }
        }).sort({ leadScore: -1 }).limit(5).select('name email phone leadScore status');
    }
    
    /**
     * Get messaging trends
     */
    async getMessagingTrends(coachId, staffId, startDate) {
        const last7Days = new Date();
        last7Days.setDate(last7Days.getDate() - 7);
        
        const whatsappMessages = await WhatsAppMessage.find({
            coachId,
            senderId: staffId,
            senderType: 'staff',
            timestamp: { $gte: last7Days }
        });
        
        const emailMessages = await EmailMessage.find({
            coachId,
            senderId: staffId,
            senderType: 'staff',
            sentAt: { $gte: last7Days }
        });
        
        // Group by day
        const dailyStats = {};
        for (let i = 0; i < 7; i++) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const dateKey = date.toISOString().split('T')[0];
            dailyStats[dateKey] = { whatsapp: 0, email: 0, total: 0 };
        }
        
        whatsappMessages.forEach(msg => {
            const dateKey = new Date(msg.timestamp).toISOString().split('T')[0];
            if (dailyStats[dateKey]) {
                dailyStats[dateKey].whatsapp++;
                dailyStats[dateKey].total++;
            }
        });
        
        emailMessages.forEach(msg => {
            const dateKey = new Date(msg.sentAt).toISOString().split('T')[0];
            if (dailyStats[dateKey]) {
                dailyStats[dateKey].email++;
                dailyStats[dateKey].total++;
            }
        });
        
        return Object.entries(dailyStats).map(([date, stats]) => ({
            date,
            ...stats
        })).reverse();
    }
    
    /**
     * Get most contacted leads
     */
    async getMostContactedLeads(coachId, staffId) {
        const whatsappMessages = await WhatsAppMessage.find({
            coachId,
            senderId: staffId,
            senderType: 'staff'
        });
        
        const contactCount = {};
        whatsappMessages.forEach(msg => {
            contactCount[msg.to] = (contactCount[msg.to] || 0) + 1;
        });
        
        const topContacts = Object.entries(contactCount)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 5)
            .map(([phone, count]) => ({ phone, messageCount: count }));
        
        // Get lead details
        const phones = topContacts.map(c => c.phone);
        const leads = await Lead.find({
            coachId,
            phone: { $in: phones }
        }).select('name phone email status');
        
        return topContacts.map(contact => {
            const lead = leads.find(l => l.phone === contact.phone);
            return {
                ...contact,
                leadName: lead?.name || 'Unknown',
                leadEmail: lead?.email,
                leadStatus: lead?.status
            };
        });
    }
    
    /**
     * Get appointment stats
     */
    async getAppointmentStats(coachId, staffId, startDate) {
        const appointments = await Appointment.find({
            coachId,
            assignedStaffId: staffId
        });
        
        const thisPeriodAppointments = appointments.filter(apt => 
            new Date(apt.createdAt) >= startDate
        );
        
        return {
            total: appointments.length,
            thisPeriod: thisPeriodAppointments.length,
            completed: appointments.filter(a => a.status === 'completed').length,
            scheduled: appointments.filter(a => a.status === 'scheduled').length,
            cancelled: appointments.filter(a => a.status === 'cancelled').length,
            noShow: appointments.filter(a => a.status === 'no-show').length,
            completionRate: appointments.length > 0
                ? ((appointments.filter(a => a.status === 'completed').length / appointments.length) * 100).toFixed(1)
                : 0
        };
    }
    
    /**
     * Get upcoming week schedule
     */
    async getUpcomingWeekSchedule(coachId, staffId) {
        const today = new Date();
        const nextWeek = new Date();
        nextWeek.setDate(nextWeek.getDate() + 7);
        
        const appointments = await Appointment.find({
            coachId,
            assignedStaffId: staffId,
            startTime: { $gte: today, $lte: nextWeek },
            status: 'scheduled'
        }).sort({ startTime: 1 }).populate('leadId', 'name phone');
        
        // Group by day
        const schedule = {};
        appointments.forEach(apt => {
            const day = new Date(apt.startTime).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
            if (!schedule[day]) {
                schedule[day] = [];
            }
            schedule[day].push({
                time: new Date(apt.startTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
                leadName: apt.leadId?.name || 'Unknown',
                phone: apt.leadId?.phone,
                duration: apt.duration || 30
            });
        });
        
        return schedule;
    }
    
    /**
     * Get performance metrics
     */
    async getPerformanceMetrics(coachId, staffId, startDate, req) {
        const metrics = {
            period: `Last ${Math.ceil((new Date() - startDate) / (1000 * 60 * 60 * 24))} days`
        };
        
        // Lead performance
        if (CoachStaffService.hasPermission(req, SECTIONS.LEADS.VIEW)) {
            const leads = await Lead.find({
                coachId,
                $or: [
                    { assignedTo: staffId },
                    { 'appointment.assignedStaffId': staffId }
                ],
                createdAt: { $gte: startDate }
            });
            
            metrics.leadsGenerated = leads.length;
            metrics.leadsConverted = leads.filter(l => l.status === 'Converted').length;
            metrics.averageLeadScore = leads.length > 0
                ? (leads.reduce((sum, l) => sum + (l.leadScore || 0), 0) / leads.length).toFixed(1)
                : 0;
        }
        
        // Messaging performance
        if (CoachStaffService.hasPermission(req, SECTIONS.MESSAGING.VIEW)) {
            const messages = await WhatsAppMessage.find({
                coachId,
                senderId: staffId,
                senderType: 'staff',
                timestamp: { $gte: startDate }
            });
            
            metrics.messagesSent = messages.length;
            metrics.averageMessagesPerDay = messages.length > 0
                ? (messages.length / Math.ceil((new Date() - startDate) / (1000 * 60 * 60 * 24))).toFixed(1)
                : 0;
        }
        
        // Appointment performance
        if (CoachStaffService.hasPermission(req, SECTIONS.CALENDAR.VIEW)) {
            const appointments = await Appointment.find({
                coachId,
                assignedStaffId: staffId,
                createdAt: { $gte: startDate }
            });
            
            metrics.appointmentsBooked = appointments.length;
            metrics.appointmentsCompleted = appointments.filter(a => a.status === 'completed').length;
            metrics.appointmentCompletionRate = appointments.length > 0
                ? ((metrics.appointmentsCompleted / appointments.length) * 100).toFixed(1)
                : 0;
        }
        
        return metrics;
    }
    
    /**
     * Get weekly trends
     */
    async getWeeklyTrends(coachId, staffId, req) {
        const thisWeek = new Date();
        thisWeek.setDate(thisWeek.getDate() - 7);
        const lastWeek = new Date();
        lastWeek.setDate(lastWeek.getDate() - 14);
        
        const trends = {};
        
        // Leads trend
        if (CoachStaffService.hasPermission(req, SECTIONS.LEADS.VIEW)) {
            const thisWeekLeads = await Lead.countDocuments({
                coachId,
                $or: [
                    { assignedTo: staffId },
                    { 'appointment.assignedStaffId': staffId }
                ],
                createdAt: { $gte: thisWeek }
            });
            
            const lastWeekLeads = await Lead.countDocuments({
                coachId,
                $or: [
                    { assignedTo: staffId },
                    { 'appointment.assignedStaffId': staffId }
                ],
                createdAt: { $gte: lastWeek, $lt: thisWeek }
            });
            
            trends.leads = {
                thisWeek: thisWeekLeads,
                lastWeek: lastWeekLeads,
                change: lastWeekLeads > 0 ? (((thisWeekLeads - lastWeekLeads) / lastWeekLeads) * 100).toFixed(1) : 0,
                trend: thisWeekLeads >= lastWeekLeads ? 'up' : 'down'
            };
        }
        
        // Messaging trend
        if (CoachStaffService.hasPermission(req, SECTIONS.MESSAGING.VIEW)) {
            const thisWeekMessages = await WhatsAppMessage.countDocuments({
                coachId,
                senderId: staffId,
                senderType: 'staff',
                timestamp: { $gte: thisWeek }
            });
            
            const lastWeekMessages = await WhatsAppMessage.countDocuments({
                coachId,
                senderId: staffId,
                senderType: 'staff',
                timestamp: { $gte: lastWeek, $lt: thisWeek }
            });
            
            trends.messaging = {
                thisWeek: thisWeekMessages,
                lastWeek: lastWeekMessages,
                change: lastWeekMessages > 0 ? (((thisWeekMessages - lastWeekMessages) / lastWeekMessages) * 100).toFixed(1) : 0,
                trend: thisWeekMessages >= lastWeekMessages ? 'up' : 'down'
            };
        }
        
        return trends;
    }
    
    /**
     * Get pending actions
     */
    async getPendingActions(coachId, staffId, req) {
        const pending = {
            total: 0,
            items: []
        };
        
        // Pending lead follow-ups
        if (CoachStaffService.hasPermission(req, SECTIONS.LEADS.VIEW)) {
            const leadsNeedingFollowup = await Lead.countDocuments({
                coachId,
                $or: [
                    { assignedTo: staffId },
                    { 'appointment.assignedStaffId': staffId }
                ],
                status: { $in: ['New', 'Contacted'] },
                lastContactedAt: { $lt: new Date(Date.now() - 24 * 60 * 60 * 1000) }
            });
            
            if (leadsNeedingFollowup > 0) {
                pending.items.push({
                    type: 'lead_followup',
                    count: leadsNeedingFollowup,
                    message: `${leadsNeedingFollowup} lead${leadsNeedingFollowup > 1 ? 's' : ''} need follow-up`,
                    priority: 'high'
                });
                pending.total += leadsNeedingFollowup;
            }
        }
        
        // Pending appointment confirmations
        if (CoachStaffService.hasPermission(req, SECTIONS.CALENDAR.VIEW)) {
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            tomorrow.setHours(23, 59, 59, 999);
            
            const upcomingAppointments = await Appointment.countDocuments({
                coachId,
                assignedStaffId: staffId,
                startTime: { $lte: tomorrow },
                status: 'scheduled'
            });
            
            if (upcomingAppointments > 0) {
                pending.items.push({
                    type: 'appointment_confirm',
                    count: upcomingAppointments,
                    message: `${upcomingAppointments} appointment${upcomingAppointments > 1 ? 's' : ''} need confirmation`,
                    priority: 'medium'
                });
                pending.total += upcomingAppointments;
            }
        }
        
        // Unresponded messages (if any)
        if (CoachStaffService.hasPermission(req, SECTIONS.MESSAGING.VIEW)) {
            // This would need a separate tracking mechanism
            // For now, showing placeholder
            pending.items.push({
                type: 'messages',
                count: 0,
                message: 'All messages responded',
                priority: 'low'
            });
        }
        
        return pending;
    }
    
    /**
     * Get quick stats
     */
    async getQuickStats(coachId, staffId, req) {
        const stats = [];
        
        // Today's stats
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        if (CoachStaffService.hasPermission(req, SECTIONS.LEADS.VIEW)) {
            const todayLeads = await Lead.countDocuments({
                coachId,
                $or: [
                    { assignedTo: staffId },
                    { 'appointment.assignedStaffId': staffId }
                ],
                createdAt: { $gte: today }
            });
            
            stats.push({
                label: 'New Leads Today',
                value: todayLeads,
                icon: 'user-plus',
                color: 'blue'
            });
        }
        
        if (CoachStaffService.hasPermission(req, SECTIONS.MESSAGING.VIEW)) {
            const todayMessages = await WhatsAppMessage.countDocuments({
                coachId,
                senderId: staffId,
                senderType: 'staff',
                timestamp: { $gte: today }
            });
            
            stats.push({
                label: 'Messages Sent Today',
                value: todayMessages,
                icon: 'message',
                color: 'green'
            });
        }
        
        if (CoachStaffService.hasPermission(req, SECTIONS.CALENDAR.VIEW)) {
            const todayAppointments = await Appointment.countDocuments({
                coachId,
                assignedStaffId: staffId,
                startTime: { $gte: today, $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000) }
            });
            
            stats.push({
                label: 'Appointments Today',
                value: todayAppointments,
                icon: 'calendar',
                color: 'purple'
            });
        }
        
        return stats;
    }
    
    /**
     * Get achievements
     */
    async getAchievements(coachId, staffId, req) {
        const achievements = [];
        
        if (CoachStaffService.hasPermission(req, SECTIONS.LEADS.VIEW)) {
            const totalLeads = await Lead.countDocuments({
                coachId,
                $or: [
                    { assignedTo: staffId },
                    { 'appointment.assignedStaffId': staffId }
                ]
            });
            
            const convertedLeads = await Lead.countDocuments({
                coachId,
                $or: [
                    { assignedTo: staffId },
                    { 'appointment.assignedStaffId': staffId }
                ],
                status: 'Converted'
            });
            
            // Lead milestones
            if (totalLeads >= 50) {
                achievements.push({
                    title: '50+ Leads Handled',
                    description: 'Successfully managed 50 or more leads',
                    icon: '🎯',
                    unlocked: true
                });
            }
            
            if (convertedLeads >= 10) {
                achievements.push({
                    title: '10 Conversions',
                    description: 'Converted 10 leads successfully',
                    icon: '🏆',
                    unlocked: true
                });
            }
            
            // Conversion rate achievement
            if (totalLeads > 0 && (convertedLeads / totalLeads) >= 0.3) {
                achievements.push({
                    title: 'High Converter',
                    description: '30%+ conversion rate',
                    icon: '⭐',
                    unlocked: true
                });
            }
        }
        
        if (CoachStaffService.hasPermission(req, SECTIONS.MESSAGING.VIEW)) {
            const totalMessages = await WhatsAppMessage.countDocuments({
                coachId,
                senderId: staffId,
                senderType: 'staff'
            });
            
            if (totalMessages >= 100) {
                achievements.push({
                    title: 'Communication Master',
                    description: 'Sent 100+ messages',
                    icon: '💬',
                    unlocked: true
                });
            }
        }
        
        return achievements;
    }
    
    /**
     * Get week summary
     */
    async getWeekSummary(coachId, staffId, req) {
        const weekStart = new Date();
        weekStart.setDate(weekStart.getDate() - 7);
        
        const summary = {
            period: 'Last 7 Days',
            highlights: []
        };
        
        if (CoachStaffService.hasPermission(req, SECTIONS.LEADS.VIEW)) {
            const weekLeads = await Lead.countDocuments({
                coachId,
                $or: [
                    { assignedTo: staffId },
                    { 'appointment.assignedStaffId': staffId }
                ],
                createdAt: { $gte: weekStart }
            });
            
            const weekConverted = await Lead.countDocuments({
                coachId,
                $or: [
                    { assignedTo: staffId },
                    { 'appointment.assignedStaffId': staffId }
                ],
                status: 'Converted',
                updatedAt: { $gte: weekStart }
            });
            
            summary.highlights.push(`Managed ${weekLeads} new leads`);
            if (weekConverted > 0) {
                summary.highlights.push(`Converted ${weekConverted} leads`);
            }
        }
        
        if (CoachStaffService.hasPermission(req, SECTIONS.MESSAGING.VIEW)) {
            const weekMessages = await WhatsAppMessage.countDocuments({
                coachId,
                senderId: staffId,
                senderType: 'staff',
                timestamp: { $gte: weekStart }
            });
            
            if (weekMessages > 0) {
                summary.highlights.push(`Sent ${weekMessages} messages`);
            }
        }
        
        if (CoachStaffService.hasPermission(req, SECTIONS.CALENDAR.VIEW)) {
            const weekAppointments = await Appointment.countDocuments({
                coachId,
                assignedStaffId: staffId,
                createdAt: { $gte: weekStart }
            });
            
            if (weekAppointments > 0) {
                summary.highlights.push(`Scheduled ${weekAppointments} appointments`);
            }
        }
        
        return summary;
    }
    
    /**
     * Calculate staff performance score (0-100)
     * This score is visible to both staff and coach
     */
    async calculatePerformanceScore(coachId, staffId, req) {
        let totalScore = 0;
        let maxScore = 0;
        const breakdown = {};
        
        // LEADS PERFORMANCE (40 points max)
        if (CoachStaffService.hasPermission(req, SECTIONS.LEADS.VIEW)) {
            const allMyLeads = await Lead.find({
                coachId,
                $or: [
                    { assignedTo: staffId },
                    { 'appointment.assignedStaffId': staffId }
                ]
            });
            
            const convertedLeads = allMyLeads.filter(l => l.status === 'Converted').length;
            const conversionRate = allMyLeads.length > 0 ? (convertedLeads / allMyLeads.length) : 0;
            
            // Conversion rate scoring (0-25 points)
            const conversionScore = conversionRate * 25;
            totalScore += conversionScore;
            maxScore += 25;
            breakdown.conversionRate = {
                score: conversionScore.toFixed(1),
                max: 25,
                rate: (conversionRate * 100).toFixed(1) + '%'
            };
            
            // Lead engagement (0-15 points)
            const avgLeadScore = allMyLeads.length > 0
                ? allMyLeads.reduce((sum, l) => sum + (l.leadScore || 0), 0) / allMyLeads.length
                : 0;
            const engagementScore = (avgLeadScore / 100) * 15;
            totalScore += engagementScore;
            maxScore += 15;
            breakdown.leadEngagement = {
                score: engagementScore.toFixed(1),
                max: 15,
                avgScore: avgLeadScore.toFixed(1)
            };
        }
        
        // MESSAGING PERFORMANCE (30 points max)
        if (CoachStaffService.hasPermission(req, SECTIONS.MESSAGING.VIEW)) {
            const last30Days = new Date();
            last30Days.setDate(last30Days.getDate() - 30);
            
            const messages = await WhatsAppMessage.countDocuments({
                coachId,
                senderId: staffId,
                senderType: 'staff',
                timestamp: { $gte: last30Days }
            });
            
            // Message volume (0-20 points) - 1 point per 5 messages, max 100 messages
            const messageScore = Math.min((messages / 5), 20);
            totalScore += messageScore;
            maxScore += 20;
            breakdown.messagingActivity = {
                score: messageScore.toFixed(1),
                max: 20,
                messages: messages
            };
            
            // Response consistency (0-10 points) - daily activity
            const activeDays = await WhatsAppMessage.distinct('timestamp', {
                coachId,
                senderId: staffId,
                senderType: 'staff',
                timestamp: { $gte: last30Days }
            });
            const consistencyScore = Math.min((activeDays.length / 30) * 10, 10);
            totalScore += consistencyScore;
            maxScore += 10;
            breakdown.consistency = {
                score: consistencyScore.toFixed(1),
                max: 10,
                activeDays: activeDays.length
            };
        }
        
        // APPOINTMENT PERFORMANCE (30 points max)
        if (CoachStaffService.hasPermission(req, SECTIONS.CALENDAR.VIEW)) {
            const appointments = await Appointment.find({
                coachId,
                assignedStaffId: staffId
            });
            
            const completed = appointments.filter(a => a.status === 'completed').length;
            const noShows = appointments.filter(a => a.status === 'no-show').length;
            
            // Completion rate (0-20 points)
            const completionRate = appointments.length > 0 ? (completed / appointments.length) : 0;
            const completionScore = completionRate * 20;
            totalScore += completionScore;
            maxScore += 20;
            breakdown.appointmentCompletion = {
                score: completionScore.toFixed(1),
                max: 20,
                rate: (completionRate * 100).toFixed(1) + '%'
            };
            
            // Low no-show rate (0-10 points) - inverse scoring
            const noShowRate = appointments.length > 0 ? (noShows / appointments.length) : 0;
            const noShowScore = Math.max(10 - (noShowRate * 10), 0);
            totalScore += noShowScore;
            maxScore += 10;
            breakdown.lowNoShowRate = {
                score: noShowScore.toFixed(1),
                max: 10,
                rate: (noShowRate * 100).toFixed(1) + '%'
            };
        }
        
        // Calculate final percentage
        const finalScore = maxScore > 0 ? ((totalScore / maxScore) * 100) : 0;
        
        return {
            overallScore: finalScore.toFixed(1),
            scoreOutOf100: finalScore.toFixed(0),
            rating: this.getPerformanceRating(finalScore),
            breakdown: breakdown,
            lastCalculated: new Date()
        };
    }
    
    /**
     * Get performance rating based on score
     */
    getPerformanceRating(score) {
        if (score >= 90) return { label: 'Exceptional', icon: '🌟', color: 'gold' };
        if (score >= 80) return { label: 'Excellent', icon: '⭐', color: 'green' };
        if (score >= 70) return { label: 'Good', icon: '👍', color: 'blue' };
        if (score >= 60) return { label: 'Average', icon: '📊', color: 'orange' };
        return { label: 'Needs Improvement', icon: '📈', color: 'red' };
    }
    
    /**
     * Get team performance (compare with colleagues)
     */
    async getTeamPerformance(coachId, staffId, req) {
        // Get all staff members under this coach
        const allStaff = await Staff.find({ 
            coachId,
            isActive: true 
        }).select('name email _id');
        
        const teamStats = [];
        
        // Calculate performance for each staff member
        for (const staff of allStaff) {
            const stats = {
                staffId: staff._id.toString(),
                staffName: staff.name,
                isCurrentUser: staff._id.toString() === staffId.toString()
            };
            
            // Get lead stats
            if (CoachStaffService.hasPermission(req, SECTIONS.LEADS.VIEW)) {
                const staffLeads = await Lead.find({
                    coachId,
                    $or: [
                        { assignedTo: staff._id },
                        { 'appointment.assignedStaffId': staff._id }
                    ]
                });
                
                stats.leadsAssigned = staffLeads.length;
                stats.leadsConverted = staffLeads.filter(l => l.status === 'Converted').length;
                stats.conversionRate = staffLeads.length > 0 
                    ? ((stats.leadsConverted / staffLeads.length) * 100).toFixed(1)
                    : 0;
            }
            
            // Get messaging stats
            if (CoachStaffService.hasPermission(req, SECTIONS.MESSAGING.VIEW)) {
                const staffMessages = await WhatsAppMessage.countDocuments({
                    coachId,
                    senderId: staff._id,
                    senderType: 'staff'
                });
                
                stats.messagesSent = staffMessages;
            }
            
            // Get appointment stats
            if (CoachStaffService.hasPermission(req, SECTIONS.CALENDAR.VIEW)) {
                const staffAppointments = await Appointment.countDocuments({
                    coachId,
                    assignedStaffId: staff._id
                });
                
                stats.appointmentsBooked = staffAppointments;
            }
            
            // Calculate simple performance score for sorting
            stats.performanceScore = this.calculateSimpleScore(stats);
            
            teamStats.push(stats);
        }
        
        // Sort by performance score
        teamStats.sort((a, b) => b.performanceScore - a.performanceScore);
        
        // Add rank
        teamStats.forEach((staff, index) => {
            staff.rank = index + 1;
        });
        
        // Find current user's rank
        const myStats = teamStats.find(s => s.isCurrentUser);

        return {
            totalTeamMembers: allStaff.length,
            myRank: myStats?.rank || 0,
            teamLeaderboard: teamStats,
            topPerformer: teamStats[0],
            teamAverage: {
                conversionRate: teamStats.reduce((sum, s) => sum + parseFloat(s.conversionRate || 0), 0) / teamStats.length,
                leadsPerStaff: teamStats.reduce((sum, s) => sum + (s.leadsAssigned || 0), 0) / teamStats.length,
                messagesPerStaff: teamStats.reduce((sum, s) => sum + (s.messagesSent || 0), 0) / teamStats.length
            }
        };
    }
    
    /**
     * Calculate simple performance score for team comparison
     */
    calculateSimpleScore(stats) {
        let score = 0;
        
        // Conversion rate (0-50 points)
        if (stats.conversionRate) {
            score += parseFloat(stats.conversionRate) * 0.5;
        }
        
        // Lead volume (0-30 points) - 1 point per 2 leads, max 60 leads
        if (stats.leadsAssigned) {
            score += Math.min((stats.leadsAssigned / 2), 30);
        }
        
        // Activity (0-20 points) - messaging
        if (stats.messagesSent) {
            score += Math.min((stats.messagesSent / 10), 20);
        }
        
        return score;
    }
    
    /**
     * Get my tasks (assigned to staff)
     */
    async getMyTasks(coachId, staffId, req) {
        // Check if Task model exists and get tasks
        try {
            const allTasks = await Task.find({
                coachId,
                assignedTo: staffId
            }).sort({ dueDate: 1, priority: -1 });
            
            const pendingTasks = allTasks.filter(t => t.status !== 'Completed' && t.status !== 'Cancelled');
            const completedTasks = allTasks.filter(t => t.status === 'Completed');
            
            // Overdue tasks
            const overdueTasks = pendingTasks.filter(t => 
                t.dueDate && new Date(t.dueDate) < new Date()
            );
            
            // Today's tasks
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const todayEnd = new Date();
            todayEnd.setHours(23, 59, 59, 999);
            
            const todayTasks = pendingTasks.filter(t => 
                t.dueDate && 
                new Date(t.dueDate) >= today && 
                new Date(t.dueDate) <= todayEnd
            );
            
            // This week's tasks
            const weekEnd = new Date();
            weekEnd.setDate(weekEnd.getDate() + 7);
            
            const weekTasks = pendingTasks.filter(t => 
                t.dueDate && 
                new Date(t.dueDate) > todayEnd && 
                new Date(t.dueDate) <= weekEnd
            );
            
            return {
                total: allTasks.length,
                pending: pendingTasks.length,
                completed: completedTasks.length,
                overdue: overdueTasks.length,
                todayTasks: todayTasks,
                weekTasks: weekTasks,
                recentTasks: pendingTasks.slice(0, 10),
                completionRate: allTasks.length > 0 
                    ? ((completedTasks.length / allTasks.length) * 100).toFixed(1)
                    : 0,
                tasksByPriority: {
                    high: pendingTasks.filter(t => t.priority === 'high').length,
                    medium: pendingTasks.filter(t => t.priority === 'medium').length,
                    low: pendingTasks.filter(t => t.priority === 'low').length
                },
                tasksByStatus: {
                    pending: pendingTasks.filter(t => t.status === 'Pending').length,
                    inProgress: pendingTasks.filter(t => t.status === 'In Progress').length,
                    completed: completedTasks.length
                }
            };
        } catch (error) {
            console.log('Task model may not exist:', error.message);
            return {
                total: 0,
                pending: 0,
                completed: 0,
                message: 'Task tracking not available'
            };
        }
    }
}

module.exports = new StaffDashboardService();
