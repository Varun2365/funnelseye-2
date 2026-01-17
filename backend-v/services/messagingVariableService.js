const { Lead, Coach } = require('../schema');
const mongoose = require('mongoose');
const Appointment = require('../schema/Appointment');

// Get models dynamically if they exist
const User = mongoose.models.User || require('../schema/User');
let Client = null;
try {
    Client = mongoose.models.Client || require('../schema/Client');
} catch (e) {
    // Client schema might not exist, will handle gracefully
    Client = null;
}

/**
 * Messaging Variable Service
 * Provides all available variables for message templates
 */
class MessagingVariableService {
    
    /**
     * Get all available variable categories and their descriptions
     */
    getAvailableVariables() {
        return {
            lead: {
                name: { label: 'Lead Name', description: 'Full name of the lead' },
                firstName: { label: 'First Name', description: 'First name of the lead' },
                lastName: { label: 'Last Name', description: 'Last name of the lead' },
                email: { label: 'Email', description: 'Email address of the lead' },
                phone: { label: 'Phone', description: 'Phone number of the lead' },
                country: { label: 'Country', description: 'Country of the lead' },
                city: { label: 'City', description: 'City of the lead' },
                status: { label: 'Status', description: 'Current status of the lead' },
                temperature: { label: 'Temperature', description: 'Lead temperature (Hot/Warm/Cold)' },
                source: { label: 'Source', description: 'Lead source' },
                company: { label: 'Company', description: 'Company name' },
                createdAt: { label: 'Created Date', description: 'Date when lead was created' }
            },
            client: {
                name: { label: 'Client Name', description: 'Full name of the client' },
                email: { label: 'Email', description: 'Email address of the client' },
                phone: { label: 'Phone', description: 'Phone number of the client' },
                age: { label: 'Age', description: 'Age of the client' },
                gender: { label: 'Gender', description: 'Gender of the client' },
                goal: { label: 'Goal', description: 'Fitness goal of the client' },
                experience: { label: 'Experience', description: 'Fitness experience level' },
                budget: { label: 'Budget', description: 'Budget range of the client' },
                timeline: { label: 'Timeline', description: 'Timeline to achieve goal' },
                availability: { label: 'Availability', description: 'Available time slots' },
                preferences: { label: 'Preferences', description: 'Preferred training style' }
            },
            coach: {
                name: { label: 'Coach Name', description: 'Full name of the coach' },
                firstName: { label: 'First Name', description: 'First name of the coach' },
                lastName: { label: 'Last Name', description: 'Last name of the coach' },
                email: { label: 'Email', description: 'Email address of the coach' },
                phone: { label: 'Phone', description: 'Phone number of the coach' },
                company: { label: 'Company', description: 'Company name of the coach' },
                whatsapp: { label: 'WhatsApp', description: 'WhatsApp number of the coach' },
                instagram: { label: 'Instagram', description: 'Instagram handle of the coach' }
            },
            system: {
                currentDate: { label: 'Current Date', description: 'Today\'s date' },
                currentTime: { label: 'Current Time', description: 'Current time' },
                currentDateTime: { label: 'Date & Time', description: 'Current date and time' },
                platformName: { label: 'Platform Name', description: 'Platform name (FunnelsEye)' },
                platformWebsite: { label: 'Platform Website', description: 'Platform website URL' }
            },
            appointment: {
                date: { label: 'Appointment Date', description: 'Date of the appointment' },
                time: { label: 'Appointment Time', description: 'Time of the appointment' },
                dateTime: { label: 'Appointment Date & Time', description: 'Full date and time of appointment' },
                duration: { label: 'Appointment Duration', description: 'Duration in minutes' },
                status: { label: 'Appointment Status', description: 'Status (confirmed, cancelled, etc.)' },
                type: { label: 'Appointment Type', description: 'Type of appointment' },
                location: { label: 'Location', description: 'Appointment location' },
                zoomLink: { label: 'Zoom Link', description: 'Zoom meeting link' },
                notes: { label: 'Appointment Notes', description: 'Notes for the appointment' },
                coachName: { label: 'Coach Name', description: 'Name of the coach conducting appointment' },
                staffName: { label: 'Staff Name', description: 'Name of the staff conducting appointment' }
            }
        };
    }

    /**
     * Extract actual data from a lead for template rendering
     */
    async extractLeadData(leadId) {
        const lead = await Lead.findById(leadId);
        if (!lead) return {};

        const data = {};
        
        // Basic lead information
        if (lead.name) data['lead.name'] = lead.name;
        if (lead.firstName) data['lead.firstName'] = lead.firstName;
        if (lead.lastName) data['lead.lastName'] = lead.lastName;
        if (lead.email) data['lead.email'] = lead.email;
        if (lead.phone) data['lead.phone'] = lead.phone;
        if (lead.country) data['lead.country'] = lead.country;
        if (lead.city) data['lead.city'] = lead.city;
        if (lead.status) data['lead.status'] = lead.status;
        if (lead.leadTemperature) data['lead.temperature'] = lead.leadTemperature;
        if (lead.source) data['lead.source'] = lead.source;
        if (lead.company) data['lead.company'] = lead.company;
        if (lead.createdAt) data['lead.createdAt'] = lead.createdAt.toLocaleDateString();

        // Client questions if available
        if (lead.clientQuestions) {
            const client = lead.clientQuestions;
            if (client.age) data['client.age'] = client.age;
            if (client.gender) data['client.gender'] = client.gender;
            if (client.goal) data['client.goal'] = client.goal;
            if (client.experience) data['client.experience'] = client.experience;
            if (client.budget) data['client.budget'] = client.budget;
            if (client.timeline) data['client.timeline'] = client.timeline;
            if (client.availability) data['client.availability'] = client.availability;
            if (client.preferences) data['client.preferences'] = client.preferences;
        }

        return data;
    }

