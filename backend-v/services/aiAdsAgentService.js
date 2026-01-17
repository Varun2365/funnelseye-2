// D:\PRJ_YCT_Final\services\aiAdsAgentService.js

const OpenAI = require('openai');
const { AdCampaign, AdSet, AdCreative, Ad } = require('../schema');
const metaAdsService = require('./metaAdsService');
const CoachMarketingCredentials = require('../schema/CoachMarketingCredentials');

// Helper function to get coach's OpenAI API key
async function getCoachOpenAIKey(coachId) {
    const credentials = await CoachMarketingCredentials.findOne({ coachId })
        .select('+openAI.apiKey +encryptionKey');
    
    if (!credentials || !credentials.openAI.apiKey) {
        // Fallback to global OpenAI API key from environment
        const globalApiKey = process.env.OPENAI_API_KEY;
        if (!globalApiKey) {
            throw new Error('OpenAI API key not found for this coach and no global API key configured. Please set OPENAI_API_KEY environment variable or configure coach-specific API key.');
        }
        console.log('Using global OpenAI API key as fallback');
        return globalApiKey;
    }
    
    return credentials.getDecryptedOpenAIKey();
}

// Helper function to get coach's OpenAI model preference
async function getCoachOpenAIModel(coachId) {
    const credentials = await CoachMarketingCredentials.findOne({ coachId })
        .select('openAI.modelPreference');
    
    return credentials?.openAI?.modelPreference || 'gpt-4';
}

class AIAdsAgent {
    constructor() {
        this.optimizationHistory = new Map();
        this.performanceThresholds = {
            ctr: 0.02, // 2% CTR threshold
            cpc: 2.0,  // $2 CPC threshold
            roas: 3.0  // 3:1 ROAS threshold
        };
    }

    /**
     * Generate AI-powered ad copy and creatives
     */
    async generateAdCopy(coachId, targetAudience, productInfo, campaignObjective) {
        try {
            const apiKey = await getCoachOpenAIKey(coachId);
            const model = await getCoachOpenAIModel(coachId);
            
            const openai = new OpenAI({
                apiKey: apiKey
            });

            const prompt = `
                Create compelling Facebook ad copy for a fitness coach targeting ${targetAudience}.
                
                Product/Service: ${productInfo}
                Campaign Objective: ${campaignObjective}
                
                Generate:
                1. Primary Headline (40 characters max)
                2. Secondary Headline (40 characters max)
                3. Ad Copy (125 characters max)
                4. Call-to-Action
                5. 3-5 ad variations for A/B testing
                
                Make it engaging, benefit-focused, and include urgency/emotion.
            `;

            const completion = await openai.chat.completions.create({
                model: model,
                messages: [{ role: "user", content: prompt }],
                max_tokens: 500
            });

            const generatedContent = completion.choices[0].message.content;
            return this.parseGeneratedContent(generatedContent);
        } catch (error) {
            console.error('Error generating ad copy:', error);
            throw new Error('Failed to generate ad copy');
        }
    }

    /**
     * Parse AI-generated content into structured format
     */
    parseGeneratedContent(content) {
        const lines = content.split('\n').filter(line => line.trim());
        const result = {
            primaryHeadline: '',
            secondaryHeadline: '',
            adCopy: '',
            callToAction: '',
            variations: []
        };

        let currentSection = '';
        let variationIndex = 0;

        for (const line of lines) {
            if (line.includes('Primary Headline:')) {
                currentSection = 'primaryHeadline';
                result.primaryHeadline = line.split(':')[1]?.trim() || '';
            } else if (line.includes('Secondary Headline:')) {
                currentSection = 'secondaryHeadline';
                result.secondaryHeadline = line.split(':')[1]?.trim() || '';
            } else if (line.includes('Ad Copy:')) {
                currentSection = 'adCopy';
                result.adCopy = line.split(':')[1]?.trim() || '';
            } else if (line.includes('Call-to-Action:')) {
                currentSection = 'callToAction';
                result.callToAction = line.split(':')[1]?.trim() || '';
            } else if (line.includes('Variation') || line.includes('variation')) {
                currentSection = 'variation';
                variationIndex++;
                result.variations.push({
                    id: variationIndex,
                    headline: '',
                    copy: '',
                    cta: ''
                });
            } else if (currentSection === 'variation' && result.variations.length > 0) {
                const currentVariation = result.variations[result.variations.length - 1];
                if (line.includes('Headline:')) {
                    currentVariation.headline = line.split(':')[1]?.trim() || '';
                } else if (line.includes('Copy:')) {
                    currentVariation.copy = line.split(':')[1]?.trim() || '';
                } else if (line.includes('CTA:')) {
                    currentVariation.cta = line.split(':')[1]?.trim() || '';
                }
            }
        }

        return result;
    }

