// D:\PRJ_YCT_Final\controllers/publicLeadController.js

const { Lead, Funnel, Coach, FormSubmissionMessage } = require('../schema');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const funnelseyeEventEmitter = require('../services/eventEmitterService');
const { publishEvent } = require('../services/rabbitmqProducer');

/**
 * Helper function to determine lead temperature based on submitted data.
 * CUSTOMIZE THIS LOGIC HEAVILY based on your specific funnel forms and qualification criteria.
 *
 * @param {object} formData - The data submitted by the lead via the form (e.g., req.body).
 * @param {object} funnelInfo - The funnel document associated with the submission.
 * @returns {('Cold'|'Warm'|'Hot')} The determined lead temperature.
 */
function determineLeadTemperature(formData, funnelInfo) {
    const { email, phone, message, interestLevel, budget, timeline, source } = formData;

    let temperature = 'Warm'; // Start with schema default, then apply rules

    // --- Rules for "Hot" leads ---
    // Rule H1: Explicit High Interest Level (if collected by form, e.g., a dropdown value)
    if (interestLevel && ['very interested', 'ready to buy', 'high intent'].includes(interestLevel.toLowerCase())) {
        temperature = 'Hot';
    }

    // Rule H2: Strong Call to Action or Urgent Keywords in Message
    if (message && (
        message.toLowerCase().includes('schedule call') ||
        message.toLowerCase().includes('urgent') ||
        message.toLowerCase().includes('need help now') ||
        message.toLowerCase().includes('book a demo') ||
        message.toLowerCase().includes('pricing') ||
        message.toLowerCase().includes('quote')
    )) {
        temperature = 'Hot'; // Overrides previous if set to Warm/Cold
    }

    // Rule H3: Both Email and Phone provided AND some specific intent
    // This is a common indicator of a serious lead.
    if (email && phone && (temperature === 'Warm' || temperature === 'Cold') && (message || interestLevel)) {
         temperature = 'Hot'; // Upgrade to Hot if they provide both and show any intent
    }

    // Rule H4: Specific Funnel Type (e.g., a "Request a Quote" funnel implies high intent)
    if (funnelInfo && funnelInfo.name && funnelInfo.name.toLowerCase().includes('quote request')) {
        if (temperature !== 'Hot') { // Don't downgrade if already Hot
            temperature = 'Hot';
        }
    }


    // --- Rules for "Cold" leads ---
    // Rule C1: Minimal Information (Overrides Hot/Warm if it's truly minimal and no strong signals were met above)
    // If they didn't provide email OR phone, it's definitely cold for contact.
    if (!email && !phone) {
        temperature = 'Cold';
    }
    // If only one contact method, and message is short/generic, and no high interest
    else if ((!email || !phone) && (!message || message.length < 15) && (!interestLevel || ['just Browse', 'low'].includes(interestLevel.toLowerCase()))) {
        temperature = 'Cold';
    }

    // Rule C2: Explicit Low Interest Level
    if (interestLevel && ['just Browse', 'low'].includes(interestLevel.toLowerCase())) {
        // Only set to Cold if it wasn't set to Hot by other rules
        if (temperature !== 'Hot') {
            temperature = 'Cold';
        }
    }


    console.log(`[QUALIFICATION] Lead from ${funnelInfo.name || 'unknown funnel'} with email: ${email || 'N/A'}, phone: ${phone || 'N/A'}. Determined Temperature: ${temperature}`);
    return temperature;
}


/**
 * @desc    Captures a new lead from a public funnel form submission.
 * @route   POST /api/public/leads/capture
 * @access  Public (no authentication required)
 *
 * This endpoint expects a `funnelId` from the form to correctly associate the lead with a coach.
 * It also handles initial lead qualification and saving the form message.
 */
