# Dashboard API Documentation - Coach & Staff

## Endpoint
```
GET /api/coach-dashboard/data
```

**Authentication Required:** Yes (Coach or Staff token)

**Query Parameters:**
- `timeRange` (optional) - Number of days for historical data (default: 30)

---

## Overview

This endpoint serves **different data based on the user type**:
- **Coach Token** → Full business dashboard with all coach data
- **Staff Token** → Personalized staff dashboard with only their assigned data

Each staff member sees **different personalized data** based on:
1. Their assigned leads
2. Their messages sent
3. Their appointments
4. Their permissions

---

# 🎯 COACH DASHBOARD RESPONSE

## Complete JSON Response (Coach)

```json
{
  "success": true,
  "data": {
    "overview": {
      "metrics": {
        "totalLeads": 150,
        "convertedLeads": 45,
        "conversionRate": 30.0,
        "totalTasks": 80,
        "completedTasks": 60,
        "taskCompletionRate": 75.0,
        "totalRevenue": 450000,
        "avgRevenuePerLead": 10000,
        "totalAppointments": 100,
        "completedAppointments": 85,
        "appointmentCompletionRate": 85.0
      }
    },
    "leads": {
      "total": 150,
      "new": 25,
      "contacted": 40,
      "qualified": 35,
      "converted": 45,
      "lost": 5,
      "recentLeads": [
        {
          "_id": "lead_id",
          "name": "John Doe",
          "email": "john@example.com",
          "phone": "+919876543210",
          "status": "Qualified",
          "leadScore": 85,
          "source": "Facebook Ad",
          "createdAt": "2025-10-10T12:00:00.000Z"
        }
      ],
      "leadsByStatus": {
        "new": 25,
        "contacted": 40,
        "qualified": 35,
        "converted": 45,
        "lost": 5
      },
      "leadsBySource": [
        {
          "source": "Facebook Ads",
          "count": 60,
          "percentage": "40.0"
        },
        {
          "source": "Google Ads",
          "count": 50,
          "percentage": "33.3"
        }
      ]
    },
    "tasks": {
      "total": 80,
      "pending": 20,
      "completed": 60,
      "tasksByStatus": {
        "pending": 20,
        "inProgress": 15,
        "completed": 60
      }
    },
    "marketing": {
      "totalCampaigns": 10,
      "activeCampaigns": 5,
      "totalAdSpend": 50000,
      "leadsFromMarketing": 80,
      "costPerLead": 625
    },
    "financial": {
      "totalRevenue": 450000,
      "totalExpenses": 50000,
      "netProfit": 400000,
      "profitMargin": 88.9,
      "revenueByMonth": [
        {
          "month": "September",
          "revenue": 150000
        },
        {
          "month": "October",
          "revenue": 120000
        }
      ],
      "topRevenueProducts": [
        {
          "product": "Premium Coaching",
          "revenue": 200000
        }
      ]
    },
    "team": {
      "totalStaff": 5,
      "activeStaff": 5,
      "staffPerformance": [
        {
          "staffId": "staff_id_1",
          "staffName": "Alice Smith",
          "leadsAssigned": 30,
          "leadsConverted": 12,
          "conversionRate": "40.0",
          "messagesSent": 200,
          "appointmentsBooked": 25,
          "performanceScore": 92.5,
          "rank": 1
        },
        {
          "staffId": "staff_id_2",
          "staffName": "John Doe",
          "leadsAssigned": 15,
          "leadsConverted": 5,
          "conversionRate": "33.3",
          "messagesSent": 150,
          "appointmentsBooked": 20,
          "performanceScore": 78.5,
          "rank": 2
        }
      ],
      "topPerformer": {
        "staffName": "Alice Smith",
        "rank": 1,
        "performanceScore": 92.5
      },
      "teamAverages": {
        "conversionRate": 35.5,
        "leadsPerStaff": 22.5,
        "messagesPerStaff": 175.0
      }
    },
    "performance": {
      "overallScore": 85,
      "trends": {
        "leads": "up",
        "revenue": "up",
        "conversion": "stable"
      }
    },
    "calendar": {
      "totalAppointments": 100,
      "upcomingAppointments": 15,
      "todayAppointments": 3
    },
    "dailyFeed": {
      "priorityTasks": [],
      "alerts": [],
      "recommendations": []
    }
  },
  "userContext": {
    "isStaff": false,
    "isCoach": true,
    "userId": "coach_id_here",
    "permissions": []
  }
}
```

