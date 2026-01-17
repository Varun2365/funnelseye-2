# Staff Management API Documentation - Coach & Staff

## Overview

The staff management system allows coaches to manage their team members and staff to view team information.

**Base Path:** `/api/coach/staff`

**Key Features:**
- Create, update, delete staff members
- Assign permissions to staff
- View staff performance and metrics
- Manage tasks assigned to staff
- Set lead distribution ratios
- View team performance leaderboard

---

# 🔐 COMPLETE PERMISSION SYSTEM

## All Available Staff Permissions (Section-wise):

### **1. CORE (2 permissions)**
```javascript
"dashboard:view"          // View dashboard
"profile:view"            // View own profile
"profile:update"          // Update own profile
```

### **2. LEADS (8 permissions)**
```javascript
"leads:view"              // View assigned leads
"leads:create"            // Create new leads
"leads:update"            // Update lead information
"leads:delete"            // Delete leads
"leads:assign"            // Assign leads to other staff
"leads:export"            // Export lead data
"leads:manage_all"        // View and manage ALL coach leads (not just assigned)
"leads:manage"            // Full lead management
```

### **3. FUNNELS (8 permissions)**
```javascript
"funnels:view"            // View funnels
"funnels:create"          // Create new funnels
"funnels:update"          // Update funnels
"funnels:delete"          // Delete funnels
"funnels:publish"         // Publish funnels
"funnels:unpublish"       // Unpublish funnels
"funnels:view_analytics"  // View funnel analytics
"funnels:manage"          // Full funnel management
```

### **4. MESSAGING (6 permissions)**
```javascript
"messaging:view"          // View messages and inbox
"messaging:send"          // Send new messages
"messaging:reply"         // Reply to conversations
"messaging:delete"        // Delete messages
"messaging:manage_inbox"  // Manage inbox organization
"messaging:manage"        // Full messaging management
```

### **5. CALENDAR (7 permissions)**
```javascript
"calendar:view"           // View calendar and appointments
"calendar:create"         // Create calendar events
"calendar:update"         // Update calendar events
"calendar:delete"         // Delete calendar events
"calendar:book"           // Book appointments
"calendar:reschedule"     // Reschedule appointments
"calendar:manage"         // Full calendar management
```

### **6. MARKETING (7 permissions)**
```javascript
"marketing:view"                  // View marketing campaigns
"marketing:create_campaign"       // Create campaigns
"marketing:update_campaign"       // Update campaigns
"marketing:delete_campaign"       // Delete campaigns
"marketing:view_analytics"        // View marketing analytics
"marketing:manage_credentials"    // Manage marketing credentials
"marketing:manage"                // Full marketing management
```

### **7. AUTOMATION (6 permissions)**
```javascript
"automation:view"         // View automation rules
"automation:create"       // Create automation rules
"automation:update"       // Update automation rules
"automation:delete"       // Delete automation rules
"automation:execute"      // Execute automation sequences
"automation:manage"       // Full automation management
```

### **8. MLM (4 permissions)**
```javascript
"mlm:view"                // View MLM network
"mlm:view_hierarchy"      // View detailed hierarchy
"mlm:manage_commissions"  // Manage commission distribution
"mlm:manage"              // Full MLM management
```

### **9. ZOOM (4 permissions)**
```javascript
"zoom:view"               // View Zoom settings
"zoom:create_meeting"     // Create Zoom meetings
"zoom:update_settings"    // Update Zoom settings
"zoom:manage"             // Full Zoom management
```

### **10. PAYMENT GATEWAY (3 permissions)**
```javascript
"payment_gateway:view"       // View payment settings
"payment_gateway:configure"  // Configure payment gateways
"payment_gateway:manage"     // Full payment management
```

### **11. DOMAINS (5 permissions)**
```javascript
"domains:view"            // View custom domains
"domains:create"          // Add new domains
"domains:update"          // Update domain settings
"domains:delete"          // Remove domains
"domains:manage"          // Full domain management
```

### **12. TEMPLATES (5 permissions)**
```javascript
"templates:view"          // View message templates
"templates:create"        // Create new templates
"templates:update"        // Update templates
"templates:delete"        // Delete templates
"templates:manage"        // Full template management
```

### **13. COURSES (7 permissions)**
```javascript
"courses:view"            // View courses
"courses:create"          // Create new courses
"courses:update"          // Update courses
"courses:delete"          // Delete courses
"courses:publish"         // Publish courses
"courses:manage_sales"    // Manage course sales
"courses:manage"          // Full course management
```

### **14. STAFF MANAGEMENT (6 permissions)**
```javascript
"staff:view"              // View staff member information
"staff:create"            // Create new staff members
"staff:update"            // Update staff information
"staff:delete"            // Delete staff members
"staff:manage_permissions" // Assign/modify staff permissions
"staff:manage"            // Full staff management
```

### **15. SUBSCRIPTION (2 permissions - COACH ONLY)**
```javascript
"subscription:view"       // View subscription (Coach only)
"subscription:manage"     // Manage subscription (Coach only)
```

**TOTAL: 78 Permissions**

---

# 🎯 PERMISSION PRESETS

## Pre-configured Role Templates:

### 1. Sales Representative
- dashboard:view, profile:view, profile:update
- leads:view, leads:create, leads:update
- funnels:view
- calendar:view, calendar:book
- messaging:view, messaging:send, messaging:reply

