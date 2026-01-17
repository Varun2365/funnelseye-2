# Funnel Management API Documentation - Coach & Staff

## Overview

All funnel management endpoints work for **both Coach and Staff** with appropriate permissions. Staff members need specific funnel permissions to perform actions.

**Base Path:** `/api/funnels`

**Authentication:** Required for all routes (except `/track`)

---

# 📋 ALL FUNNEL ROUTES

| # | Method | Route | Permission | Description |
|---|--------|-------|------------|-------------|
| 1 | `POST` | `/api/funnels/track` | Public | Track funnel events (analytics) |
| 2 | `GET` | `/api/funnels/coach/:coachId/funnels` | `funnels:view` | Get all funnels |
| 3 | `GET` | `/api/funnels/coach/:coachId/funnels/:funnelId` | `funnels:view` | Get single funnel |
| 4 | `POST` | `/api/funnels/coach/:coachId/funnels` | `funnels:create` | Create new funnel |
| 5 | `PUT` | `/api/funnels/coach/:coachId/funnels/:funnelId` | `funnels:update` | Update funnel |
| 6 | `DELETE` | `/api/funnels/coach/:coachId/funnels/:funnelId` | `funnels:delete` | Delete funnel |
| 7 | `POST` | `/api/funnels/:funnelId/stages` | `funnels:manage` | Add stage to funnel |
| 8 | `PUT` | `/api/funnels/:funnelId/stages/:stageId` | `funnels:manage` | Edit funnel stage |
| 9 | `GET` | `/api/funnels/:funnelId/analytics` | `funnels:view_analytics` | Get funnel analytics |

---

# 🔐 PERMISSION SYSTEM

## Available Funnel Permissions:

| Permission String | Constant | Description |
|------------------|----------|-------------|
| `funnels:view` | `SECTIONS.FUNNELS.VIEW` | View funnels and their details |
| `funnels:create` | `SECTIONS.FUNNELS.CREATE` | Create new funnels |
| `funnels:update` | `SECTIONS.FUNNELS.UPDATE` | Update existing funnels |
| `funnels:delete` | `SECTIONS.FUNNELS.DELETE` | Delete funnels |
| `funnels:publish` | `SECTIONS.FUNNELS.PUBLISH` | Publish funnels (make live) |
| `funnels:unpublish` | `SECTIONS.FUNNELS.UNPUBLISH` | Unpublish funnels (take offline) |
| `funnels:view_analytics` | `SECTIONS.FUNNELS.VIEW_ANALYTICS` | View funnel analytics and stats |
| `funnels:manage` | `SECTIONS.FUNNELS.MANAGE` | Full funnel management (stages, etc.) |

---

# 📍 ROUTE 1: Track Funnel Event

```
POST /api/funnels/track
```

**Authentication:** Not Required (Public)

**Purpose:** Track analytics events for funnel pages

### Request Body:
```json
{
  "funnelId": "funnel_id_here",
  "stageId": "stage_id_here",
  "eventType": "PageView",
  "sessionId": "unique_session_id",
  "userId": "user_id_if_logged_in",
  "metadata": {
    "referrer": "https://google.com",
    "device": "mobile"
  }
}
```

### Response (Same for Coach & Staff):
```json
{
  "success": true,
  "message": "Funnel event tracked successfully",
  "data": {
    "_id": "event_id",
    "funnelId": "funnel_id",
    "stageId": "stage_id",
    "eventType": "PageView",
    "sessionId": "session_id",
    "userId": "user_id",
    "ipAddress": "192.168.1.1",
    "userAgent": "Mozilla/5.0...",
    "metadata": {},
    "createdAt": "2025-10-11T10:00:00.000Z"
  }
}
```

**Notes:**
- Public endpoint for tracking
- No authentication required
- Used by funnel pages to track visitor behavior

---

# 📍 ROUTE 2: Get All Funnels

```
GET /api/funnels/coach/:coachId/funnels
```

**Permission Required:** `funnels:view`

## 🎯 COACH RESPONSE:

```json
{
  "success": true,
  "count": 5,
  "data": [
    {
      "_id": "funnel_id_1",
      "coachId": "coach_id",
      "name": "Weight Loss Funnel",
      "description": "Complete weight loss coaching funnel",
      "isPublished": true,
      "customDomain": "weightloss.example.com",
      "stages": [
        {
          "_id": "stage_id_1",
          "pageId": "landing",
          "name": "Landing Page",
          "type": "LandingPage",
          "order": 0,
          "content": {
            "headline": "Transform Your Body in 90 Days",
            "subheadline": "Personalized coaching program",
            "ctaText": "Get Started Now",
            "ctaLink": "/vsl"
          }
        },
        {
          "_id": "stage_id_2",
          "pageId": "vsl",
          "name": "Video Sales Letter",
          "type": "VSL",
          "order": 1,
          "content": {
            "videoUrl": "https://video.com/vsl.mp4",
            "ctaText": "Book Consultation",
            "ctaLink": "/booking"
          }
        },
        {
          "_id": "stage_id_3",
          "pageId": "booking",
          "name": "Booking Page",
          "type": "BookingPage",
          "order": 2,
          "content": {
            "calendarId": "calendar_id",
            "pricing": 5000
          }
        }
      ],
      "analytics": {
        "totalViews": 1500,
        "uniqueVisitors": 800,
        "conversionRate": 15.5
      },
      "createdAt": "2025-09-01T10:00:00.000Z",
      "updatedAt": "2025-10-10T15:30:00.000Z"
    },
    {
      "_id": "funnel_id_2",
      "coachId": "coach_id",
      "name": "Fitness Challenge Funnel",
      "isPublished": true,
      "stages": [
        {
          "_id": "stage_id_4",
          "pageId": "challenge",
          "name": "Challenge Landing",
          "type": "LandingPage",
          "order": 0
        }
      ],
      "createdAt": "2025-09-15T10:00:00.000Z"
    }
  ],
  "userContext": {
    "isStaff": false,
    "isCoach": true,
    "userId": "coach_id",
    "permissions": []
  }
}
```