    /**
     * Intelligent budget allocation based on performance
     */
    async optimizeBudgetAllocation(coachId, campaignId) {
        try {
            const campaign = await AdCampaign.findOne({ _id: campaignId, coachId });
            if (!campaign) {
                throw new Error('Campaign not found');
            }

            const adSets = await AdSet.find({ campaignId });
            const performanceData = await this.getAdSetPerformance(adSets);

            // Calculate optimal budget distribution
            const totalBudget = campaign.dailyBudget || 100;
            const optimizedAllocation = this.calculateOptimalAllocation(performanceData, totalBudget);

            // Update ad set budgets
            for (const allocation of optimizedAllocation) {
                await AdSet.findByIdAndUpdate(allocation.adSetId, {
                    dailyBudget: allocation.allocatedBudget
                });
            }

            return {
                success: true,
                message: 'Budget allocation optimized',
                allocation: optimizedAllocation
            };
        } catch (error) {
            console.error('Error optimizing budget allocation:', error);
            throw error;
        }
    }

    /**
     * Get performance data for ad sets
     */
    async getAdSetPerformance(adSets) {
        const performanceData = [];

        for (const adSet of adSets) {
            try {
                const insights = await metaAdsService.fetchCampaignInsights(adSet.adSetId);
                const data = insights.data?.[0] || {};

                performanceData.push({
                    adSetId: adSet._id,
                    adSetName: adSet.name,
                    impressions: parseInt(data.impressions) || 0,
                    clicks: parseInt(data.clicks) || 0,
                    spend: parseFloat(data.spend) || 0,
                    ctr: data.ctr ? parseFloat(data.ctr) : 0,
                    cpc: data.cpc ? parseFloat(data.cpc) : 0,
                    roas: data.actions ? this.calculateROAS(data.actions, data.spend) : 0
                });
            } catch (error) {
                console.error(`Error fetching insights for ad set ${adSet.adSetId}:`, error);
            }
        }

        return performanceData;
    }

    /**
     * Calculate ROAS from actions data
     */
    calculateROAS(actions, spend) {
        if (!actions || !spend) return 0;
        
        const purchaseActions = actions.filter(action => 
            action.action_type === 'purchase' || action.action_type === 'offsite_conversion'
        );
        
        const totalRevenue = purchaseActions.reduce((sum, action) => 
            sum + (parseFloat(action.value) || 0), 0
        );
        
        return spend > 0 ? totalRevenue / parseFloat(spend) : 0;
    }

    /**
     * Calculate optimal budget allocation
     */
    calculateOptimalAllocation(performanceData, totalBudget) {
        if (performanceData.length === 0) {
            return [];
        }

        // Calculate performance scores
        const scoredData = performanceData.map(data => ({
            ...data,
            score: this.calculatePerformanceScore(data)
        }));

        // Sort by performance score
        scoredData.sort((a, b) => b.score - a.score);

        // Allocate budget based on performance
        const allocation = [];
        let remainingBudget = totalBudget;

        for (const data of scoredData) {
            const budgetShare = Math.max(0.1, data.score / scoredData.reduce((sum, d) => sum + d.score, 0));
            const allocatedBudget = Math.round(totalBudget * budgetShare * 100) / 100;
            
            allocation.push({
                adSetId: data.adSetId,
                adSetName: data.adSetName,
                performanceScore: data.score,
                allocatedBudget: Math.min(allocatedBudget, remainingBudget)
            });

            remainingBudget -= allocatedBudget;
            if (remainingBudget <= 0) break;
        }

        return allocation;
    }

    /**
     * Calculate performance score based on multiple metrics
     */
    calculatePerformanceScore(data) {
        const ctrScore = Math.min(data.ctr / this.performanceThresholds.ctr, 2);
        const cpcScore = Math.max(0, 1 - (data.cpc / this.performanceThresholds.cpc));
        const roasScore = Math.min(data.roas / this.performanceThresholds.roas, 2);

        return (ctrScore * 0.3 + cpcScore * 0.3 + roasScore * 0.4);
    }

