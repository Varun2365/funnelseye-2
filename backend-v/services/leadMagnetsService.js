// services/leadMagnetsService.js

const { Lead, Coach } = require('../schema');
const OpenAI = require('openai');
// WhatsApp services moved to dustbin/whatsapp-dump/
// const { sendMessageByCoach } = require('./metaWhatsAppService');

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

class LeadMagnetsService {
    constructor() {
        this.availableLeadMagnets = {
            'ai_diet_planner': {
                name: 'AI Health Diet Planner',
                description: 'Personalized meal plans via email', // WhatsApp functionality moved to dustbin/whatsapp-dump/
                type: 'email_chat', // WhatsApp functionality moved to dustbin/whatsapp-dump/
                isActive: true
            },
            'bmi_calculator': {
                name: 'BMI Calculator',
                description: 'Calculate BMI with health recommendations',
                type: 'web_widget',
                isActive: true
            },
            'fitness_ebook': {
                name: 'Fitness E-Book Collection',
                description: 'Downloadable fitness guides',
                type: 'downloadable',
                isActive: true
            },
            'meal_planner': {
                name: 'Weekly Meal Planner',
                description: 'Customized meal plans with recipes',
                type: 'web_widget',
                isActive: true
            },
            'workout_calculator': {
                name: 'Workout Calculator',
                description: '1RM, heart rate, and calorie calculations',
                type: 'web_widget',
                isActive: true
            },
            'progress_tracker': {
                name: 'Progress Tracker',
                description: 'Track weight, measurements, and workouts',
                type: 'web_widget',
                isActive: true
            },
            'sleep_analyzer': {
                name: 'Sleep Quality Analyzer',
                description: 'Analyze sleep patterns and get tips',
                type: 'web_widget',
                isActive: true
            },
            'stress_assessment': {
                name: 'Stress Assessment Tool',
                description: 'Evaluate stress levels and get recommendations',
                type: 'web_widget',
                isActive: true
            }
        };
    }

    async getCoachLeadMagnets(coachId) {
        const coach = await Coach.findById(coachId);
        if (!coach) throw new Error('Coach not found');

        const coachLeadMagnets = coach.leadMagnets || {};
        
        return Object.keys(this.availableLeadMagnets).map(magnetId => ({
            id: magnetId,
            ...this.availableLeadMagnets[magnetId],
            isEnabled: coachLeadMagnets[magnetId]?.isEnabled || false,
            customConfig: coachLeadMagnets[magnetId]?.config || {}
        }));
    }

    async updateCoachLeadMagnets(coachId, leadMagnetSettings) {
        const coach = await Coach.findById(coachId);
        if (!coach) throw new Error('Coach not found');

        coach.leadMagnets = { ...coach.leadMagnets, ...leadMagnetSettings };
        await coach.save();
        return this.getCoachLeadMagnets(coachId);
    }

    /**
     * Automatically update lead score based on lead magnet interactions
     */
    async updateLeadScore(leadId, interactionType, conversion = false) {
        try {
            console.log(`[updateLeadScore] Updating score for leadId: ${leadId}, interactionType: ${interactionType}`);
            
            // Use the centralized Lead import instead of requiring locally
            const lead = await Lead.findById(leadId);
            
            if (!lead) {
                console.error(`[updateLeadScore] Lead not found for leadId: ${leadId}`);
                throw new Error('Lead not found');
            }
            
            console.log(`[updateLeadScore] Found lead: ${lead.name} (${lead._id})`);
            
            // Add the interaction to the lead's history
            lead.leadMagnetInteractions.push({
                type: interactionType,
                data: { timestamp: new Date() },
                timestamp: new Date(),
                conversion: conversion,
                conversionDate: conversion ? new Date() : null
            });
            
            // Recalculate the lead score - use a simple scoring approach for now
            // TODO: Import calculateLeadScore function properly
            let score = lead.score || 0;
            score += 8; // Add 8 points for lead magnet interaction
            if (conversion) score += 15; // Add 15 points for conversion
            lead.score = score;
            
            await lead.save();
            
            console.log(`[updateLeadScore] Lead ${leadId} score updated to ${score} after ${interactionType} interaction`);
            
            return { score, explanation: [`Score increased by ${conversion ? 23 : 8} points for ${interactionType} interaction`] };
        } catch (error) {
            console.error('[updateLeadScore] Error updating lead score:', error);
            throw error;
        }
    }

