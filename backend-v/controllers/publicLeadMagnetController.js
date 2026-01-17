const asyncHandler = require('../middleware/async');
const LeadMagnetInteraction = require('../schema/LeadMagnetInteraction');
const Lead = require('../schema/Lead');
const User = require('../schema/User');
const leadMagnetsService = require('../services/leadMagnetsService');
const path = require('path');
const fs = require('fs').promises;
const { v4: uuidv4 } = require('uuid');

// Helper function to extract user info from request
const extractUserInfo = (req) => {
    return {
        ipAddress: req.ip || req.connection.remoteAddress,
        userAgent: req.get('User-Agent') || '',
        referrer: req.get('Referer') || '',
        utmSource: req.query.utm_source || '',
        utmMedium: req.query.utm_medium || '',
        utmCampaign: req.query.utm_campaign || '',
        utmTerm: req.query.utm_term || '',
        utmContent: req.query.utm_content || ''
    };
};

// Helper function to extract device info
const extractDeviceInfo = (userAgent) => {
    const device = /Mobile|Android|iPhone|iPad/.test(userAgent) ? 'mobile' : 'desktop';
    const browser = userAgent.includes('Chrome') ? 'Chrome' : 
                   userAgent.includes('Firefox') ? 'Firefox' : 
                   userAgent.includes('Safari') ? 'Safari' : 'Unknown';
    const os = userAgent.includes('Windows') ? 'Windows' :
               userAgent.includes('Mac') ? 'macOS' :
               userAgent.includes('Linux') ? 'Linux' :
               userAgent.includes('Android') ? 'Android' :
               userAgent.includes('iOS') ? 'iOS' : 'Unknown';
    
    return { device, browser, os };
};

// @desc    Serve lead magnet landing page
// @route   GET /lead-magnets/:magnetType/:coachId
// @access  Public
exports.serveMagnetPage = asyncHandler(async (req, res) => {
    const { magnetType, coachId } = req.params;
    const { leadId, preview = false } = req.query;
    
    // Validate coach exists
    const coach = await User.findById(coachId);
    if (!coach) {
        return res.status(404).send(`
            <html>
                <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
                    <h1>Coach Not Found</h1>
                    <p>The coach you're looking for doesn't exist.</p>
                </body>
            </html>
        `);
    }
    
    // Validate magnet type
    const availableMagnets = leadMagnetsService.availableLeadMagnets;
    if (!availableMagnets[magnetType]) {
        return res.status(404).send(`
            <html>
                <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
                    <h1>Lead Magnet Not Found</h1>
                    <p>The lead magnet you're looking for doesn't exist.</p>
                </body>
            </html>
        `);
    }
    
    // Create interaction tracking record (unless preview mode)
    let interactionId = null;
    if (!preview) {
        const sessionId = req.session?.id || uuidv4();
        const userInfo = extractUserInfo(req);
        const deviceInfo = extractDeviceInfo(userInfo.userAgent);
        
        interactionId = uuidv4();
        
        const interaction = new LeadMagnetInteraction({
            interactionId,
            coachId,
            leadId: leadId || null,
            magnetType,
            magnetName: availableMagnets[magnetType].name,
            userInfo,
            deviceInfo,
            sessionId,
            interactionData: {
                initialView: true,
                viewedAt: new Date()
            }
        });
        
        await interaction.save();
    }
    
    // Map magnet types to HTML file names
    const magnetFileMap = {
        'ai_diet_planner': 'ai-diet-planner.html',
        'bmi_calculator': 'bmi-calculator.html',
        'fitness_ebook': 'fitness-ebook.html',
        'meal_planner': 'meal-planner.html',
        'workout_calculator': 'workout-calculator.html',
        'stress_assessment': 'stress-assessment.html'
    };
    
    // Try to serve static HTML file first
    const htmlFileName = magnetFileMap[magnetType];
    if (htmlFileName) {
        try {
            const htmlPath = path.join(__dirname, '../public/lead-magnets', htmlFileName);
            const htmlContent = await fs.readFile(htmlPath, 'utf8');
            
            // Inject coach ID into the HTML for API calls
            const modifiedHtml = htmlContent.replace(
                /const coachId = .*?;/g,
                `const coachId = '${coachId}';`
            );
            
            res.set('Content-Type', 'text/html');
            return res.send(modifiedHtml);
        } catch (error) {
            console.log(`Static HTML not found for ${magnetType}, using dynamic generation`);
        }
    }
    
    // Fallback to dynamic HTML generation
    const magnetHtml = await generateMagnetHtml(magnetType, coach, interactionId, leadId);
    
    res.send(magnetHtml);
});

