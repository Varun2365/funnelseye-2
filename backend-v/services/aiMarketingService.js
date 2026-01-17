// D:\PRJ_YCT_Final\services\aiMarketingService.js

const OpenAI = require('openai');
const CoachMarketingCredentials = require('../schema/CoachMarketingCredentials');
const { AdCampaign } = require('../schema');

// ===== AI CONTENT GENERATION =====

/**
 * Generate AI-powered ad copy
 */
async function generateAdCopy(coachId, options) {
    const {
        productInfo,
        targetAudience,
        campaignObjective,
        tone = 'professional',
        length = 'medium',
        includeCallToAction = true
    } = options;

    try {
        const openai = await getOpenAIClient(coachId);
        
        const prompt = `Create compelling ad copy for the following:

Product/Service: ${productInfo}
Target Audience: ${targetAudience}
Campaign Objective: ${campaignObjective}
Tone: ${tone}
Length: ${length}
Include Call-to-Action: ${includeCallToAction}

Please provide:
1. A compelling headline (max 40 characters)
2. Primary ad copy (${length === 'short' ? '50-100' : length === 'medium' ? '100-200' : '200-300'} characters)
3. Call-to-action text (if requested)
4. Key benefits highlighted
5. Emotional triggers used

Format the response as JSON with these fields: headline, primaryCopy, callToAction, benefits, emotionalTriggers, suggestions.`;

        const completion = await openai.chat.completions.create({
            model: 'gpt-4',
            messages: [
                {
                    role: 'system',
                    content: 'You are an expert digital marketing copywriter specializing in Facebook and Instagram ads. Create compelling, conversion-focused ad copy that resonates with the target audience.'
                },
                {
                    role: 'user',
                    content: prompt
                }
            ],
            temperature: 0.7,
            max_tokens: 1000
        });

        const response = completion.choices[0].message.content;
        
        try {
            return JSON.parse(response);
        } catch (parseError) {
            // If JSON parsing fails, return structured response
            return {
                headline: extractHeadline(response),
                primaryCopy: extractPrimaryCopy(response),
                callToAction: includeCallToAction ? extractCallToAction(response) : null,
                benefits: extractBenefits(response),
                emotionalTriggers: extractEmotionalTriggers(response),
                suggestions: response,
                rawResponse: response
            };
        }
    } catch (error) {
        throw new Error(`Failed to generate ad copy: ${error.message}`);
    }
}

/**
 * Generate AI-powered targeting recommendations
 */
async function generateTargetingRecommendations(coachId, options) {
    const {
        targetAudience,
        budget,
        objective,
        productInfo,
        excludeAudiences = []
    } = options;

    try {
        const openai = await getOpenAIClient(coachId);
        
        const prompt = `Provide detailed Facebook/Instagram ad targeting recommendations for:

Product/Service: ${productInfo}
Target Audience Description: ${targetAudience}
Budget: $${budget} per day
Campaign Objective: ${objective}
Exclude Audiences: ${excludeAudiences.join(', ') || 'None'}

Please provide:
1. Demographics (age, gender, location)
2. Interests (specific interests and behaviors)
3. Detailed targeting suggestions
4. Lookalike audience recommendations
5. Budget allocation suggestions
6. Placement recommendations
7. Bidding strategy suggestions

Format as JSON with fields: demographics, interests, detailedTargeting, lookalikeAudiences, budgetAllocation, placements, biddingStrategy, reasoning.`;

        const completion = await openai.chat.completions.create({
            model: 'gpt-4',
            messages: [
                {
                    role: 'system',
                    content: 'You are an expert Facebook/Instagram advertising strategist. Provide detailed, actionable targeting recommendations based on the provided information.'
                },
                {
                    role: 'user',
                    content: prompt
                }
            ],
            temperature: 0.6,
            max_tokens: 1500
        });

        const response = completion.choices[0].message.content;
        
        try {
            return JSON.parse(response);
        } catch (parseError) {
            return {
                demographics: extractDemographics(response),
                interests: extractInterests(response),
                detailedTargeting: response,
                lookalikeAudiences: extractLookalikeAudiences(response),
                budgetAllocation: extractBudgetAllocation(response),
                placements: extractPlacements(response),
                biddingStrategy: extractBiddingStrategy(response),
                reasoning: response,
                rawResponse: response
            };
        }
    } catch (error) {
        throw new Error(`Failed to generate targeting recommendations: ${error.message}`);
    }
}