    /**
     * Generate AI Diet Plan with automatic lead scoring
     */
    async generateAIDietPlan(coachId, leadId, userPreferences) {
        try {
            console.log(`[generateAIDietPlan] Starting with leadId: ${leadId}, coachId: ${coachId}`);
            
            const { age, gender, weight, height, activityLevel, goals, dietaryRestrictions } = userPreferences;
            
            const bmr = this.calculateBMR(age, gender, weight, height);
            const dailyCalories = this.calculateDailyCalories(bmr, activityLevel, goals);
            
            const prompt = `Create a 7-day personalized meal plan for:
            Age: ${age}, Gender: ${gender}, Weight: ${weight}kg, Height: ${height}cm
            Activity Level: ${activityLevel}, Goals: ${goals}
            Dietary Restrictions: ${dietaryRestrictions.join(', ')}
            Daily Calories: ${dailyCalories}
            
            Provide daily meal breakdown, calorie/macro breakdown, shopping list, and preparation tips.`;

            const completion = await openai.chat.completions.create({
                model: "gpt-4",
                messages: [{ role: "user", content: prompt }],
                temperature: 0.7,
                max_tokens: 2000
            });

            const dietPlan = completion.choices[0].message.content;

            console.log(`[generateAIDietPlan] Diet plan generated, updating lead ${leadId}`);

            // Update the lead with the interaction
            const updateResult = await Lead.findByIdAndUpdate(leadId, {
                $push: {
                    leadMagnetInteractions: {
                        type: 'ai_diet_planner',
                        data: { preferences: userPreferences, dietPlan, dailyCalories },
                        timestamp: new Date()
                    }
                }
            });

            if (!updateResult) {
                throw new Error(`Failed to update lead ${leadId} - lead may not exist`);
            }

            console.log(`[generateAIDietPlan] Lead updated successfully, now updating score`);

            // After successful generation, update lead score
            await this.updateLeadScore(leadId, 'ai_diet_planner', false);
            
            return {
                success: true,
                dietPlan: dietPlan,
                dailyCalories: dailyCalories,
                bmr: bmr,
                message: 'AI diet plan generated successfully'
            };
        } catch (error) {
            console.error('[generateAIDietPlan] Error:', error);
            throw error;
        }
    }

    /**
     * Calculate BMI with automatic lead scoring
     */
    async calculateBMIAndRecommendations(weight, height, age, gender, activityLevel, leadId = null) {
        try {
            const heightInMeters = height / 100;
            const bmi = weight / (heightInMeters * heightInMeters);
            const bmiCategory = this.getBMICategory(bmi);
            
            const prompt = `Generate health recommendations for:
            BMI: ${bmi.toFixed(1)} (${bmiCategory})
            Age: ${age}, Gender: ${gender}, Activity Level: ${activityLevel}
            
            Provide specific diet, exercise, and lifestyle recommendations.`;

            const completion = await openai.chat.completions.create({
                model: "gpt-4",
                messages: [{ role: "user", content: prompt }],
                temperature: 0.7,
                max_tokens: 500
            });

            const recommendations = completion.choices[0].message.content;
            const idealWeightRange = this.calculateIdealWeightRange(height, gender);

            if (leadId) {
                await this.updateLeadScore(leadId, 'bmi_calculator', false);
            }
            
            return {
                success: true,
                bmi: bmi.toFixed(1),
                category: bmiCategory,
                recommendations: recommendations,
                idealWeightRange: idealWeightRange
            };
        } catch (error) {
            console.error('Error calculating BMI:', error);
            throw error;
        }
    }

    /**
     * Generate E-book content with automatic lead scoring
     */
    async generateEbookContent(ebookType, userData = {}, leadId = null) {
        try {
            const ebookTemplates = {
                '7-Day Fat Loss Kickstart': ['Introduction', 'Meal Plans', 'Workouts', 'Mindset Tips'],
                'Home Workout Mastery': ['Equipment-Free Exercises', 'Routines', 'Recovery', 'Motivation'],
                'Nutrition Basics Guide': ['Macronutrients', 'Meal Timing', 'Hydration', 'Supplements'],
                'Mindset & Motivation': ['Goal Setting', 'Habit Formation', 'Overcoming Plateaus', 'Success']
            };

            const template = ebookTemplates[ebookType];
            if (!template) throw new Error('Invalid e-book type');

            const prompt = `Create engaging content for "${ebookType}" with sections: ${template.join(', ')}. User context: ${JSON.stringify(userData)}. Make it actionable and personalized.`;

            const completion = await openai.chat.completions.create({
                model: "gpt-4",
                messages: [{ role: "user", content: prompt }],
                temperature: 0.7,
                max_tokens: 3000
            });

            const generatedContent = completion.choices[0].message.content;
            const generatedAt = new Date();

            if (leadId) {
                await this.updateLeadScore(leadId, 'fitness_ebook', false);
            }
            
            return {
                success: true,
                content: generatedContent,
                title: ebookType,
                sections: template,
                generatedAt: generatedAt,
                message: 'E-book content generated successfully'
            };
        } catch (error) {
            console.error('Error generating e-book content:', error);
            throw error;
        }
    }

