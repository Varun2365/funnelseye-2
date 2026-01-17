# Lead Management API Documentation - Coach & Staff

## Overview

All lead management endpoints work for **both Coach and Staff** with appropriate permissions.

**IMPORTANT:** Staff can **ONLY** see and manage leads that have been **assigned to them**, unless they have the `leads:manage_all` permission.

---

# 🔐 LEAD PERMISSION SYSTEM

## Available Lead Permissions:

| Permission String | Constant | Description | Staff Impact |
|------------------|----------|-------------|--------------|
| `leads:view` | `SECTIONS.LEADS.VIEW` | View assigned leads | Can view only assigned leads |
| `leads:create` | `SECTIONS.LEADS.CREATE` | Create new leads | Can create leads (assigned to coach) |
| `leads:update` | `SECTIONS.LEADS.UPDATE` | Update lead information | Can update only assigned leads |
| `leads:delete` | `SECTIONS.LEADS.DELETE` | Delete leads | Can delete only assigned leads |
| `leads:assign` | `SECTIONS.LEADS.ASSIGN` | Assign leads to other staff | Can reassign their leads to others |
| `leads:export` | `SECTIONS.LEADS.EXPORT` | Export lead data | Can export only assigned leads |
| `leads:manage_all` | `SECTIONS.LEADS.MANAGE_ALL` | View and manage ALL coach leads | **Can see ALL coach leads** |
| `leads:manage` | `SECTIONS.LEADS.MANAGE` | Full lead management | Complete lead management access |

---

# ⚠️ CRITICAL RULE: LEAD ASSIGNMENT

## Lead Visibility for Staff:

Staff can **ONLY** see leads where:
1. `lead.assignedTo` matches their user ID, OR
2. `lead.appointment.assignedStaffId` matches their user ID

**Exception:** Staff with `leads:manage_all` permission can see ALL coach leads.

### Coach vs Staff:

| User Type | Sees | Query Filter |
|-----------|------|--------------|
| **Coach** | All their leads | `{ coachId: coach_id }` |
| **Staff (normal)** | Only assigned leads | `{ coachId: coach_id, $or: [{ assignedTo: staff_id }, { 'appointment.assignedStaffId': staff_id }] }` |
| **Staff (manage_all)** | All coach leads | `{ coachId: coach_id }` |

---

# 📋 ALL LEAD MANAGEMENT ROUTES

## Base Path: `/api/leads`

| # | Method | Route | Permission | Description |
|---|--------|-------|------------|-------------|
| 1 | `POST` | `/api/leads` | Public | Create lead (from funnel) |
| 2 | `PUT` | `/api/leads/:leadId` | Public | Update lead (from funnel) |
| 3 | `POST` | `/api/leads/question-responses` | Public | Submit question responses |
| 4 | `GET` | `/api/leads/question-types` | Public | Get available question types |
| 5 | `GET` | `/api/leads` | `leads:view` | Get all leads (filtered) |
| 6 | `GET` | `/api/leads/:leadId` | `leads:view` | Get single lead |
| 7 | `DELETE` | `/api/leads/:leadId` | `leads:delete` | Delete lead |
| 8 | `POST` | `/api/leads/:leadId/followup` | `leads:update` | Add follow-up note |
| 9 | `GET` | `/api/leads/followups/upcoming` | `leads:view` | Get upcoming follow-ups |
| 10 | `POST` | `/api/leads/assign-nurturing-sequence` | `leads:manage` | Assign nurturing sequence |
| 11 | `POST` | `/api/leads/advance-nurturing-step` | `leads:update` | Advance nurturing step |
| 12 | `GET` | `/api/leads/:leadId/nurturing-progress` | `leads:view` | Get nurturing progress |
| 13 | `POST` | `/api/leads/:leadId/ai-rescore` | AI Write | Rescore lead with AI |
| 14 | `GET` | `/api/leads/:leadId/ai-qualify` | AI Read | Get AI qualification |
| 15 | `POST` | `/api/leads/:leadId/generate-nurturing-sequence` | AI Write | Generate AI sequence |
| 16 | `POST` | `/api/leads/:leadId/generate-followup-message` | AI Write | Generate AI follow-up |

## Additional Lead Routes:

### Lead Magnets: `/api/lead-magnets`
### Lead Magnet Management: `/api/lead-magnet-management`
### Lead Scoring: `/api/lead-scoring` (Public tracking)
### Lead Nurturing: `/api/lead-nurturing`

---

# 📍 ROUTE 1-4: Public Lead Routes

These routes are **PUBLIC** (no authentication required) - used by funnel pages to create and update leads.

```
POST /api/leads
PUT /api/leads/:leadId
POST /api/leads/question-responses
GET /api/leads/question-types
```

**Not documented here** - these are public funnel integration endpoints.

---

# 📍 ROUTE 5: Get All Leads

```
GET /api/leads
```

**Permission Required:** `leads:view`

**Query Parameters:**
- `status` - Filter by lead status (New, Contacted, Qualified, Converted, Lost)
- `source` - Filter by lead source
- `leadScore[gte]` - Minimum lead score
- `leadScore[lte]` - Maximum lead score
- `nextFollowUpAt[lte]` - Follow-ups before date
- `select` - Select specific fields (comma-separated)
- `sort` - Sort by field (e.g., `-createdAt`, `leadScore`)
- `page` - Page number (default: 1)
- `limit` - Results per page (default: 25)