const captureLead = async (req, res) => {
    // Extract relevant fields from the incoming form submission
    const {
        funnelId,
        name,
        email,
        phone,
        message, // Initial message/inquiry from the form
        interestLevel, // Example: a custom field you might add to your forms
        budget,
        timeline,
        source, // Allow the form to specify source, e.g., 'WebsiteForm', 'FacebookAd'
        targetAudience,
        clientQuestions,
        coachQuestions,
        ...otherLeadData // Catch-all for any other custom fields like 'country', 'city'
    } = req.body;

    // Basic validation: A funnel ID is crucial, and at least one contact method is needed
    if (!funnelId || (!email && !phone)) {
        return res.status(400).json({ success: false, message: 'Funnel ID and either email or phone are required.' });
    }

    try {
        // 1. Validate the provided funnelId and retrieve the associated coachId
        const funnel = await Funnel.findById(funnelId);
        if (!funnel) {
            return res.status(404).json({ success: false, message: 'Funnel not found.' });
        }
        const coachId = funnel.coachId;

        // 2. Check if a lead with this email or phone already exists for this coach
        const existingLead = await Lead.findOne({
            coachId: coachId,
            $or: [
                { email: email ? email.toLowerCase() : null },
                { phone: phone }
            ]
        });

        const now = new Date();

        if (existingLead) {
            // Existing lead: Update with new information and add a note about the new form submission
            const updateData = {};
            
            // Update basic info if new data is provided
            if (name && name !== existingLead.name) updateData.name = name;
            if (email && email !== existingLead.email) updateData.email = email.toLowerCase();
            if (phone && phone !== existingLead.phone) updateData.phone = phone;
            if (otherLeadData.country && otherLeadData.country !== existingLead.country) updateData.country = otherLeadData.country;
            if (otherLeadData.city && otherLeadData.city !== existingLead.city) updateData.city = otherLeadData.city;
            
            // Add booking form questions if provided
            if (targetAudience && (clientQuestions || coachQuestions)) {
                updateData.targetAudience = targetAudience;
                if (targetAudience === 'client' && clientQuestions) {
                    updateData.clientQuestions = clientQuestions;
                } else if (targetAudience === 'coach' && coachQuestions) {
                    updateData.coachQuestions = coachQuestions;
                }
                
                // Automatically qualify the lead based on their responses
                let qualification;
                if (targetAudience === 'client' && clientQuestions) {
                    qualification = qualifyClientLead(clientQuestions);
                } else if (targetAudience === 'coach' && coachQuestions) {
                    qualification = qualifyCoachLead(coachQuestions);
                }
                
                if (qualification) {
                    const summary = getQualificationSummary(qualification);
                    
                    // Update lead with qualification results
                    updateData.score = qualification.score;
                    updateData.maxScore = qualification.maxScore;
                    updateData.leadTemperature = summary.temperature;
                    updateData.qualificationInsights = qualification.insights;
                    updateData.recommendations = summary.recommendations;
                    
                    // Add qualification note
                    const qualificationNote = `\n\n--- AUTOMATIC QUALIFICATION (Updated) ---\nScore: ${qualification.score}/${qualification.maxScore} (${summary.percentage}%)\nTemperature: ${summary.temperature}\nInsights: ${qualification.insights.join(', ')}\nRecommendations: ${summary.recommendations.join(', ')}`;
                    updateData.notes = existingLead.notes ? existingLead.notes + qualificationNote : `Lead qualified via updated booking form${qualificationNote}`;
                }
            }
            
            // Add note about the new form submission
            const newSubmissionNote = `\n\n--- NEW FORM SUBMISSION (${now.toLocaleString()}) ---\nSource: ${source || 'Funnel Form'}\nMessage: ${message || 'No message provided'}`;
            updateData.notes = updateData.notes ? updateData.notes + newSubmissionNote : existingLead.notes + newSubmissionNote;
            
            // Update the existing lead
            const updatedLead = await Lead.findByIdAndUpdate(
                existingLead._id,
                updateData,
                { new: true, runValidators: true }
            );
            
            console.log(`[PUBLIC_CAPTURE] Updated existing lead for Coach ${coachId}: ${updatedLead.name} (ID: ${updatedLead._id}).`);
            
            // Save the new message as a FormSubmissionMessage document
            if (message) {
                const newFormMessage = new FormSubmissionMessage({
                    lead: existingLead._id,
                    coach: coachId,
                    content: message,
                    senderInfo: {
                        name: name,
                        email: email,
                        phone: phone
                    },
                    timestamp: now
                });
                await newFormMessage.save();
                console.log(`[PUBLIC_CAPTURE] New form submission message saved for existing lead: ${updatedLead.name}.`);
            }
            
            // Emit an event that an existing lead was updated via a form submission
            const eventName = 'lead_updated';
            const eventPayload = {
                eventName: eventName,
                payload: {
                    leadId: existingLead._id,
                    leadData: updatedLead.toObject(),
                    coachId: coachId,
                    funnelId: funnelId,
                    updateType: 'form_submission',
                    hasBookingForm: !!(clientQuestions || coachQuestions)
                }
            };
            
            publishEvent(eventName, eventPayload)
                .then(() => console.log(`[PUBLIC_CAPTURE] Published event: ${eventName}`))
                .catch(err => console.error(`[PUBLIC_CAPTURE] Failed to publish event: ${eventName}`, err));
            
            // Also publish form_submitted event for automation rules if this is a form submission
            if (funnelId && eventName === 'lead_updated') {
                const formSubmittedPayload = {
                    eventName: 'form_submitted',
                    payload: {
                        leadId: existingLead._id,
                        leadData: updatedLead.toObject(),
                        coachId: coachId,
                        funnelId: funnelId,
                        formType: 'funnel_form',
                        source: 'funnel_form',
                        hasBookingForm: !!(clientQuestions || coachQuestions)
                    }
                };
                publishEvent('form_submitted', formSubmittedPayload)
                    .then(() => console.log(`[PUBLIC_CAPTURE] Published event: form_submitted`))
                    .catch(err => console.error(`[PUBLIC_CAPTURE] Failed to publish event: form_submitted`, err));
            }
            
            return res.status(200).json({
                success: true,
                message: 'Lead updated successfully with new information.',
                data: updatedLead,
                isExisting: true
            });
        } else {
            // New lead: Create a brand new lead document
            const newLeadData = {
                coachId: coachId,
                funnelId: funnelId,
                funnelName: funnel.name,
                name: name || email || phone || `New Lead from ${funnel.name || 'Unknown Funnel'}`,
                email: email ? email.toLowerCase() : undefined,
                phone: phone,
                source: source || 'Funnel Form',
                status: 'New',
                country: otherLeadData.country,
                city: otherLeadData.city,
                notes: message ? `Initial Form Message (${now.toLocaleString()} from ${funnel.name || 'Unknown Funnel'}): ${message}` : `Lead captured via Funnel Form (${now.toLocaleString()} from ${funnel.name || 'Unknown Funnel'}).`
            };
            
            // Add booking form questions if provided
            if (targetAudience && (clientQuestions || coachQuestions)) {
                newLeadData.targetAudience = targetAudience;
                if (targetAudience === 'client' && clientQuestions) {
                    newLeadData.clientQuestions = clientQuestions;
                } else if (targetAudience === 'coach' && coachQuestions) {
                    newLeadData.coachQuestions = coachQuestions;
                }
                
                // Automatically qualify the lead based on their responses
                let qualification;
                if (targetAudience === 'client' && clientQuestions) {
                    qualification = qualifyClientLead(clientQuestions);
                } else if (targetAudience === 'coach' && coachQuestions) {
                    qualification = qualifyCoachLead(coachQuestions);
                }
                
                if (qualification) {
                    const summary = getQualificationSummary(qualification);
                    
                    // Set initial lead temperature and qualification data
                    newLeadData.leadTemperature = summary.temperature;
                    newLeadData.score = qualification.score;
                    newLeadData.maxScore = qualification.maxScore;
                    newLeadData.qualificationInsights = qualification.insights;
                    newLeadData.recommendations = summary.recommendations;
                    
                    // Add qualification note
                    const qualificationNote = `\n\n--- AUTOMATIC QUALIFICATION ---\nScore: ${qualification.score}/${qualification.maxScore} (${summary.percentage}%)\nTemperature: ${summary.temperature}\nInsights: ${qualification.insights.join(', ')}\nRecommendations: ${summary.recommendations.join(', ')}`;
                    newLeadData.notes = newLeadData.notes ? newLeadData.notes + qualificationNote : `Lead qualified via booking form${qualificationNote}`;
                }
            } else {
                // Set default lead temperature if no booking form questions
                newLeadData.leadTemperature = 'Warm';
            }

            const newLead = new Lead(newLeadData);
            await newLead.save();
            console.log(`[PUBLIC_CAPTURE] New lead created for Coach ${coachId}: ${newLead.name} (ID: ${newLead._id}).`);

            // Save the initial message as a FormSubmissionMessage document for conversation history
            if (message) {
                const initialFormMessage = new FormSubmissionMessage({
                    lead: newLead._id,
                    coach: coachId,
                    content: message,
                    senderInfo: {
                        name: name,
                        email: email,
                        phone: phone
                    },
                    timestamp: now
                });
                await initialFormMessage.save();
                console.log(`[PUBLIC_CAPTURE] Initial form submission message saved for new lead: ${newLead.name}.`);
            }

            // Emit an event that a new lead was created via a form submission
            const eventName = 'lead_created';
            const eventPayload = {
                eventName: eventName,
                payload: {
                    leadId: newLead._id,
                    leadData: newLead.toObject(),
                    coachId: coachId,
                    funnelId: funnelId,
                    source: 'funnel_form',
                    hasBookingForm: !!(clientQuestions || coachQuestions)
                }
            };
            
            publishEvent(eventName, eventPayload)
                .then(() => console.log(`[PUBLIC_CAPTURE] Published event: ${eventName}`))
                .catch(err => console.error(`[PUBLIC_CAPTURE] Failed to publish event: ${eventName}`, err));
            
            // Also publish form_submitted event for automation rules
            if (funnelId) {
                const formSubmittedPayload = {
                    eventName: 'form_submitted',
                    payload: {
                        leadId: newLead._id,
                        leadData: newLead.toObject(),
                        coachId: coachId,
                        funnelId: funnelId,
                        formType: 'funnel_form',
                        source: 'funnel_form',
                        hasBookingForm: !!(clientQuestions || coachQuestions)
                    }
                };
                publishEvent('form_submitted', formSubmittedPayload)
                    .then(() => console.log(`[PUBLIC_CAPTURE] Published event: form_submitted`))
                    .catch(err => console.error(`[PUBLIC_CAPTURE] Failed to publish event: form_submitted`, err));
            }

            return res.status(201).json({
                success: true,
                message: 'Lead captured successfully.',
                data: newLead,
                isExisting: false
            });
        }

    } catch (error) {
        console.error('Error in publicLeadController.captureLead:', error);
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(val => val.message);
            return res.status(400).json({ success: false, message: `Validation Error: ${messages.join(', ')}` });
        }
        // Mongoose duplicate key error (if the partial unique index catches a real duplicate)
        if (error.code === 11000) {
            // You might want to log the specific duplicated key here (email or phone)
            return res.status(409).json({ success: false, message: 'A lead with this email or phone already exists for this coach.' });
        }
        res.status(500).json({ success: false, message: 'Server error during lead capture. Please try again.' });
    }
};