### 2. Lead Manager
- All Sales Representative permissions
- leads:delete, leads:assign, leads:export
- calendar:book

### 3. Senior Lead Manager
- All Lead Manager permissions
- leads:manage_all, leads:manage
- calendar:manage, messaging:manage

### 4. Marketing Manager
- dashboard:view, profile:view, profile:update
- marketing:view, marketing:create_campaign, marketing:update_campaign, marketing:view_analytics, marketing:manage_credentials
- leads:view, leads:create
- automation:view, automation:create
- templates:view, templates:create

### 5. Operations Manager
- dashboard:view, profile:view, profile:update
- calendar:view, calendar:create, calendar:update, calendar:book, calendar:reschedule, calendar:manage
- leads:view, leads:update
- messaging:view, messaging:send, messaging:reply
- templates:view

### 6. Content Manager
- dashboard:view, profile:view, profile:update
- courses:view, courses:create, courses:update, courses:publish
- templates:view, templates:create, templates:update

### 7. Technical Manager
- dashboard:view, profile:view, profile:update
- zoom:view, zoom:create_meeting, zoom:update_settings, zoom:manage
- payment_gateway:view, payment_gateway:configure
- domains:view, domains:create, domains:update
- automation:view, automation:create, automation:update

### 8. Team Lead
- dashboard:view, profile:view, profile:update
- leads: ALL permissions including manage_all
- funnels:view, funnels:create, funnels:update
- calendar:view, calendar:manage
- messaging:view, messaging:manage
- marketing:view, marketing:create_campaign
- automation:view, automation:create
- templates:view, templates:create, templates:update
- staff:view, staff:update, staff:manage_permissions

### 9. Full Access
- **ALL** permissions (except subscription)
- Complete access to all sections

---

# 📋 ALL STAFF MANAGEMENT ROUTES

| # | Method | Route | Permission | Coach | Staff | Description |
|---|--------|-------|------------|-------|-------|-------------|
| **PUBLIC ROUTES** |
| 1 | `GET` | `/api/public/permissions` | None | ✅ | ✅ | Get all available permissions |
| 2 | `GET` | `/api/public/permissions/presets` | None | ✅ | ✅ | Get permission presets |
| **STAFF CRUD** |
| 3 | `GET` | `/api/coach/staff` | `staff:view` | ✅ | ✅ | Get all staff members |
| 4 | `POST` | `/api/coach/staff` | `staff:create` | ✅ | ✅ | Create staff member |
| 5 | `GET` | `/api/coach/staff/:staffId` | `staff:view` | ✅ | ✅ | Get staff details |
| 6 | `PUT` | `/api/coach/staff/:staffId` | `staff:update` | ✅ | ✅ | Update staff member |
| 7 | `DELETE` | `/api/coach/staff/:staffId` | `staff:delete` | ✅ | ✅ | Delete staff member |
| **PERMISSION MANAGEMENT** |
| 8 | `GET` | `/api/coach/staff/permissions` | `staff:view` | ✅ | ✅ | Get permissions list |
| 9 | `GET` | `/api/coach/staff/presets` | `staff:view` | ✅ | ✅ | Get permission presets |
| 10 | `PUT` | `/api/coach/staff/:staffId/permissions` | `staff:manage` | ✅ | ❌ | Update staff permissions |
| 11 | `POST` | `/api/coach/staff/:staffId/permission-group` | `staff:manage` | ✅ | ❌ | Assign preset to staff |
| 12 | `PUT` | `/api/coach/staff/:staffId/toggle-status` | `staff:manage` | ✅ | ❌ | Activate/deactivate staff |
| **STAFF PERFORMANCE** |
| 13 | `GET` | `/api/coach/staff/:staffId/performance` | `staff:view` | ✅ | ✅ Own | Get staff performance |
| 14 | `GET` | `/api/coach/staff/:staffId/tasks` | - | ✅ | ✅ Own | Get staff tasks |
| 15 | `GET` | `/api/coach/staff/:staffId/metrics` | - | ✅ | ✅ Own | Get staff performance metrics |
| 16 | `GET` | `/api/coach/staff/:staffId/leads` | - | ✅ | ✅ Own | Get staff assigned leads |
| 17 | `GET` | `/api/coach/staff/team-performance` | - | ✅ | ✅ | Get team performance leaderboard |
| **LEAD DISTRIBUTION (COACH ONLY)** |
| 18 | `GET` | `/api/coach/staff/lead-distribution` | - | ✅ | ❌ | Get distribution settings |
| 19 | `PUT` | `/api/coach/staff/lead-distribution` | - | ✅ | ❌ | Update distribution ratios |
| **BULK OPERATIONS** |
| 20 | `PUT` | `/api/coach/staff/bulk-permissions` | `staff:manage` | ✅ | ❌ | Bulk update permissions |

**Note:** ✅ Own = Staff can only view their own data

---

# 📍 ROUTE 1: Get All Available Permissions (PUBLIC)

```
GET /api/public/permissions
```

**Authentication:** Not Required (PUBLIC)

**Purpose:** Get all available permissions that can be assigned to staff members

## Response (Same for Everyone):