/**
 * Optimize campaign with AI
 */
async function optimizeCampaign(coachId, campaignId, options) {
    const {
        optimizationType = 'performance',
        includeBudgetOptimization = true,
        includeAudienceOptimization = true,
        includeCreativeOptimization = true
    } = options;

    try {
        // Get campaign data
        const campaign = await AdCampaign.findOne({ campaignId, coachId });
        if (!campaign) {
            throw new Error('Campaign not found');
        }

        const openai = await getOpenAIClient(coachId);
        
        const prompt = `Analyze this campaign and provide optimization recommendations:

Campaign ID: ${campaignId}
Campaign Name: ${campaign.name}
Objective: ${campaign.objective}
Status: ${campaign.status}
Daily Budget: $${campaign.dailyBudget}
AI Generated: ${campaign.aiGenerated}

Optimization Focus: ${optimizationType}
Include Budget Optimization: ${includeBudgetOptimization}
Include Audience Optimization: ${includeAudienceOptimization}
Include Creative Optimization: ${includeCreativeOptimization}

Please provide:
1. Performance analysis
2. Budget optimization suggestions
3. Audience optimization recommendations
4. Creative optimization ideas
5. Bidding strategy improvements
6. Timeline for implementation
7. Expected impact

Format as JSON with fields: performanceAnalysis, budgetOptimization, audienceOptimization, creativeOptimization, biddingStrategy, implementationTimeline, expectedImpact, priorityActions.`;

        const completion = await openai.chat.completions.create({
            model: 'gpt-4',
            messages: [
                {
                    role: 'system',
                    content: 'You are an expert Facebook/Instagram advertising optimizer. Analyze campaigns and provide actionable optimization recommendations to improve performance.'
                },
                {
                    role: 'user',
                    content: prompt
                }
            ],
            temperature: 0.5,
            max_tokens: 2000
        });

        const response = completion.choices[0].message.content;
        
        try {
            return JSON.parse(response);
        } catch (parseError) {
            return {
                performanceAnalysis: extractPerformanceAnalysis(response),
                budgetOptimization: includeBudgetOptimization ? extractBudgetOptimization(response) : null,
                audienceOptimization: includeAudienceOptimization ? extractAudienceOptimization(response) : null,
                creativeOptimization: includeCreativeOptimization ? extractCreativeOptimization(response) : null,
                biddingStrategy: extractBiddingStrategy(response),
                implementationTimeline: extractImplementationTimeline(response),
                expectedImpact: extractExpectedImpact(response),
                priorityActions: extractPriorityActions(response),
                rawResponse: response
            };
        }
    } catch (error) {
        throw new Error(`Failed to optimize campaign: ${error.message}`);
    }
}

/**
 * Generate creative variations
 */