---

# 👤 STAFF DASHBOARD RESPONSE

## Complete JSON Response (Staff)

```json
{
  "success": true,
  "data": {
    "overview": {
      "staffName": "John Doe",
      "staffEmail": "john@example.com",
      "period": "Last 30 days",
      "lastActive": "2025-10-11T10:30:00.000Z",
      
      "myAssignedLeads": 15,
      "myNewLeadsThisPeriod": 5,
      "myNewLeadsToday": 2,
      "myLeadsConverted": 5,
      "myLeadsLost": 2,
      "myConversionRate": "33.3",
      "myLossRate": "13.3",
      "myAverageLeadScore": "72.5",
      "myHotLeads": 4,
      "myLeadsNeedingFollowUp": 3,
      "myLeadsByStatus": {
        "new": 3,
        "contacted": 5,
        "qualified": 2,
        "inProgress": 0,
        "converted": 5,
        "lost": 2
      },
      
      "myTotalAppointments": 20,
      "myAppointmentsThisPeriod": 8,
      "myAppointmentsToday": 2,
      "myCompletedAppointments": 15,
      "myCancelledAppointments": 2,
      "myNoShowAppointments": 3,
      "myUpcomingAppointments": 5,
      "myAppointmentCompletionRate": "75.0",
      "myAppointmentNoShowRate": "15.0",
      
      "myTotalMessagesSent": 250,
      "myMessagesSentThisPeriod": 45,
      "myMessagesToday": 8,
      "myWhatsAppMessages": 30,
      "myEmailMessages": 15,
      "myTotalWhatsAppMessages": 180,
      "myTotalEmailMessages": 70,
      "myActiveConversations": 12,
      "myTotalContactsMessaged": 45,
      "myAverageMessagesPerDay": "1.5"
    },
    
    "myPerformanceScore": {
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
    
    "teamPerformance": {
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
    },
    
    "myTasks": {
      "total": 25,
      "pending": 10,
      "completed": 15,
      "overdue": 2,
      "completionRate": "60.0",
      "todayTasks": [
        {
          "_id": "task_id_1",
          "title": "Follow up with lead John Doe",
          "description": "Call and discuss package options",
          "priority": "high",
          "status": "Pending",
          "dueDate": "2025-10-11T17:00:00.000Z",
          "assignedTo": "my_staff_id",
          "coachId": "coach_id"
        },
        {
          "_id": "task_id_2",
          "title": "Send proposal to Jane Smith",
          "description": "Email the coaching package details",
          "priority": "medium",
          "status": "In Progress",
          "dueDate": "2025-10-11T15:00:00.000Z"
        }
      ],
      "weekTasks": [
        {
          "_id": "task_id_3",
          "title": "Prepare presentation",
          "priority": "medium",
          "dueDate": "2025-10-13T10:00:00.000Z",
          "status": "Pending"
        }
      ],
      "recentTasks": [
        {
          "_id": "task_id",
          "title": "Task title",
          "priority": "high",
          "status": "Pending",
          "dueDate": "2025-10-12T10:00:00.000Z"
        }
      ],
      "tasksByPriority": {
        "high": 3,
        "medium": 5,
        "low": 2
      },
      "tasksByStatus": {
        "pending": 5,
        "inProgress": 5,
        "completed": 15
      }
    },
    
    "leads": {
      "recentLeads": [
        {
          "_id": "lead_id",
          "name": "John Doe",
          "email": "john@example.com",
          "phone": "+919876543210",
          "status": "Qualified",
          "leadScore": 85,
          "source": "Facebook Ad",
          "createdAt": "2025-10-10T12:00:00.000Z",
          "assignedTo": "my_staff_id"
        }
      ],
      "totalAssigned": 15,
      "newThisPeriod": 5,
      "avgLeadScore": 72.5
    },
    
    "leadsBySource": [
      {
        "source": "Facebook Ads",
        "count": 8,
        "percentage": "53.3"
      },
      {
        "source": "Google Ads",
        "count": 5,
        "percentage": "33.3"
      },
      {
        "source": "Referral",
        "count": 2,
        "percentage": "13.3"
      }
    ],
    
    "leadConversionFunnel": {
      "total": 15,
      "new": 3,
      "contacted": 5,
      "qualified": 2,
      "converted": 5,
      "conversionRate": "33.3"
    },
    
    "topPerformingLeads": [
      {
        "_id": "lead_id",
        "name": "Jane Smith",
        "email": "jane@example.com",
        "phone": "+919876543210",
        "leadScore": 95,
        "status": "Qualified"
      },
      {
        "_id": "lead_id_2",
        "name": "Mike Johnson",
        "email": "mike@example.com",
        "phone": "+919876543211",
        "leadScore": 88,
        "status": "Converted"
      }
    ],
    
    "messaging": {
      "recentWhatsAppMessages": [
        {
          "_id": "msg_id",
          "to": "+919876543210",
          "content": {
            "text": "Hello! Following up on our conversation."
          },
          "timestamp": "2025-10-11T09:00:00.000Z",
          "status": "delivered",
          "senderId": "my_staff_id",
          "senderType": "staff"
        }
      ],
      "recentEmailMessages": [
        {
          "_id": "email_id",
          "to": "lead@example.com",
          "subject": "Follow up on coaching package",
          "sentAt": "2025-10-11T08:00:00.000Z",
          "status": "sent",
          "senderId": "my_staff_id",
          "senderType": "staff"
        }
      ],
      "totalSent": 45
    },
    
    "messagingTrends": [
      {
        "date": "2025-10-05",
        "whatsapp": 5,
        "email": 2,
        "total": 7
      },
      {
        "date": "2025-10-06",
        "whatsapp": 8,
        "email": 3,
        "total": 11
      },
      {
        "date": "2025-10-07",
        "whatsapp": 6,
        "email": 2,
        "total": 8
      },
      {
        "date": "2025-10-08",
        "whatsapp": 7,
        "email": 4,
        "total": 11
      },
      {
        "date": "2025-10-09",
        "whatsapp": 4,
        "email": 1,
        "total": 5
      },
      {
        "date": "2025-10-10",
        "whatsapp": 9,
        "email": 3,
        "total": 12
      },
      {
        "date": "2025-10-11",
        "whatsapp": 3,
        "email": 2,
        "total": 5
      }
    ],
    
    "mostContactedLeads": [
      {
        "phone": "+919876543210",
        "messageCount": 25,
        "leadName": "John Doe",
        "leadEmail": "john@example.com",
        "leadStatus": "Qualified"
      },
      {
        "phone": "+919876543211",
        "messageCount": 18,
        "leadName": "Jane Smith",
        "leadEmail": "jane@example.com",
        "leadStatus": "Converted"
      }
    ],
    
    "appointments": {
      "recentAppointments": [
        {
          "_id": "apt_id",
          "leadId": {
            "_id": "lead_id",
            "name": "John Doe",
            "phone": "+919876543210",
            "email": "john@example.com"
          },
          "startTime": "2025-10-12T14:00:00.000Z",
          "duration": 60,
          "status": "scheduled",
          "notes": "Initial consultation",
          "assignedStaffId": "my_staff_id"
        }
      ],
      "upcomingAppointments": [
        {
          "_id": "apt_id_2",
          "leadId": {
            "name": "Jane Smith",
            "phone": "+919876543211"
          },
          "startTime": "2025-10-13T10:00:00.000Z",
          "duration": 30,
          "status": "scheduled"
        }
      ],
      "totalThisPeriod": 8
    },
    
    "appointmentStats": {
      "total": 20,
      "thisPeriod": 8,
      "completed": 15,
      "scheduled": 5,
      "cancelled": 2,
      "noShow": 3,
      "completionRate": "75.0"
    },
    
    "upcomingWeekSchedule": {
      "Monday, Oct 14": [
        {
          "time": "10:00 AM",
          "leadName": "John Doe",
          "phone": "+919876543210",
          "duration": 60
        },
        {
          "time": "02:00 PM",
          "leadName": "Jane Smith",
          "phone": "+919876543211",
          "duration": 30
        }
      ],
      "Tuesday, Oct 15": [
        {
          "time": "11:00 AM",
          "leadName": "Alice Brown",
          "phone": "+919876543212",
          "duration": 45
        }
      ],
      "Wednesday, Oct 16": [],
      "Thursday, Oct 17": [
        {
          "time": "03:00 PM",
          "leadName": "Mike Wilson",
          "phone": "+919876543213",
          "duration": 60
        }
      ]
    },
    
    "performanceMetrics": {
      "period": "Last 30 days",
      "leadsGenerated": 5,
      "leadsConverted": 2,
      "averageLeadScore": "72.5",
      "messagesSent": 45,
      "averageMessagesPerDay": "1.5",
      "appointmentsBooked": 8,
      "appointmentsCompleted": 6,
      "appointmentCompletionRate": "75.0"
    },
    
    "weeklyTrends": {
      "leads": {
        "thisWeek": 3,
        "lastWeek": 2,
        "change": "50.0",
        "trend": "up"
      },
      "messaging": {
        "thisWeek": 25,
        "lastWeek": 18,
        "change": "38.9",
        "trend": "up"
      }
    },
    
    "recentActivity": [
      {
        "type": "lead_updated",
        "leadName": "John Doe",
        "leadId": "lead_id",
        "status": "Qualified",
        "time": "2025-10-11T09:30:00.000Z"
      },
      {
        "type": "message_sent",
        "contact": "+919876543210",
        "messageType": "whatsapp",
        "time": "2025-10-11T08:15:00.000Z"
      },
      {
        "type": "appointment_booked",
        "leadName": "Jane Smith",
        "appointmentTime": "2025-10-12T14:00:00.000Z",
        "time": "2025-10-11T07:00:00.000Z"
      }
    ],
    
    "dailyTasks": [
      {
        "type": "follow_up",
        "priority": "high",
        "leadName": "John Doe",
        "leadId": "lead_id",
        "description": "Follow up with John Doe",
        "dueTime": "Today"
      },
      {
        "type": "appointment",
        "priority": "high",
        "leadName": "Jane Smith",
        "description": "Appointment with Jane Smith",
        "dueTime": "02:00 PM"
      }
    ],
    
    "pendingActions": {
      "total": 5,
      "items": [
        {
          "type": "lead_followup",
          "count": 3,
          "message": "3 leads need follow-up",
          "priority": "high"
        },
        {
          "type": "appointment_confirm",
          "count": 2,
          "message": "2 appointments need confirmation",
          "priority": "medium"
        },
        {
          "type": "messages",
          "count": 0,
          "message": "All messages responded",
          "priority": "low"
        }
      ]
    },
    
    "todayAppointments": [
      {
        "_id": "apt_id",
        "startTime": "2025-10-11T14:00:00.000Z",
        "duration": 60,
        "status": "scheduled",
        "leadId": {
          "_id": "lead_id",
          "name": "John Doe",
          "phone": "+919876543210",
          "email": "john@example.com"
        },
        "notes": "Initial consultation",
        "assignedStaffId": "my_staff_id"
      },
      {
        "_id": "apt_id_2",
        "startTime": "2025-10-11T16:30:00.000Z",
        "duration": 30,
        "status": "scheduled",
        "leadId": {
          "name": "Jane Smith",
          "phone": "+919876543211",
          "email": "jane@example.com"
        }
      }
    ],
    
    "quickStats": [
      {
        "label": "New Leads Today",
        "value": 2,
        "icon": "user-plus",
        "color": "blue"
      },
      {
        "label": "Messages Sent Today",
        "value": 8,
        "icon": "message",
        "color": "green"
      },
      {
        "label": "Appointments Today",
        "value": 2,
        "icon": "calendar",
        "color": "purple"
      }
    ],
    
    "achievements": [
      {
        "title": "50+ Leads Handled",
        "description": "Successfully managed 50 or more leads",
        "icon": "🎯",
        "unlocked": false
      },
      {
        "title": "10 Conversions",
        "description": "Converted 10 leads successfully",
        "icon": "🏆",
        "unlocked": false
      },
      {
        "title": "High Converter",
        "description": "30%+ conversion rate",
        "icon": "⭐",
        "unlocked": true
      },
      {
        "title": "Communication Master",
        "description": "Sent 100+ messages",
        "icon": "💬",
        "unlocked": true
      }
    ],
    
    "weekSummary": {
      "period": "Last 7 Days",
      "highlights": [
        "Managed 3 new leads",
        "Converted 1 lead",
        "Sent 25 messages",
        "Scheduled 2 appointments"
      ]
    }
  },
  "userContext": {
    "isStaff": true,
    "isCoach": false,
    "userId": "my_staff_id",
    "permissions": [
      "dashboard:view",
      "profile:view",
      "profile:update",
      "leads:view",
      "leads:create",
      "leads:update",
      "messaging:view",
      "messaging:send",
      "messaging:reply",
      "calendar:view",
      "calendar:book"
    ]
  }
}
```

