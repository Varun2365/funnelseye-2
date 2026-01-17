# Calendar & Appointment Management - Coach & Staff

**Comprehensive API Documentation for Calendar, Availability & Appointment Booking**

---

## 📊 **Table of Contents**

1. [Overview](#overview)
2. [Public Booking Routes (No Authentication)](#public-booking-routes-no-authentication)
3. [Coach Availability Routes](#coach-availability-routes)
4. [Staff Availability Routes](#staff-availability-routes)
5. [Appointment Management Routes](#appointment-management-routes)
6. [Calendar Routes](#calendar-routes)
7. [Staff Assignment Routes](#staff-assignment-routes)
8. [Assignment Settings Routes (Coach Only)](#assignment-settings-routes-coach-only)
9. [Reminder Settings Routes (Coach Only)](#reminder-settings-routes-coach-only)
10. [Zoom Integration Flow](#zoom-integration-flow)
11. [Data Models](#data-models)
12. [Permission Requirements](#permission-requirements)
13. [Staff Assignment Logic](#staff-assignment-logic)
14. [Appointment Reminder Logic](#appointment-reminder-logic)

---

## 🎯 **OVERVIEW**

The Calendar & Appointment system supports:
- ✅ Public appointment booking (no authentication required)
- ✅ Coach availability management
- ✅ Staff assignment (manual or automatic)
- ✅ Multiple staff handling same time slot
- ✅ Distribution ratio for fair workload distribution
- ✅ Unified endpoints for both coach and staff
- ✅ **Automatic Zoom meeting generation** when appointments are booked/assigned
- ✅ **Automated appointment reminders** via WhatsApp/Email
- ✅ **Zoom integration requirement** for availability setup
- ✅ **Staff-specific availability** copied from coach by default

### **Key Features:**

**For Coaches:**
- **Must connect Zoom account** before setting availability
- Set working hours and availability
- Configure appointment assignment settings (manual/automatic)
- Configure appointment reminder settings (frequency, timing, channel)
- View all appointments across the organization
- Manually assign appointments to staff
- View assignment statistics
- Enable/disable staff assignment mode
- **Cancel any appointment** regardless of assignment

**For Staff:**
- **Must connect Zoom account** before setting availability
- Set their own availability (defaults to coach's settings)
- View only their assigned appointments (with Zoom links)
- Book appointments (if they have permission)
- View available slots
- See their own calendar with assigned appointments
- Cannot see unassigned or other staff's appointments
- **Zoom meetings auto-generated** using their credentials

**For Public (Leads):**
- View coach availability and available time slots
- Book appointments without authentication
- Appointments auto-assign to staff if enabled
- **Automatically receive Zoom meeting link** in confirmation
- **Automatically receive appointment reminders** (3 days, 1 day, 10 mins before)

---

## 🌐 **PUBLIC BOOKING ROUTES (NO AUTHENTICATION)**

### **1. Get Coach Availability**

**Endpoint:** `GET /api/coach/:coachId/availability`

**Description:** Get coach's availability settings including working hours and time zone

**Access:** Public (No Auth Required)

**Response:**

```json
{
  "success": true,
  "data": {
    "_id": "65abc123def456...",
    "coachId": "coach_id_here",
    "timeZone": "Asia/Kolkata",
    "workingHours": [
      {
        "dayOfWeek": 1,
        "startTime": "09:00",
        "endTime": "17:00"
      },
      {
        "dayOfWeek": 2,
        "startTime": "09:00",
        "endTime": "17:00"
      },
      {
        "dayOfWeek": 3,
        "startTime": "09:00",
        "endTime": "17:00"
      },
      {
        "dayOfWeek": 4,
        "startTime": "09:00",
        "endTime": "17:00"
      },
      {
        "dayOfWeek": 5,
        "startTime": "09:00",
        "endTime": "17:00"
      }
    ],
    "unavailableSlots": [
      {
        "start": "2025-01-15T10:00:00Z",
        "end": "2025-01-15T11:00:00Z",
        "reason": "Personal appointment"
      }
    ],
    "defaultAppointmentDuration": 30,
    "bufferTime": 15,
    "appointmentAssignment": {
      "enabled": true,
      "mode": "automatic",
      "considerStaffAvailability": true,
      "allowMultipleStaffSameSlot": true
    }
  }
}
```

---

### **2. Get Available Time Slots**

**Endpoint:** `GET /api/coach/:coachId/available-slots?date=YYYY-MM-DD`

**Description:** Get available booking slots for a specific date

**Access:** Public (No Auth Required)

**Query Parameters:**
- `date` (required): Date in YYYY-MM-DD format

**Response (Staff Assignment Disabled):**

```json
{
  "success": true,
  "date": "2025-01-15",
  "slots": [
    {
      "startTime": "2025-01-15T09:00:00.000Z",
      "duration": 30,
      "timeZone": "Asia/Kolkata",
      "capacity": 1,
      "booked": 0,
      "available": 1,
      "staffAssignmentEnabled": false
    },
    {
      "startTime": "2025-01-15T09:45:00.000Z",
      "duration": 30,
      "timeZone": "Asia/Kolkata",
      "capacity": 1,
      "booked": 0,
      "available": 1,
      "staffAssignmentEnabled": false
    },
    {
      "startTime": "2025-01-15T10:30:00.000Z",
      "duration": 30,
      "timeZone": "Asia/Kolkata",
      "capacity": 1,
      "booked": 0,
      "available": 1,
      "staffAssignmentEnabled": false
    }
  ]
}
```

**Response (Staff Assignment Enabled with 3 Staff):**

```json
{
  "success": true,
  "date": "2025-01-15",
  "slots": [
    {
      "startTime": "2025-01-15T09:00:00.000Z",
      "duration": 30,
      "timeZone": "Asia/Kolkata",
      "capacity": 3,
      "booked": 1,
      "available": 2,
      "staffAssignmentEnabled": true
    },
    {
      "startTime": "2025-01-15T09:45:00.000Z",
      "duration": 30,
      "timeZone": "Asia/Kolkata",
      "capacity": 3,
      "booked": 0,
      "available": 3,
      "staffAssignmentEnabled": true
    },
    {
      "startTime": "2025-01-15T10:30:00.000Z",
      "duration": 30,
      "timeZone": "Asia/Kolkata",
      "capacity": 3,
      "booked": 3,
      "available": 0,
      "staffAssignmentEnabled": true
    }
  ]
}
```

**Note:** When staff assignment is enabled and `allowMultipleStaffSameSlot` is true:
- Same time slot can have multiple appointments (one per staff member)
- `capacity` = number of active staff members
- `booked` = number of appointments already scheduled at that time
- `available` = remaining capacity (`capacity - booked`)
- Slot only disappears when `available` reaches 0

---

### **3. Book an Appointment (Public)**

**Endpoint:** `POST /api/coach/:coachId/book`

**Description:** Book an appointment without authentication (public booking)

**Access:** Public (No Auth Required)

**Request Body:**

```json
{
  "leadId": "lead_id_here",
  "startTime": "2025-01-20T14:00:00Z",
  "duration": 30,
  "notes": "Initial consultation for weight loss program",
  "timeZone": "Asia/Kolkata"
}
```

**Response (Manual Assignment):**

```json
{
  "success": true,
  "message": "Appointment booked successfully.",
  "appointmentDetails": {
    "_id": "appt_id_here",
    "coachId": "coach_id_here",
    "leadId": {
      "_id": "lead_id_here",
      "name": "John Doe",
      "email": "john@example.com",
      "phone": "+1234567890"
    },
    "assignedStaffId": null,
    "startTime": "2025-01-20T14:00:00.000Z",
    "duration": 30,
    "summary": "Initial consultation for weight loss program",
    "notes": "Initial consultation for weight loss program",
    "timeZone": "Asia/Kolkata",
    "appointmentType": "online",
    "status": "scheduled",
    "createdAt": "2025-01-15T10:30:00.000Z",
    "updatedAt": "2025-01-15T10:30:00.000Z"
  }
}
```

**Response (Automatic Assignment with Zoom & Reminders):**

```json
{
  "success": true,
  "message": "Appointment booked successfully.",
  "appointmentDetails": {
    "_id": "appt_id_here",
    "coachId": "coach_id_here",
    "leadId": {
      "_id": "lead_id_here",
      "name": "John Doe",
      "email": "john@example.com",
      "phone": "+1234567890"
    },
    "assignedStaffId": "staff_id_here",
    "startTime": "2025-01-20T14:00:00.000Z",
    "duration": 30,
    "summary": "Initial consultation for weight loss program",
    "notes": "Initial consultation for weight loss program",
    "timeZone": "Asia/Kolkata",
    "appointmentType": "online",
    "status": "scheduled",
    "zoomMeeting": {
      "meetingId": "123456789",
      "joinUrl": "https://zoom.us/j/123456789?pwd=xyz",
      "startUrl": "https://zoom.us/s/123456789?zak=abc",
      "password": "xyz123",
      "createdAt": "2025-01-15T10:30:00.000Z"
    },
    "meetingHostPermissions": {
      "hasHostAccess": true,
      "canStartMeeting": true,
      "canManageParticipants": true,
      "canShareScreen": true,
      "canRecordMeeting": true,
      "transferredFromCoach": true,
      "originalCoachId": "coach_id_here"
    },
    "createdAt": "2025-01-15T10:30:00.000Z",
    "updatedAt": "2025-01-15T10:30:00.000Z"
  },
  "remindersScheduled": {
    "scheduled": 3,
    "total": 3,
    "reminders": [
      {
        "name": "3 Days Before",
        "timing": 4320,
        "scheduledFor": "2025-01-17T14:00:00.000Z"
      },
      {
        "name": "1 Day Before",
        "timing": 1440,
        "scheduledFor": "2025-01-19T14:00:00.000Z"
      },
      {
        "name": "10 Minutes Before",
        "timing": 10,
        "scheduledFor": "2025-01-20T13:50:00.000Z"
      }
    ]
  }
}
```

**Note:** When automatic assignment is enabled:
- System automatically assigns the appointment to the least loaded available staff
- Uses distribution ratio to determine fair distribution
- **Zoom meeting is auto-generated** using assigned staff's credentials
- **Appointment reminders are auto-scheduled** (3 days, 1 day, 10 mins before)
- If no staff available, appointment is still created but remains unassigned (uses coach's Zoom)

---

### **4. Get Coach Calendar (Public)**

**Endpoint:** `GET /api/coach/:coachId/calendar?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD`

**Description:** Get coach's calendar for a date range (shows only availability, not details)

**Access:** Public (No Auth Required)

**Query Parameters:**
- `startDate` (required): Start date in YYYY-MM-DD format
- `endDate` (required): End date in YYYY-MM-DD format

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "date": "2025-01-15",
      "appointments": [
        {
          "_id": "appt_id_1",
          "startTime": "2025-01-15T09:00:00.000Z",
          "duration": 30,
          "status": "scheduled"
        },
        {
          "_id": "appt_id_2",
          "startTime": "2025-01-15T10:00:00.000Z",
          "duration": 30,
          "status": "scheduled"
        }
      ],
      "availableSlots": [
        {
          "startTime": "2025-01-15T09:45:00.000Z",
          "duration": 30,
          "timeZone": "Asia/Kolkata",
          "capacity": 3,
          "booked": 0,
          "available": 3,
          "staffAssignmentEnabled": true
        },
        {
          "startTime": "2025-01-15T10:30:00.000Z",
          "duration": 30,
          "timeZone": "Asia/Kolkata",
          "capacity": 3,
          "booked": 1,
          "available": 2,
          "staffAssignmentEnabled": true
        }
      ]
    },
    {
      "date": "2025-01-16",
      "appointments": [],
      "availableSlots": [
        {
          "startTime": "2025-01-16T09:00:00.000Z",
          "duration": 30,
          "timeZone": "Asia/Kolkata",
          "capacity": 3,
          "booked": 0,
          "available": 3,
          "staffAssignmentEnabled": true
        }
      ]
    }
  ]
}
```

---

## 🔐 **COACH AVAILABILITY ROUTES**

All routes below require authentication and appropriate permissions.

### **5. Get Availability Settings (Coach or Staff)**

**Endpoint:** `GET /api/coach-dashboard/availability`

**Description:** Get availability settings (returns coach's for coach token, staff's for staff token)

**Access:** Private (Coach or Staff with `calendar:read` permission)

**⚠️ Note:** This is the **protected dashboard route**. For the same functionality:
- **With Coach Token** → Returns coach availability
- **With Staff Token** → Returns staff availability
- Same endpoint, different data based on authenticated user

**Coach Response:**

```json
{
  "success": true,
  "data": {
    "_id": "65abc123def456...",
    "coachId": "coach_id_here",
    "timeZone": "Asia/Kolkata",
    "workingHours": [
      {
        "dayOfWeek": 1,
        "startTime": "09:00",
        "endTime": "17:00"
      },
      {
        "dayOfWeek": 2,
        "startTime": "09:00",
        "endTime": "17:00"
      }
    ],
    "unavailableSlots": [],
    "defaultAppointmentDuration": 30,
    "bufferTime": 15,
    "appointmentAssignment": {
      "enabled": true,
      "mode": "automatic",
      "considerStaffAvailability": true,
      "allowMultipleStaffSameSlot": true
    },
    "createdAt": "2025-01-01T00:00:00.000Z",
    "updatedAt": "2025-01-15T10:00:00.000Z"
  },
  "userContext": {
    "isStaff": false,
    "permissions": ["calendar:read", "calendar:manage"]
  }
}
```

**Staff Response:**

```json
{
  "success": true,
  "data": {
    "_id": "65abc123def456...",
    "coachId": "coach_id_here",
    "timeZone": "Asia/Kolkata",
    "workingHours": [
      {
        "dayOfWeek": 1,
        "startTime": "09:00",
        "endTime": "17:00"
      },
      {
        "dayOfWeek": 2,
        "startTime": "09:00",
        "endTime": "17:00"
      }
    ],
    "defaultAppointmentDuration": 30,
    "bufferTime": 15
  },
  "userContext": {
    "isStaff": true,
    "userId": "staff_id_here",
    "permissions": ["calendar:read"]
  }
}
```

**Note:** Staff cannot see `appointmentAssignment` settings or `unavailableSlots` for security reasons.

---

### **6. Set Availability Settings (Coach Only)**

**Endpoint:** `PUT /api/coach-dashboard/availability`

**Description:** Update coach's availability settings

**Access:** Private (Coach Only with `calendar:manage` permission)

**⚠️ IMPORTANT:** Coach **MUST** have Zoom integration connected before setting availability. If Zoom is not connected, the API will return:

```json
{
  "success": false,
  "message": "You must connect your Zoom account before setting availability",
  "requiresZoomIntegration": true
}
```

**Request Body:**

```json
{
  "timeZone": "Asia/Kolkata",
  "workingHours": [
    {
      "dayOfWeek": 1,
      "startTime": "09:00",
      "endTime": "17:00"
    },
    {
      "dayOfWeek": 2,
      "startTime": "10:00",
      "endTime": "18:00"
    },
    {
      "dayOfWeek": 3,
      "startTime": "09:00",
      "endTime": "17:00"
    },
    {
      "dayOfWeek": 4,
      "startTime": "09:00",
      "endTime": "17:00"
    },
    {
      "dayOfWeek": 5,
      "startTime": "09:00",
      "endTime": "13:00"
    }
  ],
  "unavailableSlots": [
    {
      "start": "2025-01-20T14:00:00Z",
      "end": "2025-01-20T15:00:00Z",
      "reason": "Team meeting"
    }
  ],
  "defaultAppointmentDuration": 30,
  "bufferTime": 15
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "_id": "65abc123def456...",
    "coachId": "coach_id_here",
    "timeZone": "Asia/Kolkata",
    "workingHours": [
      {
        "dayOfWeek": 1,
        "startTime": "09:00",
        "endTime": "17:00"
      },
      {
        "dayOfWeek": 2,
        "startTime": "10:00",
        "endTime": "18:00"
      }
    ],
    "unavailableSlots": [
      {
        "start": "2025-01-20T14:00:00.000Z",
        "end": "2025-01-20T15:00:00.000Z",
        "reason": "Team meeting"
      }
    ],
    "defaultAppointmentDuration": 30,
    "bufferTime": 15,
    "updatedAt": "2025-01-15T11:00:00.000Z"
  }
}
```

**Validation Rules:**
- `dayOfWeek`: 0 (Sunday) to 6 (Saturday)
- `startTime` / `endTime`: HH:MM format (00:00 to 23:59)
- `defaultAppointmentDuration`: Minimum 10 minutes
- `bufferTime`: Minimum 0 minutes
- **Zoom Integration:** Required before availability can be set

---

## 👥 **STAFF AVAILABILITY (USING SAME ENDPOINTS AS COACH)**

### **🔑 How Unified Endpoints Work:**

The same availability endpoints work for **both Coach and Staff**:

| Endpoint | Coach Token | Staff Token |
|----------|-------------|-------------|
| `GET /api/coach/:coachId/availability` | Returns **Coach** availability | Returns **Staff's own** availability |
| `POST /api/coach/availability` | Updates **Coach** availability | Updates **Staff's own** availability |
| `POST /api/coach/availability/copy-from-coach` | ❌ Not allowed | ✅ Copies coach settings to staff |
| `GET /api/coach/availability/zoom-status` | Checks **Coach** Zoom status | Checks **Staff** Zoom status |

**Alternative Paths (Dashboard Routes):**
- `GET /api/coach-dashboard/availability` - Same as `GET /api/coach/:coachId/availability`
- `PUT /api/coach-dashboard/availability` - Same as `POST /api/coach/availability`
- `POST /api/coach-dashboard/availability/copy-from-coach` - Same as above
- `GET /api/coach-dashboard/availability/zoom-status` - Same as above

**Key Points:**
- ✅ **Token determines the target** - no separate routes needed
- ✅ **Staff gets their own availability** automatically
- ✅ **Staff availability auto-created** from coach settings on first access
- ✅ **Same request body format** for both coach and staff
- ✅ **Response includes userContext** to identify who's accessing
- ✅ **Available on both** `/api/coach` and `/api/coach-dashboard` paths

---

### **6a. Get Staff Availability (Same Endpoint as Coach)**

**Endpoint:** `GET /api/coach/:coachId/availability` (with Staff Token)

**Description:** Get staff member's availability settings

**Access:** Public (unauthenticated shows coach availability) OR Private (authenticated with staff token shows staff's own availability)

**Staff Response (with Staff Token):**

```json
{
  "success": true,
  "data": {
    "_id": "65abc123def456...",
    "staffId": "staff_id_here",
    "coachId": "coach_id_here",
    "timeZone": "Asia/Kolkata",
    "workingHours": [
      {
        "dayOfWeek": 1,
        "startTime": "09:00",
        "endTime": "17:00"
      }
    ],
    "unavailableSlots": [],
    "defaultAppointmentDuration": 30,
    "bufferTime": 15,
    "copiedFromCoach": true,
    "lastSyncedWithCoach": "2025-01-15T10:00:00.000Z",
    "hasZoomIntegration": true,
    "zoomIntegrationStatus": "active"
  },
  "userContext": {
    "isStaff": true,
    "userId": "staff_id_here",
    "permissions": ["calendar:read"]
  }
}
```

**Coach Response (with Coach Token):**

```json
{
  "success": true,
  "data": {
    "_id": "65abc123def456...",
    "coachId": "coach_id_here",
    "timeZone": "Asia/Kolkata",
    "workingHours": [...],
    "unavailableSlots": [],
    "defaultAppointmentDuration": 30,
    "bufferTime": 15,
    "appointmentAssignment": {...},
    "appointmentReminders": {...},
    "hasZoomIntegration": true,
    "zoomIntegrationStatus": "active"
  },
  "userContext": {
    "isStaff": false,
    "userId": "coach_id_here",
    "permissions": ["calendar:manage"]
  }
}
```

**Note:** 
- **Staff Token** → Returns staff's own availability (auto-created from coach if doesn't exist)
- **Coach Token** → Returns coach's availability
- **No Token** → Returns coach's availability (public)

---

### **6b. Set Availability (Same Endpoint for Coach & Staff)**

**Endpoint:** `POST /api/coach/availability` (Protected)

**Description:** Update availability settings - applies to coach if coach token, applies to staff if staff token

**Access:** Private (Coach or Staff with `calendar:manage` permission)

**⚠️ IMPORTANT:** User **MUST** have Zoom integration connected before setting availability.

**Request Body (Same for both Coach & Staff):**

```json
{
  "timeZone": "Asia/Kolkata",
  "workingHours": [
    {
      "dayOfWeek": 1,
      "startTime": "09:00",
      "endTime": "17:00"
    },
    {
      "dayOfWeek": 2,
      "startTime": "09:00",
      "endTime": "17:00"
    }
  ],
  "unavailableSlots": [
    {
      "start": "2025-01-20T14:00:00Z",
      "end": "2025-01-20T15:00:00Z",
      "reason": "Personal appointment"
    }
  ],
  "defaultAppointmentDuration": 30,
  "bufferTime": 15
}
```

**Response (Staff Token):**

```json
{
  "success": true,
  "message": "Staff availability updated successfully",
  "data": {
    "_id": "65abc123def456...",
    "staffId": "staff_id_here",
    "coachId": "coach_id_here",
    "workingHours": [...],
    "copiedFromCoach": false,
    "hasZoomIntegration": true,
    "zoomIntegrationStatus": "active"
  },
  "userContext": {
    "isStaff": true,
    "userId": "staff_id_here"
  }
}
```

**Response (Coach Token):**

```json
{
  "success": true,
  "message": "Coach availability updated successfully",
  "data": {
    "_id": "65abc123def456...",
    "coachId": "coach_id_here",
    "workingHours": [...],
    "hasZoomIntegration": true,
    "zoomIntegrationStatus": "active"
  },
  "userContext": {
    "isStaff": false,
    "userId": "coach_id_here"
  }
}
```

**Error (No Zoom Integration):**

```json
{
  "success": false,
  "message": "You must connect your Zoom account before setting availability",
  "requiresZoomIntegration": true,
  "userType": "staff"
}
```

**How It Works:**
- **Coach Token** → Updates `CoachAvailability` for the coach
- **Staff Token** → Updates `StaffAvailability` for that specific staff member
- Same endpoint, different data based on who's authenticated

---

### **6c. Copy Coach Availability to Staff**

**Endpoint:** `POST /api/coach/availability/copy-from-coach` (Protected)

**Description:** Copy coach's availability settings to staff member (Staff only)

**Access:** Private (Staff only with `calendar:read` permission)

**Request Body:**

```json
{}
```

**Response:**

```json
{
  "success": true,
  "message": "Coach availability copied to staff successfully",
  "data": {
    "_id": "65abc123def456...",
    "staffId": "staff_id_here",
    "coachId": "coach_id_here",
    "workingHours": [...],
    "copiedFromCoach": true,
    "lastSyncedWithCoach": "2025-01-15T11:00:00.000Z"
  }
}
```

---

### **6d. Check Zoom Integration Status**

**Endpoint:** `GET /api/coach/availability/zoom-status` (Protected)

**Description:** Check if current user has valid Zoom integration

**Access:** Private (Coach or Staff with `calendar:read` permission)

**Response (Staff Token):**

```json
{
  "success": true,
  "data": {
    "hasZoomIntegration": true,
    "userId": "staff_id_here",
    "userType": "staff"
  }
}
```

**Response (Coach Token):**

```json
{
  "success": true,
  "data": {
    "hasZoomIntegration": false,
    "userId": "coach_id_here",
    "userType": "coach"
  }
}
```

**Note:** Token determines whose Zoom status is checked - no need for query parameters.

---

## 📅 **APPOINTMENT MANAGEMENT ROUTES**

### **7. Get Calendar (Coach or Staff)**

**Endpoint:** `GET /api/coach-dashboard/calendar?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD`

**Description:** Get calendar with appointments for a date range

**Access:** Private (Coach or Staff with `calendar:read` permission)

**Query Parameters:**
- `startDate` (required): Start date in YYYY-MM-DD format
- `endDate` (required): End date in YYYY-MM-DD format

**Coach Response:**

```json
{
  "success": true,
  "data": [
    {
      "_id": "appt_id_1",
      "coachId": "coach_id_here",
      "leadId": {
        "_id": "lead_id_1",
        "name": "John Doe",
        "email": "john@example.com",
        "phone": "+1234567890"
      },
      "assignedStaffId": "staff_id_1",
      "startTime": "2025-01-15T09:00:00.000Z",
      "duration": 30,
      "summary": "Initial consultation",
      "notes": "Discuss weight loss goals",
      "timeZone": "Asia/Kolkata",
      "appointmentType": "online",
      "status": "scheduled",
      "zoomMeeting": {
        "meetingId": "123456789",
        "joinUrl": "https://zoom.us/j/123456789?pwd=xyz",
        "startUrl": "https://zoom.us/s/123456789?zak=abc",
        "password": "xyz123"
      },
      "createdAt": "2025-01-10T10:00:00.000Z",
      "updatedAt": "2025-01-10T10:00:00.000Z"
    },
    {
      "_id": "appt_id_2",
      "coachId": "coach_id_here",
      "leadId": {
        "_id": "lead_id_2",
        "name": "Jane Smith",
        "email": "jane@example.com",
        "phone": "+1234567891"
      },
      "assignedStaffId": "staff_id_2",
      "startTime": "2025-01-15T10:00:00.000Z",
      "duration": 30,
      "summary": "Follow-up session",
      "notes": "Review progress",
      "timeZone": "Asia/Kolkata",
      "appointmentType": "online",
      "status": "confirmed",
      "createdAt": "2025-01-11T14:00:00.000Z",
      "updatedAt": "2025-01-14T09:00:00.000Z"
    },
    {
      "_id": "appt_id_3",
      "coachId": "coach_id_here",
      "leadId": {
        "_id": "lead_id_3",
        "name": "Bob Johnson",
        "email": "bob@example.com",
        "phone": "+1234567892"
      },
      "assignedStaffId": null,
      "startTime": "2025-01-16T11:00:00.000Z",
      "duration": 45,
      "summary": "Premium consultation",
      "notes": "Requires coach attention",
      "timeZone": "Asia/Kolkata",
      "appointmentType": "online",
      "status": "scheduled",
      "createdAt": "2025-01-12T16:00:00.000Z",
      "updatedAt": "2025-01-12T16:00:00.000Z"
    }
  ],
  "dateRange": {
    "startDate": "2025-01-15",
    "endDate": "2025-01-20"
  },
  "count": 3,
  "userContext": {
    "isStaff": false,
    "userId": "coach_id_here",
    "permissions": ["calendar:read", "calendar:manage"]
  }
}
```

**Staff Response (Only Assigned Appointments):**

```json
{
  "success": true,
  "data": [
    {
      "_id": "appt_id_1",
      "coachId": "coach_id_here",
      "leadId": {
        "_id": "lead_id_1",
        "name": "John Doe",
        "email": "john@example.com",
        "phone": "+1234567890"
      },
      "assignedStaffId": "staff_id_1",
      "startTime": "2025-01-15T09:00:00.000Z",
      "duration": 30,
      "summary": "Initial consultation",
      "notes": "Discuss weight loss goals",
      "timeZone": "Asia/Kolkata",
      "appointmentType": "online",
      "status": "scheduled",
      "createdAt": "2025-01-10T10:00:00.000Z",
      "updatedAt": "2025-01-10T10:00:00.000Z"
    }
  ],
  "dateRange": {
    "startDate": "2025-01-15",
    "endDate": "2025-01-20"
  },
  "count": 1,
  "userContext": {
    "isStaff": true,
    "userId": "staff_id_1",
    "permissions": ["calendar:read"]
  }
}
```

**Note:** Staff only see appointments where `assignedStaffId` matches their `userId`.

---

### **8. Get Upcoming Appointments (Coach or Staff)**

**Endpoint:** `GET /api/coach-dashboard/appointments/upcoming?limit=10`

**Description:** Get upcoming appointments (future appointments sorted by date)

**Access:** Private (Coach or Staff with `calendar:read` permission)

**Query Parameters:**
- `limit` (optional): Number of appointments to return (default: 10)

**Coach Response:**

```json
{
  "success": true,
  "data": [
    {
      "_id": "appt_id_1",
      "coachId": "coach_id_here",
      "leadId": {
        "_id": "lead_id_1",
        "name": "John Doe",
        "email": "john@example.com",
        "phone": "+1234567890"
      },
      "assignedStaffId": "staff_id_1",
      "startTime": "2025-01-20T14:00:00.000Z",
      "duration": 30,
      "summary": "Initial consultation",
      "status": "scheduled"
    },
    {
      "_id": "appt_id_2",
      "coachId": "coach_id_here",
      "leadId": {
        "_id": "lead_id_2",
        "name": "Jane Smith",
        "email": "jane@example.com"
      },
      "assignedStaffId": "staff_id_2",
      "startTime": "2025-01-21T09:00:00.000Z",
      "duration": 45,
      "summary": "Follow-up session",
      "status": "confirmed"
    }
  ],
  "count": 2,
  "userContext": {
    "isStaff": false,
    "userId": "coach_id_here",
    "permissions": ["calendar:read"]
  }
}
```

**Staff Response:**

```json
{
  "success": true,
  "data": [
    {
      "_id": "appt_id_1",
      "coachId": "coach_id_here",
      "leadId": {
        "_id": "lead_id_1",
        "name": "John Doe",
        "email": "john@example.com",
        "phone": "+1234567890"
      },
      "assignedStaffId": "staff_id_1",
      "startTime": "2025-01-20T14:00:00.000Z",
      "duration": 30,
      "summary": "Initial consultation",
      "status": "scheduled"
    }
  ],
  "count": 1,
  "userContext": {
    "isStaff": true,
    "userId": "staff_id_1",
    "permissions": ["calendar:read"]
  }
}
```

---

### **9. Get Today's Appointments (Coach or Staff)**

**Endpoint:** `GET /api/coach-dashboard/appointments/today`

**Description:** Get all appointments scheduled for today

**Access:** Private (Coach or Staff with `calendar:read` permission)

**Coach Response:**

```json
{
  "success": true,
  "data": [
    {
      "_id": "appt_id_1",
      "coachId": "coach_id_here",
      "leadId": {
        "_id": "lead_id_1",
        "name": "John Doe",
        "email": "john@example.com",
        "phone": "+1234567890"
      },
      "assignedStaffId": "staff_id_1",
      "startTime": "2025-01-15T09:00:00.000Z",
      "duration": 30,
      "summary": "Morning consultation",
      "status": "scheduled"
    },
    {
      "_id": "appt_id_2",
      "coachId": "coach_id_here",
      "leadId": {
        "_id": "lead_id_2",
        "name": "Jane Smith",
        "email": "jane@example.com"
      },
      "assignedStaffId": "staff_id_2",
      "startTime": "2025-01-15T14:00:00.000Z",
      "duration": 45,
      "summary": "Afternoon session",
      "status": "confirmed"
    }
  ],
  "date": "2025-01-15",
  "count": 2,
  "userContext": {
    "isStaff": false,
    "userId": "coach_id_here",
    "permissions": ["calendar:read"]
  }
}
```

**Staff Response:**

```json
{
  "success": true,
  "data": [
    {
      "_id": "appt_id_1",
      "coachId": "coach_id_here",
      "leadId": {
        "_id": "lead_id_1",
        "name": "John Doe",
        "email": "john@example.com",
        "phone": "+1234567890"
      },
      "assignedStaffId": "staff_id_1",
      "startTime": "2025-01-15T09:00:00.000Z",
      "duration": 30,
      "summary": "Morning consultation",
      "status": "scheduled"
    }
  ],
  "date": "2025-01-15",
  "count": 1,
  "userContext": {
    "isStaff": true,
    "userId": "staff_id_1",
    "permissions": ["calendar:read"]
  }
}
```

---

### **10. Book Appointment (Coach or Staff)**

**Endpoint:** `POST /api/coach-dashboard/appointments`

**Description:** Book a new appointment

**Access:** Private (Coach or Staff with `calendar:book` permission)

**Request Body:**

```json
{
  "leadId": "lead_id_here",
  "startTime": "2025-01-20T14:00:00Z",
  "duration": 30,
  "notes": "Initial consultation for premium package",
  "timeZone": "Asia/Kolkata"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Appointment booked successfully",
  "data": {
    "_id": "appt_id_here",
    "coachId": "coach_id_here",
    "leadId": "lead_id_here",
    "assignedStaffId": "staff_id_here",
    "startTime": "2025-01-20T14:00:00.000Z",
    "duration": 30,
    "summary": "Initial consultation for premium package",
    "notes": "Initial consultation for premium package",
    "timeZone": "Asia/Kolkata",
    "appointmentType": "online",
    "status": "scheduled",
    "createdAt": "2025-01-15T10:30:00.000Z",
    "updatedAt": "2025-01-15T10:30:00.000Z"
  },
  "userContext": {
    "isStaff": false,
    "permissions": ["calendar:book"]
  }
}
```

---

### **11. Reschedule Appointment (Coach or Staff)**

**Endpoint:** `PUT /api/coach-dashboard/appointments/:appointmentId/reschedule`

**Description:** Reschedule an existing appointment

**Access:** Private (Coach or Staff with `calendar:update` permission)

**Request Body:**

```json
{
  "newStartTime": "2025-01-22T10:00:00Z",
  "newDuration": 45
}
```

**Response:**

```json
{
  "success": true,
  "message": "Appointment rescheduled successfully",
  "data": {
    "_id": "appt_id_here",
    "coachId": "coach_id_here",
    "leadId": {
      "_id": "lead_id_here",
      "name": "John Doe",
      "email": "john@example.com"
    },
    "assignedStaffId": "staff_id_here",
    "startTime": "2025-01-22T10:00:00.000Z",
    "duration": 45,
    "summary": "Rescheduled consultation",
    "status": "scheduled",
    "updatedAt": "2025-01-15T11:00:00.000Z"
  },
  "userContext": {
    "isStaff": false,
    "permissions": ["calendar:update"]
  }
}
```

---

### **12. Cancel Appointment (Coach or Staff)**

**Endpoint:** `DELETE /api/coach-dashboard/appointments/:appointmentId`

**Description:** Cancel an appointment

**Access:** Private (Coach or Staff with `calendar:delete` permission)

**Response:**

```json
{
  "success": true,
  "message": "Appointment cancelled",
  "userContext": {
    "isStaff": false,
    "permissions": ["calendar:delete"]
  }
}
```

---

### **13. Get Appointment Statistics (Coach or Staff)**

**Endpoint:** `GET /api/coach-dashboard/appointments/stats?timeRange=30`

**Description:** Get appointment statistics

**Access:** Private (Coach or Staff with `calendar:read` permission)

**Query Parameters:**
- `timeRange` (optional): Number of days to look back (default: 30)

**Coach Response:**

```json
{
  "success": true,
  "data": {
    "total": 45,
    "completed": 38,
    "cancelled": 4,
    "noShow": 3,
    "completionRate": 84.44,
    "cancellationRate": 8.89,
    "noShowRate": 6.67
  },
  "userContext": {
    "isStaff": false,
    "permissions": ["calendar:read"]
  }
}
```

**Staff Response (Only Their Appointments):**

```json
{
  "success": true,
  "data": {
    "total": 12,
    "completed": 10,
    "cancelled": 1,
    "noShow": 1,
    "completionRate": 83.33,
    "cancellationRate": 8.33,
    "noShowRate": 8.33
  },
  "userContext": {
    "isStaff": true,
    "userId": "staff_id_1",
    "permissions": ["calendar:read"]
  }
}
```

---

## 👥 **STAFF ASSIGNMENT ROUTES**

### **14. Assign Appointment to Staff (Coach Only)**

**Endpoint:** `POST /api/staff-appointments/assign`

**Description:** Manually assign an appointment to a staff member

**Access:** Private (Coach with `appointments:manage` permission)

**Request Body:**

```json
{
  "appointmentId": "appt_id_here",
  "staffId": "staff_id_here"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Appointment assigned to staff successfully",
  "data": {
    "_id": "appt_id_here",
    "coachId": "coach_id_here",
    "leadId": {
      "_id": "lead_id_here",
      "name": "John Doe",
      "email": "john@example.com",
      "phone": "+1234567890"
    },
    "assignedStaffId": {
      "_id": "staff_id_here",
      "name": "Staff Member 1",
      "email": "staff1@coach.com"
    },
    "startTime": "2025-01-20T14:00:00.000Z",
    "duration": 30,
    "status": "scheduled"
  }
}
```

---

### **15. Unassign Appointment from Staff (Coach Only)**

**Endpoint:** `PUT /api/staff-appointments/:appointmentId/unassign`

**Description:** Remove staff assignment from an appointment

**Access:** Private (Coach with `appointments:manage` permission)

**Response:**

```json
{
  "success": true,
  "message": "Appointment unassigned successfully",
  "data": {
    "_id": "appt_id_here",
    "coachId": "coach_id_here",
    "leadId": {
      "_id": "lead_id_here",
      "name": "John Doe",
      "email": "john@example.com"
    },
    "assignedStaffId": null,
    "startTime": "2025-01-20T14:00:00.000Z",
    "duration": 30,
    "status": "scheduled"
  }
}
```

---

### **16. Get Available Staff for Assignment (Coach Only)**

**Endpoint:** `GET /api/staff-appointments/available-staff?appointmentDate=YYYY-MM-DD&appointmentTime=HH:mm&duration=30`

**Description:** Get list of available staff members for a specific time slot

**Access:** Private (Coach with `appointments:read` permission)

**Query Parameters:**
- `appointmentDate` (required): Date in YYYY-MM-DD format
- `appointmentTime` (required): Time in HH:mm format
- `duration` (optional): Duration in minutes (default: 30)

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "_id": "staff_id_1",
      "name": "Staff Member 1",
      "email": "staff1@coach.com",
      "permissions": ["calendar:read", "calendar:book"],
      "hasConflicts": false,
      "conflictCount": 0
    },
    {
      "_id": "staff_id_2",
      "name": "Staff Member 2",
      "email": "staff2@coach.com",
      "permissions": ["calendar:read", "calendar:book"],
      "hasConflicts": true,
      "conflictCount": 1
    }
  ],
  "appointmentTime": {
    "start": "2025-01-20T14:00:00.000Z",
    "end": "2025-01-20T14:30:00.000Z",
    "duration": 30
  }
}
```

---

### **17. Get Staff Appointments (Coach or Staff)**

**Endpoint:** `GET /api/staff-appointments/staff/:staffId?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD&status=scheduled&page=1&limit=20`

**Description:** Get all appointments assigned to a specific staff member

**Access:** Private (Coach with `appointments:read` or Staff viewing their own)

**Query Parameters:**
- `startDate` (optional): Filter by start date
- `endDate` (optional): Filter by end date
- `status` (optional): Filter by status
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20)

**Coach Response:**

```json
{
  "success": true,
  "data": [
    {
      "_id": "appt_id_1",
      "coachId": "coach_id_here",
      "leadId": {
        "_id": "lead_id_1",
        "name": "John Doe",
        "email": "john@example.com",
        "phone": "+1234567890"
      },
      "assignedStaffId": "staff_id_1",
      "startTime": "2025-01-20T14:00:00.000Z",
      "duration": 30,
      "status": "scheduled"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 1,
    "pages": 1
  }
}
```

**Staff Response (Same as Coach):**

Staff can only access this route for their own `staffId`. Attempting to access another staff member's appointments will result in `403 Forbidden`.

---

### **18. Get Staff Calendar (Coach or Staff)**

**Endpoint:** `GET /api/staff-appointments/staff/:staffId/calendar?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD`

**Description:** Get staff member's calendar with appointments and calendar events

**Access:** Private (Coach with `appointments:read` or Staff viewing their own)

**Query Parameters:**
- `startDate` (optional): Start date (defaults to today)
- `endDate` (optional): End date (defaults to 30 days from now)

**Response:**

```json
{
  "success": true,
  "data": {
    "appointments": [
      {
        "_id": "appt_id_1",
        "coachId": "coach_id_here",
        "leadId": {
          "_id": "lead_id_1",
          "name": "John Doe",
          "email": "john@example.com"
        },
        "assignedStaffId": "staff_id_1",
        "startTime": "2025-01-20T14:00:00.000Z",
        "duration": 30,
        "status": "scheduled"
      }
    ],
    "calendarEvents": [
      {
        "_id": "event_id_1",
        "staffId": "staff_id_1",
        "eventType": "meeting",
        "title": "Team Meeting",
        "startTime": "2025-01-20T10:00:00.000Z",
        "endTime": "2025-01-20T11:00:00.000Z",
        "status": "scheduled"
      }
    ],
    "dateRange": {
      "start": "2025-01-15T00:00:00.000Z",
      "end": "2025-02-14T23:59:59.999Z"
    }
  }
}
```

---

### **19. Bulk Assign Appointments (Coach Only)**

**Endpoint:** `POST /api/staff-appointments/bulk-assign`

**Description:** Assign multiple appointments to staff members at once

**Access:** Private (Coach with `appointments:manage` permission)

**Request Body:**

```json
{
  "assignments": [
    {
      "appointmentId": "appt_id_1",
      "staffId": "staff_id_1"
    },
    {
      "appointmentId": "appt_id_2",
      "staffId": "staff_id_2"
    },
    {
      "appointmentId": "appt_id_3",
      "staffId": "staff_id_1"
    }
  ]
}
```

**Response:**

```json
{
  "success": true,
  "message": "Bulk assignment completed. 3 successful, 0 failed.",
  "results": [
    {
      "appointmentId": "appt_id_1",
      "staffId": "staff_id_1",
      "success": true
    },
    {
      "appointmentId": "appt_id_2",
      "staffId": "staff_id_2",
      "success": true
    },
    {
      "appointmentId": "appt_id_3",
      "staffId": "staff_id_1",
      "success": true
    }
  ],
  "errors": []
}
```

---

## ⚙️ **ASSIGNMENT SETTINGS ROUTES (COACH ONLY)**

### **20. Get Assignment Settings (Coach Only)**

**Endpoint:** `GET /api/coach/availability/assignment-settings` (Protected)

**Description:** Get current appointment assignment settings

**Access:** Private (Coach Only)

**Response:**

```json
{
  "success": true,
  "data": {
    "enabled": true,
    "mode": "automatic",
    "considerStaffAvailability": true,
    "allowMultipleStaffSameSlot": true
  }
}
```

**Settings Explanation:**
- `enabled`: Whether staff assignment is enabled
- `mode`: `"manual"` (coach assigns) or `"automatic"` (system assigns based on distribution ratio)
- `considerStaffAvailability`: If true, total slots = coach working hours × number of active staff
- `allowMultipleStaffSameSlot`: If true, multiple staff can have appointments at the same time

---

### **21. Update Assignment Settings (Coach Only)**

**Endpoint:** `PUT /api/coach/availability/assignment-settings` (Protected)

**Description:** Update appointment assignment settings

**Access:** Private (Coach Only)

**Request Body:**

```json
{
  "enabled": true,
  "mode": "automatic",
  "considerStaffAvailability": true,
  "allowMultipleStaffSameSlot": true
}
```

**Response:**

```json
{
  "success": true,
  "message": "Assignment settings updated successfully",
  "data": {
    "enabled": true,
    "mode": "automatic",
    "considerStaffAvailability": true,
    "allowMultipleStaffSameSlot": true
  }
}
```

**Validation:**
- `mode` must be either `"manual"` or `"automatic"`
- All fields are optional (existing values are retained if not provided)

---

### **22. Get Assignment Statistics (Coach Only)**

**Endpoint:** `GET /api/coach/availability/assignment-stats?days=30` (Protected)

**Description:** Get detailed statistics about appointment assignments

**Access:** Private (Coach Only)

**Query Parameters:**
- `days` (optional): Number of days to look back (default: 30)

**Response:**

```json
{
  "success": true,
  "data": {
    "totalAppointments": 120,
    "assignedAppointments": 95,
    "unassignedAppointments": 25,
    "assignmentRate": 79.17,
    "staffStats": [
      {
        "staffId": "staff_id_1",
        "name": "Staff Member 1",
        "email": "staff1@coach.com",
        "totalAssigned": 45,
        "completed": 38,
        "completionRate": 84.44,
        "distributionRatio": 2
      },
      {
        "staffId": "staff_id_2",
        "name": "Staff Member 2",
        "email": "staff2@coach.com",
        "totalAssigned": 30,
        "completed": 26,
        "completionRate": 86.67,
        "distributionRatio": 1.5
      },
      {
        "staffId": "staff_id_3",
        "name": "Staff Member 3",
        "email": "staff3@coach.com",
        "totalAssigned": 20,
        "completed": 15,
        "completionRate": 75.00,
        "distributionRatio": 1
      }
    ],
    "period": "Last 30 days"
  }
}
```

---

## 🔔 **REMINDER SETTINGS ROUTES (COACH ONLY)**

### **23. Get Reminder Settings**

**Endpoint:** `GET /api/coach/availability/reminder-settings`

**Description:** Get appointment reminder settings for coach

**Access:** Private (Coach Only)

**Response (Default Reminders):**

```json
{
  "success": true,
  "data": {
    "enabled": true,
    "reminders": [
      {
        "name": "3 Days Before",
        "timing": 4320,
        "channel": "whatsapp",
        "isActive": true
      },
      {
        "name": "1 Day Before",
        "timing": 1440,
        "channel": "whatsapp",
        "isActive": true
      },
      {
        "name": "10 Minutes Before",
        "timing": 10,
        "channel": "whatsapp",
        "isActive": true
      }
    ],
    "defaultReminders": true
  }
}
```

**Response (Custom Reminders):**

```json
{
  "success": true,
  "data": {
    "enabled": true,
    "reminders": [
      {
        "name": "1 Week Before",
        "timing": 10080,
        "channel": "whatsapp",
        "templateId": "template_id_here",
        "isActive": true
      },
      {
        "name": "2 Hours Before",
        "timing": 120,
        "channel": "both",
        "templateId": "template_id_here",
        "isActive": true
      }
    ],
    "defaultReminders": false
  }
}
```

**Reminder Fields:**
- `name`: Human-readable reminder name
- `timing`: Minutes before appointment (e.g., 4320 = 3 days, 1440 = 1 day, 10 = 10 minutes)
- `channel`: `"whatsapp"`, `"email"`, `"sms"`, or `"both"`
- `templateId`: WhatsApp template ID to use
- `isActive`: Whether this reminder is active

---

### **24. Update Reminder Settings**

**Endpoint:** `PUT /api/coach/availability/reminder-settings`

**Description:** Update appointment reminder settings

**Access:** Private (Coach Only)

**Request Body (Use Default Reminders):**

```json
{
  "enabled": true,
  "defaultReminders": true
}
```

**Request Body (Custom Reminders):**

```json
{
  "enabled": true,
  "defaultReminders": false,
  "reminders": [
    {
      "name": "1 Week Before",
      "timing": 10080,
      "channel": "whatsapp",
      "templateId": "template_id_here",
      "isActive": true
    },
    {
      "name": "3 Days Before",
      "timing": 4320,
      "channel": "email",
      "isActive": true
    },
    {
      "name": "1 Hour Before",
      "timing": 60,
      "channel": "both",
      "templateId": "template_id_here",
      "isActive": true
    }
  ]
}
```

**Response:**

```json
{
  "success": true,
  "message": "Reminder settings updated successfully",
  "data": {
    "enabled": true,
    "reminders": [...],
    "defaultReminders": false
  }
}
```

**Timing Examples:**
- 10 minutes = 10
- 30 minutes = 30
- 1 hour = 60
- 2 hours = 120
- 1 day = 1440
- 3 days = 4320
- 1 week = 10080

---

## 🎥 **ZOOM INTEGRATION FLOW**

### **Complete Appointment Creation Flow**

When an appointment is booked or assigned, the following happens automatically:

#### **1. Appointment Booking (Public or Authenticated)**

```
User books appointment
    ↓
System creates appointment record
    ↓
If automatic assignment enabled:
    → Find least loaded available staff
    → Assign appointment to staff
    → Generate Zoom meeting using STAFF's Zoom credentials
    ↓
If no staff or manual mode:
    → Generate Zoom meeting using COACH's Zoom credentials
    ↓
Schedule appointment reminders based on coach settings
    ↓
Return appointment with Zoom link & reminders scheduled
```

#### **2. Zoom Meeting Generation**

**For Staff-Assigned Appointments:**
- Uses **assigned staff member's Zoom credentials**
- Staff member becomes the meeting host
- Coach retains visibility of all meetings
- Staff can start/manage/record the meeting

**For Coach-Only Appointments:**
- Uses **coach's Zoom credentials**
- Coach is the meeting host

**Zoom Meeting Data Returned:**

```json
{
  "zoomMeeting": {
    "meetingId": "123456789",
    "joinUrl": "https://zoom.us/j/123456789?pwd=xyz",
    "startUrl": "https://zoom.us/s/123456789?zak=abc",
    "password": "xyz123",
    "createdAt": "2025-01-15T10:30:00.000Z"
  },
  "meetingHostPermissions": {
    "hasHostAccess": true,
    "canStartMeeting": true,
    "canManageParticipants": true,
    "canShareScreen": true,
    "canRecordMeeting": true,
    "transferredFromCoach": false,
    "originalCoachId": "coach_id"
  }
}
```

#### **3. Appointment Reminders Scheduled**

Default reminders (if not custom configured):

1. **3 Days Before** (4320 minutes)
   - Channel: WhatsApp
   - Message: Appointment reminder with Zoom link
   
2. **1 Day Before** (1440 minutes)
   - Channel: WhatsApp
   - Message: Appointment reminder with Zoom link
   
3. **10 Minutes Before** (10 minutes)
   - Channel: WhatsApp
   - Message: Meeting starting soon with Zoom link

**Reminder Payload Example:**

```json
{
  "eventName": "appointment_reminder_time",
  "payload": {
    "appointmentId": "appt_id",
    "leadId": "lead_id",
    "coachId": "coach_id",
    "assignedStaffId": "staff_id",
    "reminderName": "3 Days Before",
    "reminderTiming": 4320,
    "channel": "whatsapp",
    "lead": {
      "name": "John Doe",
      "email": "john@example.com",
      "phone": "+1234567890"
    },
    "appointment": {
      "summary": "Initial Consultation",
      "startTime": "2025-01-20T14:00:00.000Z",
      "duration": 30,
      "zoomMeeting": {
        "joinUrl": "https://zoom.us/j/123456789?pwd=xyz",
        "password": "xyz123"
      }
    }
  }
}
```

#### **4. Coach Cancellation Flow**

Coach can cancel **ANY** appointment (assigned or unassigned):

```
Coach cancels appointment
    ↓
System deletes Zoom meeting
    ↓
System cancels all scheduled reminders
    ↓
System marks appointment as cancelled
    ↓
System sends cancellation notification to lead
```

---

### **Prerequisites for Availability Setup**

**Before Coach/Staff can set availability:**

1. **Connect Zoom Account**
   - Navigate to Zoom Integration settings
   - Complete OAuth flow
   - System validates Zoom credentials
   - `zoomIntegrationStatus` becomes `"active"`

2. **Set Availability**
   - API checks `hasValidZoomIntegration(userId)`
   - If false, returns error with `requiresZoomIntegration: true`
   - If true, allows availability setup

3. **Staff Availability Auto-Copy**
   - When staff first accesses availability
   - System checks if `StaffAvailability` exists
   - If not, automatically copies from coach
   - Sets `copiedFromCoach: true`
   - Staff can then customize their own availability

---

### **Zoom Meeting Auto-Generation Scenarios**

| Scenario | Who's Zoom Used | Meeting Host |
|----------|-----------------|--------------|
| Public booking + Auto-assign to Staff | Assigned Staff | Staff Member |
| Public booking + Manual mode (no staff) | Coach | Coach |
| Coach books appointment + Assigns to Staff | Assigned Staff | Staff Member |
| Staff books appointment (for themselves) | Staff Member | Staff Member |
| Manual assignment by Coach to Staff | Assigned Staff | Staff Member |
| Appointment with no staff | Coach | Coach |

---

### **Error Handling**

**Zoom Meeting Creation Failures:**
- Appointment is still created
- No Zoom link generated
- System logs error
- Coach/Staff can manually create Zoom link later

**Reminder Scheduling Failures:**
- Appointment is still created
- Reminders not scheduled
- System logs error
- No impact on appointment itself

**Zoom Token Expiration:**
- System automatically refreshes tokens
- If refresh fails, `zoomIntegrationStatus` becomes `"expired"`
- User must reconnect Zoom account

---

## 📦 **DATA MODELS**

### **Appointment Model**

```javascript
{
  _id: ObjectId,
  coachId: ObjectId (ref: User),
  leadId: ObjectId (ref: Lead),
  assignedStaffId: ObjectId (ref: User) // nullable
  startTime: Date,
  duration: Number, // minutes
  summary: String,
  notes: String,
  timeZone: String,
  appointmentType: String, // 'online' or 'offline'
  status: String, // 'scheduled', 'confirmed', 'in_progress', 'completed', 'cancelled'
  zoomMeeting: {
    meetingId: String,
    joinUrl: String,
    startUrl: String,
    password: String,
    createdAt: Date
  },
  createdAt: Date,
  updatedAt: Date
}
```

### **CoachAvailability Model**

```javascript
{
  _id: ObjectId,
  coachId: ObjectId (ref: User),
  workingHours: [
    {
      dayOfWeek: Number, // 0-6 (Sunday-Saturday)
      startTime: String, // HH:MM
      endTime: String // HH:MM
    }
  ],
  unavailableSlots: [
    {
      start: Date,
      end: Date,
      reason: String
    }
  ],
  defaultAppointmentDuration: Number, // minutes
  bufferTime: Number, // minutes
  timeZone: String,
  appointmentAssignment: {
    enabled: Boolean,
    mode: String, // 'manual' or 'automatic'
    considerStaffAvailability: Boolean,
    allowMultipleStaffSameSlot: Boolean
  },
  appointmentReminders: {
    enabled: Boolean,
    reminders: [
      {
        name: String,
        timing: Number, // minutes before appointment
        channel: String, // 'whatsapp', 'email', 'sms', 'both'
        templateId: String,
        isActive: Boolean
      }
    ],
    defaultReminders: Boolean
  },
  hasZoomIntegration: Boolean,
  zoomIntegrationStatus: String, // 'not_configured', 'active', 'expired', 'error'
  createdAt: Date,
  updatedAt: Date
}
```

### **StaffAvailability Model**

```javascript
{
  _id: ObjectId,
  staffId: ObjectId (ref: User),
  coachId: ObjectId (ref: User),
  workingHours: [
    {
      dayOfWeek: Number, // 0-6 (Sunday-Saturday)
      startTime: String, // HH:MM
      endTime: String // HH:MM
    }
  ],
  unavailableSlots: [
    {
      start: Date,
      end: Date,
      reason: String
    }
  ],
  defaultAppointmentDuration: Number, // minutes
  bufferTime: Number, // minutes
  timeZone: String,
  hasZoomIntegration: Boolean,
  zoomIntegrationStatus: String,
  isActive: Boolean,
  copiedFromCoach: Boolean,
  lastSyncedWithCoach: Date,
  createdAt: Date,
  updatedAt: Date
}
```

### **Staff Model (Relevant Fields)**

```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: User),
  coachId: ObjectId (ref: User),
  permissions: [String], // e.g., ['calendar:read', 'calendar:book']
  distributionRatio: Number, // 0-10, higher = gets more appointments
  isActive: Boolean,
  lastActive: Date
}
```

---

## 🔐 **PERMISSION REQUIREMENTS**

### **Calendar Permissions**

| Permission | Description | Coach | Staff |
|------------|-------------|-------|-------|
| `calendar:view` | View calendar and appointments | ✅ | ✅ |
| `calendar:read` | Read availability settings | ✅ | ✅ |
| `calendar:book` | Book new appointments | ✅ | ✅ |
| `calendar:update` | Reschedule appointments | ✅ | ✅ |
| `calendar:delete` | Cancel appointments | ✅ | ✅ |
| `calendar:manage` | Manage availability settings | ✅ | ❌ |

### **Appointment Assignment Permissions**

| Permission | Description | Coach | Staff |
|------------|-------------|-------|-------|
| `appointments:read` | View appointments | ✅ | ✅ |
| `appointments:manage` | Assign/unassign staff | ✅ | ❌ |

### **Access Rules**

**Coach:**
- Can view ALL appointments across the organization
- Can view ALL staff appointments
- Can manage availability settings
- Can assign/unassign staff to appointments
- Can view assignment statistics

**Staff:**
- Can view ONLY appointments assigned to them (`assignedStaffId` matches their `userId`)
- Can view coach availability settings (limited fields)
- Cannot view assignment settings
- Cannot assign appointments to themselves or others
- Cannot view other staff's appointments

**Public (Unauthenticated):**
- Can view coach availability
- Can view available time slots
- Can book appointments
- Cannot view appointment details or assigned staff

---

## ⚙️ **STAFF ASSIGNMENT LOGIC**

### **Automatic Assignment**

When automatic assignment is enabled (`appointmentAssignment.mode === 'automatic'`):

1. **New appointments** are automatically assigned to staff when created
2. **Distribution algorithm** considers:
   - Staff's `distributionRatio` (higher = more appointments)
   - Current appointment count for the day
   - Staff availability (no conflicts)
   - Calendar permissions (`calendar:read` and `calendar:book`)

3. **Load score calculation:**
   ```
   loadScore = todayAppointmentCount / distributionRatio
   ```

4. **Assignment priority:**
   - Staff with LOWEST load score gets priority
   - Example with 3 staff members:
     - Staff A: 4 appointments, ratio 2 → score = 2.0
     - Staff B: 2 appointments, ratio 1 → score = 2.0
     - Staff C: 1 appointment, ratio 1 → score = 1.0
     - **Staff C gets the appointment** (lowest score)

5. **Conflict checking:**
   - Checks for overlapping appointments
   - Checks for calendar events
   - Skips staff with conflicts

### **Manual Assignment**

When manual assignment is enabled (`appointmentAssignment.mode === 'manual'`):

1. **Coach assigns** appointments to staff manually
2. **System validates:**
   - Staff exists and is active
   - Staff has calendar permissions
   - No scheduling conflicts
3. **Assignment endpoint:** `POST /api/staff-appointments/assign`

### **Distribution Ratio**

- Range: 0-10 (default: 1)
- **Higher ratio = more appointments**
- **Examples:**
  - Ratio 2.0: Gets 2x more appointments than ratio 1.0
  - Ratio 0.5: Gets 50% fewer appointments than ratio 1.0
  - Ratio 10.0: Highest priority, gets assigned first

### **Multiple Staff Same Slot**

When `allowMultipleStaffSameSlot === true`:

1. **Capacity multiplier:**
   ```
   totalCapacity = numberOfActiveStaff
   ```

2. **Example with 3 staff:**
   - 9:00 AM slot can have 3 appointments (one per staff)
   - After 2 bookings: capacity = 3, booked = 2, available = 1
   - After 3 bookings: capacity = 3, booked = 3, available = 0 (slot full)

3. **Slot visibility:**
   - Slot only hidden when `available === 0`
   - Public sees capacity and availability

---

## 🔔 **APPOINTMENT REMINDER LOGIC**

### **Default Reminders**

If coach hasn't configured custom reminders, system uses these defaults:

1. **3 Days Before (4320 minutes)**
   - Sent 3 days before appointment
   - Channel: WhatsApp
   - Includes: Appointment details, Date/Time, Zoom link

2. **1 Day Before (1440 minutes)**
   - Sent 1 day before appointment
   - Channel: WhatsApp
   - Includes: Appointment details, Date/Time, Zoom link

3. **10 Minutes Before (10 minutes)**
   - Sent 10 minutes before appointment
   - Channel: WhatsApp
   - Includes: Zoom link, "Meeting starting soon" message

### **Custom Reminders**

Coach can configure:
- **Unlimited reminders** (recommended: 3-5)
- **Custom timing** (e.g., 1 week, 2 days, 30 minutes before)
- **Channel selection** (WhatsApp, Email, SMS, or Both)
- **WhatsApp templates** (if using templates)
- **Enable/Disable** individual reminders

### **Reminder Scheduling**

**When Scheduled:**
- Immediately after appointment creation
- After manual staff assignment
- After automatic staff assignment

**Reminder Time Calculation:**
```javascript
reminderTime = appointmentStartTime - (reminderTiming * 60 * 1000)

Example:
- Appointment: 2025-01-20 14:00:00
- Reminder timing: 1440 minutes (1 day)
- Reminder sent at: 2025-01-19 14:00:00
```

**Skipped Reminders:**
- If reminder time is in the past
- If reminders are disabled in settings
- If appointment is cancelled

### **Reminder Rescheduling**

When appointment is rescheduled:
1. Cancel all existing reminders
2. Calculate new reminder times
3. Schedule new reminders with updated appointment time

### **Reminder Cancellation**

When appointment is cancelled:
1. All scheduled reminders are cancelled
2. No further reminders will be sent
3. System logs cancellation

### **Reminder Data Payload**

Each reminder includes:
- Lead information (name, email, phone)
- Appointment details (summary, time, duration)
- Zoom meeting link and password
- Staff/Coach information
- Reminder metadata (name, timing, channel)

---

## 📊 **IMPLEMENTATION NOTES FOR FRONTEND**

### **Displaying Coach Calendar:**
- Show all appointments
- Color-code by assigned staff
- Show unassigned appointments differently
- Allow drag-and-drop to assign staff

### **Displaying Staff Calendar:**
- Show only assigned appointments
- Filter appointments where `assignedStaffId === currentUserId`
- Hide unassigned appointments

### **Booking Flow:**
1. Fetch available slots: `GET /api/coach/:coachId/available-slots?date=YYYY-MM-DD`
2. Check slot capacity:
   - If `available > 0`: Slot is bookable
   - If `available === 0`: Slot is full
3. Book appointment: `POST /api/coach/:coachId/book`
4. If automatic assignment enabled, response includes `assignedStaffId`

### **Staff Assignment UI (Coach):**
1. View unassigned appointments
2. Click "Assign" button
3. Fetch available staff: `GET /api/staff-appointments/available-staff?appointmentDate=...&appointmentTime=...`
4. Show staff with conflict indicators
5. Assign: `POST /api/staff-appointments/assign`

### **Assignment Settings UI (Coach):**
1. Toggle "Enable Staff Assignment"
2. Select mode: Manual or Automatic
3. Toggle "Consider Staff Availability" (for capacity multiplier)
4. Toggle "Allow Multiple Staff Same Slot"
5. Save: `PUT /api/coach/availability/assignment-settings`

### **Assignment Stats Dashboard (Coach):**
1. Fetch stats: `GET /api/coach/availability/assignment-stats?days=30`
2. Display:
   - Total vs assigned appointments
   - Assignment rate (%)
   - Staff leaderboard (by total assigned)
   - Completion rates per staff
   - Distribution ratios

### **Availability Management:**

**For Coach:**
1. Check Zoom status: `GET /api/staff-availability/zoom-status`
2. If no Zoom, connect Zoom integration first
3. Fetch current settings: `GET /api/coach-dashboard/availability`
4. Edit working hours, unavailable slots, buffer time
5. Save: `PUT /api/coach-dashboard/availability`

**For Staff (Same Endpoints as Coach):**
1. Check Zoom status: `GET /api/coach/availability/zoom-status` (with staff token)
2. If no Zoom, connect Zoom integration first
3. Fetch availability: `GET /api/coach/:coachId/availability` (with staff token)
4. If not exists, system auto-copies from coach
5. Edit your own availability
6. Save: `POST /api/coach/availability` (with staff token)
7. Or copy coach settings: `POST /api/coach/availability/copy-from-coach` (with staff token)

### **Reminder Configuration (Coach):**
1. Fetch settings: `GET /api/coach/availability/reminder-settings`
2. View default reminders (3 days, 1 day, 10 min)
3. Configure custom reminders with timing and channel
4. Save: `PUT /api/coach/availability/reminder-settings`

### **Assignment Configuration (Coach):**
1. Fetch settings: `GET /api/coach/availability/assignment-settings`
2. Enable/Disable staff assignment
3. Choose Manual or Automatic mode
4. Configure staff availability consideration
5. Save: `PUT /api/coach/availability/assignment-settings`

---

## 🔄 **TYPICAL USER FLOWS**

### **Flow 1: Public Booking (Automatic Assignment with Zoom & Reminders)**

1. **Lead visits booking page** → `GET /api/coach/:coachId/availability`
2. **Lead selects date** → `GET /api/coach/:coachId/available-slots?date=2025-01-20`
3. **System shows available slots with capacity:**
   ```json
   {
     "startTime": "2025-01-20T14:00:00Z",
     "capacity": 3,
     "booked": 1,
     "available": 2
   }
   ```
4. **Lead books appointment** → `POST /api/coach/:coachId/book`
5. **System Flow (All Automatic):**
   - ✅ Creates appointment record
   - ✅ Assigns to least loaded staff (Staff A, load score: 1.5)
   - ✅ Generates Zoom meeting using Staff A's credentials
   - ✅ Schedules 3 reminders (3 days, 1 day, 10 min before)
   - ✅ Returns appointment with Zoom link
6. **Lead receives:**
   - Appointment confirmation
   - Zoom meeting link: `https://zoom.us/j/123456789?pwd=xyz`
   - Meeting password: `xyz123`
   - Staff contact information
7. **Lead will receive reminders:**
   - 3 days before (WhatsApp with Zoom link)
   - 1 day before (WhatsApp with Zoom link)
   - 10 minutes before (WhatsApp with Zoom link)

---

### **Flow 2: Coach Views Staff Performance**

1. **Coach opens assignment stats** → `GET /api/coach/availability/assignment-stats?days=30`
2. **Coach sees:**
   - Staff Member 1: 45 appointments, 84% completion
   - Staff Member 2: 30 appointments, 87% completion
   - Staff Member 3: 20 appointments, 75% completion
3. **Coach decides to increase Staff Member 2's distribution ratio**
4. **Coach updates staff settings** → `PUT /api/coach/staff/:staffId` (with `distributionRatio: 2`)
5. **Future appointments prioritize Staff Member 2**

---

### **Flow 3: Staff Views Their Calendar (With Zoom Links)**

1. **Staff logs in and navigates to calendar**
2. **Staff fetches calendar** → `GET /api/coach-dashboard/calendar?startDate=...&endDate=...`
3. **System returns only appointments where `assignedStaffId === staffUserId`**
4. **Staff sees 5 appointments for the week, each with:**
   - Lead information
   - Appointment time and duration
   - **Zoom meeting link** (generated with their credentials)
   - **Zoom start URL** (to host the meeting)
   - Meeting password
5. **Staff clicks today's appointments** → `GET /api/coach-dashboard/appointments/today`
6. **Staff sees 2 appointments for today with Zoom links**
7. **Staff clicks "Start Meeting"** → Opens Zoom with host privileges

---

### **Flow 4: Coach Sets Up Reminders**

1. **Coach navigates to reminder settings**
2. **Coach fetches current settings** → `GET /api/coach/availability/reminder-settings`
3. **System shows default reminders (3 days, 1 day, 10 min)**
4. **Coach decides to customize:**
   ```json
   {
     "enabled": true,
     "defaultReminders": false,
     "reminders": [
       { "name": "1 Week Before", "timing": 10080, "channel": "whatsapp" },
       { "name": "3 Days Before", "timing": 4320, "channel": "email" },
       { "name": "1 Hour Before", "timing": 60, "channel": "both" }
     ]
   }
   ```
5. **Coach saves** → `PUT /api/coach/availability/reminder-settings`
6. **All future appointments** will use new reminder schedule
7. **System automatically:**
   - Schedules 1 week reminder (WhatsApp)
   - Schedules 3 days reminder (Email)
   - Schedules 1 hour reminder (WhatsApp + Email)

---

### **Flow 5: Staff Sets Availability (Using Same Endpoints as Coach)**

1. **Staff navigates to availability settings**
2. **Check Zoom status** → `GET /api/coach/availability/zoom-status` (with staff token)
3. **If no Zoom:**
   - System shows: "Connect Zoom Account Required"
   - Staff connects Zoom via OAuth: `POST /api/zoom-integration/setup`
   - Returns to availability page
4. **Fetch availability** → `GET /api/coach/:coachId/availability` (with staff token)
5. **System auto-creates** availability by copying coach's settings
6. **Staff sees:**
   - Working hours: Mon-Fri 9AM-5PM (copied from coach)
   - `copiedFromCoach: true`
   - `userContext.isStaff: true`
7. **Staff customizes** their own hours:
   ```json
   {
     "workingHours": [
       { "dayOfWeek": 1, "startTime": "10:00", "endTime": "18:00" },
       { "dayOfWeek": 3, "startTime": "10:00", "endTime": "18:00" }
     ],
     "unavailableSlots": []
   }
   ```
8. **Staff saves** → `POST /api/coach/availability` (with staff token)
9. **System detects staff token** and updates `StaffAvailability` (not `CoachAvailability`)
10. **Response includes** `copiedFromCoach: false`
11. **Future appointments** respect staff's custom availability

---

## 🐛 **COMMON ERRORS & SOLUTIONS**

### **Error 1: "The requested time slot is not available"**

**Cause:** Slot is fully booked or conflicts with unavailable slot

**Solution:**
- Check `available` count in slot data
- If `available === 0`, slot is full
- Try different time or date

---

### **Error 2: "Only coaches can view assignment settings"**

**Cause:** Staff trying to access coach-only endpoints

**Solution:**
- Remove assignment settings from staff UI
- Only show to authenticated coaches

---

### **Error 3: "You can only view your own appointments"**

**Cause:** Staff trying to access another staff member's appointments

**Solution:**
- Ensure `staffId` parameter matches authenticated staff's `userId`
- Filter appointments on frontend before API call

---

### **Error 4: "Staff member has a scheduling conflict"**

**Cause:** Trying to assign appointment when staff has overlapping booking

**Solution:**
- Fetch available staff first: `GET /api/staff-appointments/available-staff`
- Check `hasConflicts` field
- Only allow assignment to staff with `hasConflicts: false`

---

### **Error 5: "You must connect your Zoom account before setting availability"**

**Cause:** Coach or Staff trying to set availability without Zoom integration

**Solution:**
1. Check Zoom status: `GET /api/coach/availability/zoom-status` (with your token)
2. If `hasZoomIntegration: false`, redirect to Zoom OAuth
3. Complete Zoom integration: `POST /api/zoom-integration/setup`
4. Return to availability page
5. Try again to set availability: `POST /api/coach/availability` (with your token)

---

### **Error 6: "Zoom integration not found for this user"**

**Cause:** Appointment assigned to staff but staff hasn't connected Zoom

**Solution:**
- Appointment is still created (no Zoom link)
- Staff must connect Zoom: `/api/zoom-integration/setup`
- Coach can manually create Zoom link later
- Or reassign to different staff with Zoom

---

### **Error 7: "Failed to refresh Zoom access token"**

**Cause:** Zoom refresh token expired or invalid

**Solution:**
- User must reconnect Zoom account
- Navigate to: `/api/zoom-integration/setup`
- Complete OAuth flow again
- Previous Zoom credentials are replaced

---

## 📝 **TESTING CHECKLIST**

### **Public Booking:**
- ✅ View coach availability without auth: `GET /api/coach/:coachId/availability`
- ✅ View available slots without auth: `GET /api/coach/:coachId/available-slots?date=...`
- ✅ Book appointment without auth: `POST /api/coach/:coachId/book`
- ✅ Verify automatic assignment works
- ✅ Verify capacity multiplier (multiple staff)
- ✅ Verify slot becomes unavailable when full

### **Coach Features:**
- ✅ View all appointments
- ✅ View all staff appointments
- ✅ Set availability settings
- ✅ Configure assignment settings
- ✅ Manually assign appointments
- ✅ View assignment statistics
- ✅ Bulk assign appointments

### **Staff Features:**
- ✅ View only assigned appointments
- ✅ Cannot see unassigned appointments
- ✅ Cannot see other staff's appointments
- ✅ Can reschedule their own appointments
- ✅ Can cancel their own appointments
- ✅ Cannot access assignment settings

### **Assignment Logic:**
- ✅ Automatic assignment uses distribution ratio
- ✅ Load score calculated correctly
- ✅ Conflict detection works
- ✅ Multiple staff same slot works
- ✅ Manual assignment validates conflicts

### **Zoom Integration:**
- ✅ Cannot set availability without Zoom connection
- ✅ Zoom meeting auto-generated on booking
- ✅ Staff-assigned appointments use staff's Zoom
- ✅ Unassigned appointments use coach's Zoom
- ✅ Zoom link included in appointment response
- ✅ Meeting deleted when appointment cancelled

### **Reminder System:**
- ✅ Default reminders work (3 days, 1 day, 10 min)
- ✅ Custom reminders can be configured
- ✅ Reminders scheduled on booking
- ✅ Reminders rescheduled on appointment change
- ✅ Reminders cancelled on appointment cancellation
- ✅ Reminders include Zoom link

### **Staff Availability:**
- ✅ Staff availability auto-copies from coach
- ✅ Staff can customize their own availability
- ✅ Staff requires Zoom before setting availability
- ✅ Coach can update staff availability

---

## 🚀 **QUICK START GUIDE**

### **For Coaches (First Time Setup):**

1. **Connect Zoom** (Required)
   ```
   POST /api/zoom-integration/setup
   ```

2. **Set Availability**
   ```
   PUT /api/coach-dashboard/availability
   Body: { workingHours, timeZone, defaultAppointmentDuration, bufferTime }
   ```

3. **Configure Assignment (Optional)**
   ```
   PUT /api/coach/availability/assignment-settings
   Body: { enabled: true, mode: "automatic", considerStaffAvailability: true }
   ```

4. **Configure Reminders (Optional)**
   ```
   PUT /api/coach/availability/reminder-settings
   Body: { enabled: true, defaultReminders: true }
   // Or set custom reminders
   ```

5. **Test Booking**
   ```
   POST /api/coach/:coachId/book
   ```

### **For Staff (First Time Setup):**

1. **Connect Zoom** (Required)
   ```
   POST /api/zoom-integration/setup
   ```

2. **Check Zoom Status**
   ```
   GET /api/coach/availability/zoom-status
   (with staff token)
   ```

3. **Get Default Availability** (Auto-copied from coach)
   ```
   GET /api/coach/:coachId/availability
   (with staff token - returns staff's availability)
   ```

4. **Customize Availability (Optional)**
   ```
   POST /api/coach/availability
   (with staff token)
   Body: { workingHours, timeZone, unavailableSlots }
   ```

5. **Or Copy Coach Settings**
   ```
   POST /api/coach/availability/copy-from-coach
   (with staff token)
   ```

6. **View Your Appointments**
   ```
   GET /api/coach-dashboard/appointments/today
   ```

### **For Leads (Public Booking):**

1. **View Available Slots**
   ```
   GET /api/coach/:coachId/available-slots?date=2025-01-20
   ```

2. **Book Appointment**
   ```
   POST /api/coach/:coachId/book
   Body: { leadId, startTime, duration, notes, timeZone }
   ```

3. **Receive:**
   - Appointment confirmation
   - Zoom meeting link
   - Meeting password
   - Assigned staff info (if auto-assignment enabled)

4. **Get Reminders:**
   - 3 days before appointment (WhatsApp)
   - 1 day before appointment (WhatsApp)
   - 10 minutes before appointment (WhatsApp)

---

**Document Version:** 2.0  
**Last Updated:** January 2025  
**Total Routes:** 28 (unified endpoints for coach & staff)  
**Public Routes:** 4  
**Protected Routes:** 24  
**New Features:** Zoom Integration, Auto Reminders, Staff Availability  
**Zoom Required:** Yes (for availability setup)  
**Auto Features:** Zoom Generation, Reminder Scheduling, Staff Assignment  
**Unified Endpoints:** Same availability routes work for both coach and staff based on token

---

This comprehensive guide covers all calendar and appointment functionality for both coaches and staff. Use this as a reference when building frontend components and testing API integrations.