async function generateCreativeVariations(coachId, options) {
    const {
        baseCreative,
        productInfo,
        targetAudience,
        variations = 3,
        includeImages = false,
        includeVideos = false
    } = options;

    try {
        const openai = await getOpenAIClient(coachId);
        
        const prompt = `Create ${variations} creative variations for this ad:

Base Creative: ${baseCreative}
Product/Service: ${productInfo}
Target Audience: ${targetAudience}
Include Images: ${includeImages}
Include Videos: ${includeVideos}

For each variation, provide:
1. Headline variation
2. Ad copy variation
3. Call-to-action variation
4. Visual suggestions (if applicable)
5. Tone/style description
6. Why this variation might work better

Format as JSON with an array of variations, each containing: headline, copy, callToAction, visualSuggestions, tone, reasoning.`;

        const completion = await openai.chat.completions.create({
            model: 'gpt-4',
            messages: [
                {
                    role: 'system',
                    content: 'You are an expert creative director specializing in Facebook/Instagram advertising. Create diverse, compelling creative variations that test different approaches.'
                },
                {
                    role: 'user',
                    content: prompt
                }
            ],
            temperature: 0.8,
            max_tokens: 2000
        });

        const response = completion.choices[0].message.content;
        
        try {
            return JSON.parse(response);
        } catch (parseError) {
            return {
                variations: extractVariations(response),
                rawResponse: response
            };
        }
    } catch (error) {
        throw new Error(`Failed to generate creative variations: ${error.message}`);
    }
}

/**
 * Get AI-powered performance insights
 */
async function getPerformanceInsights(coachId, campaignId, options) {
    const {
        dateRange = '30d',
        includePredictions = true,
        includeTrends = true,
        includeAnomalies = true
    } = options;

    try {
        const campaign = await AdCampaign.findOne({ campaignId, coachId });
        if (!campaign) {
            throw new Error('Campaign not found');
        }

        const openai = await getOpenAIClient(coachId);
        
        const prompt = `Analyze this campaign's performance and provide insights:

Campaign ID: ${campaignId}
Campaign Name: ${campaign.name}
Objective: ${campaign.objective}
Status: ${campaign.status}
Daily Budget: $${campaign.dailyBudget}
Date Range: ${dateRange}

Please provide:
1. Performance summary
2. Key trends and patterns
3. Anomaly detection (if any)
4. Performance predictions
5. Benchmark comparisons
6. Actionable insights
7. Risk factors

Format as JSON with fields: performanceSummary, trends, anomalies, predictions, benchmarks, insights, riskFactors, recommendations.`;

        const completion = await openai.chat.completions.create({
            model: 'gpt-4',
            messages: [
                {
                    role: 'system',
                    content: 'You are an expert data analyst specializing in Facebook/Instagram advertising performance. Analyze campaign data and provide actionable insights.'
                },
                {
                    role: 'user',
                    content: prompt
                }
            ],
            temperature: 0.4,
            max_tokens: 2000
        });

        const response = completion.choices[0].message.content;
        
        try {
            return JSON.parse(response);
        } catch (parseError) {
            return {
                performanceSummary: extractPerformanceSummary(response),
                trends: includeTrends ? extractTrends(response) : null,
                anomalies: includeAnomalies ? extractAnomalies(response) : null,
                predictions: includePredictions ? extractPredictions(response) : null,
                benchmarks: extractBenchmarks(response),
                insights: extractInsights(response),
                riskFactors: extractRiskFactors(response),
                recommendations: extractRecommendations(response),
                rawResponse: response
            };
        }
    } catch (error) {
        throw new Error(`Failed to get performance insights: ${error.message}`);
    }
}

/**
 * Generate AI-powered marketing strategy
 */