    calculateWorkoutMetrics(age, weight, height, gender, activityLevel, exerciseData) {
        const maxHeartRate = 220 - age;
        const heartRateZones = {
            fatBurn: { min: Math.round(maxHeartRate * 0.6), max: Math.round(maxHeartRate * 0.7) },
            cardio: { min: Math.round(maxHeartRate * 0.7), max: Math.round(maxHeartRate * 0.85) },
            peak: { min: Math.round(maxHeartRate * 0.85), max: Math.round(maxHeartRate * 0.95) }
        };

        const oneRM = {};
        if (exerciseData) {
            Object.keys(exerciseData).forEach(exercise => {
                const { weight, reps } = exerciseData[exercise];
                oneRM[exercise] = this.calculate1RM(weight, reps);
            });
        }

        return { maxHeartRate, heartRateZones, oneRM };
    }

    /**
     * Track progress with automatic lead scoring
     */
    async trackProgress(leadId, progressData) {
        try {
            // Use the centralized Lead import instead of requiring locally
            const lead = await Lead.findById(leadId);
            
            if (!lead) {
                throw new Error('Lead not found');
            }
            
            // Add progress entry
            lead.progressTracking.push({
                date: new Date(),
                data: progressData,
                metrics: this.calculateProgressMetrics(progressData)
            });
            
            // Update lead score
            await this.updateLeadScore(leadId, 'progress_tracker', false);
            
            await lead.save();
            
            return {
                success: true,
                message: 'Progress tracked successfully'
            };
        } catch (error) {
            console.error('Error tracking progress:', error);
            throw error;
        }
    }

    async analyzeSleepQuality(sleepData) {
        const { sleepHours, sleepQuality, interruptions } = sleepData;
        const sleepEfficiency = this.calculateSleepEfficiency(sleepHours, interruptions);
        const sleepScore = this.calculateSleepScore(sleepHours, sleepQuality, sleepEfficiency);

        return {
            sleepEfficiency: sleepEfficiency.toFixed(1),
            sleepScore: sleepScore.toFixed(1),
            sleepQuality: this.getSleepQualityCategory(sleepScore),
            recommendations: this.getSleepRecommendations(sleepData, sleepScore)
        };
    }

    async assessStressLevel(stressResponses) {
        const stressScore = this.calculateStressScore(stressResponses);
        const stressLevel = this.getStressLevel(stressScore);

        return {
            stressScore: stressScore.toFixed(1),
            stressLevel,
            copingStrategies: this.getCopingStrategies(stressScore),
            recommendedActivities: this.getStressReliefActivities(stressLevel)
        };
    }

    // Helper methods
    calculateBMR(age, gender, weight, height) {
        return gender === 'male' 
            ? Math.round((10 * weight) + (6.25 * height) - (5 * age) + 5)
            : Math.round((10 * weight) + (6.25 * height) - (5 * age) - 161);
    }

    calculateDailyCalories(bmr, activityLevel, goals) {
        const multipliers = { sedentary: 1.2, lightly_active: 1.375, moderately_active: 1.55, very_active: 1.725 };
        const adjustments = { weight_loss: -500, maintenance: 0, muscle_gain: 300 };
        const tdee = bmr * multipliers[activityLevel];
        return Math.round(tdee + (adjustments[goals] || 0));
    }

    getBMICategory(bmi) {
        if (bmi < 18.5) return 'Underweight';
        if (bmi < 25) return 'Normal weight';
        if (bmi < 30) return 'Overweight';
        return 'Obese';
    }

    calculateIdealWeightRange(height, gender) {
        const heightInMeters = height / 100;
        const minBMI = 18.5;
        const maxBMI = 24.9;
        const minWeight = minBMI * heightInMeters * heightInMeters;
        const maxWeight = maxBMI * heightInMeters * heightInMeters;
        return { min: Math.round(minWeight), max: Math.round(maxWeight) };
    }

