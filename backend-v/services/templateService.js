const Lead = require('../schema/Lead');

/**
 * Template Service for handling template parameters and data extraction
 */
class TemplateService {
    
    /**
     * Get available template parameters from database schemas
     */
    getAvailableParameters() {
        return [
            // Lead basic information
            {
                category: 'Lead Information',
                parameters: [
                    {
                        name: 'lead.name',
                        description: 'Lead\'s full name',
                        example: 'John Doe',
                        field: 'name',
                        type: 'string'
                    },
                    {
                        name: 'lead.email',
                        description: 'Lead\'s email address',
                        example: 'john@example.com',
                        field: 'email',
                        type: 'string'
                    },
                    {
                        name: 'lead.phone',
                        description: 'Lead\'s phone number',
                        example: '+1234567890',
                        field: 'phone',
                        type: 'string'
                    },
                    {
                        name: 'lead.country',
                        description: 'Lead\'s country',
                        example: 'United States',
                        field: 'country',
                        type: 'string'
                    },
                    {
                        name: 'lead.city',
                        description: 'Lead\'s city',
                        example: 'New York',
                        field: 'city',
                        type: 'string'
                    },
                    {
                        name: 'lead.status',
                        description: 'Lead\'s current status',
                        example: 'New',
                        field: 'status',
                        type: 'string'
                    },
                    {
                        name: 'lead.temperature',
                        description: 'Lead\'s temperature (Cold, Warm, Hot)',
                        example: 'Warm',
                        field: 'leadTemperature',
                        type: 'string'
                    },
                    {
                        name: 'lead.source',
                        description: 'Lead\'s source',
                        example: 'Web Form',
                        field: 'source',
                        type: 'string'
                    }
                ]
            },
            
            // Client questions
            {
                category: 'Client Information',
                parameters: [
                    {
                        name: 'client.age',
                        description: 'Client\'s age',
                        example: '25',
                        field: 'clientQuestions.age',
                        type: 'number'
                    },
                    {
                        name: 'client.gender',
                        description: 'Client\'s gender',
                        example: 'Male',
                        field: 'clientQuestions.gender',
                        type: 'string'
                    },
                    {
                        name: 'client.goal',
                        description: 'Client\'s fitness goal',
                        example: 'Weight Loss',
                        field: 'clientQuestions.goal',
                        type: 'string'
                    },
                    {
                        name: 'client.experience',
                        description: 'Client\'s fitness experience',
                        example: 'Beginner',
                        field: 'clientQuestions.experience',
                        type: 'string'
                    },
                    {
                        name: 'client.budget',
                        description: 'Client\'s budget range',
                        example: '$100-200/month',
                        field: 'clientQuestions.budget',
                        type: 'string'
                    },
                    {
                        name: 'client.timeline',
                        description: 'Client\'s timeline to achieve goal',
                        example: '3-6 months',
                        field: 'clientQuestions.timeline',
                        type: 'string'
                    },
                    {
                        name: 'client.availability',
                        description: 'Client\'s availability',
                        example: 'Evenings',
                        field: 'clientQuestions.availability',
                        type: 'string'
                    },
                    {
                        name: 'client.preferences',
                        description: 'Client\'s preferences',
                        example: 'Online training',
                        field: 'clientQuestions.preferences',
                        type: 'string'
                    },
                    {
                        name: 'client.medical',
                        description: 'Client\'s medical conditions',
                        example: 'None',
                        field: 'clientQuestions.medicalConditions',
                        type: 'string'
                    },
                    {
                        name: 'client.supplements',
                        description: 'Client\'s supplement usage',
                        example: 'Protein powder',
                        field: 'clientQuestions.supplements',
                        type: 'string'
                    },
                    {
                        name: 'client.obstacle',
                        description: 'Client\'s biggest obstacle',
                        example: 'Time constraints',
                        field: 'clientQuestions.biggestObstacle',
                        type: 'string'
                    },
                    {
                        name: 'client.seriousness',
                        description: 'Client\'s seriousness scale (1-10)',
                        example: '8',
                        field: 'clientQuestions.seriousnessScale',
                        type: 'number'
                    },
                    {
                        name: 'client.motivation',
                        description: 'Client\'s motivation',
                        example: 'Health improvement',
                        field: 'clientQuestions.motivation',
                        type: 'string'
                    }
                ]
            },
            
            // Coach questions
            {
                category: 'Coach Information',
                parameters: [
                    {
                        name: 'coach.fullName',
                        description: 'Coach\'s full name',
                        example: 'Jane Smith',
                        field: 'coachQuestions.fullName',
                        type: 'string'
                    },
                    {
                        name: 'coach.email',
                        description: 'Coach\'s email',
                        example: 'jane@example.com',
                        field: 'coachQuestions.email',
                        type: 'string'
                    },
                    {
                        name: 'coach.whatsapp',
                        description: 'Coach\'s WhatsApp number',
                        example: '+1234567890',
                        field: 'coachQuestions.whatsappNumber',
                        type: 'string'
                    },
                    {
                        name: 'coach.instagram',
                        description: 'Coach\'s Instagram username',
                        example: '@janesmith',
                        field: 'coachQuestions.instagramUsername',
                        type: 'string'
                    },
                    {
                        name: 'coach.profession',
                        description: 'Coach\'s current profession',
                        example: 'Fitness Trainer',
                        field: 'coachQuestions.currentProfession',
                        type: 'string'
                    },
                    {
                        name: 'coach.incomeGoal',
                        description: 'Coach\'s income goal',
                        example: '$50,000-100,000/month',
                        field: 'coachQuestions.incomeGoal',
                        type: 'string'
                    },
                    {
                        name: 'coach.investment',
                        description: 'Coach\'s investment capacity',
                        example: '$100,000-200,000',
                        field: 'coachQuestions.investmentCapacity',
                        type: 'string'
                    },
                    {
                        name: 'coach.timeAvailability',
                        description: 'Coach\'s time availability',
                        example: '4-6 hours/day',
                        field: 'coachQuestions.timeAvailability',
                        type: 'string'
                    },
                    {
                        name: 'coach.timeline',
                        description: 'Coach\'s timeline to achieve goal',
                        example: '3-6 months',
                        field: 'coachQuestions.timelineToAchieveGoal',
                        type: 'string'
                    },
                    {
                        name: 'coach.description',
                        description: 'Coach\'s description',
                        example: 'Full-time job',
                        field: 'coachQuestions.description',
                        type: 'string'
                    },
                    {
                        name: 'coach.readiness',
                        description: 'Coach\'s readiness level',
                        example: '100% ready',
                        field: 'coachQuestions.readiness',
                        type: 'string'
                    },
                    {
                        name: 'coach.commitment',
                        description: 'Coach\'s commitment level',
                        example: 'Yes, fully committed',
                        field: 'coachQuestions.commitment',
                        type: 'string'
                    },
                    {
                        name: 'coach.timeCommitment',
                        description: 'Coach\'s time commitment',
                        example: '3-4 hours/day',
                        field: 'coachQuestions.timeCommitment',
                        type: 'string'
                    }
                ]
            },
            
            // System information
            {
                category: 'System Information',
                parameters: [
                    {
                        name: 'system.date',
                        description: 'Current date',
                        example: '2024-01-15',
                        field: 'system',
                        type: 'date'
                    },
                    {
                        name: 'system.time',
                        description: 'Current time',
                        example: '14:30',
                        field: 'system',
                        type: 'time'
                    },
                    {
                        name: 'system.datetime',
                        description: 'Current date and time',
                        example: '2024-01-15 14:30:00',
                        field: 'system',
                        type: 'datetime'
                    },
                    {
                        name: 'system.company',
                        description: 'Company name',
                        example: 'FunnelsEye',
                        field: 'system',
                        type: 'string'
                    },
                    {
                        name: 'system.website',
                        description: 'Company website',
                        example: 'https://funnelseye.com',
                        field: 'system',
                        type: 'string'
                    }
                ]
            }
        ];
    }
    