async function generateMarketingStrategy(coachId, options) {
    const {
        businessInfo,
        goals,
        budget,
        timeline,
        targetAudience,
        competitors = []
    } = options;

    try {
        const openai = await getOpenAIClient(coachId);
        
        const prompt = `Create a comprehensive Facebook/Instagram marketing strategy for:

Business Information: ${businessInfo}
Goals: ${goals}
Budget: $${budget}
Timeline: ${timeline}
Target Audience: ${targetAudience}
Competitors: ${competitors.join(', ') || 'None specified'}

Please provide:
1. Executive summary
2. Campaign objectives and KPIs
3. Target audience analysis
4. Campaign structure and budget allocation
5. Creative strategy
6. Content calendar suggestions
7. Performance tracking plan
8. Risk mitigation strategies
9. Success metrics and milestones

Format as JSON with fields: executiveSummary, objectives, audienceAnalysis, campaignStructure, creativeStrategy, contentCalendar, performanceTracking, riskMitigation, successMetrics.`;

        const completion = await openai.chat.completions.create({
            model: 'gpt-4',
            messages: [
                {
                    role: 'system',
                    content: 'You are an expert digital marketing strategist specializing in Facebook/Instagram advertising. Create comprehensive, actionable marketing strategies.'
                },
                {
                    role: 'user',
                    content: prompt
                }
            ],
            temperature: 0.6,
            max_tokens: 3000
        });

        const response = completion.choices[0].message.content;
        
        try {
            return JSON.parse(response);
        } catch (parseError) {
            return {
                executiveSummary: extractExecutiveSummary(response),
                objectives: extractObjectives(response),
                audienceAnalysis: extractAudienceAnalysis(response),
                campaignStructure: extractCampaignStructure(response),
                creativeStrategy: extractCreativeStrategy(response),
                contentCalendar: extractContentCalendar(response),
                performanceTracking: extractPerformanceTracking(response),
                riskMitigation: extractRiskMitigation(response),
                successMetrics: extractSuccessMetrics(response),
                rawResponse: response
            };
        }
    } catch (error) {
        throw new Error(`Failed to generate marketing strategy: ${error.message}`);
    }
}

// ===== CAMPAIGN-SPECIFIC AI FEATURES =====

/**
 * Generate campaign content
 */
async function generateCampaignContent(coachId, options) {
    const { campaignData, metaCampaignId } = options;
    
    try {
        const adCopy = await generateAdCopy(coachId, {
            productInfo: campaignData.productInfo,
            targetAudience: campaignData.targetAudience,
            campaignObjective: campaignData.objective
        });

        const targetingRecommendations = await generateTargetingRecommendations(coachId, {
            targetAudience: campaignData.targetAudience,
            budget: campaignData.budget,
            objective: campaignData.objective,
            productInfo: campaignData.productInfo
        });

        return {
            adCopy,
            targetingRecommendations,
            generatedAt: new Date(),
            metaCampaignId
        };
    } catch (error) {
        throw new Error(`Failed to generate campaign content: ${error.message}`);
    }
}

/**
 * Generate campaign recommendations
 */
async function generateCampaignRecommendations(coachId, campaignId, insights) {
    try {
        const openai = await getOpenAIClient(coachId);
        
        const prompt = `Based on these campaign insights, provide specific recommendations:

Campaign ID: ${campaignId}
Insights: ${JSON.stringify(insights)}

Provide:
1. Immediate actions to take
2. Optimization opportunities
3. Budget adjustments
4. Audience refinements
5. Creative improvements
6. Timeline for changes

Format as JSON with fields: immediateActions, optimizationOpportunities, budgetAdjustments, audienceRefinements, creativeImprovements, timeline.`;

        const completion = await openai.chat.completions.create({
            model: 'gpt-4',
            messages: [
                {
                    role: 'system',
                    content: 'You are an expert Facebook/Instagram advertising consultant. Provide specific, actionable recommendations based on campaign performance data.'
                },
                {
                    role: 'user',
                    content: prompt
                }
            ],
            temperature: 0.5,
            max_tokens: 1500
        });

        const response = completion.choices[0].message.content;
        
        try {
            return JSON.parse(response);
        } catch (parseError) {
            return {
                immediateActions: extractImmediateActions(response),
                optimizationOpportunities: extractOptimizationOpportunities(response),
                budgetAdjustments: extractBudgetAdjustments(response),
                audienceRefinements: extractAudienceRefinements(response),
                creativeImprovements: extractCreativeImprovements(response),
                timeline: extractTimeline(response),
                rawResponse: response
            };
        }
    } catch (error) {
        throw new Error(`Failed to generate campaign recommendations: ${error.message}`);
    }
}

/**
 * Generate dashboard insights
 */