**Coach Sees:**
- ✅ All funnels created by the coach
- ✅ Complete funnel details with all stages
- ✅ Analytics data
- ✅ Custom domain information
- ✅ Full access to all fields

---

## 👤 STAFF RESPONSE:

```json
{
  "success": true,
  "count": 5,
  "data": [
    {
      "_id": "funnel_id_1",
      "coachId": "coach_id",
      "name": "Weight Loss Funnel",
      "description": "Complete weight loss coaching funnel",
      "isPublished": true,
      "customDomain": "weightloss.example.com",
      "stages": [
        {
          "_id": "stage_id_1",
          "pageId": "landing",
          "name": "Landing Page",
          "type": "LandingPage",
          "order": 0,
          "content": {
            "headline": "Transform Your Body in 90 Days",
            "subheadline": "Personalized coaching program",
            "ctaText": "Get Started Now",
            "ctaLink": "/vsl"
          }
        }
      ],
      "analytics": {
        "totalViews": 1500,
        "uniqueVisitors": 800,
        "conversionRate": 15.5
      },
      "createdAt": "2025-09-01T10:00:00.000Z",
      "updatedAt": "2025-10-10T15:30:00.000Z"
    }
  ],
  "userContext": {
    "isStaff": true,
    "isCoach": false,
    "userId": "staff_id",
    "permissions": [
      "funnels:view",
      "funnels:update",
      "leads:view"
    ]
  }
}
```

**Staff Sees:**
- ✅ All coach's funnels (same as coach)
- ✅ Complete funnel details
- ✅ Analytics data (if `funnels:view_analytics` permission)
- ⚠️ Data filtered based on permissions
- ⚠️ Can only access their coach's funnels (not other coaches)

**Permission Check:**
- ❌ No `funnels:view` → 403 Forbidden
- ✅ Has `funnels:view` → Can see all coach's funnels

---

# 📍 ROUTE 3: Get Single Funnel

```
GET /api/funnels/coach/:coachId/funnels/:funnelId
```

**Permission Required:** `funnels:view`

## 🎯 COACH RESPONSE:

```json
{
  "success": true,
  "data": {
    "_id": "funnel_id_1",
    "coachId": "coach_id",
    "name": "Weight Loss Funnel",
    "description": "Complete weight loss coaching funnel with 3 stages",
    "isPublished": true,
    "publishedAt": "2025-09-05T10:00:00.000Z",
    "customDomain": "weightloss.example.com",
    "slug": "weight-loss-transformation",
    "stages": [
      {
        "_id": "stage_id_1",
        "pageId": "landing",
        "name": "Landing Page",
        "type": "LandingPage",
        "order": 0,
        "content": {
          "headline": "Transform Your Body in 90 Days",
          "subheadline": "Join 500+ clients who achieved their goals",
          "ctaText": "Watch Free Training",
          "ctaLink": "/vsl",
          "backgroundColor": "#ffffff",
          "textColor": "#000000",
          "images": [
            "https://cdn.example.com/hero.jpg"
          ],
          "testimonials": [
            {
              "name": "Sarah K.",
              "text": "Lost 20kg in 3 months!",
              "rating": 5
            }
          ]
        },
        "metadata": {
          "views": 500,
          "conversions": 75
        }
      },
      {
        "_id": "stage_id_2",
        "pageId": "vsl",
        "name": "Video Sales Letter",
        "type": "VSL",
        "order": 1,
        "content": {
          "videoUrl": "https://video.com/vsl.mp4",
          "videoDuration": 1200,
          "ctaText": "Book Free Consultation",
          "ctaLink": "/booking",
          "autoplay": true,
          "showControls": false
        }
      },
      {
        "_id": "stage_id_3",
        "pageId": "booking",
        "name": "Booking Page",
        "type": "BookingPage",
        "order": 2,
        "content": {
          "calendarId": "calendar_id",
          "pricing": 5000,
          "currency": "INR",
          "availableSlots": "dynamic",
          "formFields": [
            "name",
            "email",
            "phone",
            "healthGoal"
          ]
        }
      }
    ],
    "metadata": {
      "totalStages": 3,
      "lastModified": "2025-10-10T15:30:00.000Z",
      "createdBy": "coach_id"
    },
    "analytics": {
      "totalViews": 1500,
      "uniqueVisitors": 800,
      "conversionRate": 15.5,
      "avgTimeOnFunnel": 480,
      "dropOffRate": 25.5
    },
    "seo": {
      "metaTitle": "Transform Your Body - Weight Loss Coaching",
      "metaDescription": "Join our proven 90-day transformation program",
      "ogImage": "https://cdn.example.com/og-image.jpg"
    },
    "createdAt": "2025-09-01T10:00:00.000Z",
    "updatedAt": "2025-10-10T15:30:00.000Z"
  },
  "userContext": {
    "isStaff": false,
    "isCoach": true,
    "userId": "coach_id",
    "permissions": []
  }
}
```