```json
{
  "success": true,
  "data": {
    "totalPermissions": 78,
    "totalCategories": 11,
    "totalPresets": 9,
    "categories": {
      "Core": {
        "category": "Core",
        "permissions": [
          {
            "permission": "dashboard:view",
            "name": "View Dashboard",
            "description": "Access to staff dashboard with assigned tasks and overview",
            "icon": "📊",
            "alwaysAccessible": true,
            "coachOnly": false,
            "isAdvanced": false
          },
          {
            "permission": "profile:view",
            "name": "View Profile",
            "description": "View your own profile",
            "icon": "👁️",
            "alwaysAccessible": true,
            "coachOnly": false
          }
        ]
      },
      "Lead Management": {
        "category": "Lead Management",
        "permissions": [
          {
            "permission": "leads:view",
            "name": "View Leads",
            "description": "View assigned leads and their information",
            "icon": "👁️"
          },
          {
            "permission": "leads:create",
            "name": "Create Leads",
            "description": "Create new leads",
            "icon": "➕"
          },
          {
            "permission": "leads:manage_all",
            "name": "Manage All Leads",
            "description": "View and manage all coach leads (not just assigned ones)",
            "icon": "👥",
            "isAdvanced": true
          }
        ]
      },
      "Sales & Marketing": {
        "category": "Sales & Marketing",
        "permissions": [
          {
            "permission": "funnels:view",
            "name": "View Funnels",
            "description": "View funnel information and analytics",
            "icon": "👁️"
          },
          {
            "permission": "marketing:view",
            "name": "View Marketing",
            "description": "View marketing campaigns and analytics",
            "icon": "👁️"
          }
        ]
      }
      // ... more categories
    },
    "presets": {
      "Sales Representative": {
        "name": "Sales Representative",
        "permissions": [
          "dashboard:view",
          "leads:view",
          "leads:create",
          "leads:update",
          "messaging:view",
          "messaging:send"
        ],
        "permissionCount": 6,
        "description": "Sales Representative role preset"
      },
      "Full Access": {
        "name": "Full Access",
        "permissions": [ /* all 78 permissions */ ],
        "permissionCount": 78,
        "description": "Full Access role preset"
      }
      // ... more presets
    },
    "allPermissions": [
      "dashboard:view",
      "profile:view",
      "profile:update",
      "leads:view",
      "leads:create"
      // ... all 78 permissions
    ]
  }
}
```

**Use Case:**
- Frontend can fetch this to build permission selection UI
- No authentication required
- Shows ALL available permissions with descriptions
- Includes presets for quick assignment

---

# 📍 ROUTE 2: Get Permission Presets (PUBLIC)

```
GET /api/public/permissions/presets
```

**Authentication:** Not Required (PUBLIC)

## Response:

```json
{
  "success": true,
  "data": {
    "totalPresets": 9,
    "presets": {
      "Sales Representative": {
        "name": "Sales Representative",
        "permissions": [
          "dashboard:view",
          "profile:view",
          "profile:update",
          "leads:view",
          "leads:create",
          "leads:update",
          "funnels:view",
          "calendar:view",
          "calendar:book",
          "messaging:view",
          "messaging:send",
          "messaging:reply"
        ],
        "permissionCount": 12,
        "description": "Sales Representative role - 12 permissions",
        "categorized": {
          "dashboard": ["dashboard:view"],
          "profile": ["profile:view", "profile:update"],
          "leads": ["leads:view", "leads:create", "leads:update"],
          "funnels": ["funnels:view"],
          "calendar": ["calendar:view", "calendar:book"],
          "messaging": ["messaging:view", "messaging:send", "messaging:reply"]
        }
      },
      "Full Access": {
        "name": "Full Access",
        "permissions": [ /* all permissions */ ],
        "permissionCount": 78,
        "description": "Full Access role - 78 permissions"
      }
    },
    "presetNames": [
      "Sales Representative",
      "Lead Manager",
      "Senior Lead Manager",
      "Marketing Manager",
      "Operations Manager",
      "Content Manager",
      "Technical Manager",
      "Team Lead",
      "Full Access"
    ]
  }
}
```

---

# 📍 ROUTE 3: Get All Staff Members

```
GET /api/coach/staff
```

**Permission Required:** `staff:view`

## 🎯 COACH RESPONSE:

```json
{
  "success": true,
  "data": [
    {
      "_id": "staff_id_1",
      "name": "Alice Smith",
      "email": "alice@example.com",
      "role": "staff",
      "coachId": "coach_id",
      "permissions": [
        "dashboard:view",
        "leads:view",
        "leads:create",
        "leads:update",
        "leads:delete",
        "leads:assign",
        "leads:export",
        "leads:manage_all",
        "messaging:view",
        "messaging:send",
        "calendar:view",
        "calendar:book"
      ],
      "isActive": true,
      "distributionRatio": 2,
      "lastActive": "2025-10-11T09:30:00.000Z",
      "createdAt": "2025-09-01T10:00:00.000Z",
      "updatedAt": "2025-10-10T15:00:00.000Z"
    },
    {
      "_id": "staff_id_2",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "staff",
      "coachId": "coach_id",
      "permissions": [
        "dashboard:view",
        "leads:view",
        "messaging:view",
        "messaging:send"
      ],
      "isActive": true,
      "distributionRatio": 1,
      "lastActive": "2025-10-11T08:00:00.000Z",
      "createdAt": "2025-09-15T10:00:00.000Z"
    }
  ]
}
```