---

# 🔒 PERMISSION-BASED FILTERING

## Staff Dashboard Sections Based on Permissions:

| Section | Required Permission | If Missing |
|---------|-------------------|------------|
| `overview` (lead stats) | `leads:view` | Lead stats not included in overview |
| `overview` (appointment stats) | `calendar:view` | Appointment stats not included |
| `overview` (messaging stats) | `messaging:view` | Messaging stats not included |
| `leads` | `leads:view` | Entire section missing |
| `leadsBySource` | `leads:view` | Section missing |
| `leadConversionFunnel` | `leads:view` | Section missing |
| `topPerformingLeads` | `leads:view` | Section missing |
| `messaging` | `messaging:view` | Section missing |
| `messagingTrends` | `messaging:view` | Section missing |
| `mostContactedLeads` | `messaging:view` | Section missing |
| `appointments` | `calendar:view` | Section missing |
| `appointmentStats` | `calendar:view` | Section missing |
| `upcomingWeekSchedule` | `calendar:view` | Section missing |
| `todayAppointments` | `calendar:view` | Section missing |
| `myPerformanceScore` | - | Always visible |
| `teamPerformance` | - | Always visible |
| `myTasks` | - | Always visible |

---

# 🎨 FRONTEND IMPLEMENTATION GUIDE