**Coach Sees:**
- ✅ Complete funnel details
- ✅ All stages with full content
- ✅ Analytics data
- ✅ SEO metadata
- ✅ Custom domain settings
- ✅ Full access to all fields

---

## 👤 STAFF RESPONSE:

```json
{
  "success": true,
  "data": {
    "_id": "funnel_id_1",
    "coachId": "coach_id",
    "name": "Weight Loss Funnel",
    "description": "Complete weight loss coaching funnel with 3 stages",
    "isPublished": true,
    "publishedAt": "2025-09-05T10:00:00.000Z",
    "customDomain": "weightloss.example.com",
    "slug": "weight-loss-transformation",
    "stages": [
      {
        "_id": "stage_id_1",
        "pageId": "landing",
        "name": "Landing Page",
        "type": "LandingPage",
        "order": 0,
        "content": {
          "headline": "Transform Your Body in 90 Days",
          "subheadline": "Join 500+ clients who achieved their goals",
          "ctaText": "Watch Free Training",
          "ctaLink": "/vsl"
        }
      },
      {
        "_id": "stage_id_2",
        "pageId": "vsl",
        "name": "Video Sales Letter",
        "type": "VSL",
        "order": 1,
        "content": {
          "videoUrl": "https://video.com/vsl.mp4",
          "ctaText": "Book Free Consultation",
          "ctaLink": "/booking"
        }
      }
    ],
    "analytics": {
      "totalViews": 1500,
      "uniqueVisitors": 800
    },
    "createdAt": "2025-09-01T10:00:00.000Z",
    "updatedAt": "2025-10-10T15:30:00.000Z"
  },
  "userContext": {
    "isStaff": true,
    "isCoach": false,
    "userId": "staff_id",
    "permissions": [
      "funnels:view",
      "funnels:update"
    ]
  }
}
```

**Staff Sees (with `funnels:view` permission):**
- ✅ Complete funnel details (same as coach)
- ✅ All stages with content
- ⚠️ Analytics data filtered (may hide sensitive metrics if no `funnels:view_analytics`)
- ✅ Can view all coach's funnels
- ❌ Without permission → 403 Forbidden

---

# 📍 ROUTE 4: Create Funnel

```
POST /api/funnels/coach/:coachId/funnels
```

**Permission Required:** `funnels:create`

### Request Body:
```json
{
  "name": "New Product Launch Funnel",
  "description": "Funnel for new course launch",
  "customDomain": "launch.example.com",
  "slug": "product-launch-2025",
  "isPublished": false,
  "stages": [
    {
      "pageId": "landing",
      "name": "Landing Page",
      "type": "LandingPage",
      "order": 0,
      "content": {
        "headline": "New Course Launching Soon!",
        "ctaText": "Join Waitlist",
        "ctaLink": "/waitlist"
      }
    },
    {
      "pageId": "waitlist",
      "name": "Waitlist Page",
      "type": "LeadCapture",
      "order": 1,
      "content": {
        "formFields": ["name", "email"],
        "successMessage": "You're on the list!"
      }
    }
  ]
}
```

## 🎯 COACH RESPONSE:

```json
{
  "success": true,
  "data": {
    "_id": "new_funnel_id",
    "coachId": "coach_id",
    "name": "New Product Launch Funnel",
    "description": "Funnel for new course launch",
    "customDomain": "launch.example.com",
    "slug": "product-launch-2025",
    "isPublished": false,
    "stages": [
      {
        "_id": "stage_id_1",
        "pageId": "landing",
        "name": "Landing Page",
        "type": "LandingPage",
        "order": 0,
        "content": {
          "headline": "New Course Launching Soon!",
          "ctaText": "Join Waitlist",
          "ctaLink": "/waitlist"
        }
      },
      {
        "_id": "stage_id_2",
        "pageId": "waitlist",
        "name": "Waitlist Page",
        "type": "LeadCapture",
        "order": 1,
        "content": {
          "formFields": ["name", "email"],
          "successMessage": "You're on the list!"
        }
      }
    ],
    "createdAt": "2025-10-11T10:30:00.000Z",
    "updatedAt": "2025-10-11T10:30:00.000Z"
  },
  "userContext": {
    "isStaff": false,
    "isCoach": true,
    "userId": "coach_id",
    "permissions": []
  }
}
```

**Coach Can:**
- ✅ Create unlimited funnels (based on subscription plan)
- ✅ Use custom domains
- ✅ Add multiple stages in creation
- ✅ Set as published or draft

**Subscription Check:**
- Checks coach's subscription plan for funnel limit
- Returns error if limit reached with upgrade info

---

## 👤 STAFF RESPONSE:

```json
{
  "success": true,
  "data": {
    "_id": "new_funnel_id",
    "coachId": "coach_id",
    "name": "New Product Launch Funnel",
    "description": "Funnel for new course launch",
    "customDomain": "launch.example.com",
    "slug": "product-launch-2025",
    "isPublished": false,
    "stages": [
      {
        "_id": "stage_id_1",
        "pageId": "landing",
        "name": "Landing Page",
        "type": "LandingPage",
        "order": 0,
        "content": {
          "headline": "New Course Launching Soon!",
          "ctaText": "Join Waitlist",
          "ctaLink": "/waitlist"
        }
      }
    ],
    "createdAt": "2025-10-11T10:30:00.000Z",
    "updatedAt": "2025-10-11T10:30:00.000Z"
  },
  "userContext": {
    "isStaff": true,
    "isCoach": false,
    "userId": "staff_id",
    "permissions": [
      "funnels:create",
      "funnels:view"
    ]
  }
}
```

**Staff Can (with `funnels:create` permission):**
- ✅ Create funnels for the coach
- ✅ Use custom domains (if available)
- ✅ Add stages during creation
- ✅ Funnel belongs to coach (not staff)
- ⚠️ Subscription limit checked against **coach's account**
- ❌ Without permission → 403 Forbidden

**Important:**
- Staff-created funnels belong to the coach
- Subscription limits apply to coach's account
- Staff action is logged for audit trail

---

# 📍 ROUTE 5: Update Funnel

```
PUT /api/funnels/coach/:coachId/funnels/:funnelId
```

**Permission Required:** `funnels:update`

### Request Body:
```json
{
  "name": "Updated Funnel Name",
  "description": "Updated description",
  "isPublished": true,
  "stages": [
    {
      "_id": "existing_stage_id",
      "pageId": "landing",
      "name": "Updated Landing Page",
      "type": "LandingPage",
      "order": 0,
      "content": {
        "headline": "New Headline Here"
      }
    }
  ]
}
```

**Note:** Sending the `stages` array completely replaces existing stages.

## 🎯 COACH RESPONSE:

```json
{
  "success": true,
  "data": {
    "_id": "funnel_id_1",
    "coachId": "coach_id",
    "name": "Updated Funnel Name",
    "description": "Updated description",
    "isPublished": true,
    "publishedAt": "2025-10-11T10:35:00.000Z",
    "stages": [
      {
        "_id": "existing_stage_id",
        "pageId": "landing",
        "name": "Updated Landing Page",
        "type": "LandingPage",
        "order": 0,
        "content": {
          "headline": "New Headline Here"
        }
      }
    ],
    "updatedAt": "2025-10-11T10:35:00.000Z"
  },
  "userContext": {
    "isStaff": false,
    "isCoach": true,
    "userId": "coach_id",
    "permissions": []
  }
}
```

---

## 👤 STAFF RESPONSE:

```json
{
  "success": true,
  "data": {
    "_id": "funnel_id_1",
    "coachId": "coach_id",
    "name": "Updated Funnel Name",
    "description": "Updated description",
    "isPublished": true,
    "publishedAt": "2025-10-11T10:35:00.000Z",
    "stages": [
      {
        "_id": "existing_stage_id",
        "pageId": "landing",
        "name": "Updated Landing Page",
        "type": "LandingPage",
        "order": 0,
        "content": {
          "headline": "New Headline Here"
        }
      }
    ],
    "updatedAt": "2025-10-11T10:35:00.000Z"
  },
  "userContext": {
    "isStaff": true,
    "isCoach": false,
    "userId": "staff_id",
    "permissions": [
      "funnels:update",
      "funnels:view"
    ]
  }
}
```

**Staff Can (with `funnels:update` permission):**
- ✅ Update funnel name, description
- ✅ Publish/unpublish funnels
- ✅ Update stages (complete replacement)
- ✅ Change custom domain
- ❌ Without permission → 403 Forbidden

---

# 📍 ROUTE 6: Delete Funnel

```
DELETE /api/funnels/coach/:coachId/funnels/:funnelId
```

**Permission Required:** `funnels:delete`

## 🎯 COACH RESPONSE:

```json
{
  "success": true,
  "message": "Funnel deleted successfully.",
  "userContext": {
    "isStaff": false,
    "isCoach": true,
    "userId": "coach_id",
    "permissions": []
  }
}
```

---

## 👤 STAFF RESPONSE:

```json
{
  "success": true,
  "message": "Funnel deleted successfully.",
  "userContext": {
    "isStaff": true,
    "isCoach": false,
    "userId": "staff_id",
    "permissions": [
      "funnels:delete",
      "funnels:view"
    ]
  }
}
```

**Staff Can (with `funnels:delete` permission):**
- ✅ Delete coach's funnels
- ✅ Permanent deletion (no soft delete)
- ❌ Without permission → 403 Forbidden

**Warning:**
- Deletion is permanent
- All funnel stages are deleted
- Analytics data is preserved (in FunnelEvent collection)

---

# 📍 ROUTE 7: Add Stage to Funnel

```
POST /api/funnels/:funnelId/stages
```

**Permission Required:** `funnels:manage`