**Coach Sees:**
- ✅ All staff members
- ✅ Complete staff details
- ✅ All permissions
- ✅ Distribution ratios
- ✅ Active status
- ✅ Last active time

---

## 👤 STAFF RESPONSE:

```json
{
  "success": true,
  "data": [
    {
      "_id": "staff_id_1",
      "name": "Alice Smith",
      "email": "alice@example.com",
      "role": "staff",
      "isActive": true,
      "lastActive": "2025-10-11T09:30:00.000Z"
    },
    {
      "_id": "my_staff_id",
      "name": "John Doe (Me)",
      "email": "john@example.com",
      "role": "staff",
      "isActive": true,
      "lastActive": "2025-10-11T10:30:00.000Z"
    }
  ]
}
```

**Staff Sees (with `staff:view` permission):**
- ✅ Basic information about team members
- ✅ Names and emails
- ⚠️ Cannot see other staff's permissions
- ⚠️ Cannot see distribution ratios
- ⚠️ Limited to basic team info

---

# 📍 ROUTE 14: Get Staff Tasks

```
GET /api/coach/staff/:staffId/tasks
```

**Permission:** None (Coach can view any staff, Staff can view own)

## 🎯 COACH RESPONSE (Any Staff Member):

```json
{
  "success": true,
  "data": {
    "total": 25,
    "pending": 10,
    "completed": 15,
    "overdue": 2,
    "completionRate": "60.0",
    "todayTasks": [
      {
        "_id": "task_id_1",
        "title": "Follow up with John Doe",
        "description": "Call and discuss package options",
        "priority": "high",
        "status": "Pending",
        "dueDate": "2025-10-11T17:00:00.000Z",
        "assignedTo": "staff_id_1",
        "coachId": "coach_id",
        "createdAt": "2025-10-11T09:00:00.000Z"
      }
    ],
    "allTasks": [
      {
        "_id": "task_id_1",
        "title": "Follow up with John Doe",
        "priority": "high",
        "status": "Pending",
        "dueDate": "2025-10-11T17:00:00.000Z"
      },
      {
        "_id": "task_id_2",
        "title": "Prepare presentation",
        "priority": "medium",
        "status": "Completed",
        "dueDate": "2025-10-10T10:00:00.000Z",
        "completedAt": "2025-10-10T09:30:00.000Z"
      }
      // ... all 25 tasks
    ]
  }
}
```

**Coach Can:**
- ✅ View tasks for any staff member
- ✅ See all task details
- ✅ Monitor task completion rates
- ✅ Identify overdue tasks

---

## 👤 STAFF RESPONSE (Own Tasks):

```json
{
  "success": true,
  "data": {
    "total": 25,
    "pending": 10,
    "completed": 15,
    "overdue": 2,
    "completionRate": "60.0",
    "todayTasks": [
      {
        "_id": "task_id_1",
        "title": "Follow up with John Doe",
        "description": "Call and discuss package options",
        "priority": "high",
        "status": "Pending",
        "dueDate": "2025-10-11T17:00:00.000Z"
      }
    ],
    "allTasks": [ /* All my tasks */ ]
  }
}
```

**Staff Can:**
- ✅ View their own tasks
- ❌ Cannot view other staff's tasks (unless has `staff:view` permission)
- ✅ See task priorities, due dates
- ✅ Track completion rate

---

# 📍 ROUTE 15: Get Staff Performance Metrics

```
GET /api/coach/staff/:staffId/metrics
```

**Permission:** None (Coach can view any, Staff can view own)

## 🎯 COACH RESPONSE:

```json
{
  "success": true,
  "data": {
    "performanceScore": {
      "overallScore": "78.5",
      "scoreOutOf100": "79",
      "rating": {
        "label": "Good",
        "icon": "👍",
        "color": "blue"
      },
      "breakdown": {
        "conversionRate": {
          "score": "16.5",
          "max": 25,
          "rate": "66.0%"
        },
        "leadEngagement": {
          "score": "10.9",
          "max": 15,
          "avgScore": "72.5"
        },
        "messagingActivity": {
          "score": "18.0",
          "max": 20,
          "messages": 90
        },
        "consistency": {
          "score": "8.3",
          "max": 10,
          "activeDays": 25
        },
        "appointmentCompletion": {
          "score": "15.0",
          "max": 20,
          "rate": "75.0%"
        },
        "lowNoShowRate": {
          "score": "8.5",
          "max": 10,
          "rate": "15.0%"
        }
      },
      "lastCalculated": "2025-10-11T10:30:00.000Z"
    },
    "leadStats": [
      {
        "_id": "Converted",
        "count": 5
      },
      {
        "_id": "Qualified",
        "count": 3
      },
      {
        "_id": "Contacted",
        "count": 5
      }
    ],
    "staffId": "staff_id_1",
    "coachId": "coach_id"
  }
}
```

**Coach Can:**
- ✅ View detailed metrics for any staff member
- ✅ See performance score breakdown
- ✅ Compare staff members
- ✅ Use for performance reviews

---

## 👤 STAFF RESPONSE (Own Metrics):

**Same as coach response** - Staff can see their own detailed performance metrics.

**Staff Can:**
- ✅ View their own performance score
- ✅ See detailed breakdown
- ✅ Track their progress
- ❌ Cannot view other staff metrics (unless has `staff:view`)

---

# 📍 ROUTE 16: Get Staff Assigned Leads

```
GET /api/coach/staff/:staffId/leads
```