## 1. Detecting User Type

```javascript
// Check userContext to determine which dashboard to render
if (response.data.userContext.isStaff) {
  // Render Staff Dashboard
  renderStaffDashboard(response.data);
} else if (response.data.userContext.isCoach) {
  // Render Coach Dashboard
  renderCoachDashboard(response.data);
}
```

## 2. Handling Permission-Based Sections

```javascript
// Example: Check if leads section exists
if (response.data.leads) {
  renderLeadsSection(response.data.leads);
}

// Example: Check permission in userContext
if (response.data.userContext.permissions.includes('leads:view')) {
  // Show leads-related UI elements
}
```

## 3. Highlighting Current User in Team Leaderboard

```javascript
response.data.teamPerformance.teamLeaderboard.forEach(staff => {
  if (staff.isCurrentUser) {
    // Highlight this row with special CSS class
    rowElement.classList.add('current-user-highlight');
    // Add "You" badge
    renderYouBadge();
  }
});
```

## 4. Performance Score Display

```javascript
const score = response.data.myPerformanceScore;

// Circular progress bar
renderCircularProgress(score.scoreOutOf100, score.rating.color);

// Rating badge
renderRatingBadge(score.rating.label, score.rating.icon);

// Expandable breakdown
renderScoreBreakdown(score.breakdown);
```