### Request Body:
```json
{
  "pageId": "thankyou",
  "name": "Thank You Page",
  "type": "ThankYouPage",
  "order": 3,
  "content": {
    "headline": "Thank You for Booking!",
    "message": "We'll contact you within 24 hours",
    "nextSteps": [
      "Check your email for confirmation",
      "Prepare your health goals",
      "Join our WhatsApp group"
    ],
    "redirectUrl": "/dashboard",
    "redirectDelay": 5
  }
}
```

## 🎯 COACH RESPONSE:

```json
{
  "success": true,
  "message": "Stage 'Thank You Page' (ThankYouPage) added successfully.",
  "data": {
    "_id": "new_stage_id",
    "pageId": "thankyou",
    "name": "Thank You Page",
    "type": "ThankYouPage",
    "order": 3,
    "content": {
      "headline": "Thank You for Booking!",
      "message": "We'll contact you within 24 hours",
      "nextSteps": [
        "Check your email for confirmation",
        "Prepare your health goals",
        "Join our WhatsApp group"
      ],
      "redirectUrl": "/dashboard",
      "redirectDelay": 5
    }
  },
  "userContext": {
    "isStaff": false,
    "isCoach": true,
    "userId": "coach_id",
    "permissions": []
  }
}
```

---

## 👤 STAFF RESPONSE:

```json
{
  "success": true,
  "message": "Stage 'Thank You Page' (ThankYouPage) added successfully.",
  "data": {
    "_id": "new_stage_id",
    "pageId": "thankyou",
    "name": "Thank You Page",
    "type": "ThankYouPage",
    "order": 3,
    "content": {
      "headline": "Thank You for Booking!",
      "message": "We'll contact you within 24 hours",
      "nextSteps": [
        "Check your email for confirmation",
        "Prepare your health goals",
        "Join our WhatsApp group"
      ]
    }
  },
  "userContext": {
    "isStaff": true,
    "isCoach": false,
    "userId": "staff_id",
    "permissions": [
      "funnels:manage",
      "funnels:view"
    ]
  }
}
```

**Staff Can (with `funnels:manage` permission):**
- ✅ Add new stages to existing funnels
- ✅ Define stage order
- ✅ Set stage content and configuration
- ✅ Stage is automatically sorted by order
- ❌ Cannot have duplicate `pageId` in same funnel
- ❌ Without permission → 403 Forbidden

**Validation:**
- `pageId` must be unique within the funnel
- `name` and `type` are required
- `order` auto-assigned if not provided

---

# 📍 ROUTE 8: Edit Funnel Stage

```
PUT /api/funnels/:funnelId/stages/:stageId
```

**Permission Required:** `funnels:manage`

### Request Body:
```json
{
  "name": "Updated Stage Name",
  "content": {
    "headline": "New Headline",
    "ctaText": "New CTA Text"
  },
  "order": 2
}
```

**Note:** Partial updates supported - only send fields to update.

## 🎯 COACH RESPONSE:

```json
{
  "success": true,
  "message": "Funnel stage updated successfully.",
  "data": {
    "_id": "stage_id",
    "pageId": "landing",
    "name": "Updated Stage Name",
    "type": "LandingPage",
    "order": 2,
    "content": {
      "headline": "New Headline",
      "subheadline": "Original subheadline",
      "ctaText": "New CTA Text",
      "ctaLink": "/vsl"
    }
  },
  "userContext": {
    "isStaff": false,
    "isCoach": true,
    "userId": "coach_id",
    "permissions": []
  }
}
```

---

## 👤 STAFF RESPONSE:

```json
{
  "success": true,
  "message": "Funnel stage updated successfully.",
  "data": {
    "_id": "stage_id",
    "pageId": "landing",
    "name": "Updated Stage Name",
    "type": "LandingPage",
    "order": 2,
    "content": {
      "headline": "New Headline",
      "ctaText": "New CTA Text",
      "ctaLink": "/vsl"
    }
  },
  "userContext": {
    "isStaff": true,
    "isCoach": false,
    "userId": "staff_id",
    "permissions": [
      "funnels:manage",
      "funnels:view"
    ]
  }
}
```

**Staff Can (with `funnels:manage` permission):**
- ✅ Update stage name, content, order
- ✅ Partial updates (only changed fields)
- ✅ Re-ordering triggers automatic sort
- ❌ Without permission → 403 Forbidden

**Notes:**
- Updates are merged with existing data
- Changing `order` will re-sort all stages
- Stage `_id` and `pageId` cannot be changed

---

# 📍 ROUTE 9: Get Funnel Analytics

```
GET /api/funnels/:funnelId/analytics
```

**Permission Required:** `funnels:view_analytics`

**Query Parameters:**
- `startDate` (optional) - Filter analytics from this date (ISO 8601)
- `endDate` (optional) - Filter analytics to this date (ISO 8601)

**Example:**
```
GET /api/funnels/funnel_id_123/analytics?startDate=2025-10-01T00:00:00Z&endDate=2025-10-31T23:59:59Z
```

## 🎯 COACH RESPONSE:

```json
{
  "success": true,
  "data": {
    "overall": {
      "totalViews": 1500,
      "uniqueVisitors": 800
    },
    "leadsCaptured": 120,
    "appointmentsBooked": 45,
    "productsPurchased": 15,
    "funnelCompletionCount": 60,
    "overallConversionToLead": 15.5,
    "funnelCompletionRate": 8.0,
    
    "loggedInOverall": {
      "totalViews": 500,
      "uniqueVisitors": 300
    },
    "loggedInLeadsCaptured": 80,
    "loggedInAppointmentsBooked": 35,
    "loggedInProductsPurchased": 12,
    "loggedInFunnelCompletionCount": 45,
    "loggedInConversionToLead": 26.7,
    "loggedInFunnelCompletionRate": 15.0,
    
    "stageAnalytics": [
      {
        "stageId": "stage_id_1",
        "stageName": "Landing Page",
        "totalViews": 1500,
        "uniqueVisitors": 800,
        "dropOffCount": 700,
        "dropOffRate": 46.7,
        "avgTimeOnStage": 120
      },
      {
        "stageId": "stage_id_2",
        "stageName": "VSL Page",
        "totalViews": 800,
        "uniqueVisitors": 600,
        "dropOffCount": 400,
        "dropOffRate": 50.0,
        "avgTimeOnStage": 480
      },
      {
        "stageId": "stage_id_3",
        "stageName": "Booking Page",
        "totalViews": 400,
        "uniqueVisitors": 300,
        "dropOffCount": 240,
        "dropOffRate": 60.0,
        "avgTimeOnStage": 180
      }
    ]
  },
  "userContext": {
    "isStaff": false,
    "isCoach": true,
    "userId": "coach_id",
    "permissions": []
  }
}
```

**Coach Sees:**
- ✅ Complete analytics data
- ✅ Overall funnel metrics
- ✅ Stage-by-stage breakdown
- ✅ Logged-in user analytics
- ✅ Conversion rates
- ✅ Drop-off rates
- ✅ Time-on-stage metrics

---

## 👤 STAFF RESPONSE:

```json
{
  "success": true,
  "data": {
    "overall": {
      "totalViews": 1500,
      "uniqueVisitors": 800
    },
    "leadsCaptured": 120,
    "appointmentsBooked": 45,
    "overallConversionToLead": 15.5,
    
    "stageAnalytics": [
      {
        "stageId": "stage_id_1",
        "stageName": "Landing Page",
        "totalViews": 1500,
        "uniqueVisitors": 800
      },
      {
        "stageId": "stage_id_2",
        "stageName": "VSL Page",
        "totalViews": 800,
        "uniqueVisitors": 600
      }
    ]
  },
  "userContext": {
    "isStaff": true,
    "isCoach": false,
    "userId": "staff_id",
    "permissions": [
      "funnels:view_analytics",
      "funnels:view"
    ]
  }
}
```

**Staff Sees (with `funnels:view_analytics` permission):**
- ✅ Basic analytics data
- ✅ View counts and conversions
- ⚠️ Some sensitive financial data may be filtered
- ❌ Without permission → 403 Forbidden

**Analytics Metrics Explained:**

| Metric | Description |
|--------|-------------|
| `totalViews` | Total page views on funnel |
| `uniqueVisitors` | Unique visitors (based on session) |
| `leadsCaptured` | Leads generated from funnel |
| `appointmentsBooked` | Appointments booked through funnel |
| `productsPurchased` | Products purchased |
| `funnelCompletionCount` | Users who completed entire funnel |
| `overallConversionToLead` | Percentage of visitors who became leads |
| `funnelCompletionRate` | Percentage who completed funnel |
| `loggedIn*` | Metrics for logged-in users only |
| `stageAnalytics` | Per-stage breakdown with drop-off rates |

---

# 🔒 PERMISSION-BASED ACCESS SUMMARY

## Permission Matrix:

| Action | Permission Required | Coach | Staff (with permission) | Staff (without) |
|--------|-------------------|-------|----------------------|----------------|
| View all funnels | `funnels:view` | ✅ Always | ✅ Yes | ❌ 403 Forbidden |
| View funnel details | `funnels:view` | ✅ Always | ✅ Yes | ❌ 403 Forbidden |
| Create funnel | `funnels:create` | ✅ Always | ✅ Yes | ❌ 403 Forbidden |
| Update funnel | `funnels:update` | ✅ Always | ✅ Yes | ❌ 403 Forbidden |
| Delete funnel | `funnels:delete` | ✅ Always | ✅ Yes | ❌ 403 Forbidden |
| Add stage | `funnels:manage` | ✅ Always | ✅ Yes | ❌ 403 Forbidden |
| Edit stage | `funnels:manage` | ✅ Always | ✅ Yes | ❌ 403 Forbidden |
| View analytics | `funnels:view_analytics` | ✅ Always | ✅ Yes | ❌ 403 Forbidden |
| Publish funnel | `funnels:publish` | ✅ Always | ✅ Yes (if update) | ❌ 403 Forbidden |

---

# 🎯 KEY DIFFERENCES: COACH vs STAFF

| Feature | Coach | Staff |
|---------|-------|-------|
| **Funnel Access** | All their funnels | All coach's funnels (if permission) |
| **Creation** | Creates own funnels | Creates for coach |
| **Ownership** | Owns all funnels | Funnels belong to coach |
| **Subscription Limits** | Checked against own plan | Checked against coach's plan |
| **Analytics** | Full access | Access if `funnels:view_analytics` |
| **Custom Domains** | Can use their domains | Can use coach's domains |
| **Data Filtering** | No filtering | Filtered by permissions |
| **Audit Trail** | Actions logged as coach | Actions logged as staff |