    /**
     * Extract lead data for template parameters
     */
    extractLeadData(lead) {
        const data = {};
        
        // Basic lead information
        if (lead.name) data['lead.name'] = lead.name;
        if (lead.email) data['lead.email'] = lead.email;
        if (lead.phone) data['lead.phone'] = lead.phone;
        if (lead.country) data['lead.country'] = lead.country;
        if (lead.city) data['lead.city'] = lead.city;
        if (lead.status) data['lead.status'] = lead.status;
        if (lead.leadTemperature) data['lead.temperature'] = lead.leadTemperature;
        if (lead.source) data['lead.source'] = lead.source;
        
        // Client questions
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
            if (client.medicalConditions) data['client.medical'] = client.medicalConditions;
            if (client.supplements) data['client.supplements'] = client.supplements;
            if (client.biggestObstacle) data['client.obstacle'] = client.biggestObstacle;
            if (client.seriousnessScale) data['client.seriousness'] = client.seriousnessScale;
            if (client.motivation) data['client.motivation'] = client.motivation;
        }
        
        // Coach questions
        if (lead.coachQuestions) {
            const coach = lead.coachQuestions;
            if (coach.fullName) data['coach.fullName'] = coach.fullName;
            if (coach.email) data['coach.email'] = coach.email;
            if (coach.whatsappNumber) data['coach.whatsapp'] = coach.whatsappNumber;
            if (coach.instagramUsername) data['coach.instagram'] = coach.instagramUsername;
            if (coach.currentProfession) data['coach.profession'] = coach.currentProfession;
            if (coach.incomeGoal) data['coach.incomeGoal'] = coach.incomeGoal;
            if (coach.investmentCapacity) data['coach.investment'] = coach.investmentCapacity;
            if (coach.timeAvailability) data['coach.timeAvailability'] = coach.timeAvailability;
            if (coach.timelineToAchieveGoal) data['coach.timeline'] = coach.timelineToAchieveGoal;
            if (coach.description) data['coach.description'] = coach.description;
            if (coach.readiness) data['coach.readiness'] = coach.readiness;
            if (coach.commitment) data['coach.commitment'] = coach.commitment;
            if (coach.timeCommitment) data['coach.timeCommitment'] = coach.timeCommitment;
        }
        