## 5. Task Management UI

```javascript
const tasks = response.data.myTasks;

// Show overdue count in red badge
if (tasks.overdue > 0) {
  showOverdueBadge(tasks.overdue);
}

// Render today's tasks prominently
renderTodayTasks(tasks.todayTasks);

// Show completion progress
renderProgressBar(tasks.completionRate);
```

## 6. Weekly Schedule Calendar

```javascript
const schedule = response.data.upcomingWeekSchedule;

Object.keys(schedule).forEach(day => {
  const appointments = schedule[day];
  renderDaySchedule(day, appointments);
});
```

---

# 📊 UI/UX RECOMMENDATIONS

## Staff Dashboard Layout

```
+----------------------------------------------------------+
|  🏠 HEADER                                                |
|  Welcome back, John Doe!                                 |
|  Last active: 2 hours ago | Your Rank: #2 of 5 🥈       |
+----------------------------------------------------------+
|                                                           |
|  📊 QUICK STATS (Cards Row)                              |
|  +---------------+  +---------------+  +---------------+  |
|  | New Leads     |  | Messages      |  | Appointments  |  |
|  | Today: 2      |  | Today: 8      |  | Today: 2      |  |
|  +---------------+  +---------------+  +---------------+  |
|                                                           |
+----------------------------------------------------------+
|                                                           |
|  🎯 MY PERFORMANCE SCORE                                 |
|  +----------------------------------------------------+  |
|  |        ⭕ 79/100                                    |  |
|  |         "Good" 👍                                   |  |
|  |                                                    |  |
|  |  Breakdown:                                        |  |
|  |  ██████████████████░░ Conversion Rate (16.5/25)   |  |
|  |  ██████████████░░░░░░ Lead Engagement (10.9/15)   |  |
|  |  ████████████████████ Messaging (18.0/20)         |  |
|  +----------------------------------------------------+  |
|                                                           |
+----------------------------------------------------------+
|                                                           |
|  🏆 TEAM LEADERBOARD                                     |
|  +----------------------------------------------------+  |
|  | Rank | Name        | Leads | Conv% | Score | You  |  |
|  |------|-------------|-------|-------|-------|------|  |
|  | 🥇 1 | Alice Smith | 30    | 40%   | 92.5  |      |  |
|  | 🥈 2 | John Doe    | 15    | 33%   | 78.5  | ⭐   |  |
|  | 🥉 3 | Bob Wilson  | 20    | 30%   | 68.2  |      |  |
|  +----------------------------------------------------+  |
|  Team Average: 35.5% conversion | 22.5 leads per staff  |
|                                                           |
+----------------------------------------------------------+
|  ✅ MY TASKS (10 pending, 2 overdue)                     |
|  +----------------------------------------------------+  |
|  | 🔴 OVERDUE                                         |  |
|  | □ Follow up with John Doe (Yesterday)             |  |
|  |                                                    |  |
|  | 🔥 TODAY                                           |  |
|  | □ Send proposal to Jane Smith (5:00 PM)           |  |
|  | □ Confirm appointment with Mike (3:00 PM)         |  |
|  +----------------------------------------------------+  |
|                                                           |
+----------------------------------------------------------+
|  📅 TODAY'S SCHEDULE      |  ⚠️ PENDING ACTIONS         |
|  +-----------------------+  +-----------------------+    |
|  | 10:00 AM - John Doe   |  | • 3 leads follow-up   |    |
|  | 02:00 PM - Jane Smith |  | • 2 appointments      |    |
|  +-----------------------+  +-----------------------+    |
|                                                           |
+----------------------------------------------------------+
|  📊 MY STATS (Cards)                                     |
|  +------------------+  +------------------+               |
|  | LEADS            |  | MESSAGING        |               |
|  | 15 assigned      |  | 45 sent          |               |
|  | 33% conversion   |  | 12 conversations |               |
|  | 72.5 avg score   |  | 1.5/day avg      |               |
|  +------------------+  +------------------+               |
|                                                           |
+----------------------------------------------------------+
|  📈 TRENDS & CHARTS                                      |
|  - Lead Conversion Funnel                                |
|  - Messaging Trends (7-day chart)                        |
|  - Weekly Performance Comparison                         |
|                                                           |
+----------------------------------------------------------+
|  🏆 ACHIEVEMENTS                                         |
|  🎯 50+ Leads  🏆 10 Conversions  ⭐ High Converter      |
|                                                           |
+----------------------------------------------------------+
```