// Lead qualification logic (integrated)
const qualifyClientLead = (clientQuestions) => {
    let score = 0;
    const maxScore = 100;
    const insights = [];
    
    // Video engagement (15 points)
    if (clientQuestions.watchedVideo === 'Yes') {
        score += 15;
        insights.push('Watched full video - high engagement');
    } else if (clientQuestions.watchedVideo === 'I plan to watch it soon') {
        score += 8;
        insights.push('Plans to watch video - moderate engagement');
    }
    
    // Health goal specificity (20 points)
    if (clientQuestions.healthGoal && clientQuestions.healthGoal.includes('Lose Weight (15+ kg)')) {
        score += 20;
        insights.push('Significant weight loss goal - high motivation');
    } else if (clientQuestions.healthGoal && (clientQuestions.healthGoal.includes('Lose Weight (5-15 kg)') || clientQuestions.healthGoal.includes('Manage Health Condition'))) {
        score += 15;
        insights.push('Specific health goal - good motivation');
    } else if (clientQuestions.healthGoal && clientQuestions.healthGoal.includes('General Wellness')) {
        score += 10;
        insights.push('General wellness goal - moderate motivation');
    }
    
    // Timeline urgency (20 points)
    if (clientQuestions.timelineForResults === '1-3 months (Urgent)') {
        score += 20;
        insights.push('Urgent timeline - high priority');
    } else if (clientQuestions.timelineForResults === '3-6 months (Moderate)') {
        score += 15;
        insights.push('Moderate timeline - good commitment');
    } else if (clientQuestions.timelineForResults === '6-12 months (Gradual)') {
        score += 10;
        insights.push('Gradual timeline - patient approach');
    }
    
    // Seriousness level (25 points)
    if (clientQuestions.seriousnessLevel === 'Very serious - willing to invest time and money') {
        score += 25;
        insights.push('Very serious - high conversion potential');
    } else if (clientQuestions.seriousnessLevel === 'Serious - depends on the approach') {
        score += 20;
        insights.push('Serious with conditions - good potential');
    } else if (clientQuestions.seriousnessLevel === 'Somewhat serious - exploring options') {
        score += 10;
        insights.push('Exploring options - needs nurturing');
    }
    
    // Investment range (15 points)
    if (clientQuestions.investmentRange && clientQuestions.investmentRange.includes('₹1,00,000+')) {
        score += 15;
        insights.push('High investment capacity - premium client');
    } else if (clientQuestions.investmentRange && clientQuestions.investmentRange.includes('₹50,000 - ₹1,00,000')) {
        score += 12;
        insights.push('Good investment capacity - solid client');
    } else if (clientQuestions.investmentRange && clientQuestions.investmentRange.includes('₹25,000 - ₹50,000')) {
        score += 8;
        insights.push('Moderate investment capacity - budget conscious');
    } else if (clientQuestions.investmentRange === 'Need to understand value first') {
        score += 5;
        insights.push('Needs value education - requires nurturing');
    }
    
    // Start timeline (5 points)
    if (clientQuestions.startTimeline === 'Immediately (This week)') {
        score += 5;
        insights.push('Immediate start - high urgency');
    } else if (clientQuestions.startTimeline === 'Within 2 weeks') {
        score += 3;
        insights.push('Quick start - good urgency');
    }
    
    return { score, maxScore, insights };
};