## 🎯 COACH RESPONSE:

```json
{
  "success": true,
  "count": 150,
  "pagination": {
    "next": {
      "page": 2,
      "limit": 25
    }
  },
  "data": [
    {
      "_id": "lead_id_1",
      "coachId": "coach_id",
      "funnelId": {
        "_id": "funnel_id",
        "name": "Weight Loss Funnel"
      },
      "name": "John Doe",
      "email": "john@example.com",
      "phone": "+919876543210",
      "status": "Qualified",
      "leadScore": 85,
      "leadTemperature": "Hot",
      "source": "Facebook Ads",
      "targetAudience": "Weight Loss",
      "clientQuestions": {
        "healthGoal": "Lose Weight (15+ kg)",
        "timelineForResults": "1-3 months (Urgent)",
        "seriousnessLevel": "Very serious - willing to invest time and money",
        "investmentRange": "₹50,000 - ₹1,00,000"
      },
      "score": 85,
      "maxScore": 100,
      "qualificationInsights": [
        "Significant weight loss goal - high motivation",
        "Urgent timeline - high priority",
        "Very serious - high conversion potential"
      ],
      "recommendations": [
        "Book consultation immediately",
        "Send premium package details",
        "Assign dedicated support"
      ],
      "assignedTo": {
        "_id": "staff_id_1",
        "name": "Alice Smith"
      },
      "appointment": {
        "assignedStaffId": "staff_id_1",
        "isBooked": true,
        "scheduledTime": "2025-10-12T14:00:00.000Z"
      },
      "followUpHistory": [
        {
          "_id": "followup_id_1",
          "note": "Initial contact made, very interested",
          "createdBy": {
            "_id": "coach_id",
            "name": "Coach Name"
          },
          "followUpDate": "2025-10-10T10:00:00.000Z"
        }
      ],
      "nextFollowUpAt": "2025-10-13T10:00:00.000Z",
      "lastContactedAt": "2025-10-10T10:00:00.000Z",
      "nurturingSequence": "sequence_id",
      "nurturingStepIndex": 2,
      "createdAt": "2025-10-01T12:00:00.000Z",
      "updatedAt": "2025-10-10T10:30:00.000Z"
    }
    // ... more leads (up to 25 per page)
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
- ✅ **ALL** leads (150 total in this example)
- ✅ Complete lead details
- ✅ Assignment information
- ✅ Follow-up history
- ✅ Nurturing sequence progress
- ✅ Full qualification data
- ✅ All lead scores and insights

---

## 👤 STAFF RESPONSE (Normal Staff):

```json
{
  "success": true,
  "count": 15,
  "pagination": {},
  "data": [
    {
      "_id": "lead_id_5",
      "coachId": "coach_id",
      "funnelId": {
        "_id": "funnel_id",
        "name": "Weight Loss Funnel"
      },
      "name": "Sarah Johnson",
      "email": "sarah@example.com",
      "phone": "+919876543215",
      "status": "Contacted",
      "leadScore": 72,
      "leadTemperature": "Warm",
      "source": "Instagram",
      "targetAudience": "Weight Loss",
      "clientQuestions": {
        "healthGoal": "Lose Weight (5-15 kg)",
        "timelineForResults": "3-6 months (Moderate)"
      },
      "score": 72,
      "maxScore": 100,
      "qualificationInsights": [
        "Specific health goal - good motivation",
        "Moderate timeline - good commitment"
      ],
      "recommendations": [
        "Schedule follow-up call",
        "Send success stories"
      ],
      "assignedTo": {
        "_id": "my_staff_id",
        "name": "John Doe (Me)"
      },
      "followUpHistory": [
        {
          "_id": "followup_id_1",
          "note": "Initial contact made",
          "createdBy": {
            "_id": "my_staff_id",
            "name": "John Doe (Me)"
          },
          "followUpDate": "2025-10-10T10:00:00.000Z"
        }
      ],
      "nextFollowUpAt": "2025-10-12T10:00:00.000Z",
      "lastContactedAt": "2025-10-10T10:00:00.000Z",
      "createdAt": "2025-10-08T12:00:00.000Z",
      "updatedAt": "2025-10-10T10:30:00.000Z"
    }
    // ... only 15 leads (assigned to this staff member)
  ],
  "userContext": {
    "isStaff": true,
    "isCoach": false,
    "userId": "my_staff_id",
    "permissions": [
      "leads:view",
      "leads:update",
      "leads:create"
    ]
  }
}
```

**Staff Sees (Normal):**
- ✅ **ONLY** leads assigned to them (15 out of 150 total)
- ✅ Complete details of assigned leads
- ✅ Their own follow-up history
- ⚠️ Cannot see unassigned leads
- ⚠️ Cannot see other staff's leads

---

## 👤 STAFF RESPONSE (With `leads:manage_all`):

```json
{
  "success": true,
  "count": 150,
  "pagination": {
    "next": {
      "page": 2,
      "limit": 25
    }
  },
  "data": [
    {
      "_id": "lead_id_1",
      "name": "John Doe",
      "email": "john@example.com",
      "status": "Qualified",
      "leadScore": 85,
      "assignedTo": {
        "_id": "staff_id_1",
        "name": "Alice Smith"
      }
    },
    {
      "_id": "lead_id_2",
      "name": "Jane Smith",
      "assignedTo": {
        "_id": "staff_id_2",
        "name": "Bob Wilson"
      }
    },
    {
      "_id": "lead_id_5",
      "name": "Sarah Johnson",
      "assignedTo": {
        "_id": "my_staff_id",
        "name": "John Doe (Me)"
      }
    }
    // ... ALL 150 leads (same as coach)
  ],
  "userContext": {
    "isStaff": true,
    "isCoach": false,
    "userId": "my_staff_id",
    "permissions": [
      "leads:view",
      "leads:manage_all"
    ]
  }
}
```

**Staff Sees (With `leads:manage_all`):**
- ✅ **ALL** coach leads (150 total - same as coach)
- ✅ Can see leads assigned to other staff members
- ✅ Complete lead details
- ✅ Can manage any lead (with appropriate permissions)

---

# 📍 ROUTE 6: Get Single Lead

```
GET /api/leads/:leadId
```

**Permission Required:** `leads:view`

## 🎯 COACH RESPONSE:

```json
{
  "success": true,
  "data": {
    "_id": "lead_id_1",
    "coachId": "coach_id",
    "funnelId": {
      "_id": "funnel_id",
      "name": "Weight Loss Funnel"
    },
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+919876543210",
    "whatsappNumber": "+919876543210",
    "status": "Qualified",
    "leadScore": 85,
    "leadTemperature": "Hot",
    "source": "Facebook Ads",
    "targetAudience": "Weight Loss",
    "clientQuestions": {
      "watchedVideo": "Yes",
      "healthGoal": "Lose Weight (15+ kg)",
      "timelineForResults": "1-3 months (Urgent)",
      "seriousnessLevel": "Very serious - willing to invest time and money",
      "investmentRange": "₹50,000 - ₹1,00,000",
      "startTimeline": "Immediately (This week)"
    },
    "coachQuestions": {
      "currentWeight": "90 kg",
      "targetWeight": "70 kg",
      "lifestyle": "Sedentary",
      "dietPreference": "Vegetarian"
    },
    "score": 85,
    "maxScore": 100,
    "qualificationInsights": [
      "Watched full video - high engagement",
      "Significant weight loss goal - high motivation",
      "Urgent timeline - high priority",
      "Very serious - high conversion potential",
      "Good investment capacity - solid client",
      "Immediate start - high urgency"
    ],
    "recommendations": [
      "Book consultation immediately - high conversion probability",
      "Send premium package details",
      "Assign dedicated support for quick response",
      "Highlight immediate start options"
    ],
    "assignedTo": {
      "_id": "staff_id_1",
      "name": "Alice Smith"
    },
    "appointment": {
      "isBooked": true,
      "scheduledTime": "2025-10-12T14:00:00.000Z",
      "duration": 60,
      "zoomLink": "https://zoom.us/j/123456",
      "assignedStaffId": "staff_id_1"
    },
    "followUpHistory": [
      {
        "_id": "followup_id_1",
        "note": "Initial contact made, very interested in premium package",
        "createdBy": {
          "_id": "staff_id_1",
          "name": "Alice Smith"
        },
        "followUpDate": "2025-10-10T10:00:00.000Z"
      },
      {
        "_id": "followup_id_2",
        "note": "Sent package details via email",
        "createdBy": {
          "_id": "staff_id_1",
          "name": "Alice Smith"
        },
        "followUpDate": "2025-10-10T15:00:00.000Z"
      }
    ],
    "nextFollowUpAt": "2025-10-13T10:00:00.000Z",
    "lastContactedAt": "2025-10-10T15:00:00.000Z",
    "nurturingSequence": {
      "_id": "sequence_id",
      "name": "Hot Lead Sequence",
      "steps": []
    },
    "nurturingStepIndex": 2,
    "metadata": {
      "browser": "Chrome",
      "device": "Mobile",
      "ipAddress": "192.168.1.1"
    },
    "createdAt": "2025-10-01T12:00:00.000Z",
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

---

## 👤 STAFF RESPONSE (Assigned Lead):

```json
{
  "success": true,
  "data": {
    "_id": "lead_id_5",
    "coachId": "coach_id",
    "funnelId": {
      "_id": "funnel_id",
      "name": "Weight Loss Funnel"
    },
    "name": "Sarah Johnson",
    "email": "sarah@example.com",
    "phone": "+919876543215",
    "status": "Contacted",
    "leadScore": 72,
    "leadTemperature": "Warm",
    "source": "Instagram",
    "targetAudience": "Weight Loss",
    "clientQuestions": {
      "healthGoal": "Lose Weight (5-15 kg)",
      "timelineForResults": "3-6 months (Moderate)"
    },
    "score": 72,
    "maxScore": 100,
    "qualificationInsights": [
      "Specific health goal - good motivation",
      "Moderate timeline - good commitment"
    ],
    "recommendations": [
      "Schedule follow-up call",
      "Send success stories"
    ],
    "assignedTo": {
      "_id": "my_staff_id",
      "name": "John Doe (Me)"
    },
    "followUpHistory": [
      {
        "_id": "followup_id_1",
        "note": "Initial contact made",
        "createdBy": {
          "_id": "my_staff_id",
          "name": "John Doe (Me)"
        },
        "followUpDate": "2025-10-10T10:00:00.000Z"
      }
    ],
    "nextFollowUpAt": "2025-10-12T10:00:00.000Z",
    "lastContactedAt": "2025-10-10T10:00:00.000Z",
    "createdAt": "2025-10-08T12:00:00.000Z",
    "updatedAt": "2025-10-10T10:30:00.000Z"
  },
  "userContext": {
    "isStaff": true,
    "isCoach": false,
    "userId": "my_staff_id",
    "permissions": [
      "leads:view",
      "leads:update"
    ]
  }
}
```

**Staff Sees:**
- ✅ Full details of their assigned lead
- ✅ Follow-up history
- ✅ Qualification insights
- ✅ Assignment information

---

## 👤 STAFF RESPONSE (NOT Assigned Lead):

```json
{
  "success": false,
  "message": "Lead not found or you do not have access to this lead."
}
```

**If lead is not assigned to staff:**
- ❌ 404 Not Found
- ⚠️ Staff cannot access unassigned leads
- ⚠️ Unless they have `leads:manage_all` permission

---

# 📍 ROUTE 7: Delete Lead

```
DELETE /api/leads/:leadId
```

**Permission Required:** `leads:delete`

## 🎯 COACH RESPONSE:

```json
{
  "success": true,
  "data": {}
}
```

---

## 👤 STAFF RESPONSE:

```json
{
  "success": true,
  "data": {}
}
```

**Staff Can Delete (with `leads:delete` permission):**
- ✅ Can delete leads assigned to them
- ❌ Cannot delete unassigned leads (404 error)
- ⚠️ Deletion is permanent
- ✅ Staff action is logged for audit

---

# 📍 ROUTE 8: Add Follow-Up Note

```
POST /api/leads/:leadId/followup
```

**Permission Required:** `leads:update`

### Request Body:
```json
{
  "note": "Had a great conversation, interested in premium package",
  "nextFollowUpAt": "2025-10-15T10:00:00.000Z"
}
```

## 🎯 COACH RESPONSE:

```json
{
  "success": true,
  "data": {
    "_id": "lead_id_1",
    "name": "John Doe",
    "followUpHistory": [
      {
        "_id": "followup_id_3",
        "note": "Had a great conversation, interested in premium package",
        "createdBy": "coach_id",
        "followUpDate": "2025-10-11T11:00:00.000Z"
      }
    ],
    "nextFollowUpAt": "2025-10-15T10:00:00.000Z",
    "lastContactedAt": "2025-10-11T11:00:00.000Z"
  }
}
```

---

## 👤 STAFF RESPONSE:

```json
{
  "success": true,
  "data": {
    "_id": "lead_id_5",
    "name": "Sarah Johnson",
    "followUpHistory": [
      {
        "_id": "followup_id_2",
        "note": "Had a great conversation, interested in premium package",
        "createdBy": "my_staff_id",
        "followUpDate": "2025-10-11T11:00:00.000Z"
      }
    ],
    "nextFollowUpAt": "2025-10-15T10:00:00.000Z",
    "lastContactedAt": "2025-10-11T11:00:00.000Z"
  }
}
```

**Staff Can (with `leads:update` permission):**
- ✅ Add follow-up notes to assigned leads
- ✅ Set next follow-up date
- ✅ Notes are attributed to staff member
- ❌ Cannot add notes to unassigned leads

---

# 📍 ROUTE 9: Get Upcoming Follow-Ups

```
GET /api/leads/followups/upcoming?days=7&includeOverdue=true
```

**Permission Required:** `leads:view`

**Query Parameters:**
- `days` - Number of days to look ahead (default: 7)
- `includeOverdue` - Include overdue follow-ups (default: false)

## 🎯 COACH RESPONSE:

```json
{
  "success": true,
  "count": 25,
  "data": [
    {
      "_id": "lead_id_1",
      "name": "John Doe",
      "email": "john@example.com",
      "phone": "+919876543210",
      "status": "Qualified",
      "nextFollowUpAt": "2025-10-11T10:00:00.000Z",
      "leadScore": 85,
      "assignedTo": {
        "_id": "staff_id_1",
        "name": "Alice Smith"
      },
      "funnelId": {
        "_id": "funnel_id",
        "name": "Weight Loss Funnel"
      },
      "daysUntilFollowup": 0,
      "isOverdue": false
    },
    {
      "_id": "lead_id_2",
      "name": "Jane Smith",
      "nextFollowUpAt": "2025-10-09T10:00:00.000Z",
      "assignedTo": {
        "_id": "staff_id_2",
        "name": "Bob Wilson"
      },
      "daysUntilFollowup": -2,
      "isOverdue": true
    }
    // ... all leads with upcoming follow-ups (25 total)
  ]
}
```

**Coach Sees:**
- ✅ ALL upcoming follow-ups (all staff members)
- ✅ Overdue follow-ups
- ✅ Assignment information

---

## 👤 STAFF RESPONSE:

```json
{
  "success": true,
  "count": 5,
  "data": [
    {
      "_id": "lead_id_5",
      "name": "Sarah Johnson",
      "email": "sarah@example.com",
      "phone": "+919876543215",
      "status": "Contacted",
      "nextFollowUpAt": "2025-10-12T10:00:00.000Z",
      "leadScore": 72,
      "assignedTo": {
        "_id": "my_staff_id",
        "name": "John Doe (Me)"
      },
      "funnelId": {
        "_id": "funnel_id",
        "name": "Weight Loss Funnel"
      },
      "daysUntilFollowup": 1,
      "isOverdue": false
    },
    {
      "_id": "lead_id_8",
      "name": "Mike Brown",
      "nextFollowUpAt": "2025-10-10T10:00:00.000Z",
      "assignedTo": {
        "_id": "my_staff_id",
        "name": "John Doe (Me)"
      },
      "daysUntilFollowup": -1,
      "isOverdue": true
    }
    // ... only 5 leads (assigned to this staff member)
  ],
  "userContext": {
    "isStaff": true,
    "isCoach": false,
    "userId": "my_staff_id",
    "permissions": [
      "leads:view",
      "leads:update"
    ]
  }
}
```

**Staff Sees:**
- ✅ **ONLY** their assigned leads with upcoming follow-ups
- ✅ Overdue follow-ups (if included)
- ⚠️ Cannot see other staff's follow-ups

---

# 📍 ROUTE 10: Assign Nurturing Sequence

```
POST /api/leads/assign-nurturing-sequence
```

**Permission Required:** `leads:manage`

### Request Body:
```json
{
  "leadId": "lead_id_here",
  "sequenceId": "sequence_id_here"
}
```

## 🎯 COACH RESPONSE:

```json
{
  "success": true,
  "message": "Nurturing sequence assigned",
  "data": {
    "_id": "lead_id_1",
    "name": "John Doe",
    "nurturingSequence": "sequence_id",
    "nurturingStepIndex": 0,
    "updatedAt": "2025-10-11T12:00:00.000Z"
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
  "message": "Nurturing sequence assigned",
  "data": {
    "_id": "lead_id_5",
    "name": "Sarah Johnson",
    "nurturingSequence": "sequence_id",
    "nurturingStepIndex": 0,
    "updatedAt": "2025-10-11T12:00:00.000Z"
  },
  "userContext": {
    "isStaff": true,
    "isCoach": false,
    "userId": "my_staff_id",
    "permissions": [
      "leads:manage",
      "leads:view"
    ]
  }
}
```

**Staff Can (with `leads:manage` permission):**
- ✅ Assign nurturing sequences to assigned leads
- ❌ Cannot assign to unassigned leads

---

# 📍 ROUTE 11: Advance Nurturing Step

```
POST /api/leads/advance-nurturing-step
```

**Permission Required:** `leads:update`

### Request Body:
```json
{
  "leadId": "lead_id_here"
}
```

## 🎯 COACH & STAFF RESPONSE (Similar):

```json
{
  "success": true,
  "message": "Nurturing step advanced",
  "data": {
    "_id": "lead_id_1",
    "nurturingStepIndex": 3,
    "currentStep": {
      "actionType": "send_email",
      "content": "Follow-up email content",
      "delayDays": 2
    }
  }
}
```

**Staff Can (with `leads:update` permission):**
- ✅ Advance nurturing for assigned leads
- ❌ Cannot advance for unassigned leads

---

# 📍 ROUTE 12: Get Nurturing Progress

```
GET /api/leads/:leadId/nurturing-progress
```

**Permission Required:** `leads:view`

## 🎯 COACH & STAFF RESPONSE:

```json
{
  "success": true,
  "data": {
    "sequence": {
      "_id": "sequence_id",
      "name": "Hot Lead Sequence",
      "description": "5-step sequence for hot leads",
      "steps": [
        {
          "stepNumber": 1,
          "actionType": "send_whatsapp",
          "content": "Initial contact message",
          "delayDays": 0
        },
        {
          "stepNumber": 2,
          "actionType": "send_email",
          "content": "Package details email",
          "delayDays": 1
        },
        {
          "stepNumber": 3,
          "actionType": "send_whatsapp",
          "content": "Follow-up message",
          "delayDays": 2
        }
      ]
    },
    "currentStep": {
      "stepNumber": 3,
      "actionType": "send_whatsapp",
      "content": "Follow-up message",
      "delayDays": 2
    },
    "stepIndex": 2
  },
  "userContext": {
    "isStaff": true,
    "isCoach": false,
    "userId": "my_staff_id",
    "permissions": [
      "leads:view"
    ]
  }
}
```

**Staff Can (with `leads:view` permission):**
- ✅ View nurturing progress for assigned leads
- ❌ Cannot view for unassigned leads

---

# 📍 ROUTE 13: AI Rescore Lead

```
POST /api/leads/:leadId/ai-rescore
```

**Permission Required:** AI Write permission

## 🎯 COACH & STAFF RESPONSE:

```json
{
  "success": true,
  "data": {
    "leadId": "lead_id_1",
    "score": 88,
    "explanation": {
      "videoEngagement": 15,
      "healthGoalSpecificity": 20,
      "timelineUrgency": 20,
      "seriousnessLevel": 25,
      "investmentRange": 8
    }
  },
  "userContext": {
    "isStaff": true,
    "isCoach": false,
    "userId": "my_staff_id",
    "permissions": [
      "leads:view",
      "ai:write"
    ]
  }
}
```

**Staff Can (with AI permission):**
- ✅ Rescore assigned leads using AI
- ❌ Cannot rescore unassigned leads

---

# 📍 ROUTE 14: AI Qualify Lead

```
GET /api/leads/:leadId/ai-qualify
```

**Permission Required:** AI Read permission

## 🎯 COACH & STAFF RESPONSE:

```json
{
  "success": true,
  "data": {
    "leadId": "lead_id_1",
    "insights": {
      "qualification": "High Quality Lead",
      "conversionProbability": 85,
      "urgency": "High",
      "suggestedActions": [
        "Book consultation within 24 hours",
        "Send premium package details",
        "Assign dedicated support"
      ],
      "riskFactors": [],
      "strengths": [
        "High engagement with content",
        "Clear health goals",
        "Strong investment capacity",
        "Urgent timeline"
      ]
    }
  }
}
```

---

# 📍 ROUTE 15: Generate AI Nurturing Sequence

```
POST /api/leads/:leadId/generate-nurturing-sequence
```

**Permission Required:** AI Write permission

### Request Body:
```json
{
  "sequenceType": "warm_lead"
}
```

**Sequence Types:**
- `warm_lead` - For engaged leads
- `cold_lead` - For unresponsive leads
- `post_consultation` - After consultation
- `objection_handling` - For hesitant leads

## 🎯 COACH & STAFF RESPONSE:

```json
{
  "success": true,
  "data": {
    "sequence": {
      "name": "AI-Generated Warm Lead Sequence",
      "description": "5-step sequence for Sarah Johnson",
      "steps": [
        {
          "stepNumber": 1,
          "actionType": "send_whatsapp",
          "content": "Hi Sarah! Thanks for your interest in our weight loss program...",
          "delayDays": 0,
          "title": "Initial Welcome"
        },
        {
          "stepNumber": 2,
          "actionType": "send_email",
          "content": "Subject: Your Personalized Weight Loss Plan\n\nHi Sarah...",
          "delayDays": 1,
          "title": "Send Package Details"
        },
        {
          "stepNumber": 3,
          "actionType": "send_whatsapp",
          "content": "Sarah, I wanted to follow up on the package details I sent...",
          "delayDays": 2,
          "title": "Follow-up Check"
        }
      ],
      "targetAudience": "Weight Loss - Moderate Timeline",
      "generatedBy": "AI",
      "generatedAt": "2025-10-11T12:00:00.000Z"
    }
  }
}
```

**Staff Can (with AI Write permission):**
- ✅ Generate AI sequences for assigned leads
- ❌ Cannot generate for unassigned leads

---

# 📍 ROUTE 16: Generate AI Follow-Up Message

```
POST /api/leads/:leadId/generate-followup-message
```

**Permission Required:** AI Write permission

### Request Body:
```json
{
  "followUpType": "first_followup",
  "context": "Lead showed interest but hasn't responded in 3 days"
}
```

**Follow-Up Types:**
- `first_followup` - Initial follow-up
- `reminder` - Gentle reminder
- `objection_handling` - Address concerns
- `re_engagement` - Bring back cold lead

## 🎯 COACH & STAFF RESPONSE:

```json
{
  "success": true,
  "data": {
    "message": "Hi Sarah! 👋\n\nI wanted to follow up on our conversation about your weight loss goals. I know you mentioned wanting to lose 5-15kg over the next 3-6 months.\n\nI have some great success stories from clients with similar goals that I'd love to share with you. Would you be available for a quick 15-minute call this week?\n\nLooking forward to helping you achieve your transformation!\n\nBest regards,\nJohn",
    "type": "whatsapp",
    "suggestedTiming": "morning",
    "tone": "friendly_professional",
    "generatedAt": "2025-10-11T12:00:00.000Z"
  }
}
```

**Staff Can (with AI Write permission):**
- ✅ Generate personalized follow-up messages for assigned leads
- ❌ Cannot generate for unassigned leads

---

# 🔒 STAFF ACCESS SUMMARY

## What Staff Can Do (With Permissions):

| Permission | Can Do | Cannot Do |
|------------|--------|-----------|
| `leads:view` | • View assigned leads<br>• See lead details<br>• View follow-up history<br>• Check nurturing progress | • View unassigned leads<br>• See other staff's leads<br>• Access leads from other coaches |
| `leads:create` | • Create new leads for coach<br>• Leads auto-assigned to coach | • Create leads for other coaches |
| `leads:update` | • Update assigned lead info<br>• Add follow-up notes<br>• Change lead status<br>• Advance nurturing steps | • Update unassigned leads<br>• Modify other staff's leads |
| `leads:delete` | • Delete assigned leads | • Delete unassigned leads<br>• Delete other staff's leads |
| `leads:assign` | • Reassign their leads to others<br>• Change assignment | • Assign unassigned leads |
| `leads:export` | • Export assigned leads data<br>• Download CSV | • Export unassigned leads |
| `leads:manage_all` | • **View ALL coach leads**<br>• Manage any lead<br>• Full access like coach | N/A - Full access granted |
| `leads:manage` | • Full lead management<br>• All CRUD operations | • Limited to assigned leads |

---

# 🚀 TESTING EXAMPLES

## Test 1: Coach Gets All Leads
```bash
GET /api/leads
Authorization: Bearer {COACH_TOKEN}

# Expected: All 150 leads
```

## Test 2: Staff Gets Leads (Normal Permission)
```bash
GET /api/leads
Authorization: Bearer {STAFF_TOKEN}

# Staff has leads:view (no manage_all)
# Expected: Only 15 assigned leads
```

## Test 3: Staff Gets Leads (With manage_all)
```bash
GET /api/leads
Authorization: Bearer {STAFF_WITH_MANAGE_ALL_TOKEN}

# Staff has leads:view + leads:manage_all
# Expected: All 150 leads (same as coach)
```

## Test 4: Staff Tries to View Unassigned Lead
```bash
GET /api/leads/unassigned_lead_id
Authorization: Bearer {STAFF_TOKEN}

# Lead is not assigned to this staff
# Expected: 404 Not Found
{
  "success": false,
  "message": "Lead not found or you do not have access to this lead."
}
```

## Test 5: Staff Updates Assigned Lead
```bash
PUT /api/leads/assigned_lead_id/followup
Authorization: Bearer {STAFF_TOKEN}
Content-Type: application/json

{
  "note": "Follow-up complete",
  "nextFollowUpAt": "2025-10-15T10:00:00.000Z"
}

# Staff has leads:update
# Lead is assigned to staff
# Expected: Success
```

## Test 6: Staff Deletes Assigned Lead
```bash
DELETE /api/leads/assigned_lead_id
Authorization: Bearer {STAFF_TOKEN}

# Staff has leads:delete
# Lead is assigned to staff
# Expected: Success (lead deleted, action logged)
```

## Test 7: Staff Without Permission
```bash
GET /api/leads
Authorization: Bearer {STAFF_WITHOUT_PERMISSION}

# Staff does NOT have leads:view
# Expected: 403 Forbidden
```

---

# 📊 LEAD ASSIGNMENT METHODS

## How Leads Get Assigned to Staff:

### 1. Manual Assignment (by Coach)
- Coach assigns leads to staff via admin panel
- Sets `lead.assignedTo = staff_id`

### 2. Automation System
- Automation rules can auto-assign leads
- Based on criteria (source, score, round-robin, etc.)

### 3. Appointment Booking
- When appointment booked, sets `lead.appointment.assignedStaffId`
- Staff can see lead through this assignment too

### 4. Staff Creates Lead
- When staff creates a lead, it can be auto-assigned to them
- Or assigned to coach by default

---

# 💡 FRONTEND IMPLEMENTATION GUIDE

## 1. Lead List - Check Assignment

```javascript
leads.forEach(lead => {
  const isAssignedToMe = 
    lead.assignedTo?._id === currentUserId || 
    lead.appointment?.assignedStaffId === currentUserId;
  
  if (isAssignedToMe) {
    // Highlight as "My Lead"
    renderLeadCard(lead, { highlight: true, badge: 'Assigned to Me' });
  } else {
    // Regular display (only if has manage_all)
    renderLeadCard(lead);
  }
});
```

## 2. Lead Detail - Show Assignment Info

```javascript
if (userContext.isStaff) {
  const isMyLead = 
    lead.assignedTo?._id === userContext.userId ||
    lead.appointment?.assignedStaffId === userContext.userId;
  
  if (isMyLead) {
    showBadge('Assigned to You', 'success');
  } else if (userContext.permissions.includes('leads:manage_all')) {
    showBadge(`Assigned to ${lead.assignedTo?.name}`, 'info');
  }
}
```

## 3. Permission-Based Actions

```javascript
const canUpdate = userContext.permissions.includes('leads:update');
const canDelete = userContext.permissions.includes('leads:delete');
const canAssign = userContext.permissions.includes('leads:assign');

if (canUpdate) {
  showEditButton();
  showAddFollowupButton();
}

if (canDelete) {
  showDeleteButton();
}

if (canAssign) {
  showReassignButton();
}
```

## 4. Lead Creation Flow (Staff)

```javascript
const createLead = async (leadData) => {
  const response = await fetch('/api/leads', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${staffToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      ...leadData,
      coachId: userContext.coachId,  // Staff creates for their coach
      assignedTo: userContext.userId  // Auto-assign to self (optional)
    })
  });
  
  if (response.ok) {
    showSuccess('Lead created and assigned to you');
  }
};
```

## 5. Follow-Up Management

```javascript
// Show only assigned leads needing follow-up
const upcomingFollowups = await getUpcomingFollowUps(7, true);

upcomingFollowups.data.forEach(lead => {
  renderFollowUpCard({
    leadName: lead.name,
    dueDate: lead.nextFollowUpAt,
    isOverdue: lead.isOverdue,
    priority: lead.isOverdue ? 'urgent' : 'normal',
    onClick: () => openLeadDetail(lead._id)
  });
});
```

---

# 🎨 UI RECOMMENDATIONS

## Staff Lead List View

```
+--------------------------------------------------------+
|  📋 My Leads (15)                   [+ Create Lead]    |
|  Filter: [All] [New] [Contacted] [Qualified]          |
+--------------------------------------------------------+
|                                                         |
|  🔥 HOT LEAD - Sarah Johnson                  Score: 85|
|  📱 +91-987-654-3215 | 📧 sarah@example.com           |
|  Status: Qualified | Source: Instagram                 |
|  📅 Follow-up: Tomorrow at 10:00 AM                    |
|  [View] [Add Note] [Message] [Book Appointment]       |
|                                                         |
|  🌡️ WARM - Mike Brown                       Score: 72  |
|  Contacted | Facebook Ads                               |
|  ⚠️ Overdue follow-up (2 days ago)                     |
|  [View] [Follow Up] [Message]                         |
|                                                         |
+--------------------------------------------------------+
```

## Staff Lead Detail View

```
+--------------------------------------------------------+
|  🔙 Back to Leads                                      |
+--------------------------------------------------------+
|  Sarah Johnson                             ⭐ Score: 85|
|  🏷️ Assigned to Me                       Status: Qualified|
+--------------------------------------------------------+
|                                                         |
|  📞 Contact Information                                |
|  Phone: +91-987-654-3215                               |
|  Email: sarah@example.com                              |
|  WhatsApp: Available                                   |
|                                                         |
|  🎯 Health Goals                                       |
|  Goal: Lose Weight (5-15 kg)                          |
|  Timeline: 3-6 months (Moderate)                       |
|  Seriousness: Serious - depends on approach            |
|                                                         |
|  💼 Qualification Insights                             |
|  ✅ Specific health goal - good motivation             |
|  ✅ Moderate timeline - good commitment                |
|  ✅ Exploring options - needs nurturing                |
|                                                         |
|  📝 Recommendations                                    |
|  • Schedule follow-up call                             |
|  • Send success stories                                |
|  • Highlight flexible payment options                  |
|                                                         |
|  📅 Follow-Up Schedule                                 |
|  Next Follow-up: Oct 12, 2025 at 10:00 AM             |
|  [Reschedule] [Mark Complete] [Add Note]              |
|                                                         |
|  💬 Follow-Up History (3 notes)                        |
|  Oct 10 - Initial contact made                         |
|  Oct 10 - Sent package details                         |
|  Oct 11 - Follow-up scheduled                          |
|                                                         |
|  🤖 AI Actions                                         |
|  [Generate Follow-up Message]                          |
|  [Rescore Lead]                                        |
|  [Generate Nurturing Sequence]                         |
|                                                         |
+--------------------------------------------------------+
```

## Staff Without manage_all

```
+--------------------------------------------------------+
|  📋 My Leads (15)                                      |
|  ℹ️ You can only see leads assigned to you            |
+--------------------------------------------------------+
```

## Staff With manage_all

```
+--------------------------------------------------------+
|  📋 All Leads (150)                  🌟 Full Access    |
|  Filter: [My Leads (15)] [All Leads (150)]            |
|  Assigned to: [Me] [Alice] [Bob] [Unassigned]         |
+--------------------------------------------------------+
```

---

# ⚠️ IMPORTANT SECURITY NOTES

## Automatic Lead Filtering:

✅ **All lead queries are automatically filtered** using:
```javascript
CoachStaffService.buildLeadQueryFilter(req, baseQuery)
```

This ensures:
1. Staff can only query assigned leads
2. Coach can query all their leads
3. No manual filtering needed in controllers
4. Secure by default

## Audit Trail:

✅ **All staff actions are logged:**
```javascript
CoachStaffService.logStaffAction(req, 'update', 'leads', 'add_followup', { ... })
```

Coach can see:
- Which staff member performed the action
- What action was performed
- When it was performed
- On which lead

---

# 🔄 COMPARISON: COACH vs STAFF

| Feature | Coach | Staff (Normal) | Staff (manage_all) |
|---------|-------|----------------|-------------------|
| **Leads Visible** | All 150 leads | Only 15 assigned | All 150 leads |
| **Create Lead** | Yes | Yes (if permission) | Yes |
| **Update Lead** | All leads | Only assigned | All leads |
| **Delete Lead** | All leads | Only assigned | All leads |
| **View Follow-Ups** | All follow-ups | Only their leads | All follow-ups |
| **Add Follow-Up** | Any lead | Only assigned | Any lead |
| **Assign Sequence** | Any lead | Only assigned | Any lead |
| **AI Operations** | Any lead | Only assigned | Any lead |
| **Export Data** | All leads | Only assigned | All leads |

---

# 🐛 BUGS FIXED

## Issues Resolved:

1. ✅ **getLeads** - Now uses `buildLeadQueryFilter` for assignment filtering
2. ✅ **getLead** - Uses `buildLeadQueryFilter` instead of simple coachId query
3. ✅ **deleteLead** - Uses `buildLeadQueryFilter` and proper CoachStaffService
4. ✅ **addFollowUpNote** - Assignment filtering added
5. ✅ **getUpcomingFollowUps** - Assignment filtering added
6. ✅ **assignNurturingSequence** - Assignment filtering added
7. ✅ **advanceNurturingStep** - Assignment filtering added
8. ✅ **getNurturingProgress** - Assignment filtering added
9. ✅ **aiQualifyLead** - Assignment filtering added
10. ✅ **aiRescore** - Assignment filtering added
11. ✅ **generateNurturingSequence** - Assignment filtering added
12. ✅ **generateFollowUpMessage** - Assignment filtering added

## Changes Made:

- ✅ All methods now use `CoachStaffService.buildLeadQueryFilter()`
- ✅ Staff action logging added to all methods
- ✅ UserContext added to all responses
- ✅ Proper error messages for unassigned leads
- ✅ Assignment-based filtering enforced

---

# 📝 FRONTEND CHECKLIST

## Must-Haves:

- [ ] Check `userContext.isStaff` to show appropriate UI
- [ ] Show "My Leads" vs "All Leads" based on permissions
- [ ] Display assignment badges ("Assigned to You", "Assigned to Alice")
- [ ] Filter options for staff (My Leads only by default)
- [ ] Permission-based action buttons
- [ ] Handle 404 for unassigned leads gracefully
- [ ] Show "manage_all" indicator if staff has full access
- [ ] Lead count badge (show assigned count for staff)
- [ ] Quick filters: My Hot Leads, My Overdue Follow-ups
- [ ] Create lead with auto-assignment option

---

**END OF LEAD MANAGEMENT DOCUMENTATION**

**Related Files:**
- `controllers/leadController.js` - Main lead CRUD operations
- `routes/leadRoutes.js` - Route definitions
- `services/coachStaffService.js` - Assignment filtering logic
- `middleware/unifiedCoachAuth.js` - Permission enforcement
- `utils/sectionPermissions.js` - Permission definitions

