# Marketing V1 API Documentation

Complete API documentation for the Marketing V1 system with sample requests and responses.

## Table of Contents
- [Authentication](#authentication)
- [Credentials Management](#credentials-management)
- [Campaign Analysis & Management](#campaign-analysis--management)
- [AI-Powered Features](#ai-powered-features)
- [Dashboard & Analytics](#dashboard--analytics)
- [Automation & Scheduling](#automation--scheduling)

---

## Authentication

### Coach Login
**POST** `/api/auth/login`

**Request:**
```json
{
  "email": "coach@example.com",
  "password": "your_password"
}
```

**Response:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "coach@example.com",
    "role": "coach",
    "selfCoachId": "COACH_001",
    "currentLevel": 1,
    "teamRankName": "Distributor Coach"
  }
}
```

---

## Credentials Management

### Get Meta API Setup Steps
**GET** `/api/marketing/v1/credentials/meta/setup-steps`

**Headers:**
```
Authorization: Bearer {coach_jwt_token}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "title": "📋 STEP-BY-STEP GUIDE TO GET META API CREDENTIALS:",
    "steps": [
      {
        "step": 1,
        "title": "🔧 Create Facebook App",
        "instructions": [
          "Go to https://developers.facebook.com/",
          "Click \"My Apps\" → \"Create App\"",
          "Choose \"Business\" as app type",
          "Fill in app details:",
          "  - App Name: Your business name",
          "  - App Contact Email: Your email",
          "  - Business Manager Account: Select your business",
          "Click \"Create App\""
        ]
      },
      {
        "step": 2,
        "title": "🔑 Get App ID and App Secret",
        "instructions": [
          "In your app dashboard, go to \"Settings\" → \"Basic\"",
          "Copy \"App ID\" (this is your appId)",
          "Click \"Show\" next to App Secret and copy it (this is your appSecret)"
        ]
      },
      {
        "step": 3,
        "title": "🎯 Get Access Token",
        "instructions": [
          "Go to \"Tools\" → \"Graph API Explorer\"",
          "Select your app from dropdown",
          "Click \"Generate Access Token\"",
          "Select these permissions:",
          "  - ads_management",
          "  - pages_manage_posts",
          "  - pages_read_engagement",
          "  - instagram_basic",
          "  - instagram_content_publish",
          "Click \"Generate Access Token\"",
          "Copy the token (this is your accessToken)"
        ]
      },
      {
        "step": 4,
        "title": "🏢 Get Business Account ID",
        "instructions": [
          "Go to https://business.facebook.com/",
          "Select your Business Manager",
          "Go to \"Business Settings\" → \"Business Info\"",
          "Copy \"Business Manager ID\" (this is your businessAccountId)"
        ]
      },
      {
        "step": 5,
        "title": "💰 Get Ad Account ID",
        "instructions": [
          "In Business Manager, go to \"Ad Accounts\"",
          "Click on your ad account",
          "Copy the account ID (format: act_123456789)",
          "This is your adAccountId"
        ]
      },
      {
        "step": 6,
        "title": "📄 Get Facebook Page ID",
        "instructions": [
          "Go to your Facebook Page",
          "Click \"Settings\" → \"Page Info\"",
          "Scroll down to find \"Page ID\"",
          "Copy the ID (this is your facebookPageId)"
        ]
      },
      {
        "step": 7,
        "title": "📸 Get Instagram Account ID",
        "instructions": [
          "Go to https://business.facebook.com/",
          "Go to \"Business Settings\" → \"Instagram Accounts\"",
          "Click on your Instagram account",
          "Copy the Instagram Account ID (this is your instagramAccountId)"
        ]
      }
    ],
    "importantNotes": [
      "Access tokens expire! You'll need to refresh them periodically",
      "Make sure your Facebook app is approved for production use",
      "Test with a small budget first",
      "Keep all credentials secure and never share them publicly"
    ],
    "verification": "After setup, use the \"Verify Meta API Credentials\" endpoint to test your configuration.",
    "requiredFields": [
      "accessToken - Your Meta API access token",
      "appId - Your Facebook App ID",
      "appSecret - Your Facebook App Secret",
      "businessAccountId - Your Business Manager ID (optional)",
      "adAccountId - Your Ad Account ID (optional)",
      "facebookPageId - Your Facebook Page ID (optional)",
      "instagramAccountId - Your Instagram Account ID (optional)"
    ]
  }
}
```

### Get OpenAI Setup Steps
**GET** `/api/marketing/v1/credentials/openai/setup-steps`

**Headers:**
```
Authorization: Bearer {coach_jwt_token}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "title": "📋 STEP-BY-STEP GUIDE TO GET OPENAI API KEY:",
    "steps": [
      {
        "step": 1,
        "title": "🔧 Create OpenAI Account",
        "instructions": [
          "Go to https://platform.openai.com/",
          "Click \"Sign Up\" or \"Log In\"",
          "Complete account verification (email + phone)",
          "Add payment method (required for API usage)"
        ]
      },
      {
        "step": 2,
        "title": "🔑 Get API Key",
        "instructions": [
          "Log into your OpenAI account",
          "Go to https://platform.openai.com/api-keys",
          "Click \"Create new secret key\"",
          "Give it a name (e.g., \"Marketing V1 API\")",
          "Copy the key immediately (you won't see it again!)",
          "This is your apiKey (starts with sk-)"
        ]
      },
      {
        "step": 3,
        "title": "💰 Add Credits",
        "instructions": [
          "Go to https://platform.openai.com/account/billing",
          "Click \"Add credits\" or \"Set up billing\"",
          "Add at least $5-10 for testing",
          "Monitor usage in the dashboard"
        ]
      },
      {
        "step": 4,
        "title": "⚙️ Choose Model Preference",
        "instructions": [
          "Available models:",
          "  - gpt-4 (Recommended) - Most capable, best for complex tasks",
          "  - gpt-3.5-turbo - Faster and cheaper, good for simple tasks",
          "  - gpt-4-turbo-preview - Latest GPT-4 with improvements"
        ]
      },
      {
        "step": 5,
        "title": "📊 Monitor Usage",
        "instructions": [
          "Go to https://platform.openai.com/usage",
          "Set up usage limits to avoid unexpected charges",
          "Monitor your API calls and costs"
        ]
      }
    ],
    "importantNotes": [
      "API keys are sensitive - never share them publicly",
      "Each API call costs money (typically $0.01-0.10 per request)",
      "Set usage limits to control costs",
      "Keys don't expire but can be revoked",
      "Keep your key secure and rotate it periodically"
    ],
    "costEstimation": {
      "GPT-4": "~$0.03 per 1K tokens",
      "GPT-3.5-turbo": "~$0.002 per 1K tokens",
      "Typical ad copy generation": "$0.01-0.05 per request",
      "Campaign optimization": "$0.05-0.20 per request"
    },
    "verification": "After setup, use the \"Verify OpenAI Credentials\" endpoint to test your configuration.",
    "requiredFields": [
      "apiKey - Your OpenAI API key (starts with sk-)",
      "modelPreference - AI model to use (gpt-4, gpt-3.5-turbo, gpt-4-turbo-preview)"
    ]
  }
}
```

### Setup Meta API Credentials
**POST** `/api/marketing/v1/credentials/meta`

**Headers:**
```
Authorization: Bearer {coach_jwt_token}
Content-Type: application/json
```

**Request:**
```json
{
  "accessToken": "EAABwzLixnjYBO...",
  "appId": "123456789",
  "appSecret": "abc123def456...",
  "businessAccountId": "123456789",
  "adAccountId": "act_123456789",
  "facebookPageId": "123456789",
  "instagramAccountId": "123456789"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Meta credentials setup successfully",
  "data": {
    "isConnected": true,
    "lastVerified": "2024-01-01T00:00:00Z",
    "businessAccountId": "123456789",
    "adAccountId": "act_123456789"
  }
}
```

### Verify Meta API Credentials
**POST** `/api/marketing/v1/credentials/meta/verify`

**Headers:**
```
Authorization: Bearer {coach_jwt_token}
```

**Response:**
```json
{
  "success": true,
  "message": "Meta credentials are valid",
  "data": {
    "isValid": true,
    "userInfo": {
      "id": "123456789",
      "name": "John Doe"
    },
    "lastVerified": "2024-01-01T00:00:00Z"
  }
}
```

### Get Meta Account Information
**GET** `/api/marketing/v1/credentials/meta/account-info`

**Headers:**
```
Authorization: Bearer {coach_jwt_token}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "123456789",
      "name": "John Doe"
    },
    "adAccounts": [
      {
        "id": "act_123456789",
        "name": "My Ad Account",
        "account_status": 1,
        "currency": "USD",
        "timezone_name": "America/New_York"
      }
    ],
    "businessAccounts": [
      {
        "id": "123456789",
        "name": "My Business",
        "primary_page": {
          "id": "123456789",
          "name": "My Page"
        }
      }
    ],
    "connectedAccount": {
      "businessAccountId": "123456789",
      "adAccountId": "act_123456789",
      "facebookPageId": "123456789",
      "instagramAccountId": "123456789"
    }
  }
}
```

### Setup OpenAI Credentials
**POST** `/api/marketing/v1/credentials/openai`

**Headers:**
```
Authorization: Bearer {coach_jwt_token}
Content-Type: application/json
```

**Request:**
```json
{
  "apiKey": "sk-...",
  "modelPreference": "gpt-4"
}
```

**Response:**
```json
{
  "success": true,
  "message": "OpenAI credentials setup successfully",
  "data": {
    "isConnected": true,
    "lastVerified": "2024-01-01T00:00:00Z",
    "modelPreference": "gpt-4"
  }
}
```

### Get Credentials Status
**GET** `/api/marketing/v1/credentials/status`

**Headers:**
```
Authorization: Bearer {coach_jwt_token}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "meta": {
      "isConnected": true,
      "hasCredentials": true,
      "lastVerified": "2024-01-01T00:00:00Z",
      "businessAccountId": "123456789",
      "adAccountId": "act_123456789"
    },
    "openai": {
      "isConnected": true,
      "hasCredentials": true,
      "lastVerified": "2024-01-01T00:00:00Z",
      "modelPreference": "gpt-4"
    },
    "setupComplete": true
  }
}
```

---

## Campaign Analysis & Management

### Get Comprehensive Campaign Analysis
**GET** `/api/marketing/v1/campaigns/analysis?dateRange=30d&campaignIds=camp1,camp2&includeInsights=true&includeRecommendations=true`

**Headers:**
```
Authorization: Bearer {coach_jwt_token}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "summary": {
      "totalCampaigns": 5,
      "activeCampaigns": 3,
      "pausedCampaigns": 2,
      "dateRange": "30d",
      "overallMetrics": {
        "totalImpressions": 125000,
        "totalClicks": 2500,
        "totalSpend": 1250.50,
        "averageCTR": 2.0,
        "averageCPC": 0.50
      }
    },
    "campaigns": [
      {
        "id": "123456789",
        "name": "Fitness Campaign Q1",
        "status": "ACTIVE",
        "objective": "CONVERSIONS",
        "createdTime": "2024-01-01T00:00:00Z",
        "updatedTime": "2024-01-15T00:00:00Z",
        "insights": {
          "impressions": "25000",
          "clicks": "500",
          "spend": "250.00",
          "ctr": "2.00",
          "cpc": "0.50",
          "cpm": "10.00",
          "conversions": "25",
          "conversion_rate": "5.00"
        }
      }
    ]
  }
}
```

### Get Campaign Insights
**GET** `/api/marketing/v1/campaigns/{campaignId}/insights?dateRange=30d&breakdown=daily&includeDemographics=true&includePlacements=true`

**Headers:**
```
Authorization: Bearer {coach_jwt_token}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "basic": {
      "impressions": "25000",
      "clicks": "500",
      "spend": "250.00",
      "ctr": "2.00",
      "cpc": "0.50",
      "cpm": "10.00",
      "conversions": "25",
      "conversion_rate": "5.00",
      "reach": "20000",
      "frequency": "1.25"
    },
    "demographics": [
      {
        "age": "25-34",
        "gender": "female",
        "impressions": "15000",
        "clicks": "300",
        "spend": "150.00",
        "ctr": "2.00",
        "cpc": "0.50",
        "cpm": "10.00",
        "conversions": "15"
      }
    ],
    "placements": [
      {
        "publisher_platform": "facebook",
        "placement": "feed",
        "impressions": "20000",
        "clicks": "400",
        "spend": "200.00",
        "ctr": "2.00",
        "cpc": "0.50",
        "cpm": "10.00",
        "conversions": "20"
      }
    ]
  }
}
```

### Create Campaign with AI
**POST** `/api/marketing/v1/campaigns/create`

**Headers:**
```
Authorization: Bearer {coach_jwt_token}
Content-Type: application/json
```

**Request:**
```json
{
  "name": "AI-Powered Fitness Campaign",
  "objective": "CONVERSIONS",
  "budget": 50,
  "targetAudience": "Fitness enthusiasts aged 25-45 interested in online coaching",
  "productInfo": "Online fitness coaching program with personalized workout plans and nutrition guidance",
  "useAI": true,
  "autoOptimize": false,
  "schedule": {
    "startDate": "2024-01-01T00:00:00Z",
    "endDate": "2024-01-31T23:59:59Z"
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Campaign created successfully",
  "data": {
    "campaign": {
      "_id": "507f1f77bcf86cd799439011",
      "campaignId": "123456789",
      "coachId": "507f1f77bcf86cd799439012",
      "name": "AI-Powered Fitness Campaign",
      "objective": "CONVERSIONS",
      "status": "PAUSED",
      "dailyBudget": 50,
      "aiGenerated": true,
      "metaRaw": {
        "id": "123456789",
        "name": "AI-Powered Fitness Campaign",
        "objective": "CONVERSIONS",
        "status": "PAUSED"
      },
      "createdAt": "2024-01-01T00:00:00Z"
    },
    "metaCampaign": {
      "id": "123456789",
      "name": "AI-Powered Fitness Campaign"
    },
    "aiContent": {
      "adCopy": {
        "headline": "Transform Your Fitness Journey",
        "primaryCopy": "Get personalized workout plans and nutrition guidance from certified fitness coaches. Start your transformation today!",
        "callToAction": "Start Free Trial",
        "benefits": ["Personalized workouts", "Nutrition guidance", "Expert coaching"],
        "emotionalTriggers": ["transformation", "confidence", "health"]
      },
      "targetingRecommendations": {
        "demographics": "Fitness enthusiasts aged 25-45",
        "interests": ["fitness", "health", "workout", "nutrition"],
        "detailedTargeting": "People interested in fitness, health, and wellness",
        "budgetAllocation": "Daily budget: $50, Weekly budget: $350"
      }
    },
    "message": "Campaign created successfully. Review and activate when ready."
  }
}
```

---

## AI-Powered Features

### Generate AI Ad Copy
**POST** `/api/marketing/v1/ai/generate-copy`

**Headers:**
```
Authorization: Bearer {coach_jwt_token}
Content-Type: application/json
```

**Request:**
```json
{
  "productInfo": "Online fitness coaching program with personalized workout plans",
  "targetAudience": "Fitness enthusiasts aged 25-45 who want to get in shape",
  "campaignObjective": "CONVERSIONS",
  "tone": "motivational",
  "length": "medium",
  "includeCallToAction": true
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "headline": "Transform Your Fitness Journey Today!",
    "primaryCopy": "Get personalized workout plans and nutrition guidance from certified fitness coaches. Join thousands who've already transformed their lives with our proven system.",
    "callToAction": "Start Your Free Trial",
    "benefits": [
      "Personalized workout plans",
      "Expert nutrition guidance",
      "24/7 coach support",
      "Proven results in 30 days"
    ],
    "emotionalTriggers": [
      "transformation",
      "confidence",
      "health",
      "success"
    ],
    "suggestions": "Consider A/B testing different headlines and call-to-action buttons to optimize performance."
  }
}
```

### Generate AI Targeting Recommendations
**POST** `/api/marketing/v1/ai/targeting-recommendations`

**Headers:**
```
Authorization: Bearer {coach_jwt_token}
Content-Type: application/json
```

**Request:**
```json
{
  "targetAudience": "Fitness enthusiasts who want to lose weight",
  "budget": 50,
  "objective": "CONVERSIONS",
  "productInfo": "Online fitness coaching program",
  "excludeAudiences": ["competitors", "existing customers"]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "demographics": "Ages 25-45, All genders, English-speaking countries",
    "interests": [
      "fitness",
      "health",
      "workout",
      "nutrition",
      "weight loss",
      "gym",
      "personal training"
    ],
    "detailedTargeting": {
      "age_min": 25,
      "age_max": 45,
      "interests": [
        {"id": "6003107902433", "name": "Fitness and wellness"},
        {"id": "6004037886251", "name": "Health and wellness"}
      ],
      "behaviors": [
        {"id": "6002714895372", "name": "Frequent travelers"}
      ]
    },
    "lookalikeAudiences": "Create 1% lookalike audience based on your existing customers",
    "budgetAllocation": {
      "dailyBudget": 50,
      "weeklyBudget": 350,
      "monthlyBudget": 1500,
      "recommendedBid": "Cost per conversion: $10-15"
    },
    "placements": [
      "Facebook Feed",
      "Instagram Feed",
      "Instagram Stories",
      "Facebook Stories"
    ],
    "biddingStrategy": "Use 'Conversions' bidding with 'Cost per result' optimization",
    "reasoning": "Targeting fitness enthusiasts aged 25-45 with interests in health and wellness will likely convert well for your fitness coaching program."
  }
}
```

### Optimize Campaign with AI
**POST** `/api/marketing/v1/ai/optimize-campaign/{campaignId}`

**Headers:**
```
Authorization: Bearer {coach_jwt_token}
Content-Type: application/json
```

**Request:**
```json
{
  "optimizationType": "performance",
  "includeBudgetOptimization": true,
  "includeAudienceOptimization": true,
  "includeCreativeOptimization": true
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "performanceAnalysis": "Your campaign is performing well with a 2.0% CTR, but there's room for improvement in conversion rate.",
    "budgetOptimization": {
      "currentBudget": 50,
      "recommendedBudget": 75,
      "reasoning": "Increase budget by 50% to scale successful ad sets",
      "expectedImpact": "20-30% increase in conversions"
    },
    "audienceOptimization": {
      "currentAudience": "Fitness enthusiasts 25-45",
      "recommendedAudience": "Add interests: 'home workout', 'fitness equipment'",
      "reasoning": "Expand audience to include home fitness enthusiasts",
      "expectedImpact": "15-25% increase in reach"
    },
    "creativeOptimization": {
      "currentCreative": "Standard fitness ad",
      "recommendations": [
        "Test video creatives showing workout demonstrations",
        "Add user testimonials and before/after photos",
        "Create urgency with limited-time offers"
      ],
      "expectedImpact": "10-20% improvement in engagement"
    },
    "biddingStrategy": "Switch to 'Cost per result' bidding for better conversion optimization",
    "implementationTimeline": "Implement changes over 3-5 days for optimal results",
    "expectedImpact": "Overall 25-40% improvement in campaign performance",
    "priorityActions": [
      "Increase budget to $75/day",
      "Add new audience interests",
      "Create video creative variations",
      "Update bidding strategy"
    ]
  }
}
```

---

## Dashboard & Analytics

### Get Marketing Dashboard
**GET** `/api/marketing/v1/dashboard?dateRange=30d&includeAIInsights=true&includeRecommendations=true`

**Headers:**
```
Authorization: Bearer {coach_jwt_token}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "credentials": {
      "meta": {
        "isConnected": true,
        "hasCredentials": true,
        "lastVerified": "2024-01-01T00:00:00Z",
        "businessAccountId": "123456789",
        "adAccountId": "act_123456789"
      },
      "openai": {
        "isConnected": true,
        "hasCredentials": true,
        "lastVerified": "2024-01-01T00:00:00Z",
        "modelPreference": "gpt-4"
      },
      "setupComplete": true
    },
    "campaigns": {
      "summary": {
        "totalCampaigns": 5,
        "activeCampaigns": 3,
        "pausedCampaigns": 2,
        "dateRange": "30d",
        "overallMetrics": {
          "totalImpressions": 125000,
          "totalClicks": 2500,
          "totalSpend": 1250.50,
          "averageCTR": 2.0,
          "averageCPC": 0.50
        }
      },
      "campaigns": [
        {
          "id": "123456789",
          "name": "Fitness Campaign Q1",
          "status": "ACTIVE",
          "objective": "CONVERSIONS",
          "insights": {
            "impressions": "25000",
            "clicks": "500",
            "spend": "250.00",
            "ctr": "2.00",
            "cpc": "0.50",
            "conversions": "25"
          }
        }
      ]
    },
    "aiInsights": {
      "performanceSummary": "Your campaigns are performing well with strong engagement rates",
      "keyInsights": [
        "Fitness campaigns show 2x better performance than general health campaigns",
        "Video creatives outperform static images by 40%",
        "Weekend campaigns perform 25% better than weekday campaigns"
      ],
      "topPerformers": [
        "Fitness Campaign Q1 - 2.0% CTR",
        "Weight Loss Challenge - 1.8% CTR"
      ],
      "improvementAreas": [
        "Increase budget for top-performing campaigns",
        "Test more video creative variations",
        "Expand audience targeting"
      ],
      "strategicRecommendations": [
        "Focus on fitness niche for better ROI",
        "Increase video creative production",
        "Schedule more campaigns for weekends"
      ],
      "budgetOptimization": "Reallocate 30% of budget from low-performing to high-performing campaigns"
    },
    "timestamp": "2024-01-01T00:00:00Z"
  }
}
```

---

## Automation & Scheduling

### Schedule Campaign
**POST** `/api/marketing/v1/campaigns/{campaignId}/schedule`

**Headers:**
```
Authorization: Bearer {coach_jwt_token}
Content-Type: application/json
```

**Request:**
```json
{
  "startDate": "2024-01-01T00:00:00Z",
  "endDate": "2024-01-31T23:59:59Z",
  "timezone": "UTC",
  "budgetSchedule": {
    "dailyBudget": 50,
    "weeklyBudget": 350,
    "monthlyBudget": 1500
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Campaign scheduled successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "campaignId": "123456789",
    "coachId": "507f1f77bcf86cd799439012",
    "name": "Fitness Campaign Q1",
    "objective": "CONVERSIONS",
    "status": "PAUSED",
    "dailyBudget": 50,
    "scheduledStart": "2024-01-01T00:00:00Z",
    "scheduledEnd": "2024-01-31T23:59:59Z",
    "timezone": "UTC",
    "budgetSchedule": {
      "dailyBudget": 50,
      "weeklyBudget": 350,
      "monthlyBudget": 1500
    },
    "updatedAt": "2024-01-01T00:00:00Z"
  }
}
```

### Setup Campaign Automation
**POST** `/api/marketing/v1/campaigns/{campaignId}/automation`

**Headers:**
```
Authorization: Bearer {coach_jwt_token}
Content-Type: application/json
```

**Request:**
```json
{
  "rules": [
    {
      "condition": "ctr < 1%",
      "action": "pause_campaign",
      "description": "Pause campaign if CTR drops below 1%"
    },
    {
      "condition": "cpc > 2.0",
      "action": "reduce_budget",
      "description": "Reduce budget if CPC exceeds $2.00",
      "parameters": {
        "reductionPercentage": 20
      }
    },
    {
      "condition": "conversion_rate < 2%",
      "action": "optimize_audience",
      "description": "Optimize audience targeting if conversion rate is low"
    }
  ],
  "notifications": true,
  "autoOptimize": false
}
```

**Response:**
```json
{
  "success": true,
  "message": "Campaign automation setup successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "campaignId": "123456789",
    "coachId": "507f1f77bcf86cd799439012",
    "name": "Fitness Campaign Q1",
    "automationRules": [
      {
        "condition": "ctr < 1%",
        "action": "pause_campaign",
        "description": "Pause campaign if CTR drops below 1%"
      },
      {
        "condition": "cpc > 2.0",
        "action": "reduce_budget",
        "description": "Reduce budget if CPC exceeds $2.00",
        "parameters": {
          "reductionPercentage": 20
        }
      },
      {
        "condition": "conversion_rate < 2%",
        "action": "optimize_audience",
        "description": "Optimize audience targeting if conversion rate is low"
      }
    ],
    "automationNotifications": true,
    "autoOptimize": false,
    "updatedAt": "2024-01-01T00:00:00Z"
  }
}
```

---

## Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "message": "Access token, App ID, and App Secret are required. Use GET /api/marketing/v1/credentials/meta/setup-steps to get detailed setup instructions."
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "message": "Not authorized to access this route, token has expired."
}
```

### 403 Forbidden
```json
{
  "success": false,
  "message": "User role (staff) is not authorized to access this route."
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "message": "Failed to setup Meta credentials: Invalid access token"
}
```

---

## Environment Variables

### Required Environment Variables
```bash
# Base URL for API requests
BASE_URL=http://localhost:5000

# Coach JWT Token (obtained from login)
COACH_JWT_TOKEN=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Meta API Credentials (for testing)
META_ACCESS_TOKEN=EAABwzLixnjYBO...
META_APP_ID=123456789
META_APP_SECRET=abc123def456...

# OpenAI API Key (for testing)
OPENAI_API_KEY=sk-...

# Campaign ID (for testing campaign-specific endpoints)
CAMPAIGN_ID=123456789
```

---

## Rate Limits

- **Authentication endpoints**: 10 requests per minute
- **Setup steps endpoints**: 100 requests per minute
- **Campaign management**: 50 requests per minute
- **AI features**: 20 requests per minute
- **Analytics endpoints**: 30 requests per minute

---

## Support

For technical support or questions about the Marketing V1 API, please contact the development team or refer to the API documentation at `/api/docs`.