    /**
     * Detect anomalies in campaign performance
     */
    async detectAnomalies(coachId, campaignId) {
        try {
            const campaign = await AdCampaign.findOne({ _id: campaignId, coachId });
            const adSets = await AdSet.find({ campaignId });
            const performanceData = await this.getAdSetPerformance(adSets);

            const anomalies = [];

            for (const data of performanceData) {
                // Check for low CTR
                if (data.ctr < this.performanceThresholds.ctr * 0.5) {
                    anomalies.push({
                        type: 'LOW_CTR',
                        adSetId: data.adSetId,
                        adSetName: data.adSetName,
                        currentValue: data.ctr,
                        threshold: this.performanceThresholds.ctr,
                        severity: 'HIGH',
                        recommendation: 'Consider updating ad creative or targeting'
                    });
                }

                // Check for high CPC
                if (data.cpc > this.performanceThresholds.cpc * 1.5) {
                    anomalies.push({
                        type: 'HIGH_CPC',
                        adSetId: data.adSetId,
                        adSetName: data.adSetName,
                        currentValue: data.cpc,
                        threshold: this.performanceThresholds.cpc,
                        severity: 'MEDIUM',
                        recommendation: 'Review bidding strategy and audience targeting'
                    });
                }

                // Check for low ROAS
                if (data.roas < this.performanceThresholds.roas * 0.7) {
                    anomalies.push({
                        type: 'LOW_ROAS',
                        adSetId: data.adSetId,
                        adSetName: data.adSetName,
                        currentValue: data.roas,
                        threshold: this.performanceThresholds.roas,
                        severity: 'HIGH',
                        recommendation: 'Optimize landing page and offer'
                    });
                }
            }

            return anomalies;
        } catch (error) {
            console.error('Error detecting anomalies:', error);
            throw error;
        }
    }

    /**
     * Generate targeting recommendations
     */
    async generateTargetingRecommendations(coachId, targetAudience, budget) {
        try {
            const apiKey = await getCoachOpenAIKey(coachId);
            const model = await getCoachOpenAIModel(coachId);
            
            const openai = new OpenAI({
                apiKey: apiKey
            });

            const prompt = `
                Generate Facebook ad targeting recommendations for a fitness coach.
                
                Target Audience: ${targetAudience}
                Budget: $${budget} per day
                
                Provide:
                1. Age ranges (3-5 options)
                2. Interest targeting (10-15 interests)
                3. Behavior targeting (5-8 behaviors)
                4. Lookalike audience suggestions
                5. Custom audience ideas
                6. Placement recommendations
                
                Focus on fitness, health, and wellness interests.
            `;

            const completion = await openai.chat.completions.create({
                model: model,
                messages: [{ role: "user", content: prompt }],
                max_tokens: 800
            });

            return this.parseTargetingRecommendations(completion.choices[0].message.content);
        } catch (error) {
            console.error('Error generating targeting recommendations:', error);
            throw new Error('Failed to generate targeting recommendations');
        }
    }

    /**
     * Parse targeting recommendations
     */
    parseTargetingRecommendations(content) {
        const recommendations = {
            ageRanges: [],
            interests: [],
            behaviors: [],
            lookalikeAudiences: [],
            customAudiences: [],
            placements: []
        };

        const lines = content.split('\n');
        let currentSection = '';

        for (const line of lines) {
            const trimmedLine = line.trim();
            if (!trimmedLine) continue;

            if (trimmedLine.includes('Age ranges:') || trimmedLine.includes('Age Ranges:')) {
                currentSection = 'ageRanges';
            } else if (trimmedLine.includes('Interest targeting:') || trimmedLine.includes('Interests:')) {
                currentSection = 'interests';
            } else if (trimmedLine.includes('Behavior targeting:') || trimmedLine.includes('Behaviors:')) {
                currentSection = 'behaviors';
            } else if (trimmedLine.includes('Lookalike audience:') || trimmedLine.includes('Lookalike:')) {
                currentSection = 'lookalikeAudiences';
            } else if (trimmedLine.includes('Custom audience:') || trimmedLine.includes('Custom:')) {
                currentSection = 'customAudiences';
            } else if (trimmedLine.includes('Placement:') || trimmedLine.includes('Placements:')) {
                currentSection = 'placements';
            } else if (trimmedLine.match(/^\d+\./)) {
                const item = trimmedLine.replace(/^\d+\.\s*/, '');
                if (currentSection && recommendations[currentSection]) {
                    recommendations[currentSection].push(item);
                }
            }
        }

        return recommendations;
    }

    /**
     * Auto-optimize campaign based on performance
     */
    async autoOptimizeCampaign(coachId, campaignId) {
        try {
            const anomalies = await this.detectAnomalies(coachId, campaignId);
            
            if (anomalies.length === 0) {
                return { success: true, message: 'No optimization needed' };
            }

            const optimizations = [];

            for (const anomaly of anomalies) {
                switch (anomaly.type) {
                    case 'LOW_CTR':
                        optimizations.push({
                            action: 'UPDATE_CREATIVE',
                            adSetId: anomaly.adSetId,
                            reason: anomaly.recommendation
                        });
                        break;
                    case 'HIGH_CPC':
                        optimizations.push({
                            action: 'ADJUST_BIDDING',
                            adSetId: anomaly.adSetId,
                            reason: anomaly.recommendation
                        });
                        break;
                    case 'LOW_ROAS':
                        optimizations.push({
                            action: 'PAUSE_ADSET',
                            adSetId: anomaly.adSetId,
                            reason: anomaly.recommendation
                        });
                        break;
                }
            }

            return {
                success: true,
                message: 'Campaign optimization completed',
                optimizations,
                anomalies
            };
        } catch (error) {
            console.error('Error auto-optimizing campaign:', error);
            throw error;
        }
    }