    /**
     * Extract actual data from a client
     */
    async extractClientData(clientId) {
        if (!Client || !clientId) return {};
        
        try {
            const client = await Client.findById(clientId);
            if (!client) return {};

            const data = {};
            
            if (client.name) data['client.name'] = client.name;
            if (client.email) data['client.email'] = client.email;
            if (client.phone) data['client.phone'] = client.phone;
            if (client.age) data['client.age'] = client.age;
            if (client.gender) data['client.gender'] = client.gender;
            if (client.goal) data['client.goal'] = client.goal;
            if (client.experience) data['client.experience'] = client.experience;
            if (client.budget) data['client.budget'] = client.budget;
            if (client.timeline) data['client.timeline'] = client.timeline;
            if (client.availability) data['client.availability'] = client.availability;
            if (client.preferences) data['client.preferences'] = client.preferences;

            return data;
        } catch (error) {
            console.warn('Client data extraction failed:', error.message);
            return {};
        }
    }

    /**
     * Extract actual data from a coach
     */
    async extractCoachData(coachId) {
        const coach = await Coach.findOne({ selfCoachId: coachId });
        if (!coach) return {};

        const data = {};
        
        if (coach.firstName) data['coach.firstName'] = coach.firstName;
        if (coach.lastName) data['coach.lastName'] = coach.lastName;
        data['coach.name'] = `${coach.firstName || ''} ${coach.lastName || ''}`.trim();
        if (coach.email) data['coach.email'] = coach.email;
        if (coach.phone) data['coach.phone'] = coach.phone;
        if (coach.company) data['coach.company'] = coach.company;
        if (coach.whatsappNumber) data['coach.whatsapp'] = coach.whatsappNumber;
        if (coach.instagramUsername) data['coach.instagram'] = coach.instagramUsername;

        return data;
    }

    /**
     * Get system variables
     */
    getSystemVariables() {
        const now = new Date();
        return {
            'system.currentDate': now.toLocaleDateString(),
            'system.currentTime': now.toLocaleTimeString(),
            'system.currentDateTime': now.toLocaleString(),
            'system.platformName': 'FunnelsEye',
            'system.platformWebsite': 'https://funnelseye.com'
        };
    }

    /**
     * Extract appointment data for template rendering
     */
    async extractAppointmentData(appointmentId) {
        if (!appointmentId) return {};
        
        try {
            const appointment = await Appointment.findById(appointmentId)
                .populate('coachId', 'firstName lastName email phone')
                .populate('assignedStaffId', 'firstName lastName email');
            
            if (!appointment) return {};

            const data = {};
            
            if (appointment.startTime) {
                const date = new Date(appointment.startTime);
                data['appointment.date'] = date.toLocaleDateString();
                data['appointment.time'] = date.toLocaleTimeString();
                data['appointment.dateTime'] = date.toLocaleString();
            }
            
            if (appointment.duration) data['appointment.duration'] = `${appointment.duration} minutes`;
            if (appointment.status) data['appointment.status'] = appointment.status;
            if (appointment.appointmentType) data['appointment.type'] = appointment.appointmentType;
            if (appointment.summary) data['appointment.notes'] = appointment.summary;
            if (appointment.notes) data['appointment.notes'] = appointment.notes;
            
            if (appointment.zoomMeeting) {
                if (appointment.zoomMeeting.joinUrl) data['appointment.zoomLink'] = appointment.zoomMeeting.joinUrl;
            }
            
            // Coach name
            if (appointment.coachId) {
                const coach = appointment.coachId;
                const coachName = coach.firstName ? `${coach.firstName} ${coach.lastName || ''}`.trim() : 'Coach';
                data['appointment.coachName'] = coachName;
            }
            
            // Staff name
            if (appointment.assignedStaffId) {
                const staff = appointment.assignedStaffId;
                const staffName = staff.firstName ? `${staff.firstName} ${staff.lastName || ''}`.trim() : 'Staff';
                data['appointment.staffName'] = staffName;
            }

            return data;
        } catch (error) {
            console.warn('Appointment data extraction failed:', error.message);
            return {};
        }
    }

    /**
     * Extract all relevant data for template rendering
     * @param {String} leadId - Lead ID
     * @param {String} clientId - Client ID (optional)
     * @param {String} coachId - Coach ID
     * @param {String} appointmentId - Appointment ID (optional)
     */
    async extractTemplateData({ leadId, clientId, coachId, appointmentId }) {
        const templateData = {};

        // Get system variables
        Object.assign(templateData, this.getSystemVariables());

        // Get coach data
        if (coachId) {
            const coachData = await this.extractCoachData(coachId);
            Object.assign(templateData, coachData);
        }

        // Get lead data
        if (leadId) {
            const leadData = await this.extractLeadData(leadId);
            Object.assign(templateData, leadData);
        }

        // Get client data
        if (clientId) {
            const clientData = await this.extractClientData(clientId);
            Object.assign(templateData, clientData);
        }

        // Get appointment data
        if (appointmentId) {
            const appointmentData = await this.extractAppointmentData(appointmentId);
            Object.assign(templateData, appointmentData);
        }

        return templateData;
    }

    /**
     * Replace variables in text with actual values
     * @param {String} text - Text with variables like {{lead.name}}
     * @param {Object} data - Data object with values
     */
    replaceVariables(text, data) {
        let result = text;
        
        // Replace {{variable}} placeholders
        for (const [key, value] of Object.entries(data)) {
            const placeholder = new RegExp(`{{${key}}}`, 'gi');
            result = result.replace(placeholder, value || '');
        }
        
        return result;
    }
}

module.exports = new MessagingVariableService();