async function generateDashboardInsights(coachId, campaignAnalysis) {
    try {
        const openai = await getOpenAIClient(coachId);
        
        const prompt = `Analyze this marketing dashboard data and provide insights:

Campaign Analysis: ${JSON.stringify(campaignAnalysis)}

Provide:
1. Overall performance summary
2. Key insights and trends
3. Top performing campaigns
4. Areas for improvement
5. Strategic recommendations
6. Budget optimization suggestions

Format as JSON with fields: performanceSummary, keyInsights, topPerformers, improvementAreas, strategicRecommendations, budgetOptimization.`;

        const completion = await openai.chat.completions.create({
            model: 'gpt-4',
            messages: [
                {
                    role: 'system',
                    content: 'You are an expert marketing analyst. Analyze dashboard data and provide strategic insights and recommendations.'
                },
                {
                    role: 'user',
                    content: prompt
                }
            ],
            temperature: 0.4,
            max_tokens: 2000
        });

        const response = completion.choices[0].message.content;
        
        try {
            return JSON.parse(response);
        } catch (parseError) {
            return {
                performanceSummary: extractPerformanceSummary(response),
                keyInsights: extractKeyInsights(response),
                topPerformers: extractTopPerformers(response),
                improvementAreas: extractImprovementAreas(response),
                strategicRecommendations: extractStrategicRecommendations(response),
                budgetOptimization: extractBudgetOptimization(response),
                rawResponse: response
            };
        }
    } catch (error) {
        // Check if it's an API key error
        if (error.message?.includes('401') || error.message?.includes('Incorrect API key') || error.message?.includes('Invalid API key')) {
            console.error(`[generateDashboardInsights] OpenAI API key error for coach ${coachId}:`, error.message);
            throw new Error(`OpenAI API key is invalid or expired. Please update your OpenAI API key in settings. Original error: ${error.message}`);
        }
        
        // Check if it's a rate limit error
        if (error.message?.includes('429') || error.message?.includes('rate limit')) {
            console.error(`[generateDashboardInsights] OpenAI rate limit error for coach ${coachId}:`, error.message);
            throw new Error(`OpenAI API rate limit exceeded. Please try again later. Original error: ${error.message}`);
        }
        
        console.error(`[generateDashboardInsights] Error generating dashboard insights for coach ${coachId}:`, error);
        throw new Error(`Failed to generate dashboard insights: ${error.message}`);
    }
}

// ===== HELPER FUNCTIONS =====

/**
 * Get OpenAI client for coach
 */
async function getOpenAIClient(coachId) {
    const credentials = await CoachMarketingCredentials.findOne({ coachId })
        .select('+openAI.apiKey +encryptionKey');
    
    if (!credentials || !credentials.openAI.apiKey) {
        // Fallback to global OpenAI API key
        const globalApiKey = process.env.OPENAI_API_KEY;
        if (!globalApiKey) {
            throw new Error('OpenAI API key not found for this coach and no global API key configured');
        }
        
        // Validate the global API key format
        if (!globalApiKey.startsWith('sk-') || globalApiKey.length < 20) {
            throw new Error('Invalid global OpenAI API key format. Please check your OPENAI_API_KEY environment variable.');
        }
        
        console.log('Using global OpenAI API key as fallback');
        return new OpenAI({ apiKey: globalApiKey });
    }
    
    const apiKey = credentials.getDecryptedOpenAIKey();
    
    // Validate the coach's API key format
    if (!apiKey || (!apiKey.startsWith('sk-') && apiKey.length < 20)) {
        throw new Error('Invalid OpenAI API key format for this coach. Please reconfigure your OpenAI credentials.');
    }
    
    return new OpenAI({ apiKey });
}

// ===== TEXT EXTRACTION HELPERS =====

function extractHeadline(text) {
    const headlineMatch = text.match(/headline[:\s]+(.+?)(?:\n|$)/i);
    return headlineMatch ? headlineMatch[1].trim() : 'Generated Headline';
}