    calculate1RM(weight, reps) {
        return Math.round(weight * (1 + reps / 30));
    }

    calculateSleepEfficiency(sleepHours, interruptions) {
        const totalTimeInBed = sleepHours + (interruptions * 0.25);
        return (sleepHours / totalTimeInBed) * 100;
    }

    calculateSleepScore(sleepHours, sleepQuality, sleepEfficiency) {
        const hoursScore = Math.min(sleepHours / 8 * 40, 40);
        const qualityScore = sleepQuality * 30;
        const efficiencyScore = sleepEfficiency * 0.3;
        return hoursScore + qualityScore + efficiencyScore;
    }

    getSleepQualityCategory(sleepScore) {
        if (sleepScore >= 80) return 'Excellent';
        if (sleepScore >= 60) return 'Good';
        if (sleepScore >= 40) return 'Fair';
        return 'Poor';
    }

    calculateStressScore(responses) {
        const factors = { sleep_quality: { poor: 3, fair: 2, good: 1, excellent: 0 } };
        let totalScore = 0;
        Object.keys(responses).forEach(factor => {
            if (factors[factor] && factors[factor][responses[factor]]) {
                totalScore += factors[factor][responses[factor]];
            }
        });
        return (totalScore / (Object.keys(responses).length * 3)) * 100;
    }

    getStressLevel(stressScore) {
        if (stressScore < 25) return 'Low';
        if (stressScore < 50) return 'Moderate';
        if (stressScore < 75) return 'High';
        return 'Very High';
    }

    /**
     * Mark lead magnet interaction as converted (for when leads actually sign up)
     */
    async markLeadMagnetConversion(leadId, interactionType) {
        try {
            // Use the centralized Lead import instead of requiring locally
            const lead = await Lead.findById(leadId);
            
            if (!lead) {
                throw new Error('Lead not found');
            }
            
            // Find the most recent interaction of this type and mark it as converted
            const interaction = lead.leadMagnetInteractions
                .filter(i => i.type === interactionType)
                .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))[0];
            
            if (interaction) {
                interaction.conversion = true;
                interaction.conversionDate = new Date();
                
                // Recalculate score with conversion - use simple scoring approach
                let score = lead.score || 0;
                score += 15; // Add 15 points for conversion
                lead.score = score;
                
                await lead.save();
                
                console.log(`Lead ${leadId} marked as converted for ${interactionType}, score updated to ${score}`);
                
                return { score, explanation: [`Score increased by 15 points for ${interactionType} conversion`] };
            }
            