    /**
     * Build simple background image prompt (no text, no poster elements)
     */
    buildSimpleBackgroundPrompt(posterRequirements) {
        const {
            heroImage,
            coachName,
            niche,
            offer,
            targetAudience,
            style,
            colorScheme,
            additionalElements
        } = posterRequirements;

        // Define style-specific background elements
        const styleElements = {
            'modern': 'clean, minimalist background, subtle geometric patterns, contemporary aesthetic',
            'energetic': 'dynamic background, gradient transitions, high energy feel, vibrant colors',
            'professional': 'sophisticated background, subtle textures, premium feel, business-like',
            'motivational': 'inspirational background, uplifting gradients, aspirational feel, emotional appeal',
            'minimalist': 'simple background, lots of clean space, focused composition, elegant feel'
        };

        // Define color scheme specifics
        const colorDetails = {
            'blue_green': 'professional blue tones with energizing green accents, trust and growth',
            'red_orange': 'high-energy red and orange palette, urgency and motivation',
            'purple_pink': 'creative purple with vibrant pink, innovation and transformation',
            'earth_tones': 'natural browns and greens, organic and authentic feel',
            'bright_colors': 'vibrant, eye-catching colors, fun and engaging'
        };

        // Define target audience specific background elements
        const audienceElements = {
            'weight_loss': 'transformation-focused background, progress-oriented gradients, motivational feel',
            'muscle_building': 'strength-focused background, power-oriented gradients, achievement feel',
            'general_fitness': 'versatile fitness background, balanced gradients, universal appeal',
            'nutrition': 'wellness-focused background, clean gradients, vitality feel',
            'sports': 'athletic background, performance-oriented gradients, competitive feel',
            'recovery': 'healing-focused background, gentle gradients, wellness feel'
        };

        // Build the simple background prompt
        const prompt = `
            Create a simple, clean background image for a fitness marketing poster with these EXACT specifications:

            BACKGROUND STYLE: ${styleElements[style || 'modern']}
            COLOR PALETTE: ${colorDetails[colorScheme || 'blue_green']}
            TARGET AUDIENCE: ${audienceElements[targetAudience || 'general_fitness']}

            VISUAL REQUIREMENTS:
            - Simple, uncluttered background ONLY (no text, no images, no poster elements)
            - Full 1024x1024 image that serves as a clean canvas
            - Subtle gradients or textures that won't interfere with text overlay
            - Professional, high-quality background suitable for fitness marketing
            - Instagram-optimized (1080x1080 square format)
            - Clean, minimal design with strategic areas for text placement

            COMPOSITION:
            - Pure background image with no embedded elements
            - Subtle depth and dimension through gradients or textures
            - Areas of contrast for optimal text readability
            - Professional studio lighting feel
            - No busy patterns or distracting elements

            TECHNICAL SPECIFICATIONS:
            - Resolution: 1024x1024 pixels
            - Quality: Ultra-HD, professional photography standard
            - Style: Photorealistic background, not illustration
            - Mood: Professional, trustworthy, motivational
            - Purpose: Clean canvas for text overlay

            AVOID:
            - Any text or written words
            - Poster-like elements or frames
            - Busy patterns or complex designs
            - Embedded images or graphics
            - Cluttered or distracting elements

            FINAL RESULT:
            A clean, simple background image that looks like a professional fitness brand's marketing canvas. The background should be so clean and simple that it's perfect for adding text overlay without any visual conflicts.
        `;

        return prompt.trim();
    }