**Permission:** None (Coach can view any, Staff can view own)

## 🎯 COACH RESPONSE:

```json
{
  "success": true,
  "data": {
    "total": 15,
    "leads": [
      {
        "_id": "lead_id_1",
        "name": "Sarah Johnson",
        "email": "sarah@example.com",
        "phone": "+919876543210",
        "status": "Qualified",
        "leadScore": 85,
        "source": "Facebook Ads",
        "funnelId": {
          "_id": "funnel_id",
          "name": "Weight Loss Funnel"
        },
        "assignedTo": "staff_id_1",
        "createdAt": "2025-10-08T12:00:00.000Z"
      }
      // ... all 15 assigned leads
    ],
    "leadsByStatus": {
      "new": 3,
      "contacted": 5,
      "qualified": 2,
      "converted": 5,
      "lost": 0
    },
    "conversionRate": "33.3"
  }
}
```

**Coach Can:**
- ✅ View which leads are assigned to each staff
- ✅ Monitor lead distribution
- ✅ See conversion rates per staff
- ✅ Reassign leads if needed

---

## 👤 STAFF RESPONSE (Own Leads):

**Same as coach response** - Staff can see all their assigned leads.

**Staff Can:**
- ✅ View all leads assigned to them
- ✅ See lead details and status
- ✅ Track their conversion rate
- ❌ Cannot view other staff's assigned leads (unless has `staff:view`)

---

# 📍 ROUTE 17: Get Team Performance

```
GET /api/coach/staff/team-performance
```

**Permission:** None (Available to all)

## 🎯 COACH RESPONSE:

```json
{
  "success": true,
  "data": {
    "totalTeamMembers": 5,
    "myRank": null,
    "teamLeaderboard": [
      {
        "staffId": "staff_id_1",
        "staffName": "Alice Smith",
        "rank": 1,
        "leadsAssigned": 30,
        "leadsConverted": 12,
        "conversionRate": "40.0",
        "messagesSent": 200,
        "appointmentsBooked": 25,
        "performanceScore": 92.5,
        "isCurrentUser": false
      },
      {
        "staffId": "staff_id_2",
        "staffName": "John Doe",
        "rank": 2,
        "leadsAssigned": 15,
        "leadsConverted": 5,
        "conversionRate": "33.3",
        "messagesSent": 150,
        "appointmentsBooked": 20,
        "performanceScore": 78.5,
        "isCurrentUser": false
      },
      {
        "staffId": "staff_id_3",
        "staffName": "Bob Wilson",
        "rank": 3,
        "leadsAssigned": 20,
        "leadsConverted": 6,
        "conversionRate": "30.0",
        "messagesSent": 120,
        "appointmentsBooked": 18,
        "performanceScore": 68.2,
        "isCurrentUser": false
      }
    ],
    "topPerformer": {
      "staffId": "staff_id_1",
      "staffName": "Alice Smith",
      "rank": 1,
      "performanceScore": 92.5
    },
    "teamAverage": {
      "conversionRate": 35.5,
      "leadsPerStaff": 22.5,
      "messagesPerStaff": 175.0
    }
  }
}
```

**Coach Sees:**
- ✅ Complete team leaderboard
- ✅ All staff ranked by performance
- ✅ Detailed stats for each staff
- ✅ Team averages
- ✅ Top performer highlighted

---

## 👤 STAFF RESPONSE:

```json
{
  "success": true,
  "data": {
    "totalTeamMembers": 5,
    "myRank": 2,
    "teamLeaderboard": [
      {
        "staffId": "staff_id_1",
        "staffName": "Alice Smith",
        "rank": 1,
        "leadsAssigned": 30,
        "leadsConverted": 12,
        "conversionRate": "40.0",
        "messagesSent": 200,
        "appointmentsBooked": 25,
        "performanceScore": 92.5,
        "isCurrentUser": false
      },
      {
        "staffId": "my_staff_id",
        "staffName": "John Doe",
        "rank": 2,
        "leadsAssigned": 15,
        "leadsConverted": 5,
        "conversionRate": "33.3",
        "messagesSent": 150,
        "appointmentsBooked": 20,
        "performanceScore": 78.5,
        "isCurrentUser": true
      },
      {
        "staffId": "staff_id_3",
        "staffName": "Bob Wilson",
        "rank": 3,
        "leadsAssigned": 20,
        "leadsConverted": 6,
        "conversionRate": "30.0",
        "performanceScore": 68.2,
        "isCurrentUser": false
      }
    ],
    "topPerformer": {
      "staffName": "Alice Smith",
      "rank": 1,
      "performanceScore": 92.5
    },
    "teamAverage": {
      "conversionRate": 35.5,
      "leadsPerStaff": 22.5,
      "messagesPerStaff": 175.0
    }
  }
}
```

**Staff Sees:**
- ✅ Full team leaderboard (can see teammates)
- ✅ Their own rank highlighted (`isCurrentUser: true`)
- ✅ Compare performance with team
- ✅ See team averages
- ✅ Competitive but transparent

---

# 📍 ROUTE 18: Get Lead Distribution Settings

```
GET /api/coach/staff/lead-distribution
```

**Permission:** Coach Only

## 🎯 COACH RESPONSE:

```json
{
  "success": true,
  "data": {
    "staff": [
      {
        "staffId": "staff_id_1",
        "name": "Alice Smith",
        "email": "alice@example.com",
        "distributionRatio": 2
      },
      {
        "staffId": "staff_id_2",
        "name": "John Doe",
        "email": "john@example.com",
        "distributionRatio": 1
      },
      {
        "staffId": "staff_id_3",
        "name": "Bob Wilson",
        "email": "bob@example.com",
        "distributionRatio": 1.5
      }
    ],
    "totalRatio": 4.5
  }
}
```

**Distribution Ratio Explanation:**
- Ratio `1` = Normal (baseline)
- Ratio `2` = Gets 2x more leads than baseline
- Ratio `1.5` = Gets 1.5x more leads
- Ratio `0.5` = Gets 50% of baseline
- Ratio `0` = Paused (no new leads)

**Example Distribution:**
- Alice: Ratio 2 → Gets ~44% of leads
- John: Ratio 1 → Gets ~22% of leads
- Bob: Ratio 1.5 → Gets ~33% of leads

---

## 👤 STAFF RESPONSE:

```json
{
  "success": false,
  "message": "Only coaches can manage lead distribution settings"
}
```

**Staff Cannot:**
- ❌ View distribution settings
- ❌ Modify distribution ratios
- ⚠️ This is coach-only functionality

---

# 📍 ROUTE 19: Update Lead Distribution

```
PUT /api/coach/staff/lead-distribution
```

**Permission:** Coach Only

### Request Body:
```json
{
  "distributions": [
    {
      "staffId": "staff_id_1",
      "ratio": 2
    },
    {
      "staffId": "staff_id_2",
      "ratio": 1
    },
    {
      "staffId": "staff_id_3",
      "ratio": 1.5
    }
  ]
}
```

## 🎯 COACH RESPONSE:

```json
{
  "success": true,
  "message": "Lead distribution settings updated",
  "data": [
    {
      "staffId": "staff_id_1",
      "name": "Alice Smith",
      "ratio": 2,
      "success": true
    },
    {
      "staffId": "staff_id_2",
      "name": "John Doe",
      "ratio": 1,
      "success": true
    },
    {
      "staffId": "staff_id_3",
      "name": "Bob Wilson",
      "ratio": 1.5,
      "success": true
    }
  ]
}
```

**Coach Can:**
- ✅ Set custom distribution ratios for each staff
- ✅ Give high performers more leads
- ✅ Reduce load for struggling staff
- ✅ Pause distribution (ratio = 0)
- ✅ Fine-tune team workload

---

## 👤 STAFF RESPONSE:

```json
{
  "success": false,
  "message": "Only coaches can manage lead distribution settings"
}
```

---

# 🎯 LEAD DISTRIBUTION SYSTEM

## How Automatic Lead Assignment Works:

### When a new lead is created:

1. **Get all active staff** with `distributionRatio > 0`
2. **Calculate weights** based on ratios
3. **Select staff** using weighted random selection
4. **Assign lead** to selected staff

### Example Code (Backend Logic):

```javascript
// Get active staff with distribution enabled
const activeStaff = await Staff.find({
  coachId: coachId,
  isActive: true,
  distributionRatio: { $gt: 0 }
});

// Calculate total ratio
const totalRatio = activeStaff.reduce((sum, s) => sum + s.distributionRatio, 0);

// Weighted random selection
const random = Math.random() * totalRatio;
let cumulative = 0;

for (const staff of activeStaff) {
  cumulative += staff.distributionRatio;
  if (random <= cumulative) {
    // Assign lead to this staff
    lead.assignedTo = staff._id;
    await lead.save();
    break;
  }
}
```

### Distribution Examples:

**Scenario 1: Equal Distribution**
- Alice: Ratio 1
- John: Ratio 1
- Bob: Ratio 1
- Result: Each gets ~33% of leads

**Scenario 2: Performance-Based**
- Alice (Top Performer): Ratio 2
- John (Average): Ratio 1
- Bob (New): Ratio 0.5
- Result: Alice ~57%, John ~29%, Bob ~14%

**Scenario 3: Pause Distribution**
- Alice: Ratio 2
- John: Ratio 1
- Bob: Ratio 0 (Paused)
- Result: Alice ~67%, John ~33%, Bob ~0%

---

# 🔒 PERMISSION MATRIX

## What Each User Can Do:

| Action | Permission Required | Coach | Staff (with permission) | Staff (without) |
|--------|-------------------|-------|------------------------|----------------|
| View all staff | `staff:view` | ✅ Full details | ✅ Basic info only | ❌ 403 |
| Create staff | `staff:create` | ✅ Always | ✅ Yes | ❌ 403 |
| Update staff | `staff:update` | ✅ Always | ✅ Yes | ❌ 403 |
| Delete staff | `staff:delete` | ✅ Always | ✅ Yes | ❌ 403 |
| View permissions | `staff:view` | ✅ Always | ✅ Yes | ❌ 403 |
| Update permissions | `staff:manage` | ✅ Always | ❌ Coach only | ❌ 403 |
| View team performance | - | ✅ Full view | ✅ Full view | ✅ Full view |
| View staff tasks | - | ✅ Any staff | ✅ Own only | ❌ 403 |
| View staff metrics | - | ✅ Any staff | ✅ Own only | ❌ 403 |
| View staff leads | - | ✅ Any staff | ✅ Own only | ❌ 403 |
| Manage lead distribution | - | ✅ Always | ❌ Coach only | ❌ Coach only |