function extractPrimaryCopy(text) {
    const copyMatch = text.match(/copy[:\s]+(.+?)(?:\n|$)/i);
    return copyMatch ? copyMatch[1].trim() : text.substring(0, 200);
}

function extractCallToAction(text) {
    const ctaMatch = text.match(/call.?to.?action[:\s]+(.+?)(?:\n|$)/i);
    return ctaMatch ? ctaMatch[1].trim() : 'Learn More';
}

function extractBenefits(text) {
    const benefitsMatch = text.match(/benefits[:\s]+(.+?)(?:\n|$)/i);
    return benefitsMatch ? benefitsMatch[1].trim().split(',').map(b => b.trim()) : [];
}

function extractEmotionalTriggers(text) {
    const triggersMatch = text.match(/emotional.?triggers[:\s]+(.+?)(?:\n|$)/i);
    return triggersMatch ? triggersMatch[1].trim().split(',').map(t => t.trim()) : [];
}

function extractDemographics(text) {
    const demoMatch = text.match(/demographics[:\s]+(.+?)(?:\n|$)/i);
    return demoMatch ? demoMatch[1].trim() : 'General demographics';
}

function extractInterests(text) {
    const interestsMatch = text.match(/interests[:\s]+(.+?)(?:\n|$)/i);
    return interestsMatch ? interestsMatch[1].trim().split(',').map(i => i.trim()) : [];
}

function extractLookalikeAudiences(text) {
    const lookalikeMatch = text.match(/lookalike[:\s]+(.+?)(?:\n|$)/i);
    return lookalikeMatch ? lookalikeMatch[1].trim() : 'No lookalike recommendations';
}

function extractBudgetAllocation(text) {
    const budgetMatch = text.match(/budget[:\s]+(.+?)(?:\n|$)/i);
    return budgetMatch ? budgetMatch[1].trim() : 'Budget allocation suggestions';
}

function extractPlacements(text) {
    const placementsMatch = text.match(/placements[:\s]+(.+?)(?:\n|$)/i);
    return placementsMatch ? placementsMatch[1].trim().split(',').map(p => p.trim()) : [];
}

function extractBiddingStrategy(text) {
    const biddingMatch = text.match(/bidding[:\s]+(.+?)(?:\n|$)/i);
    return biddingMatch ? biddingMatch[1].trim() : 'Bidding strategy recommendations';
}

function extractPerformanceAnalysis(text) {
    const analysisMatch = text.match(/performance.?analysis[:\s]+(.+?)(?:\n|$)/i);
    return analysisMatch ? analysisMatch[1].trim() : 'Performance analysis';
}

function extractBudgetOptimization(text) {
    const budgetMatch = text.match(/budget.?optimization[:\s]+(.+?)(?:\n|$)/i);
    return budgetMatch ? budgetMatch[1].trim() : 'Budget optimization suggestions';
}

function extractAudienceOptimization(text) {
    const audienceMatch = text.match(/audience.?optimization[:\s]+(.+?)(?:\n|$)/i);
    return audienceMatch ? audienceMatch[1].trim() : 'Audience optimization recommendations';
}

function extractCreativeOptimization(text) {
    const creativeMatch = text.match(/creative.?optimization[:\s]+(.+?)(?:\n|$)/i);
    return creativeMatch ? creativeMatch[1].trim() : 'Creative optimization ideas';
}

function extractImplementationTimeline(text) {
    const timelineMatch = text.match(/timeline[:\s]+(.+?)(?:\n|$)/i);
    return timelineMatch ? timelineMatch[1].trim() : 'Implementation timeline';
}

function extractExpectedImpact(text) {
    const impactMatch = text.match(/expected.?impact[:\s]+(.+?)(?:\n|$)/i);
    return impactMatch ? impactMatch[1].trim() : 'Expected impact';
}