// @desc    Process lead magnet form submission
// @route   POST /lead-magnets/:magnetType/submit
// @access  Public
exports.submitMagnetForm = asyncHandler(async (req, res) => {
    const { magnetType } = req.params;
    const { interactionId, coachId, leadId, formData } = req.body;
    
    if (!interactionId || !coachId) {
        return res.status(400).json({
            success: false,
            message: 'Missing required parameters'
        });
    }
    
    // Find interaction record
    const interaction = await LeadMagnetInteraction.findOne({ interactionId });
    if (!interaction) {
        return res.status(404).json({
            success: false,
            message: 'Interaction not found'
        });
    }
    
    // Process the form based on magnet type
    let results = {};
    let leadData = {};
    
    switch (magnetType) {
        case 'bmi_calculator':
            results = await leadMagnetsService.calculateBMIAndRecommendations(
                formData.weight,
                formData.height,
                formData.age,
                formData.gender,
                formData.activityLevel
            );
            leadData = {
                name: formData.name,
                email: formData.email,
                phone: formData.phone
            };
            break;
            
        case 'ai_diet_planner':
            if (leadId) {
                results = await leadMagnetsService.generateAIDietPlan(
                    coachId,
                    leadId,
                    formData
                );
            } else {
                results = { message: 'Diet plan will be sent to your email' };
            }
            leadData = {
                name: formData.name,
                email: formData.email,
                phone: formData.phone
            };
            break;
            
        case 'workout_calculator':
            results = leadMagnetsService.calculateWorkoutMetrics(
                formData.age,
                formData.weight,
                formData.height,
                formData.gender,
                formData.activityLevel,
                formData.exerciseData
            );
            leadData = {
                name: formData.name,
                email: formData.email,
                phone: formData.phone
            };
            break;
            
        case 'meal_planner':
            results = await generateMealPlan(formData);
            leadData = {
                name: formData.name,
                email: formData.email,
                phone: formData.phone
            };
            break;
            
        case 'fitness_ebook':
            results = await leadMagnetsService.generateEbookContent(
                formData.ebookType,
                formData
            );
            leadData = {
                name: formData.name,
                email: formData.email,
                phone: formData.phone
            };
            break;
            
        case 'sleep_analyzer':
            results = await leadMagnetsService.analyzeSleepQuality(formData.sleepData);
            leadData = {
                name: formData.name,
                email: formData.email,
                phone: formData.phone
            };
            break;
            
        case 'stress_assessment':
            results = await leadMagnetsService.assessStressLevel(formData.stressResponses);
            leadData = {
                name: formData.name,
                email: formData.email,
                phone: formData.phone
            };
            break;
            
        default:
            results = { message: 'Form submitted successfully' };
            leadData = {
                name: formData.name,
                email: formData.email,
                phone: formData.phone
            };
    }
    
    // Update interaction with form data and results
    interaction.interactionData = { ...interaction.interactionData, formData };
    interaction.results = results;
    interaction.userInfo.name = leadData.name;
    interaction.userInfo.email = leadData.email;
    interaction.userInfo.phone = leadData.phone;
    await interaction.updateEngagement('form_submit');
    
    // Create or update lead if contact info provided
    let lead = null;
    if (leadData.email || leadData.phone) {
        const leadQuery = leadData.email ? 
            { email: leadData.email } : 
            { phone: leadData.phone };
        
        lead = await Lead.findOneAndUpdate(
            { ...leadQuery, coachId },
            {
                ...leadData,
                coachId,
                source: 'Lead Magnet',
                leadTemperature: 'Warm',
                status: 'New',
                $push: {
                    leadMagnetInteractions: {
                        type: magnetType,
                        data: formData,
                        timestamp: new Date(),
                        conversion: false
                    }
                }
            },
            { 
                upsert: true, 
                new: true,
                setDefaultsOnInsert: true
            }
        );
        
        // Update interaction with lead ID
        interaction.leadId = lead._id;
        await interaction.updateEngagement('lead_created');
        await interaction.save();
    }
    
    res.json({
        success: true,
        data: {
            results,
            leadId: lead?._id,
            downloadUrl: results.downloadUrl || null,
            nextSteps: getNextSteps(magnetType, results)
        }
    });
});