---

# 💡 FRONTEND IMPLEMENTATION GUIDE

## 1. Permission Selection UI

```javascript
// Fetch all available permissions
const response = await fetch('/api/public/permissions');
const { categories, presets } = response.data;

// Build permission selector
Object.entries(categories).forEach(([category, data]) => {
  renderCategory({
    name: category,
    permissions: data.permissions.map(p => ({
      value: p.permission,
      label: p.name,
      description: p.description,
      icon: p.icon,
      alwaysOn: p.alwaysAccessible,
      coachOnly: p.coachOnly
    }))
  });
});

// Add preset buttons
Object.entries(presets).forEach(([name, preset]) => {
  renderPresetButton({
    name: name,
    count: preset.permissionCount,
    onClick: () => selectPreset(preset.permissions)
  });
});
```

## 2. Staff List with Performance

```javascript
const staffList = await fetch('/api/coach/staff');

staffList.data.forEach(staff => {
  renderStaffCard({
    name: staff.name,
    email: staff.email,
    isActive: staff.isActive,
    permissionCount: staff.permissions?.length || 0,
    distributionRatio: staff.distributionRatio,
    lastActive: formatRelativeTime(staff.lastActive),
    actions: {
      viewTasks: () => fetchTasks(staff._id),
      viewMetrics: () => fetchMetrics(staff._id),
      viewLeads: () => fetchLeads(staff._id),
      edit: () => editStaff(staff._id),
      deactivate: () => toggleStatus(staff._id)
    }
  });
});
```

## 3. Lead Distribution Manager (Coach Only)

```javascript
// Fetch distribution settings
const distribution = await fetch('/api/coach/staff/lead-distribution');

renderDistributionSliders(distribution.data.staff);

// Update distribution
const updateDistribution = async (newRatios) => {
  await fetch('/api/coach/staff/lead-distribution', {
    method: 'PUT',
    body: JSON.stringify({
      distributions: newRatios
    })
  });
};
```

## 4. Team Performance Dashboard

```javascript
const teamPerf = await fetch('/api/coach/staff/team-performance');

// Render leaderboard
renderLeaderboard({
  myRank: teamPerf.data.myRank,  // For staff
  leaderboard: teamPerf.data.teamLeaderboard.map(staff => ({
    ...staff,
    isMe: staff.isCurrentUser  // Highlight current user
  })),
  topPerformer: teamPerf.data.topPerformer,
  average: teamPerf.data.teamAverage
});
```

## 5. Staff Task Management

```javascript
// Fetch staff tasks
const tasks = await fetch(`/api/coach/staff/${staffId}/tasks`);

// Categorize tasks
renderTaskSections({
  overdue: tasks.data.todayTasks.filter(t => isOverdue(t)),
  today: tasks.data.todayTasks,
  pending: tasks.data.pending,
  completed: tasks.data.completed,
  completionRate: tasks.data.completionRate
});

// Color code by priority
tasks.data.allTasks.forEach(task => {
  const color = {
    high: 'red',
    medium: 'orange',
    low: 'blue'
  }[task.priority];
  
  renderTask(task, { color, overdue: isOverdue(task.dueDate) });
});
```

---

# 🎨 UI RECOMMENDATIONS

## Coach Staff Management Dashboard

```
+--------------------------------------------------------+
|  👥 Staff Management                    [+ Add Staff] |
+--------------------------------------------------------+
|                                                         |
|  📊 Team Overview                                      |
|  Total Staff: 5 | Active: 5 | Inactive: 0             |
|                                                         |
|  🏆 Top Performer: Alice Smith (Score: 92.5)           |
|  📈 Team Average Conversion: 35.5%                     |
|                                                         |
+--------------------------------------------------------+
|  STAFF LIST                                            |
|  +---------------------------------------------------+ |
|  | 🥇 Alice Smith           alice@example.com  [⚙️] | |
|  | Score: 92.5 | 30 Leads | Ratio: 2x                | |
|  | Permissions: 25 | Last active: 2h ago             | |
|  | [Tasks] [Metrics] [Leads] [Edit] [Deactivate]    | |
|  +---------------------------------------------------+ |
|                                                         |
|  | 🥈 John Doe              john@example.com   [⚙️]  | |
|  | Score: 78.5 | 15 Leads | Ratio: 1x                | |
|  | [Tasks] [Metrics] [Leads] [Edit]                  | |
|  +---------------------------------------------------+ |
|                                                         |
+--------------------------------------------------------+
|  📊 Lead Distribution Settings                         |
|  +---------------------------------------------------+ |
|  | Alice Smith    [========] 2.0x                    | |
|  | John Doe       [====] 1.0x                        | |
|  | Bob Wilson     [======] 1.5x                      | |
|  +---------------------------------------------------+ |
|  Total Ratio: 4.5                      [Save Changes] |
|                                                         |
+--------------------------------------------------------+
```

## Staff Team View