---

# 🔄 COMPARISON: COACH vs STAFF

| Data Point | Coach Sees | Staff Sees |
|------------|------------|------------|
| **Leads** | All 150 coach leads | Only 15 assigned leads |
| **Lead Details** | Full access | Only assigned leads |
| **Revenue** | ₹4,50,000 total | ❌ Not visible |
| **Financial Data** | Full P&L, expenses | ❌ Not visible |
| **Team Stats** | All staff performance with full details | Team leaderboard (competitive view) |
| **Messages** | All messages from all staff | Only their 250 messages |
| **Appointments** | All 100 appointments | Only their 20 appointments |
| **Performance Score** | Can see all staff scores | Only their own score (79/100) |
| **Tasks** | All 80 tasks | Only their 25 assigned tasks |
| **Dashboard Focus** | Business overview & management | Personal productivity & performance |
| **Data Volume** | Complete business data | Personalized subset |

---

# 🚀 TESTING EXAMPLES

## Test 1: Coach Dashboard
```bash
curl -X GET "http://localhost:3000/api/coach-dashboard/data?timeRange=30" \
  -H "Authorization: Bearer {COACH_TOKEN}"

# Expected Response Structure:
{
  "success": true,
  "data": {
    "overview": { ... full coach business metrics },
    "leads": { ... all leads },
    "financial": { ... revenue data },
    "team": { ... all staff performance }
  },
  "userContext": {
    "isStaff": false,
    "isCoach": true
  }
}
```