// @desc    Track page interactions (AJAX endpoint)
// @route   POST /lead-magnets/track
// @access  Public
exports.trackInteraction = asyncHandler(async (req, res) => {
    const { interactionId, action, data } = req.body;
    
    if (!interactionId || !action) {
        return res.status(400).json({
            success: false,
            message: 'Missing required parameters'
        });
    }
    
    const interaction = await LeadMagnetInteraction.findOne({ interactionId });
    if (!interaction) {
        return res.status(404).json({
            success: false,
            message: 'Interaction not found'
        });
    }
    
    await interaction.updateEngagement(action, data);
    
    res.json({
        success: true,
        message: 'Interaction tracked successfully'
    });
});

// @desc    Get lead magnet analytics for coach
// @route   GET /lead-magnets/analytics/:coachId
// @access  Private (Coach)
exports.getMagnetAnalytics = asyncHandler(async (req, res) => {
    const { coachId } = req.params;
    const { timeRange = 30, magnetType } = req.query;
    
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(timeRange));
    
    let query = {
        coachId,
        createdAt: { $gte: startDate }
    };
    
    if (magnetType) {
        query.magnetType = magnetType;
    }
    
    // Get detailed analytics
    const analytics = await LeadMagnetInteraction.aggregate([
        { $match: query },
        {
            $group: {
                _id: '$magnetType',
                totalViews: { $sum: 1 },
                uniqueVisitors: { $addToSet: '$userInfo.ipAddress' },
                totalPageViews: { $sum: '$pageViews' },
                totalTimeSpent: { $sum: '$timeSpent' },
                formSubmissions: { $sum: '$engagement.formSubmissions' },
                conversions: {
                    $sum: {
                        $cond: [
                            { $in: ['$conversion.status', ['converted', 'lead_created']] },
                            1,
                            0
                        ]
                    }
                },
                downloads: { $sum: '$engagement.downloads' },
                shares: { $sum: '$engagement.shares' },
                avgTimeSpent: { $avg: '$timeSpent' },
                conversionRate: {
                    $multiply: [
                        {
                            $divide: [
                                {
                                    $sum: {
                                        $cond: [
                                            { $in: ['$conversion.status', ['converted', 'lead_created']] },
                                            1,
                                            0
                                        ]
                                    }
                                },
                                { $sum: 1 }
                            ]
                        },
                        100
                    ]
                }
            }
        },
        {
            $addFields: {
                uniqueVisitorCount: { $size: '$uniqueVisitors' }
            }
        },
        {
            $project: {
                uniqueVisitors: 0
            }
        },
        {
            $sort: { totalViews: -1 }
        }
    ]);
    
    // Get daily breakdown
    const dailyBreakdown = await LeadMagnetInteraction.aggregate([
        { $match: query },
        {
            $group: {
                _id: {
                    date: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
                    magnetType: '$magnetType'
                },
                views: { $sum: 1 },
                conversions: {
                    $sum: {
                        $cond: [
                            { $in: ['$conversion.status', ['converted', 'lead_created']] },
                            1,
                            0
                        ]
                    }
                }
            }
        },
        {
            $sort: { '_id.date': 1 }
        }
    ]);
    
    res.json({
        success: true,
        data: {
            summary: analytics,
            dailyBreakdown,
            timeRange: timeRange,
            totalMagnets: analytics.length
        }
    });
});