    /**
     * Generate text content and positioning instructions for the poster
     */
    async generatePosterTextContent(coachId, posterRequirements) {
        try {
            const apiKey = await getCoachOpenAIKey(coachId);
            const model = await getCoachOpenAIModel(coachId);
            
            const openai = new OpenAI({
                apiKey: apiKey
            });

            const prompt = `
                You are a professional fitness marketing copywriter. Create compelling text content and positioning instructions for a fitness marketing poster.

                COACH INFORMATION:
                - Name: ${posterRequirements.coachName}
                - Specialization: ${posterRequirements.niche}
                - Program: ${posterRequirements.offer}
                - Target Audience: ${posterRequirements.targetAudience}

                REQUIREMENTS:
                - Create a main headline (H1)
                - Create a compelling subheadline (H2)
                - Create 2-3 key benefit points
                - Create a call-to-action (CTA)
                - Provide exact positioning instructions for each text element
                - Ensure text hierarchy and readability

                OUTPUT FORMAT:
                Return a JSON object with this structure:
                {
                    "headline": "Main attention-grabbing headline",
                    "subheadline": "Supporting compelling subheadline",
                    "benefits": ["Benefit 1", "Benefit 2", "Benefit 3"],
                    "cta": "Call to action text",
                    "positioning": {
                        "headline": { "x": "center", "y": "top", "fontSize": "large", "color": "white" },
                        "subheadline": { "x": "center", "y": "below_headline", "fontSize": "medium", "color": "light" },
                        "benefits": { "x": "left", "y": "center", "fontSize": "small", "color": "white" },
                        "cta": { "x": "center", "y": "bottom", "fontSize": "large", "color": "accent" }
                    },
                    "designNotes": "Specific design recommendations for text overlay"
                }

                Make the content highly engaging and conversion-focused for fitness marketing.
            `;

            const completion = await openai.chat.completions.create({
                model: model,
                messages: [
                    {
                        role: "system",
                        content: "You are a professional fitness marketing copywriter. Always respond with valid JSON only."
                    },
                    {
                        role: "user",
                        content: prompt
                    }
                ],
                temperature: 0.7,
                max_tokens: 500
            });

            const textContent = JSON.parse(completion.choices[0].message.content);
            
            return {
                success: true,
                textContent,
                metadata: {
                    coachId,
                    coachName: posterRequirements.coachName,
                    niche: posterRequirements.niche,
                    offer: posterRequirements.offer,
                    targetAudience: posterRequirements.targetAudience,
                    generatedAt: new Date(),
                    model: 'gpt-4'
                }
            };
        } catch (error) {
            console.error('Error generating poster text content:', error);
            throw new Error('Failed to generate poster text content');
        }
    }

    /**
     * Generate simple background image for poster
     */
    async generateSimpleBackground(coachId, posterRequirements) {
        try {
            const prompt = this.buildSimpleBackgroundPrompt(posterRequirements);
            
            const imageResponse = await openai.images.generate({
                model: "dall-e-3",
                prompt: prompt,
                size: "1024x1024",
                quality: "hd",
                n: 1,
                style: "vivid",
            });

            // Generate text content and positioning instructions
            const textContentResult = await this.generatePosterTextContent(coachId, posterRequirements);

            return {
                success: true,
                backgroundImage: imageResponse.data[0].url,
                textContent: textContentResult.textContent,
                metadata: {
                    coachId,
                    coachName: posterRequirements.coachName,
                    niche: posterRequirements.niche,
                    offer: posterRequirements.offer,
                    targetAudience: posterRequirements.targetAudience,
                    generatedAt: new Date(),
                    model: 'dall-e-3',
                    prompt: prompt
                }
            };
        } catch (error) {
            console.error('Error generating simple background:', error);
            throw new Error('Failed to generate simple background');
        }
    }

    /**
     * Generate multiple background variations with text content
     */
    async generateBackgroundVariations(coachId, posterRequirements, variationCount = 3) {
        try {
            const variations = [];
            
            for (let i = 0; i < variationCount; i++) {
                // Slightly modify the requirements for each variation
                const modifiedRequirements = {
                    ...posterRequirements,
                    style: this.getVariationStyle(posterRequirements.style, i),
                    colorScheme: this.getVariationColor(posterRequirements.colorScheme, i)
                };
                
                const result = await this.generateSimpleBackground(coachId, modifiedRequirements);
                
                variations.push({
                    variation: i + 1,
                    backgroundImage: result.backgroundImage,
                    textContent: result.textContent,
                    style: modifiedRequirements.style,
                    colorScheme: modifiedRequirements.colorScheme
                });
            }

            return {
                success: true,
                variations,
                totalVariations: variations.length,
                metadata: {
                    coachId,
                    coachName: posterRequirements.coachName,
                    niche: posterRequirements.niche,
                    offer: posterRequirements.offer,
                    targetAudience: posterRequirements.targetAudience,
                    generatedAt: new Date(),
                    model: 'dall-e-3'
                }
            };
        } catch (error) {
            console.error('Error generating background variations:', error);
            throw new Error('Failed to generate background variations');
        }
    }