            return { score: lead.score, explanation: ['No interaction found to convert'] };
        } catch (error) {
            console.error('Error marking lead magnet conversion:', error);
            throw error;
        }
    }

    /**
     * Calculate progress metrics for tracking
     */
    calculateProgressMetrics(progressData) {
        return {
            weightChange: this.calculateWeightChange(progressData.weightHistory || []),
            measurementChanges: this.calculateMeasurementChanges(progressData.measurementHistory || []),
            workoutProgress: this.analyzeWorkoutProgress(progressData.workoutHistory || [])
        };
    }

    /**
     * Calculate weight change over time
     */
    calculateWeightChange(weightHistory) {
        if (weightHistory.length < 2) return 0;
        const firstWeight = weightHistory[0].weight;
        const lastWeight = weightHistory[weightHistory.length - 1].weight;
        return lastWeight - firstWeight;
    }

    /**
     * Calculate measurement changes
     */
    calculateMeasurementChanges(measurementHistory) {
        if (measurementHistory.length < 2) return {};
        
        const firstMeasurements = measurementHistory[0];
        const lastMeasurements = measurementHistory[measurementHistory.length - 1];
        
        const changes = {};
        Object.keys(firstMeasurements).forEach(key => {
            if (typeof firstMeasurements[key] === 'number') {
                changes[key] = lastMeasurements[key] - firstMeasurements[key];
            }
        });
        
        return changes;
    }

    /**
     * Analyze workout progress
     */
    analyzeWorkoutProgress(workoutHistory) {
        if (workoutHistory.length === 0) return { totalWorkouts: 0, averageDuration: 0 };
        
        const totalWorkouts = workoutHistory.length;
        const totalDuration = workoutHistory.reduce((sum, workout) => sum + (workout.duration || 0), 0);
        const averageDuration = totalDuration / totalWorkouts;
        
        return {
            totalWorkouts,
            averageDuration: Math.round(averageDuration),
            consistency: this.calculateConsistency(workoutHistory)
        };
    }

    /**
     * Calculate workout consistency
     */
    calculateConsistency(workoutHistory) {
        if (workoutHistory.length < 2) return 0;
        
        const dates = workoutHistory.map(w => new Date(w.date)).sort();
        const totalDays = (dates[dates.length - 1] - dates[0]) / (1000 * 60 * 60 * 24);
        const workoutDays = workoutHistory.length;
        
        return Math.round((workoutDays / totalDays) * 100);
    }

    getSleepRecommendations(sleepData, sleepScore) {
        return "Sleep recommendations based on your data";
    }

    getCopingStrategies(stressScore) {
        return "Coping strategies for your stress level";
    }

    getStressReliefActivities(stressLevel) {
        return "Recommended stress relief activities";
    }

    /**
     * Get lead magnet interaction analytics
     */
    async getInteractionAnalytics(coachId, timeRange = 30) {
        try {
            // Use the centralized Lead import instead of requiring locally
            const startDate = new Date();
            startDate.setDate(startDate.getDate() - timeRange);

            const leads = await Lead.find({
                coachId: coachId,
                'leadMagnetInteractions.timestamp': { $gte: startDate }
            });

            const analytics = {
                totalInteractions: 0,
                totalConversions: 0,
                conversionRate: 0,
                interactionsByType: {},
                scoreImpact: {
                    averageScoreIncrease: 0,
                    totalScorePoints: 0,
                    leadsWithScoreIncrease: 0
                },
                topPerformingMagnets: [],
                recentActivity: []
            };

            let totalScoreIncrease = 0;
            let leadsWithIncrease = 0;

            leads.forEach(lead => {
                const recentInteractions = lead.leadMagnetInteractions.filter(
                    interaction => new Date(interaction.timestamp) >= startDate
                );

                recentInteractions.forEach(interaction => {
                    // Count interactions by type
                    if (!analytics.interactionsByType[interaction.type]) {
                        analytics.interactionsByType[interaction.type] = {
                            count: 0,
                            conversions: 0,
                            conversionRate: 0
                        };
                    }
                    analytics.interactionsByType[interaction.type].count++;
                    analytics.totalInteractions++;

                    if (interaction.conversion) {
                        analytics.interactionsByType[interaction.type].conversions++;
                        analytics.totalConversions++;
                    }
                });

                // Calculate score impact
                if (recentInteractions.length > 0) {
                    const scoreBefore = lead.score - (recentInteractions.length * 8); // Approximate score before interactions
                    const scoreIncrease = lead.score - scoreBefore;
                    if (scoreIncrease > 0) {
                        totalScoreIncrease += scoreIncrease;
                        leadsWithIncrease++;
                    }
                }
            });

            // Calculate conversion rates
            if (analytics.totalInteractions > 0) {
                analytics.conversionRate = (analytics.totalConversions / analytics.totalInteractions) * 100;
            }

            Object.keys(analytics.interactionsByType).forEach(type => {
                const typeData = analytics.interactionsByType[type];
                if (typeData.count > 0) {
                    typeData.conversionRate = (typeData.conversions / typeData.count) * 100;
                }
            });

            // Calculate score impact metrics
            if (leadsWithIncrease > 0) {
                analytics.scoreImpact.averageScoreIncrease = totalScoreIncrease / leadsWithIncrease;
                analytics.scoreImpact.totalScorePoints = totalScoreIncrease;
                analytics.scoreImpact.leadsWithScoreIncrease = leadsWithIncrease;
            }

            // Get top performing magnets
            analytics.topPerformingMagnets = Object.entries(analytics.interactionsByType)
                .map(([type, data]) => ({
                    type,
                    name: this.availableLeadMagnets[type]?.name || type,
                    interactions: data.count,
                    conversions: data.conversions,
                    conversionRate: data.conversionRate
                }))
                .sort((a, b) => b.conversionRate - a.conversionRate)
                .slice(0, 5);

            // Get recent activity
            const allInteractions = leads.flatMap(lead => 
                lead.leadMagnetInteractions
                    .filter(interaction => new Date(interaction.timestamp) >= startDate)
                    .map(interaction => ({
                        leadId: lead._id,
                        leadName: lead.name,
                        type: interaction.type,
                        timestamp: interaction.timestamp,
                        conversion: interaction.conversion
                    }))
            );

            analytics.recentActivity = allInteractions
                .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
                .slice(0, 10);

            return analytics;
        } catch (error) {
            console.error('Error getting interaction analytics:', error);
            throw error;
        }
    }
}

module.exports = new LeadMagnetsService();