---

# 🚀 TESTING EXAMPLES

## Test 1: Coach Views Funnels
```bash
GET /api/funnels/coach/coach_id_123/funnels
Authorization: Bearer {COACH_TOKEN}

# Expected: All coach's funnels with full details
```

## Test 2: Staff Views Funnels (With Permission)
```bash
GET /api/funnels/coach/coach_id_123/funnels
Authorization: Bearer {STAFF_TOKEN}

# Staff has funnels:view permission
# Expected: All coach's funnels (same data as coach)
```

## Test 3: Staff Views Funnels (Without Permission)
```bash
GET /api/funnels/coach/coach_id_123/funnels
Authorization: Bearer {STAFF_WITHOUT_PERMISSION}

# Staff does NOT have funnels:view permission
# Expected: 403 Forbidden
{
  "success": false,
  "message": "You don't have permission to perform this action"
}
```

## Test 4: Staff Creates Funnel
```bash
POST /api/funnels/coach/coach_id_123/funnels
Authorization: Bearer {STAFF_TOKEN}
Content-Type: application/json

{
  "name": "Staff Created Funnel",
  "stages": [...]
}

# Staff has funnels:create permission
# Expected: Funnel created, belongs to coach
# Subscription limit checked against coach's account
```

## Test 5: Staff Tries to Access Another Coach's Funnel
```bash
GET /api/funnels/coach/different_coach_id/funnels
Authorization: Bearer {STAFF_TOKEN}

# Staff belongs to coach_id_123, trying to access different_coach_id
# Expected: 403 Forbidden
{
  "success": false,
  "message": "Forbidden: You can only access your own funnels."
}
```

## Test 6: Staff Views Analytics (With Permission)
```bash
GET /api/funnels/funnel_id_123/analytics
Authorization: Bearer {STAFF_TOKEN}

# Staff has funnels:view_analytics permission
# Expected: Analytics data (may have some filtering)
```

## Test 7: Staff Views Analytics (Without Permission)
```bash
GET /api/funnels/funnel_id_123/analytics
Authorization: Bearer {STAFF_WITHOUT_ANALYTICS_PERMISSION}

# Expected: 403 Forbidden
```

---

# ⚙️ IMPLEMENTATION DETAILS

## Ownership Check:
```javascript
// Both coach and staff can access
// But only their coach's funnels
checkFunnelOwnership(funnel, req);

// Staff: req.coachId = their coach's ID
// Coach: req.coachId = their own ID
```

## Subscription Limits:
```javascript
// Always checked against coach's account
const limitCheck = await SubscriptionLimitsMiddleware.checkFunnelLimit(coachId);

// Staff creates funnel → Coach's limit checked
// Coach creates funnel → Own limit checked
```

## Staff Action Logging:
```javascript
// All staff actions are logged
CoachStaffService.logStaffAction(req, 'write', 'funnels', 'create', { coachId });

// Coach can see audit trail:
// "Staff John Doe created funnel 'Weight Loss Funnel' on Oct 11, 2025"
```

## Response Filtering:
```javascript
// Data filtered based on staff permissions
const filteredFunnel = CoachStaffService.filterResponseData(req, funnel, 'funnels');

// May hide:
// - Sensitive analytics (if no funnels:view_analytics)
// - Financial data
// - Other sensitive fields
```

---

# 📝 FRONTEND IMPLEMENTATION GUIDE

## 1. Checking User Type

```javascript
const userContext = response.data.userContext;

if (userContext.isStaff) {
  // Show staff-friendly UI
  // Add "Created by Staff" badges
  // Show permission restrictions
} else {
  // Show full coach UI
  // Show subscription limits
}
```

## 2. Permission-Based UI Elements

```javascript
// Check if staff can create funnels
if (userContext.permissions.includes('funnels:create')) {
  // Show "Create Funnel" button
  renderCreateButton();
}

// Check if staff can delete
if (userContext.permissions.includes('funnels:delete')) {
  // Show delete button on funnels
  renderDeleteButtons();
}

// Check if staff can view analytics
if (userContext.permissions.includes('funnels:view_analytics')) {
  // Show analytics tab
  renderAnalyticsTab();
}
```

## 3. Funnel List Display

```javascript
funnels.forEach(funnel => {
  renderFunnelCard({
    name: funnel.name,
    stageCount: funnel.stages.length,
    isPublished: funnel.isPublished,
    views: funnel.analytics?.totalViews || 0,
    
    // Staff-specific
    canEdit: userContext.permissions.includes('funnels:update'),
    canDelete: userContext.permissions.includes('funnels:delete'),
    canViewAnalytics: userContext.permissions.includes('funnels:view_analytics')
  });
});
```

## 4. Funnel Builder UI

```javascript
// When editing stages
const canManageStages = userContext.permissions.includes('funnels:manage');

if (canManageStages) {
  // Show stage editor
  // Allow add/edit/reorder stages
} else {
  // Read-only view
  // Show message: "You don't have permission to edit stages"
}
```