```
+--------------------------------------------------------+
|  👥 My Team                           Your Rank: #2 🥈 |
+--------------------------------------------------------+
|                                                         |
|  📊 TEAM LEADERBOARD                                   |
|  +---------------------------------------------------+ |
|  | Rank | Name        | Leads | Conv% | Score | You | |
|  |------|-------------|-------|-------|-------|-----| |
|  | 🥇 1 | Alice Smith | 30    | 40%   | 92.5  |     | |
|  | 🥈 2 | John Doe    | 15    | 33%   | 78.5  | ⭐  | |
|  | 🥉 3 | Bob Wilson  | 20    | 30%   | 68.2  |     | |
|  +---------------------------------------------------+ |
|                                                         |
|  Team Average: 35.5% conversion | 22.5 leads per staff|
|  Top Performer: Alice Smith                            |
|                                                         |
+--------------------------------------------------------+
|  MY STATS                                              |
|  Performance Score: 78.5/100 - "Good" 👍               |
|  Leads: 15 | Converted: 5 | Messages: 150              |
|  [View My Detailed Metrics]                            |
|                                                         |
+--------------------------------------------------------+
```

---

# 🚀 TESTING EXAMPLES

## Test 1: Get Public Permissions (No Auth)
```bash
GET /api/public/permissions

# Expected: All 78 permissions with categories
```

## Test 2: Coach Views All Staff
```bash
GET /api/coach/staff
Authorization: Bearer {COACH_TOKEN}

# Expected: All 5 staff with full details
```

## Test 3: Staff Views Team
```bash
GET /api/coach/staff
Authorization: Bearer {STAFF_TOKEN}

# Expected: Basic team info (no permissions/ratios)
```

## Test 4: Coach Views Staff Tasks
```bash
GET /api/coach/staff/staff_id_1/tasks
Authorization: Bearer {COACH_TOKEN}

# Expected: All tasks for Alice Smith
```

## Test 5: Staff Views Own Tasks
```bash
GET /api/coach/staff/my_staff_id/tasks
Authorization: Bearer {STAFF_TOKEN}

# Expected: All my tasks
```

## Test 6: Staff Tries to View Other's Tasks
```bash
GET /api/coach/staff/other_staff_id/tasks
Authorization: Bearer {STAFF_TOKEN}

# Expected: 403 Forbidden (unless has staff:view)
```

## Test 7: Coach Sets Distribution
```bash
PUT /api/coach/staff/lead-distribution
Authorization: Bearer {COACH_TOKEN}

{
  "distributions": [
    { "staffId": "staff_id_1", "ratio": 2 },
    { "staffId": "staff_id_2", "ratio": 1 }
  ]
}

# Expected: Distribution updated
```

## Test 8: Get Team Performance
```bash
GET /api/coach/staff/team-performance
Authorization: Bearer {STAFF_TOKEN}

# Expected: Full leaderboard with myRank highlighted
```

---

# 📊 COMPLETE ROUTE SUMMARY

## Total Routes: 20

### Public Routes (2):
- Get all permissions
- Get permission presets

### Staff CRUD (5):
- Get all staff
- Create staff
- Get staff details
- Update staff
- Delete staff

### Permission Management (5):
- Get permissions list
- Get permission presets
- Update staff permissions
- Assign permission preset
- Toggle staff status

### Performance & Metrics (5):
- Get staff performance (legacy)
- Get staff tasks
- Get staff metrics
- Get staff leads
- Get team performance

### Lead Distribution (2):
- Get distribution settings
- Update distribution settings

### Bulk Operations (1):
- Bulk update permissions

---

# ⚠️ IMPORTANT NOTES

## For Frontend Developers:

1. **Public Permissions Route:**
   - Use `/api/public/permissions` to build permission selection UI
   - No authentication needed
   - Shows all 78 permissions with descriptions

2. **Staff Can View Own Data:**
   - Tasks: `/api/coach/staff/:myId/tasks`
   - Metrics: `/api/coach/staff/:myId/metrics`
   - Leads: `/api/coach/staff/:myId/leads`
   - Use `userContext.userId` as staffId

3. **Team Performance:**
   - Same endpoint for both coach and staff
   - Staff sees `isCurrentUser: true` on their row
   - Coach sees `myRank: null`

4. **Lead Distribution:**
   - Coach-only feature
   - Hide UI for staff
   - Ratios range from 0 to 10
   - Higher ratio = more leads

5. **Permission Display:**
   - Group by category
   - Show icons for visual appeal
   - Mark "Always Accessible" permissions
   - Mark "Coach Only" permissions
   - Mark "Advanced" permissions

## Security Notes:

- ✅ Staff can only view own tasks/metrics (unless has `staff:view`)
- ✅ Lead distribution is coach-only
- ✅ Permission management requires `staff:manage`
- ✅ All staff actions are logged
- ✅ Automatic filtering ensures data isolation

---

# 🔄 CHANGELOG

**Version 1.0** - Initial staff management

**Version 2.0** - Enhanced features
- Added staff tasks endpoint
- Added staff metrics/performance score
- Added staff assigned leads view
- Added team performance leaderboard
- Added lead distribution system
- Added public permissions route
- Updated permission system to use SECTIONS
- Added distributionRatio to Staff schema
- Fixed all staff access bugs

---

**END OF STAFF MANAGEMENT DOCUMENTATION**

**Related Files:**
- `controllers/coachStaffManagementController.js` - Staff management logic
- `routes/coachStaffManagementRoutes.js` - Route definitions
- `routes/publicPermissionsRoutes.js` - Public permissions API
- `schema/Staff.js` - Staff model with distributionRatio
- `services/staffDashboardService.js` - Performance calculations
- `utils/sectionPermissions.js` - All permission definitions