function extractPriorityActions(text) {
    const actionsMatch = text.match(/priority.?actions[:\s]+(.+?)(?:\n|$)/i);
    return actionsMatch ? actionsMatch[1].trim().split(',').map(a => a.trim()) : [];
}

function extractVariations(text) {
    // Simple extraction - in real implementation, you'd parse more carefully
    const variations = [];
    const lines = text.split('\n');
    let currentVariation = {};
    
    for (const line of lines) {
        if (line.includes('Variation') || line.includes('variation')) {
            if (Object.keys(currentVariation).length > 0) {
                variations.push(currentVariation);
            }
            currentVariation = {};
        }
        // Add more sophisticated parsing here
    }
    
    if (Object.keys(currentVariation).length > 0) {
        variations.push(currentVariation);
    }
    
    return variations.length > 0 ? variations : [{ headline: 'Generated Variation', copy: text.substring(0, 200) }];
}

function extractPerformanceSummary(text) {
    const summaryMatch = text.match(/performance.?summary[:\s]+(.+?)(?:\n|$)/i);
    return summaryMatch ? summaryMatch[1].trim() : 'Performance summary';
}

function extractTrends(text) {
    const trendsMatch = text.match(/trends[:\s]+(.+?)(?:\n|$)/i);
    return trendsMatch ? trendsMatch[1].trim() : 'Trend analysis';
}

function extractAnomalies(text) {
    const anomaliesMatch = text.match(/anomalies[:\s]+(.+?)(?:\n|$)/i);
    return anomaliesMatch ? anomaliesMatch[1].trim() : 'No anomalies detected';
}

function extractPredictions(text) {
    const predictionsMatch = text.match(/predictions[:\s]+(.+?)(?:\n|$)/i);
    return predictionsMatch ? predictionsMatch[1].trim() : 'Performance predictions';
}

function extractBenchmarks(text) {
    const benchmarksMatch = text.match(/benchmarks[:\s]+(.+?)(?:\n|$)/i);
    return benchmarksMatch ? benchmarksMatch[1].trim() : 'Benchmark comparisons';
}

function extractInsights(text) {
    const insightsMatch = text.match(/insights[:\s]+(.+?)(?:\n|$)/i);
    return insightsMatch ? insightsMatch[1].trim() : 'Key insights';
}

function extractRiskFactors(text) {
    const risksMatch = text.match(/risk.?factors[:\s]+(.+?)(?:\n|$)/i);
    return risksMatch ? risksMatch[1].trim() : 'Risk factors';
}

function extractRecommendations(text) {
    const recommendationsMatch = text.match(/recommendations[:\s]+(.+?)(?:\n|$)/i);
    return recommendationsMatch ? recommendationsMatch[1].trim() : 'Recommendations';
}

function extractExecutiveSummary(text) {
    const summaryMatch = text.match(/executive.?summary[:\s]+(.+?)(?:\n|$)/i);
    return summaryMatch ? summaryMatch[1].trim() : 'Executive summary';
}

function extractObjectives(text) {
    const objectivesMatch = text.match(/objectives[:\s]+(.+?)(?:\n|$)/i);
    return objectivesMatch ? objectivesMatch[1].trim() : 'Campaign objectives';
}

function extractAudienceAnalysis(text) {
    const audienceMatch = text.match(/audience.?analysis[:\s]+(.+?)(?:\n|$)/i);
    return audienceMatch ? audienceMatch[1].trim() : 'Audience analysis';
}

function extractCampaignStructure(text) {
    const structureMatch = text.match(/campaign.?structure[:\s]+(.+?)(?:\n|$)/i);
    return structureMatch ? structureMatch[1].trim() : 'Campaign structure';
}

function extractCreativeStrategy(text) {
    const creativeMatch = text.match(/creative.?strategy[:\s]+(.+?)(?:\n|$)/i);
    return creativeMatch ? creativeMatch[1].trim() : 'Creative strategy';
}