// @desc    Generate shareable URL for lead magnet
// @route   GET /lead-magnets/generate-url/:magnetType/:coachId
// @access  Private (Coach)
exports.generateShareableUrl = asyncHandler(async (req, res) => {
    const { magnetType, coachId } = req.params;
    const { campaign, medium, source, leadId } = req.query;
    
    const baseUrl = process.env.PUBLIC_URL || 'http://localhost:8080';
    let url = `${baseUrl}/lead-magnets/${magnetType}/${coachId}`;
    
    const queryParams = [];
    if (leadId) queryParams.push(`leadId=${leadId}`);
    if (campaign) queryParams.push(`utm_campaign=${encodeURIComponent(campaign)}`);
    if (medium) queryParams.push(`utm_medium=${encodeURIComponent(medium)}`);
    if (source) queryParams.push(`utm_source=${encodeURIComponent(source)}`);
    
    if (queryParams.length > 0) {
        url += '?' + queryParams.join('&');
    }
    
    res.json({
        success: true,
        data: {
            url,
            shortUrl: await generateShortUrl(url), // Implement if needed
            qrCode: await generateQRCode(url) // Implement if needed
        }
    });
});

// Helper function to generate magnet-specific HTML
const generateMagnetHtml = async (magnetType, coach, interactionId, leadId) => {
    const magnetInfo = leadMagnetsService.availableLeadMagnets[magnetType];
    const coachName = coach.name || 'Fitness Coach';
    const coachBrand = coach.businessName || `${coachName}'s Fitness`;
    
    const baseTemplate = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${magnetInfo.name} - ${coachBrand}</title>
        <meta name="description" content="${magnetInfo.description}">
        <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
        <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet">
        <style>
            .gradient-bg { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }
            .animate-pulse-slow { animation: pulse 3s infinite; }
        </style>
    </head>
    <body class="bg-gray-50">
        <!-- Header -->
        <nav class="gradient-bg text-white p-4">
            <div class="container mx-auto flex justify-between items-center">
                <h1 class="text-xl font-bold">${coachBrand}</h1>
                <div class="text-sm">Free Tool</div>
            </div>
        </nav>
        
        <!-- Main Content -->
        <div class="container mx-auto px-4 py-8">
            ${getMagnetSpecificContent(magnetType, coachName, interactionId, leadId)}
        </div>
        
        <!-- Footer -->
        <footer class="bg-gray-800 text-white p-8 mt-16">
            <div class="container mx-auto text-center">
                <h3 class="text-xl font-bold mb-4">Ready to Transform Your Health?</h3>
                <p class="mb-4">Get personalized coaching from ${coachName}</p>
                <button class="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold transition duration-300">
                    Book Your Free Consultation
                </button>
            </div>
        </footer>
        
        <!-- Tracking Script -->
        <script>
            const interactionId = '${interactionId}';
            const startTime = Date.now();
            
            // Track time spent
            window.addEventListener('beforeunload', function() {
                const timeSpent = Math.floor((Date.now() - startTime) / 1000);
                navigator.sendBeacon('/api/lead-magnets/track', JSON.stringify({
                    interactionId,
                    action: 'time_spent',
                    data: { seconds: timeSpent }
                }));
            });
            
            // Track form submissions
            function trackFormSubmit(formData) {
                fetch('/api/lead-magnets/${magnetType}/submit', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        interactionId,
                        coachId: '${coach._id}',
                        leadId: '${leadId || ''}',
                        formData
                    })
                })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        showResults(data.data);
                    }
                })
                .catch(error => console.error('Error:', error));
            }
            
            function showResults(data) {
                const resultsDiv = document.getElementById('results');
                resultsDiv.innerHTML = '<div class="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">Results generated successfully!</div>';
                resultsDiv.style.display = 'block';
            }
        </script>
    </body>
    </html>
    `;
    
    return baseTemplate;
};

// Helper function to get magnet-specific content
const getMagnetSpecificContent = (magnetType, coachName, interactionId, leadId) => {
    switch (magnetType) {
        case 'bmi_calculator':
            return `
                <div class="max-w-2xl mx-auto">
                    <div class="text-center mb-8">
                        <h1 class="text-4xl font-bold text-gray-800 mb-4">Free BMI Calculator</h1>
                        <p class="text-xl text-gray-600">Get your Body Mass Index and personalized health recommendations</p>
                    </div>
                    
                    <div class="bg-white rounded-lg shadow-lg p-8">
                        <form id="bmiForm" onsubmit="handleBMISubmit(event)">
                            <div class="grid md:grid-cols-2 gap-6">
                                <div>
                                    <label class="block text-gray-700 font-semibold mb-2">Name</label>
                                    <input type="text" name="name" required class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500">
                                </div>
                                <div>
                                    <label class="block text-gray-700 font-semibold mb-2">Email</label>
                                    <input type="email" name="email" required class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500">
                                </div>
                                <div>
                                    <label class="block text-gray-700 font-semibold mb-2">Weight (kg)</label>
                                    <input type="number" name="weight" required class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500">
                                </div>
                                <div>
                                    <label class="block text-gray-700 font-semibold mb-2">Height (cm)</label>
                                    <input type="number" name="height" required class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500">
                                </div>
                                <div>
                                    <label class="block text-gray-700 font-semibold mb-2">Age</label>
                                    <input type="number" name="age" required class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500">
                                </div>
                                <div>
                                    <label class="block text-gray-700 font-semibold mb-2">Gender</label>
                                    <select name="gender" required class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500">
                                        <option value="">Select Gender</option>
                                        <option value="male">Male</option>
                                        <option value="female">Female</option>
                                    </select>
                                </div>
                            </div>
                            <div class="mt-6">
                                <label class="block text-gray-700 font-semibold mb-2">Activity Level</label>
                                <select name="activityLevel" required class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500">
                                    <option value="">Select Activity Level</option>
                                    <option value="sedentary">Sedentary (little/no exercise)</option>
                                    <option value="light">Light (exercise 1-3 times/week)</option>
                                    <option value="moderate">Moderate (exercise 4-5 times/week)</option>
                                    <option value="active">Active (daily exercise or intense exercise 3-4 times/week)</option>
                                    <option value="extra">Extra Active (very intense exercise daily, or physical job)</option>
                                </select>
                            </div>
                            <button type="submit" class="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg mt-6 transition duration-300">
                                Calculate My BMI
                            </button>
                        </form>
                        <div id="results" style="display: none;" class="mt-6"></div>
                    </div>
                </div>
                
                <script>
                    function handleBMISubmit(event) {
                        event.preventDefault();
                        const formData = new FormData(event.target);
                        const data = Object.fromEntries(formData);
                        trackFormSubmit(data);
                    }
                </script>
            `;
            
        case 'ai_diet_planner':
            return `
                <div class="max-w-2xl mx-auto">
                    <div class="text-center mb-8">
                        <h1 class="text-4xl font-bold text-gray-800 mb-4">AI-Powered Diet Planner</h1>
                        <p class="text-xl text-gray-600">Get a personalized meal plan created by AI, tailored to your goals</p>
                    </div>
                    
                    <div class="bg-white rounded-lg shadow-lg p-8">
                        <form id="dietForm" onsubmit="handleDietSubmit(event)">
                            <div class="grid md:grid-cols-2 gap-6">
                                <div>
                                    <label class="block text-gray-700 font-semibold mb-2">Name</label>
                                    <input type="text" name="name" required class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500">
                                </div>
                                <div>
                                    <label class="block text-gray-700 font-semibold mb-2">Email</label>
                                    <input type="email" name="email" required class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500">
                                </div>
                                <div>
                                    <label class="block text-gray-700 font-semibold mb-2">Phone</label>
                                    <input type="tel" name="phone" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500">
                                </div>
                                <div>
                                    <label class="block text-gray-700 font-semibold mb-2">Primary Goal</label>
                                    <select name="goal" required class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500">
                                        <option value="">Select Goal</option>
                                        <option value="weight_loss">Weight Loss</option>
                                        <option value="weight_gain">Weight Gain</option>
                                        <option value="muscle_gain">Muscle Gain</option>
                                        <option value="maintenance">Maintenance</option>
                                    </select>
                                </div>
                            </div>
                            <div class="mt-6">
                                <label class="block text-gray-700 font-semibold mb-2">Dietary Restrictions</label>
                                <div class="grid grid-cols-2 gap-2">
                                    <label class="flex items-center">
                                        <input type="checkbox" name="restrictions" value="vegetarian" class="mr-2">
                                        Vegetarian
                                    </label>
                                    <label class="flex items-center">
                                        <input type="checkbox" name="restrictions" value="vegan" class="mr-2">
                                        Vegan
                                    </label>
                                    <label class="flex items-center">
                                        <input type="checkbox" name="restrictions" value="gluten_free" class="mr-2">
                                        Gluten Free
                                    </label>
                                    <label class="flex items-center">
                                        <input type="checkbox" name="restrictions" value="dairy_free" class="mr-2">
                                        Dairy Free
                                    </label>
                                </div>
                            </div>
                            <button type="submit" class="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-lg mt-6 transition duration-300">
                                Generate My Diet Plan
                            </button>
                        </form>
                        <div id="results" style="display: none;" class="mt-6"></div>
                    </div>
                </div>
                
                <script>
                    function handleDietSubmit(event) {
                        event.preventDefault();
                        const formData = new FormData(event.target);
                        const data = Object.fromEntries(formData);
                        
                        // Handle multiple selections for restrictions
                        data.restrictions = Array.from(formData.getAll('restrictions'));
                        
                        trackFormSubmit(data);
                    }
                </script>
            `;
            
        // Add more magnet types here...
        default:
            return `
                <div class="max-w-2xl mx-auto text-center">
                    <h1 class="text-4xl font-bold text-gray-800 mb-4">${leadMagnetsService.availableLeadMagnets[magnetType]?.name || 'Fitness Tool'}</h1>
                    <p class="text-xl text-gray-600 mb-8">This feature is coming soon!</p>
                    <div class="bg-white rounded-lg shadow-lg p-8">
                        <p class="text-gray-700">We're working hard to bring you this amazing tool. Stay tuned!</p>
                    </div>
                </div>
            `;
    }
};

// Helper function to get next steps based on magnet type
const getNextSteps = (magnetType, results) => {
    const commonSteps = [
        'Check your email for detailed results',
        'Book a free consultation to discuss your goals',
        'Follow us on social media for daily tips'
    ];
    
    switch (magnetType) {
        case 'bmi_calculator':
            return [
                'Review your BMI category and health recommendations',
                'Consider speaking with a fitness professional',
                ...commonSteps
            ];
        case 'ai_diet_planner':
            return [
                'Your personalized diet plan has been sent to your email',
                'Start with day 1 and track your progress',
                ...commonSteps
            ];
        default:
            return commonSteps;
    }
};

// Helper function to generate meal plan (simplified)
const generateMealPlan = async (formData) => {
    // This would integrate with your meal planning service
    return {
        plan: 'Custom meal plan generated',
        downloadUrl: null,
        duration: '7 days'
    };
};

// Helper function to generate short URL (placeholder)
const generateShortUrl = async (url) => {
    // Implement URL shortening service integration
    return url;
};

// Helper function to generate QR code (placeholder)
const generateQRCode = async (url) => {
    // Implement QR code generation
    return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(url)}`;
};