## 5. Analytics Dashboard

```javascript
if (userContext.permissions.includes('funnels:view_analytics')) {
  renderAnalytics({
    totalViews: analytics.overall.totalViews,
    conversionRate: analytics.overallConversionToLead,
    stageBreakdown: analytics.stageAnalytics
  });
} else {
  // Show message: "Analytics access requires permission"
  showUpgradePrompt();
}
```

---

# 🎨 UI/UX RECOMMENDATIONS

## Funnel List View (Staff with Permissions)

```
+-------------------------------------------------------+
|  📊 Funnels                          [+ Create Funnel] |
+-------------------------------------------------------+
|                                                        |
|  🟢 Weight Loss Funnel                    [Published] |
|  3 stages | 1,500 views | 15.5% conversion           |
|  [View] [Edit] [Analytics] [Delete]                   |
|                                                        |
|  🟡 Fitness Challenge                         [Draft] |
|  1 stage | 0 views                                    |
|  [View] [Edit] [Publish]                              |
|                                                        |
+-------------------------------------------------------+
```

## Funnel List View (Staff WITHOUT Permissions)

```
+-------------------------------------------------------+
|  📊 Funnels                                           |
|  ⚠️ You don't have permission to view funnels        |
+-------------------------------------------------------+
```

## Funnel Detail View (Staff)

```
+-------------------------------------------------------+
|  Weight Loss Funnel                      [Published]  |
|  Created: Sep 1, 2025 | Updated: Oct 10, 2025        |
|                                                        |
|  📝 Description:                                      |
|  Complete weight loss coaching funnel                 |
|                                                        |
|  🌐 Custom Domain: weightloss.example.com            |
|                                                        |
|  📊 Stages (3)                        [+ Add Stage]   |
|  +--------------------------------------------------+ |
|  | 1. Landing Page              [Edit] [Preview]    | |
|  | 2. Video Sales Letter        [Edit] [Preview]    | |
|  | 3. Booking Page              [Edit] [Preview]    | |
|  +--------------------------------------------------+ |
|                                                        |
|  📈 Analytics                                         |
|  Views: 1,500 | Conversions: 15.5% | Leads: 120      |
|  [View Detailed Analytics]                            |
|                                                        |
+-------------------------------------------------------+
```

## Permission Badges

```javascript
// Show permission badges on funnel cards
if (userContext.isStaff) {
  const badges = [];
  
  if (userContext.permissions.includes('funnels:view')) {
    badges.push({ icon: '👁️', text: 'View' });
  }
  if (userContext.permissions.includes('funnels:update')) {
    badges.push({ icon: '✏️', text: 'Edit' });
  }
  if (userContext.permissions.includes('funnels:delete')) {
    badges.push({ icon: '🗑️', text: 'Delete' });
  }
  if (userContext.permissions.includes('funnels:manage')) {
    badges.push({ icon: '⚙️', text: 'Manage' });
  }
  
  renderPermissionBadges(badges);
}
```

---

# ⚠️ IMPORTANT NOTES

## For Frontend Developers:

1. **Always check `userContext.isStaff`** to customize UI
2. **Check specific permissions** before showing action buttons
3. **Staff actions are logged** - show "Action logged" toast
4. **Subscription limits apply to coach** - show coach's limit, not staff's
5. **Funnels belong to coach** - even if staff created them
6. **Use `isCurrentUser` patterns** where applicable
7. **Handle 403 errors gracefully** - show permission denied message
8. **Custom domains** - validate against coach's domains
9. **Stage management** - check `funnels:manage` permission
10. **Analytics access** - separate permission required

## Security Notes:

- ✅ Staff can only access their coach's funnels
- ✅ Staff cannot access other coaches' funnels
- ✅ Permission checks enforced at middleware level
- ✅ Ownership verified on every request
- ✅ All staff actions logged for audit

## Performance Notes:

- Funnel queries are optimized
- Analytics use MongoDB aggregation
- Response data is filtered efficiently
- Consider caching for frequently accessed funnels

---

# 📊 DATA VOLUME

## Typical Funnel Object Size:

- **Funnel with 3 stages:** ~2-5 KB
- **Funnel with analytics:** ~10-15 KB
- **Full funnel list (10 funnels):** ~50-100 KB
- **Analytics response:** ~5-20 KB (depending on date range)

## Recommended Pagination:

- List all funnels: No pagination needed (typically <50 funnels per coach)
- Analytics: Filter by date range to reduce payload
- Stage content: Lazy load if stages have heavy media

---

# 🔄 CHANGELOG

**Version 1.0** - Initial implementation
- Basic CRUD operations
- Coach-only access

**Version 2.0** - Staff support added
- Staff can access with permissions
- Permission-based filtering
- Staff action logging
- UserContext in responses
- Bug fixes for ownership checks

---

**END OF FUNNEL DOCUMENTATION**

**Related Files:**
- `controllers/funnelController.js` - Funnel CRUD operations
- `controllers/analyticsController.js` - Analytics logic
- `routes/funnelRoutes.js` - Route definitions
- `middleware/unifiedCoachAuth.js` - Permission middleware
- `utils/sectionPermissions.js` - Permission definitions