const qualifyCoachLead = (coachQuestions) => {
    let score = 0;
    const maxScore = 100;
    const insights = [];
    
    // Video engagement (15 points)
    if (coachQuestions.watchedVideo === 'Yes') {
        score += 15;
        insights.push('Watched full video - high engagement');
    }
    
    // Professional background (20 points)
    if (coachQuestions.currentProfession && ['Fitness Trainer/Gym Instructor', 'Nutritionist/Dietitian', 'Healthcare Professional'].includes(coachQuestions.currentProfession)) {
        score += 20;
        insights.push('Relevant professional background - high potential');
    } else if (coachQuestions.currentProfession && ['Sales Professional', 'Business Owner'].includes(coachQuestions.currentProfession)) {
        score += 15;
        insights.push('Business/sales background - good potential');
    } else if (coachQuestions.currentProfession && ['Corporate Employee', 'Student'].includes(coachQuestions.currentProfession)) {
        score += 10;
        insights.push('Professional background - moderate potential');
    }
    
    // Interest reasons (multiple select) (20 points)
    if (coachQuestions.interestReasons && Array.isArray(coachQuestions.interestReasons)) {
        const highValueReasons = ['Want financial freedom', 'Passionate about helping people transform', 'Already in fitness, want to scale'];
        const matchingReasons = coachQuestions.interestReasons.filter(reason => highValueReasons.includes(reason));
        if (matchingReasons.length >= 2) {
            score += 20;
            insights.push('Multiple high-value motivations - strong drive');
        } else if (matchingReasons.length === 1) {
            score += 15;
            insights.push('Good motivation - solid potential');
        } else {
            score += 10;
            insights.push('Basic motivation - needs nurturing');
        }
    }
    
    // Income goal ambition (20 points)
    if (coachQuestions.incomeGoal && coachQuestions.incomeGoal.includes('₹5,00,000+/month')) {
        score += 20;
        insights.push('Empire building mindset - high ambition');
    } else if (coachQuestions.incomeGoal && coachQuestions.incomeGoal.includes('₹2,00,000 - ₹5,00,000/month')) {
        score += 15;
        insights.push('Advanced income goal - strong ambition');
    } else if (coachQuestions.incomeGoal && coachQuestions.incomeGoal.includes('₹1,00,000 - ₹2,00,000/month')) {
        score += 12;
        insights.push('Professional income goal - good ambition');
    } else if (coachQuestions.incomeGoal && coachQuestions.incomeGoal.includes('₹50,000 - ₹1,00,000/month')) {
        score += 8;
        insights.push('Full-time income goal - moderate ambition');
    }
    
    // Investment capacity (15 points)
    if (coachQuestions.investmentCapacity && coachQuestions.investmentCapacity.includes('₹3,00,000+')) {
        score += 15;
        insights.push('High investment capacity - serious commitment');
    } else if (coachQuestions.investmentCapacity && coachQuestions.investmentCapacity.includes('₹2,00,000 - ₹3,00,000')) {
        score += 12;
        insights.push('Good investment capacity - solid commitment');
    } else if (coachQuestions.investmentCapacity && coachQuestions.investmentCapacity.includes('₹1,00,000 - ₹2,00,000')) {
        score += 8;
        insights.push('Moderate investment capacity - reasonable commitment');
    } else if (coachQuestions.investmentCapacity === 'Need to understand business model first') {
        score += 5;
        insights.push('Needs education - requires nurturing');
    }
    
    // Time availability (10 points)
    if (coachQuestions.timeAvailability && coachQuestions.timeAvailability.includes('8+ hours/day')) {
        score += 10;
        insights.push('Full commitment - maximum potential');
    } else if (coachQuestions.timeAvailability && coachQuestions.timeAvailability.includes('6-8 hours/day')) {
        score += 8;
        insights.push('Full-time availability - strong potential');
    } else if (coachQuestions.timeAvailability && coachQuestions.timeAvailability.includes('4-6 hours/day')) {
        score += 5;
        insights.push('Serious part-time - good potential');
    }
    
    return { score, maxScore, insights };
};

const getQualificationSummary = (qualification) => {
    const { score, maxScore, insights } = qualification;
    const percentage = Math.round((score / maxScore) * 100);
    
    let temperature = 'Cold';
    if (percentage >= 80) temperature = 'Hot';
    else if (percentage >= 50) temperature = 'Warm';
    
    const recommendations = [];
    
    if (temperature === 'Hot') {
        recommendations.push('High priority follow-up within 24 hours');
        recommendations.push('Send detailed program information');
        recommendations.push('Schedule discovery call immediately');
    } else if (temperature === 'Warm') {
        recommendations.push('Follow up within 48-72 hours');
        recommendations.push('Send nurturing content and testimonials');
        recommendations.push('Offer free consultation to build trust');
    } else {
        recommendations.push('Add to nurturing sequence');
        recommendations.push('Send educational content regularly');
        recommendations.push('Re-engage after 1-2 weeks');
    }
    
    return { temperature, percentage, recommendations };
};

// Export using object syntax
module.exports = {
    captureLead
};