## Test 2: Staff Dashboard
```bash
curl -X GET "http://localhost:3000/api/coach-dashboard/data?timeRange=30" \
  -H "Authorization: Bearer {STAFF_TOKEN}"

# Expected Response Structure:
{
  "success": true,
  "data": {
    "overview": { ... MY personal stats },
    "myPerformanceScore": { ... MY score },
    "teamPerformance": { ... team leaderboard },
    "myTasks": { ... MY tasks },
    "leads": { ... MY assigned leads only }
    // NO financial data
    // NO other staff's messages
  },
  "userContext": {
    "isStaff": true,
    "isCoach": false,
    "permissions": [...]
  }
}
```

## Test 3: Staff with Limited Permissions
```bash
# Staff with only messaging:view permission
curl -X GET "http://localhost:3000/api/coach-dashboard/data" \
  -H "Authorization: Bearer {LIMITED_STAFF_TOKEN}"

# Expected: 
# - overview: only messaging stats
# - messaging sections present
# - leads sections: MISSING
# - appointments sections: MISSING
```

---

# ⚙️ IMPORTANT TECHNICAL NOTES

## For Frontend Developers:

1. **Always Check Section Existence:**
   ```javascript
   if (data.leads) {
     // Render leads section
   } else {
     // Staff doesn't have leads:view permission
     // Show "No access" message or hide section
   }
   ```

2. **Handle `isCurrentUser` Flag:**
   ```javascript
   teamLeaderboard.map(staff => 
     staff.isCurrentUser 
       ? <HighlightedRow data={staff} /> 
       : <RegularRow data={staff} />
   )
   ```

3. **Format Percentages:**
   ```javascript
   // Values come as strings like "33.3"
   const formatted = score + '%';  // "33.3%"
   ```

4. **Date Formatting:**
   ```javascript
   // Use relative time for recent activity
   import { formatDistanceToNow } from 'date-fns';
   formatDistanceToNow(new Date(activity.time)) // "2 hours ago"
   ```

5. **Performance Score Colors:**
   ```javascript
   const colors = {
     'gold': '#FFD700',
     'green': '#22C55E',
     'blue': '#3B82F6',
     'orange': '#F59E0B',
     'red': '#EF4444'
   };
   ```

6. **Empty States:**
   - No leads assigned: "No leads assigned yet"
   - No tasks: "All caught up! 🎉"
   - No appointments: "No appointments scheduled"

7. **Real-time Updates:**
   - Consider polling this endpoint every 5 minutes
   - Or use WebSocket for real-time updates
   - Update `quickStats` and `todayAppointments` more frequently

---

# 📱 RESPONSIVE DESIGN NOTES

## Mobile View Priority (Staff):
1. Quick Stats (top)
2. Performance Score
3. My Rank
4. Today's Appointments
5. Pending Actions
6. My Tasks (collapsible)
7. Recent Activity
8. Other sections (tabs/accordion)

## Desktop View:
- 2-3 column layout
- Performance score & team leaderboard side-by-side
- Charts and trends in separate section
- All sections visible with scroll

---

**END OF DOCUMENTATION**

**Files:**
- `services/staffDashboardService.js` - Staff dashboard logic
- `services/coachDashboardService.js` - Coach dashboard logic  
- `controllers/coachDashboardController.js` - Controller implementation
- `utils/sectionPermissions.js` - Permission definitions