    /**
     * Get variation style for multiple poster generation
     */
    getVariationStyle(baseStyle, variationIndex) {
        const styleVariations = {
            'modern': ['modern', 'minimalist', 'professional'],
            'energetic': ['energetic', 'dynamic', 'motivational'],
            'professional': ['professional', 'corporate', 'sophisticated'],
            'motivational': ['motivational', 'inspirational', 'energetic'],
            'minimalist': ['minimalist', 'clean', 'modern']
        };
        
        const variations = styleVariations[baseStyle] || ['modern', 'professional', 'energetic'];
        return variations[variationIndex % variations.length];
    }

    /**
     * Get variation color for multiple poster generation
     */
    getVariationColor(baseColor, variationIndex) {
        const colorVariations = {
            'blue_green': ['blue_green', 'blue_purple', 'green_teal'],
            'red_orange': ['red_orange', 'red_pink', 'orange_yellow'],
            'purple_pink': ['purple_pink', 'purple_blue', 'pink_red'],
            'earth_tones': ['earth_tones', 'warm_neutrals', 'natural_greens'],
            'bright_colors': ['bright_colors', 'vibrant_primary', 'high_contrast']
        };
        
        const variations = colorVariations[baseColor] || ['blue_green', 'red_orange', 'purple_pink'];
        return variations[variationIndex % variations.length];
    }

    /**
     * Generate AI-powered marketing headlines
     */
    async generateMarketingHeadlines(coachId, headlineRequirements) {
        try {
            const apiKey = await getCoachOpenAIKey(coachId);
            const model = await getCoachOpenAIModel(coachId);
            
            const openai = new OpenAI({
                apiKey: apiKey
            });

            const {
                coachName,
                niche,
                offer,
                targetAudience,
                tone,
                headlineCount = 5,
                includeHashtags = true
            } = headlineRequirements;

            const prompt = `
                Generate ${headlineCount} compelling marketing headlines for a fitness coach's social media posts.
                
                Coach: ${coachName}
                Niche: ${niche}
                Offer: ${offer}
                Target Audience: ${targetAudience}
                Tone: ${tone || 'Motivational and professional'}
                
                Requirements:
                - Each headline should be engaging and conversion-focused
                - Include emotional triggers and urgency
                - Make them suitable for Instagram/Facebook
                - Focus on benefits and results
                - Use power words and action verbs
                ${includeHashtags ? '- Include 3-5 relevant hashtags for each headline' : ''}
                
                Format each headline as:
                Headline: [The headline text]
                ${includeHashtags ? 'Hashtags: [hashtag1 #hashtag2 #hashtag3]' : ''}
                ---
            `;

            const completion = await openai.chat.completions.create({
                model: model,
                messages: [{ role: "user", content: prompt }],
                max_tokens: 800
            });

            const generatedContent = completion.choices[0].message.content;
            return this.parseMarketingHeadlines(generatedContent, includeHashtags);
        } catch (error) {
            console.error('Error generating marketing headlines:', error);
            throw new Error('Failed to generate marketing headlines');
        }
    }

    /**
     * Parse generated marketing headlines
     */
    parseMarketingHeadlines(content, includeHashtags) {
        const headlines = [];
        const sections = content.split('---').filter(section => section.trim());

        for (const section of sections) {
            const lines = section.split('\n').filter(line => line.trim());
            const headline = {
                id: headlines.length + 1,
                headline: '',
                hashtags: []
            };

            for (const line of lines) {
                if (line.includes('Headline:')) {
                    headline.headline = line.split(':')[1]?.trim() || '';
                } else if (includeHashtags && line.includes('Hashtags:')) {
                    const hashtagText = line.split(':')[1]?.trim() || '';
                    headline.hashtags = hashtagText.split(' ').filter(tag => tag.startsWith('#'));
                }
            }

            if (headline.headline) {
                headlines.push(headline);
            }
        }

        return {
            success: true,
            headlines,
            totalHeadlines: headlines.length
        };
    }

    /**
     * Generate complete social media post content
     */
    async generateSocialMediaPost(coachId, postRequirements) {
        try {
            const apiKey = await getCoachOpenAIKey(coachId);
            const model = await getCoachOpenAIModel(coachId);
            
            const openai = new OpenAI({
                apiKey: apiKey
            });

            const {
                coachName,
                niche,
                offer,
                targetAudience,
                postType = 'motivational',
                includeCallToAction = true,
                tone = 'professional'
            } = postRequirements;

            const prompt = `
                Generate a complete social media post for a fitness coach.
                
                Coach: ${coachName}
                Niche: ${niche}
                Offer: ${offer}
                Target Audience: ${targetAudience}
                Post Type: ${postType}
                Tone: ${tone}
                Include CTA: ${includeCallToAction}
                
                Generate:
                1. Caption (2-3 paragraphs, engaging and informative)
                2. Call-to-Action (if requested)
                3. 5-8 relevant hashtags
                4. Emoji suggestions for visual appeal
                
                Make it:
                - Engaging and authentic
                - Educational or motivational
                - Suitable for Instagram/Facebook
                - Include personal touch
                - Drive engagement and conversions
            `;

            const completion = await openai.chat.completions.create({
                model: model,
                messages: [{ role: "user", content: prompt }],
                max_tokens: 600
            });

            const generatedContent = completion.choices[0].message.content;
            return this.parseSocialMediaPost(generatedContent);
        } catch (error) {
            console.error('Error generating social media post:', error);
            throw new Error('Failed to generate social media post');
        }
    }