        // System information
        const now = new Date();
        data['system.date'] = now.toISOString().split('T')[0];
        data['system.time'] = now.toTimeString().split(' ')[0];
        data['system.datetime'] = now.toISOString();
        data['system.company'] = 'FunnelsEye';
        data['system.website'] = 'https://funnelseye.com';
        
        return data;
    }
    
    /**
     * Get sample data for template preview
     */
    getSampleData() {
        return {
            // Lead basic information
            'lead.name': 'John Doe',
            'lead.email': 'john.doe@example.com',
            'lead.phone': '+1234567890',
            'lead.country': 'United States',
            'lead.city': 'New York',
            'lead.status': 'New',
            'lead.temperature': 'Warm',
            'lead.source': 'Web Form',
            
            // Client information
            'client.age': '28',
            'client.gender': 'Male',
            'client.goal': 'Weight Loss',
            'client.experience': 'Beginner',
            'client.budget': '$100-200/month',
            'client.timeline': '3-6 months',
            'client.availability': 'Evenings',
            'client.preferences': 'Online training',
            'client.medical': 'None',
            'client.supplements': 'Protein powder',
            'client.obstacle': 'Time constraints',
            'client.seriousness': '8',
            'client.motivation': 'Health improvement',
            
            // Coach information
            'coach.fullName': 'Jane Smith',
            'coach.email': 'jane.smith@example.com',
            'coach.whatsapp': '+1987654321',
            'coach.instagram': '@janesmith',
            'coach.profession': 'Fitness Trainer',
            'coach.incomeGoal': '$50,000-100,000/month',
            'coach.investment': '$100,000-200,000',
            'coach.timeAvailability': '4-6 hours/day',
            'coach.timeline': '3-6 months',
            'coach.description': 'Full-time job',
            'coach.readiness': '100% ready',
            'coach.commitment': 'Yes, fully committed',
            'coach.timeCommitment': '3-4 hours/day',
            
            // System information
            'system.date': new Date().toISOString().split('T')[0],
            'system.time': new Date().toTimeString().split(' ')[0],
            'system.datetime': new Date().toISOString(),
            'system.company': 'FunnelsEye',
            'system.website': 'https://funnelseye.com'
        };
    }
    
    /**
     * Validate template parameters
     */
    validateTemplateParameters(template, parameters) {
        const errors = [];
        const warnings = [];
        
        // Check for required parameters
        if (template.availableVariables) {
            template.availableVariables.forEach(variable => {
                if (variable.required && !parameters[variable.name]) {
                    errors.push(`Required parameter '${variable.name}' is missing`);
                }
            });
        }
        
        // Check for unused parameters
        Object.keys(parameters).forEach(param => {
            if (template.availableVariables && 
                !template.availableVariables.find(v => v.name === param)) {
                warnings.push(`Parameter '${param}' is not defined in template`);
            }
        });
        
        return {
            isValid: errors.length === 0,
            errors,
            warnings
        };
    }
    
    /**
     * Render template with parameters
     */
    renderTemplate(template, parameters = {}) {
        let content = { ...template.content };
        
        // Replace parameters in body
        if (content.body) {
            content.body = this.replaceParameters(content.body, parameters);
        }
        
        // Replace parameters in subject (for emails)
        if (content.subject) {
            content.subject = this.replaceParameters(content.subject, parameters);
        }
        
        // Replace parameters in WhatsApp options
        if (content.whatsappOptions) {
            if (content.whatsappOptions.quickReplies) {
                content.whatsappOptions.quickReplies = content.whatsappOptions.quickReplies.map(
                    reply => this.replaceParameters(reply, parameters)
                );
            }
            
            if (content.whatsappOptions.buttons) {
                content.whatsappOptions.buttons = content.whatsappOptions.buttons.map(button => ({
                    ...button,
                    text: this.replaceParameters(button.text, parameters),
                    url: button.url ? this.replaceParameters(button.url, parameters) : undefined
                }));
            }
        }
        
        return content;
    }
    
    /**
     * Replace parameters in text
     */
    replaceParameters(text, parameters) {
        let result = text;
        
        // Replace {{parameter}} placeholders
        Object.keys(parameters).forEach(key => {
            const placeholder = new RegExp(`{{${key}}}`, 'gi');
            result = result.replace(placeholder, parameters[key] || '');
        });
        
        return result;
    }
}

module.exports = new TemplateService();