function extractContentCalendar(text) {
    const calendarMatch = text.match(/content.?calendar[:\s]+(.+?)(?:\n|$)/i);
    return calendarMatch ? calendarMatch[1].trim() : 'Content calendar';
}

function extractPerformanceTracking(text) {
    const trackingMatch = text.match(/performance.?tracking[:\s]+(.+?)(?:\n|$)/i);
    return trackingMatch ? trackingMatch[1].trim() : 'Performance tracking plan';
}

function extractRiskMitigation(text) {
    const riskMatch = text.match(/risk.?mitigation[:\s]+(.+?)(?:\n|$)/i);
    return riskMatch ? riskMatch[1].trim() : 'Risk mitigation strategies';
}

function extractSuccessMetrics(text) {
    const metricsMatch = text.match(/success.?metrics[:\s]+(.+?)(?:\n|$)/i);
    return metricsMatch ? metricsMatch[1].trim() : 'Success metrics';
}

function extractImmediateActions(text) {
    const actionsMatch = text.match(/immediate.?actions[:\s]+(.+?)(?:\n|$)/i);
    return actionsMatch ? actionsMatch[1].trim().split(',').map(a => a.trim()) : [];
}

function extractOptimizationOpportunities(text) {
    const opportunitiesMatch = text.match(/optimization.?opportunities[:\s]+(.+?)(?:\n|$)/i);
    return opportunitiesMatch ? opportunitiesMatch[1].trim() : 'Optimization opportunities';
}

function extractBudgetAdjustments(text) {
    const budgetMatch = text.match(/budget.?adjustments[:\s]+(.+?)(?:\n|$)/i);
    return budgetMatch ? budgetMatch[1].trim() : 'Budget adjustments';
}

function extractAudienceRefinements(text) {
    const audienceMatch = text.match(/audience.?refinements[:\s]+(.+?)(?:\n|$)/i);
    return audienceMatch ? audienceMatch[1].trim() : 'Audience refinements';
}

function extractCreativeImprovements(text) {
    const creativeMatch = text.match(/creative.?improvements[:\s]+(.+?)(?:\n|$)/i);
    return creativeMatch ? creativeMatch[1].trim() : 'Creative improvements';
}

function extractTimeline(text) {
    const timelineMatch = text.match(/timeline[:\s]+(.+?)(?:\n|$)/i);
    return timelineMatch ? timelineMatch[1].trim() : 'Implementation timeline';
}

function extractKeyInsights(text) {
    const insightsMatch = text.match(/key.?insights[:\s]+(.+?)(?:\n|$)/i);
    return insightsMatch ? insightsMatch[1].trim() : 'Key insights';
}

function extractTopPerformers(text) {
    const performersMatch = text.match(/top.?performers[:\s]+(.+?)(?:\n|$)/i);
    return performersMatch ? performersMatch[1].trim() : 'Top performers';
}

function extractImprovementAreas(text) {
    const improvementsMatch = text.match(/improvement.?areas[:\s]+(.+?)(?:\n|$)/i);
    return improvementsMatch ? improvementsMatch[1].trim() : 'Areas for improvement';
}

function extractStrategicRecommendations(text) {
    const strategicMatch = text.match(/strategic.?recommendations[:\s]+(.+?)(?:\n|$)/i);
    return strategicMatch ? strategicMatch[1].trim() : 'Strategic recommendations';
}

function extractBudgetOptimization(text) {
    const budgetMatch = text.match(/budget.?optimization[:\s]+(.+?)(?:\n|$)/i);
    return budgetMatch ? budgetMatch[1].trim() : 'Budget optimization';
}

module.exports = {
    // AI Content Generation
    generateAdCopy,
    generateTargetingRecommendations,
    optimizeCampaign,
    generateCreativeVariations,
    getPerformanceInsights,
    generateMarketingStrategy,
    
    // Campaign-specific AI Features
    generateCampaignContent,
    generateCampaignRecommendations,
    generateDashboardInsights
};