    /**
     * Parse generated social media post
     */
    parseSocialMediaPost(content) {
        const lines = content.split('\n').filter(line => line.trim());
        const post = {
            caption: '',
            callToAction: '',
            hashtags: [],
            emojis: [],
            fullPost: content
        };

        let currentSection = '';

        for (const line of lines) {
            if (line.includes('Caption:') || line.includes('1.')) {
                currentSection = 'caption';
                post.caption = line.split(':')[1]?.trim() || '';
            } else if (line.includes('Call-to-Action:') || line.includes('2.')) {
                currentSection = 'cta';
                post.callToAction = line.split(':')[1]?.trim() || '';
            } else if (line.includes('Hashtags:') || line.includes('3.')) {
                currentSection = 'hashtags';
                const hashtagText = line.split(':')[1]?.trim() || '';
                post.hashtags = hashtagText.split(' ').filter(tag => tag.startsWith('#'));
            } else if (line.includes('Emoji suggestions:') || line.includes('4.')) {
                currentSection = 'emojis';
                const emojiText = line.split(':')[1]?.trim() || '';
                post.emojis = emojiText.split(' ').filter(emoji => /[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/u.test(emoji));
            } else if (currentSection === 'caption' && post.caption) {
                post.caption += ' ' + line.trim();
            } else if (currentSection === 'cta' && post.callToAction) {
                post.callToAction += ' ' + line.trim();
            }
        }

        return {
            success: true,
            post
        };
    }

    /**
     * Upload generated content to Instagram via Meta Ads
     */
    async uploadToInstagram(coachId, coachMetaAccountId, uploadData) {
        try {
            const {
                imageUrl,
                caption,
                hashtags,
                callToAction,
                targetAudience,
                budget,
                duration
            } = uploadData;

            // First, upload the image to Meta
            const imageUploadResult = await metaAdsService.uploadImage(imageUrl);
            
            if (!imageUploadResult.images || !imageUploadResult.images[0]) {
                throw new Error('Failed to upload image to Meta');
            }

            const imageHash = imageUploadResult.images[0].hash;

            // Create Instagram Story/Post campaign
            const campaignData = {
                name: `Instagram Post - ${new Date().toLocaleDateString()}`,
                objective: 'OUTCOME_ENGAGEMENT',
                status: 'PAUSED', // Start paused for review
                special_ad_categories: [],
                targeting: {
                    age_min: 18,
                    age_max: 65,
                    geo_locations: {
                        countries: ['US'], // Default, can be customized
                        location_types: ['home']
                    },
                    interests: this.getFitnessInterests(targetAudience),
                    behaviors: this.getFitnessBehaviors(targetAudience)
                }
            };

            // Create campaign
            const campaign = await metaAdsService.createCampaign(coachMetaAccountId, campaignData);
            
            if (!campaign.id) {
                throw new Error('Failed to create Instagram campaign');
            }

            // Create ad set
            const adSetData = {
                name: `Instagram Ad Set - ${new Date().toLocaleDateString()}`,
                campaign_id: campaign.id,
                daily_budget: budget || 50,
                billing_event: 'IMPRESSIONS',
                optimization_goal: 'POST_ENGAGEMENT',
                targeting: campaignData.targeting,
                start_time: new Date().toISOString(),
                end_time: duration ? new Date(Date.now() + duration * 24 * 60 * 60 * 1000).toISOString() : undefined
            };

            const adSet = await metaAdsService.createAdSet(campaign.id, adSetData);
            
            if (!adSet.id) {
                throw new Error('Failed to create Instagram ad set');
            }

            // Create ad creative
            const creativeData = {
                name: `Instagram Creative - ${new Date().toLocaleDateString()}`,
                object_story_spec: {
                    instagram_story: {
                        image_hash: imageHash,
                        link: process.env.COACH_WEBSITE_URL || 'https://example.com',
                        caption: `${caption}\n\n${callToAction}\n\n${hashtags.join(' ')}`
                    }
                }
            };

            const creative = await metaAdsService.createAdCreative(campaign.id, creativeData);
            
            if (!creative.id) {
                throw new Error('Failed to create Instagram ad creative');
            }

            // Create the actual ad
            const adData = {
                name: `Instagram Ad - ${new Date().toLocaleDateString()}`,
                adset_id: adSet.id,
                creative: { creative_id: creative.id },
                status: 'PAUSED' // Start paused for review
            };

            const ad = await metaAdsService.createAd(campaign.id, adData);

            return {
                success: true,
                message: 'Instagram post uploaded successfully',
                data: {
                    campaignId: campaign.id,
                    adSetId: adSet.id,
                    creativeId: creative.id,
                    adId: ad.id,
                    imageHash,
                    imageUrl,
                    caption,
                    hashtags,
                    callToAction,
                    status: 'PAUSED',
                    reviewRequired: true
                }
            };
        } catch (error) {
            console.error('Error uploading to Instagram:', error);
            throw new Error(`Failed to upload to Instagram: ${error.message}`);
        }
    }

    /**
     * Get fitness-related interests for targeting
     */
    getFitnessInterests(targetAudience) {
        const baseInterests = [
            'Fitness',
            'Health and wellness',
            'Nutrition',
            'Weight training',
            'Cardio fitness',
            'Yoga',
            'Personal training'
        ];

        if (targetAudience === 'weight_loss') {
            baseInterests.push('Weight loss', 'Dieting', 'Healthy eating');
        } else if (targetAudience === 'muscle_gain') {
            baseInterests.push('Bodybuilding', 'Strength training', 'Muscle building');
        } else if (targetAudience === 'general_health') {
            baseInterests.push('Healthy lifestyle', 'Wellness', 'Self-care');
        }

        return baseInterests;
    }

    /**
     * Get fitness-related behaviors for targeting
     */
    getFitnessBehaviors(targetAudience) {
        const behaviors = [
            'Frequent travelers',
            'Small business owners',
            'Frequent online shoppers',
            'Mobile device users'
        ];

        if (targetAudience === 'busy_professionals') {
            behaviors.push('Business travelers', 'High income earners');
        } else if (targetAudience === 'students') {
            behaviors.push('College students', 'Recent graduates');
        }

        return behaviors;
    }

    /**
     * Generate complete social media campaign package
     */
    async generateSocialMediaCampaign(coachId, campaignRequirements) {
        try {
            const {
                coachName,
                niche,
                offer,
                targetAudience,
                campaignDuration = 7,
                dailyBudget = 50,
                postFrequency = 1,
                coachMetaAccountId
            } = campaignRequirements;

            const campaignPackage = {
                coachId,
                coachName,
                niche,
                offer,
                targetAudience,
                duration: campaignDuration,
                dailyBudget,
                postFrequency,
                generatedAt: new Date(),
                posts: []
            };

            // Generate multiple posts for the campaign
            for (let i = 0; i < campaignDuration * postFrequency; i++) {
                try {
                    // Generate poster image
                    const posterResult = await this.generatePosterImage(coachId, {
                        coachName,
                        niche,
                        offer,
                        targetAudience,
                        style: i % 2 === 0 ? 'Motivational' : 'Educational',
                        colorScheme: i % 3 === 0 ? 'Energetic' : i % 3 === 1 ? 'Professional' : 'Warm'
                    });

                    // Generate marketing headlines
                    const headlinesResult = await this.generateMarketingHeadlines(coachId, {
                        coachName,
                        niche,
                        offer,
                        targetAudience,
                        tone: i % 2 === 0 ? 'Motivational' : 'Professional',
                        headlineCount: 3
                    });

                    // Generate social media post content
                    const postResult = await this.generateSocialMediaPost(coachId, {
                        coachName,
                        niche,
                        offer,
                        targetAudience,
                        postType: i % 3 === 0 ? 'motivational' : i % 3 === 1 ? 'educational' : 'testimonial'
                    });

                    campaignPackage.posts.push({
                        postNumber: i + 1,
                        scheduledDate: new Date(Date.now() + i * 24 * 60 * 60 * 1000 / postFrequency),
                        poster: posterResult,
                        headlines: headlinesResult,
                        postContent: postResult,
                        uploadStatus: 'pending'
                    });
                } catch (error) {
                    console.error(`Error generating post ${i + 1}:`, error);
                    campaignPackage.posts.push({
                        postNumber: i + 1,
                        error: error.message,
                        uploadStatus: 'failed'
                    });
                }
            }

            return {
                success: true,
                message: 'Social media campaign package generated successfully',
                data: campaignPackage
            };
        } catch (error) {
            console.error('Error generating social media campaign:', error);
            throw new Error('Failed to generate social media campaign package');
        }
    }
}

module.exports = new AIAdsAgent();
