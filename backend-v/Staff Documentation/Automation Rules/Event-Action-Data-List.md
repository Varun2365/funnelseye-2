# Automation Rules - Event Triggers, Actions & Data Requirements

**Comprehensive Guide to Automation System Data Flow**

This document details all trigger events, actions, and the exact data required for each to work successfully.

---

## 📊 **Table of Contents**

1. [Trigger Events & Their Payload Data](#trigger-events--their-payload-data)
2. [Actions & Their Required Configuration](#actions--their-required-configuration)
3. [Data Validation Rules](#data-validation-rules)
4. [Example Automation Flows](#example-automation-flows)

---

## 🎯 **TRIGGER EVENTS & THEIR PAYLOAD DATA**

Each trigger event provides specific data that can be used by actions. Below is the complete list.

---

### **1. LEAD & CUSTOMER LIFECYCLE TRIGGERS**

#### **1.1 Lead Created** (`lead_created`)

**Trigger Conditions:**
- When a new lead is added to the system (manual or automated)

**Payload Data Provided:**
```json
{
  "eventType": "lead_created",
  "timestamp": "2024-01-15T10:30:00Z",
  "lead": {
    "_id": "lead_id_here",
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+1234567890",
    "countryCode": "+1",
    "status": "New",
    "temperature": "Cold",
    "source": "Website Form",
    "funnelId": "funnel_id",
    "stage": "stage_name",
    "customFields": {},
    "tags": [],
    "score": 0,
    "createdAt": "2024-01-15T10:30:00Z"
  },
  "coach": {
    "coachId": "coach_id",
    "name": "Coach Name",
    "email": "coach@example.com"
  },
  "assignedStaff": {
    "staffId": "staff_id",
    "name": "Staff Name"
  }
}
```

**Available Variables for Actions:**
- `{{lead.name}}` - Lead's full name
- `{{lead.email}}` - Lead's email
- `{{lead.phone}}` - Lead's phone number
- `{{lead.countryCode}}` - Country code
- `{{lead.source}}` - Lead source
- `{{coach.name}}` - Coach's name
- `{{assignedStaff.name}}` - Assigned staff name

---

#### **1.2 Lead Status Changed** (`lead_status_changed`)

**Trigger Conditions:**
- Status changes (New → Contacted → Qualified → Converted → Lost)

**Payload Data Provided:**
```json
{
  "eventType": "lead_status_changed",
  "timestamp": "2024-01-15T10:30:00Z",
  "lead": {
    "_id": "lead_id_here",
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+1234567890",
    "countryCode": "+1",
    "status": "Qualified",
    "previousStatus": "Contacted",
    "temperature": "Warm",
    "score": 45,
    "lastContactDate": "2024-01-14T15:20:00Z"
  },
  "statusChange": {
    "from": "Contacted",
    "to": "Qualified",
    "changedBy": "staff_id_or_coach_id",
    "changedByName": "Staff Name",
    "reason": "Lead showed interest",
    "timestamp": "2024-01-15T10:30:00Z"
  },
  "coach": {
    "coachId": "coach_id",
    "name": "Coach Name"
  }
}
```

**Available Variables:**
- `{{lead.status}}` - New status
- `{{lead.previousStatus}}` - Old status
- `{{statusChange.reason}}` - Reason for change
- `{{statusChange.changedByName}}` - Who changed it

---

#### **1.3 Lead Temperature Changed** (`lead_temperature_changed`)

**Trigger Conditions:**
- Temperature changes (Cold → Warm → Hot)

**Payload Data Provided:**
```json
{
  "eventType": "lead_temperature_changed",
  "timestamp": "2024-01-15T10:30:00Z",
  "lead": {
    "_id": "lead_id_here",
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+1234567890",
    "countryCode": "+1",
    "temperature": "Hot",
    "previousTemperature": "Warm",
    "score": 85,
    "engagementLevel": "High"
  },
  "temperatureChange": {
    "from": "Warm",
    "to": "Hot",
    "scoreIncrease": 40,
    "trigger": "Multiple interactions in 24 hours",
    "timestamp": "2024-01-15T10:30:00Z"
  },
  "recentActivity": [
    {
      "type": "email_opened",
      "timestamp": "2024-01-15T09:00:00Z"
    },
    {
      "type": "link_clicked",
      "timestamp": "2024-01-15T09:30:00Z"
    }
  ]
}
```

**Available Variables:**
- `{{lead.temperature}}` - New temperature (Hot/Warm/Cold)
- `{{lead.previousTemperature}}` - Old temperature
- `{{temperatureChange.scoreIncrease}}` - Points increased
- `{{temperatureChange.trigger}}` - What caused the change

---

#### **1.4 Lead Converted to Client** (`lead_converted_to_client`)

**Trigger Conditions:**
- Lead status changes to "Converted"
- Payment is received

**Payload Data Provided:**
```json
{
  "eventType": "lead_converted_to_client",
  "timestamp": "2024-01-15T10:30:00Z",
  "lead": {
    "_id": "lead_id_here",
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+1234567890",
    "convertedAt": "2024-01-15T10:30:00Z",
    "conversionValue": 5000,
    "currency": "INR"
  },
  "deal": {
    "dealId": "deal_id",
    "amount": 5000,
    "product": "Premium Coaching Package",
    "closedBy": "staff_id"
  },
  "timeline": {
    "leadCreatedAt": "2024-01-01T10:00:00Z",
    "firstContactAt": "2024-01-02T11:30:00Z",
    "convertedAt": "2024-01-15T10:30:00Z",
    "daysTaken": 14,
    "touchpointsCount": 12
  }
}
```

**Available Variables:**
- `{{lead.name}}` - Client name
- `{{deal.amount}}` - Deal value
- `{{deal.product}}` - Product/service purchased
- `{{timeline.daysTaken}}` - Days to conversion
- `{{timeline.touchpointsCount}}` - Number of interactions

---

### **2. FUNNEL & CONVERSION TRIGGERS**

#### **2.1 Form Submitted** (`form_submitted`)

**Trigger Conditions:**
- Any form is submitted (lead magnet, contact, booking)

**Payload Data Provided:**
```json
{
  "eventType": "form_submitted",
  "timestamp": "2024-01-15T10:30:00Z",
  "form": {
    "formId": "form_id",
    "formName": "Free Consultation Request",
    "formType": "lead_capture",
    "pageUrl": "https://coach.com/consultation"
  },
  "submission": {
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+1234567890",
    "customFields": {
      "interest": "Weight Loss",
      "budget": "5000-10000",
      "timeframe": "Next 30 days"
    }
  },
  "lead": {
    "_id": "lead_id_if_exists",
    "isNew": true
  },
  "source": {
    "utm_source": "facebook",
    "utm_medium": "cpc",
    "utm_campaign": "weight_loss_jan",
    "referrer": "https://facebook.com"
  }
}
```

**Available Variables:**
- `{{form.formName}}` - Form name
- `{{submission.name}}` - Submitter name
- `{{submission.email}}` - Email submitted
- `{{submission.customFields.interest}}` - Any custom field value
- `{{source.utm_campaign}}` - Campaign source

---

#### **2.2 Funnel Stage Entered** (`funnel_stage_entered`)

**Trigger Conditions:**
- Lead moves into a new funnel stage

**Payload Data Provided:**
```json
{
  "eventType": "funnel_stage_entered",
  "timestamp": "2024-01-15T10:30:00Z",
  "lead": {
    "_id": "lead_id",
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+1234567890"
  },
  "funnel": {
    "funnelId": "funnel_id",
    "funnelName": "Sales Funnel 2024",
    "funnelType": "sales"
  },
  "stage": {
    "stageId": "stage_id",
    "stageName": "Qualified Leads",
    "stageOrder": 2,
    "previousStage": "Initial Contact",
    "enteredAt": "2024-01-15T10:30:00Z"
  },
  "progression": {
    "daysInPreviousStage": 3,
    "totalDaysInFunnel": 10,
    "completionPercentage": 40
  }
}
```

**Available Variables:**
- `{{funnel.funnelName}}` - Funnel name
- `{{stage.stageName}}` - Current stage name
- `{{stage.previousStage}}` - Previous stage
- `{{progression.daysInPreviousStage}}` - Time in last stage
- `{{progression.completionPercentage}}` - Progress %

---

#### **2.3 Funnel Stage Exited** (`funnel_stage_exited`)

**Trigger Conditions:**
- Lead exits a funnel stage (moves forward or removed)

**Payload Data Provided:**
```json
{
  "eventType": "funnel_stage_exited",
  "timestamp": "2024-01-15T10:30:00Z",
  "lead": {
    "_id": "lead_id",
    "name": "John Doe",
    "email": "john@example.com"
  },
  "funnel": {
    "funnelId": "funnel_id",
    "funnelName": "Sales Funnel 2024"
  },
  "stage": {
    "exitedStageId": "stage_id",
    "exitedStageName": "Initial Contact",
    "enteredAt": "2024-01-12T10:00:00Z",
    "exitedAt": "2024-01-15T10:30:00Z",
    "timeSpent": "3 days 30 minutes"
  },
  "exitReason": {
    "type": "progressed", // or "removed", "disqualified"
    "movedToStage": "Qualified Leads",
    "reason": "Lead showed interest"
  }
}
```

**Available Variables:**
- `{{stage.exitedStageName}}` - Stage exited
- `{{stage.timeSpent}}` - Time spent in stage
- `{{exitReason.type}}` - Why they exited
- `{{exitReason.movedToStage}}` - Next stage (if progressed)

---

#### **2.4 Funnel Completed** (`funnel_completed`)

**Trigger Conditions:**
- Lead reaches the final stage of a funnel

**Payload Data Provided:**
```json
{
  "eventType": "funnel_completed",
  "timestamp": "2024-01-15T10:30:00Z",
  "lead": {
    "_id": "lead_id",
    "name": "John Doe",
    "email": "john@example.com",
    "status": "Converted"
  },
  "funnel": {
    "funnelId": "funnel_id",
    "funnelName": "Sales Funnel 2024",
    "totalStages": 5,
    "completedAt": "2024-01-15T10:30:00Z"
  },
  "journey": {
    "startedAt": "2024-01-01T10:00:00Z",
    "completedAt": "2024-01-15T10:30:00Z",
    "totalDays": 14,
    "stagesCompleted": 5,
    "conversionRate": 100
  },
  "metrics": {
    "emailsSent": 8,
    "emailsOpened": 6,
    "linkClicks": 4,
    "appointmentsBooked": 2,
    "totalTouchpoints": 15
  }
}
```

**Available Variables:**
- `{{funnel.funnelName}}` - Completed funnel
- `{{journey.totalDays}}` - Days to complete
- `{{metrics.emailsSent}}` - Emails sent
- `{{metrics.totalTouchpoints}}` - Total interactions

---

### **3. APPOINTMENT & CALENDAR TRIGGERS**

#### **3.1 Appointment Booked** (`appointment_booked`)

**Trigger Conditions:**
- New appointment is scheduled

**Payload Data Provided:**
```json
{
  "eventType": "appointment_booked",
  "timestamp": "2024-01-15T10:30:00Z",
  "appointment": {
    "appointmentId": "appt_id",
    "title": "Initial Consultation",
    "type": "consultation",
    "scheduledDate": "2024-01-20T14:00:00Z",
    "duration": 60,
    "timezone": "Asia/Kolkata",
    "location": "Zoom Meeting",
    "meetingLink": "https://zoom.us/j/123456789",
    "status": "Confirmed"
  },
  "lead": {
    "_id": "lead_id",
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+1234567890"
  },
  "coach": {
    "coachId": "coach_id",
    "name": "Coach Name"
  },
  "assignedStaff": {
    "staffId": "staff_id",
    "name": "Staff Name",
    "email": "staff@example.com"
  },
  "bookingDetails": {
    "bookedAt": "2024-01-15T10:30:00Z",
    "bookedBy": "lead", // or "staff", "coach"
    "source": "booking_page",
    "daysUntilAppointment": 5
  }
}
```

**Available Variables:**
- `{{appointment.title}}` - Appointment title
- `{{appointment.scheduledDate}}` - Date & time
- `{{appointment.duration}}` - Duration in minutes
- `{{appointment.meetingLink}}` - Zoom/meeting link
- `{{lead.name}}` - Lead name
- `{{assignedStaff.name}}` - Staff handling appointment
- `{{bookingDetails.daysUntilAppointment}}` - Days until appointment

**Required Data for Booking:**
- Lead ID
- Date & time (ISO 8601 format)
- Duration (minutes)
- Appointment type
- Assigned staff/coach ID

---

#### **3.2 Appointment Rescheduled** (`appointment_rescheduled`)

**Trigger Conditions:**
- Appointment date/time is changed

**Payload Data Provided:**
```json
{
  "eventType": "appointment_rescheduled",
  "timestamp": "2024-01-15T10:30:00Z",
  "appointment": {
    "appointmentId": "appt_id",
    "title": "Initial Consultation",
    "newScheduledDate": "2024-01-22T15:00:00Z",
    "oldScheduledDate": "2024-01-20T14:00:00Z",
    "duration": 60,
    "meetingLink": "https://zoom.us/j/123456789"
  },
  "lead": {
    "_id": "lead_id",
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+1234567890"
  },
  "rescheduleDetails": {
    "rescheduledBy": "lead", // or "staff", "coach"
    "rescheduledAt": "2024-01-15T10:30:00Z",
    "reason": "Personal conflict",
    "daysDifference": 2,
    "rescheduledByName": "John Doe"
  }
}
```

**Available Variables:**
- `{{appointment.newScheduledDate}}` - New date/time
- `{{appointment.oldScheduledDate}}` - Original date/time
- `{{rescheduleDetails.reason}}` - Reschedule reason
- `{{rescheduleDetails.rescheduledByName}}` - Who rescheduled

---

#### **3.3 Appointment Cancelled** (`appointment_cancelled`)

**Trigger Conditions:**
- Appointment is cancelled

**Payload Data Provided:**
```json
{
  "eventType": "appointment_cancelled",
  "timestamp": "2024-01-15T10:30:00Z",
  "appointment": {
    "appointmentId": "appt_id",
    "title": "Initial Consultation",
    "scheduledDate": "2024-01-20T14:00:00Z",
    "wasScheduledFor": "5 days from now"
  },
  "lead": {
    "_id": "lead_id",
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+1234567890"
  },
  "cancellation": {
    "cancelledBy": "lead", // or "staff", "coach"
    "cancelledAt": "2024-01-15T10:30:00Z",
    "reason": "No longer interested",
    "cancelledByName": "John Doe",
    "noticeGiven": "5 days"
  }
}
```

**Available Variables:**
- `{{appointment.scheduledDate}}` - When it was scheduled
- `{{cancellation.reason}}` - Cancellation reason
- `{{cancellation.cancelledByName}}` - Who cancelled
- `{{cancellation.noticeGiven}}` - Notice period

---

#### **3.4 Appointment Reminder Time** (`appointment_reminder_time`)

**Trigger Conditions:**
- Scheduled reminder time is reached (e.g., 24 hours before, 1 hour before)

**Payload Data Provided:**
```json
{
  "eventType": "appointment_reminder_time",
  "timestamp": "2024-01-19T14:00:00Z",
  "appointment": {
    "appointmentId": "appt_id",
    "title": "Initial Consultation",
    "scheduledDate": "2024-01-20T14:00:00Z",
    "duration": 60,
    "meetingLink": "https://zoom.us/j/123456789",
    "location": "Zoom Meeting"
  },
  "lead": {
    "_id": "lead_id",
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+1234567890"
  },
  "reminder": {
    "reminderType": "24_hours_before", // or "1_hour_before", "custom"
    "timeUntilAppointment": "24 hours",
    "formattedTime": "Tomorrow at 2:00 PM IST"
  },
  "assignedStaff": {
    "staffId": "staff_id",
    "name": "Staff Name"
  }
}
```

**Available Variables:**
- `{{appointment.scheduledDate}}` - Appointment date/time
- `{{appointment.meetingLink}}` - Meeting link
- `{{reminder.timeUntilAppointment}}` - Time remaining
- `{{reminder.formattedTime}}` - Human-readable time

---

#### **3.5 Appointment Finished** (`appointment_finished`)

**Trigger Conditions:**
- Appointment end time has passed
- Status marked as completed

**Payload Data Provided:**
```json
{
  "eventType": "appointment_finished",
  "timestamp": "2024-01-20T15:00:00Z",
  "appointment": {
    "appointmentId": "appt_id",
    "title": "Initial Consultation",
    "scheduledDate": "2024-01-20T14:00:00Z",
    "actualStartTime": "2024-01-20T14:05:00Z",
    "actualEndTime": "2024-01-20T15:00:00Z",
    "duration": 60,
    "actualDuration": 55
  },
  "lead": {
    "_id": "lead_id",
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+1234567890"
  },
  "outcome": {
    "status": "completed", // or "no_show", "cancelled_last_minute"
    "notes": "Good conversation, interested in premium package",
    "nextSteps": "Send proposal",
    "followUpRequired": true,
    "followUpDate": "2024-01-22T10:00:00Z"
  },
  "assignedStaff": {
    "staffId": "staff_id",
    "name": "Staff Name"
  }
}
```

**Available Variables:**
- `{{outcome.status}}` - Appointment outcome
- `{{outcome.notes}}` - Meeting notes
- `{{outcome.nextSteps}}` - Next steps
- `{{outcome.followUpDate}}` - Follow-up date

---

### **4. COMMUNICATION TRIGGERS**

#### **4.1 Content Consumed** (`content_consumed`)

**Trigger Conditions:**
- Lead views/downloads content (video, PDF, webinar)

**Payload Data Provided:**
```json
{
  "eventType": "content_consumed",
  "timestamp": "2024-01-15T10:30:00Z",
  "lead": {
    "_id": "lead_id",
    "name": "John Doe",
    "email": "john@example.com"
  },
  "content": {
    "contentId": "content_id",
    "contentName": "Weight Loss Masterclass",
    "contentType": "video", // or "pdf", "webinar", "ebook"
    "contentUrl": "https://coach.com/content/masterclass",
    "duration": 3600, // seconds (for videos)
    "fileSize": "25MB" // for downloads
  },
  "consumption": {
    "consumedAt": "2024-01-15T10:30:00Z",
    "percentageCompleted": 85, // for videos
    "timeSpent": 3060, // seconds
    "downloadedCount": 1,
    "isFirstView": false
  },
  "engagement": {
    "previousViews": 2,
    "totalEngagementScore": 45,
    "engagementLevel": "High"
  }
}
```

**Available Variables:**
- `{{content.contentName}}` - Content name
- `{{content.contentType}}` - Content type
- `{{consumption.percentageCompleted}}` - Completion %
- `{{engagement.engagementLevel}}` - Engagement level

---

### **5. TASK & SYSTEM TRIGGERS**

#### **5.1 Task Created** (`task_created`)

**Trigger Conditions:**
- New task is created (manual or automated)

**Payload Data Provided:**
```json
{
  "eventType": "task_created",
  "timestamp": "2024-01-15T10:30:00Z",
  "task": {
    "taskId": "task_id",
    "title": "Follow up with John Doe",
    "description": "Call to discuss premium package",
    "priority": "High", // High, Medium, Low
    "status": "Pending",
    "dueDate": "2024-01-18T17:00:00Z",
    "category": "Follow-up"
  },
  "lead": {
    "_id": "lead_id",
    "name": "John Doe",
    "email": "john@example.com"
  },
  "assignedTo": {
    "staffId": "staff_id",
    "name": "Staff Name",
    "email": "staff@example.com"
  },
  "createdBy": {
    "userId": "creator_id",
    "name": "Coach Name",
    "role": "coach" // or "staff", "system"
  }
}
```

**Available Variables:**
- `{{task.title}}` - Task title
- `{{task.priority}}` - Priority level
- `{{task.dueDate}}` - Due date
- `{{assignedTo.name}}` - Assigned staff name
- `{{lead.name}}` - Related lead

---

#### **5.2 Task Completed** (`task_completed`)

**Trigger Conditions:**
- Task status changes to "Completed"

**Payload Data Provided:**
```json
{
  "eventType": "task_completed",
  "timestamp": "2024-01-18T14:30:00Z",
  "task": {
    "taskId": "task_id",
    "title": "Follow up with John Doe",
    "priority": "High",
    "status": "Completed",
    "createdAt": "2024-01-15T10:30:00Z",
    "completedAt": "2024-01-18T14:30:00Z",
    "dueDate": "2024-01-18T17:00:00Z"
  },
  "completion": {
    "completedBy": "staff_id",
    "completedByName": "Staff Name",
    "timeToComplete": "3 days 4 hours",
    "completedOnTime": true,
    "notes": "Called and discussed package, sending proposal"
  },
  "lead": {
    "_id": "lead_id",
    "name": "John Doe"
  }
}
```

**Available Variables:**
- `{{task.title}}` - Task completed
- `{{completion.completedByName}}` - Who completed it
- `{{completion.timeToComplete}}` - Time taken
- `{{completion.notes}}` - Completion notes

---

#### **5.3 Task Overdue** (`task_overdue`)

**Trigger Conditions:**
- Task due date has passed and status is not "Completed"

**Payload Data Provided:**
```json
{
  "eventType": "task_overdue",
  "timestamp": "2024-01-19T00:00:00Z",
  "task": {
    "taskId": "task_id",
    "title": "Follow up with John Doe",
    "priority": "High",
    "status": "Pending",
    "dueDate": "2024-01-18T17:00:00Z",
    "createdAt": "2024-01-15T10:30:00Z"
  },
  "overdue": {
    "overdueSince": "2024-01-18T17:00:00Z",
    "daysOverdue": 1,
    "hoursOverdue": 7
  },
  "assignedTo": {
    "staffId": "staff_id",
    "name": "Staff Name",
    "email": "staff@example.com"
  },
  "lead": {
    "_id": "lead_id",
    "name": "John Doe"
  }
}
```

**Available Variables:**
- `{{task.title}}` - Overdue task
- `{{overdue.daysOverdue}}` - Days overdue
- `{{assignedTo.name}}` - Responsible person
- `{{lead.name}}` - Related lead

---

### **6. PAYMENT & SUBSCRIPTION TRIGGERS**

#### **6.1 Payment Successful** (`payment_successful`)

**Trigger Conditions:**
- Payment is successfully processed

**Payload Data Provided:**
```json
{
  "eventType": "payment_successful",
  "timestamp": "2024-01-15T10:30:00Z",
  "payment": {
    "paymentId": "pay_abc123",
    "transactionId": "txn_xyz789",
    "amount": 5000,
    "currency": "INR",
    "paymentMethod": "card", // card, upi, netbanking, wallet
    "status": "success",
    "receiptUrl": "https://payment.com/receipt/xyz"
  },
  "customer": {
    "leadId": "lead_id",
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+1234567890"
  },
  "product": {
    "productId": "prod_id",
    "productName": "Premium Coaching Package",
    "productType": "course", // or "product", "subscription"
    "quantity": 1
  },
  "coach": {
    "coachId": "coach_id",
    "name": "Coach Name"
  }
}
```

**Available Variables:**
- `{{payment.amount}}` - Amount paid
- `{{payment.currency}}` - Currency
- `{{payment.receiptUrl}}` - Receipt link
- `{{product.productName}}` - Product purchased
- `{{customer.name}}` - Customer name

---

#### **6.2 Payment Failed** (`payment_failed`)

**Trigger Conditions:**
- Payment attempt fails

**Payload Data Provided:**
```json
{
  "eventType": "payment_failed",
  "timestamp": "2024-01-15T10:30:00Z",
  "payment": {
    "attemptId": "attempt_abc123",
    "amount": 5000,
    "currency": "INR",
    "paymentMethod": "card",
    "status": "failed",
    "errorCode": "insufficient_funds",
    "errorMessage": "Insufficient funds in account"
  },
  "customer": {
    "leadId": "lead_id",
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+1234567890"
  },
  "product": {
    "productName": "Premium Coaching Package",
    "amount": 5000
  },
  "retryDetails": {
    "attemptNumber": 1,
    "maxRetries": 3,
    "nextRetryAt": "2024-01-15T11:00:00Z"
  }
}
```

**Available Variables:**
- `{{payment.amount}}` - Failed amount
- `{{payment.errorMessage}}` - Failure reason
- `{{product.productName}}` - Product name
- `{{retryDetails.attemptNumber}}` - Attempt number

---

#### **6.3 Payment Link Clicked** (`payment_link_clicked`)

**Trigger Conditions:**
- Payment link is opened by customer

**Payload Data Provided:**
```json
{
  "eventType": "payment_link_clicked",
  "timestamp": "2024-01-15T10:30:00Z",
  "paymentLink": {
    "linkId": "link_abc123",
    "amount": 5000,
    "currency": "INR",
    "productName": "Premium Coaching Package",
    "expiresAt": "2024-01-22T23:59:59Z",
    "clickCount": 1,
    "firstClickedAt": "2024-01-15T10:30:00Z"
  },
  "customer": {
    "leadId": "lead_id",
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+1234567890"
  },
  "source": {
    "medium": "whatsapp", // or "email", "sms"
    "campaignId": "campaign_id",
    "ipAddress": "192.168.1.1",
    "device": "mobile",
    "browser": "Chrome"
  }
}
```

**Available Variables:**
- `{{paymentLink.amount}}` - Link amount
- `{{paymentLink.productName}}` - Product name
- `{{paymentLink.expiresAt}}` - Expiry date
- `{{source.medium}}` - How link was accessed

---

#### **6.4 Payment Abandoned** (`payment_abandoned`)

**Trigger Conditions:**
- Customer starts payment but doesn't complete it

**Payload Data Provided:**
```json
{
  "eventType": "payment_abandoned",
  "timestamp": "2024-01-15T10:35:00Z",
  "payment": {
    "sessionId": "session_abc123",
    "amount": 5000,
    "currency": "INR",
    "abandonedAt": "payment_page", // or "card_details", "otp_verification"
    "timeSpentOnPage": 120 // seconds
  },
  "customer": {
    "leadId": "lead_id",
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+1234567890"
  },
  "product": {
    "productName": "Premium Coaching Package"
  },
  "abandonmentDetails": {
    "stage": "payment_page",
    "possibleReason": "Price too high",
    "cartValue": 5000,
    "timeElapsed": "5 minutes"
  }
}
```

**Available Variables:**
- `{{payment.amount}}` - Abandoned amount
- `{{abandonmentDetails.stage}}` - Where they left
- `{{product.productName}}` - Product name
- `{{abandonmentDetails.timeElapsed}}` - Time on page

---

#### **6.5 Invoice Paid** (`invoice_paid`)

**Trigger Conditions:**
- Invoice is marked as paid

**Payload Data Provided:**
```json
{
  "eventType": "invoice_paid",
  "timestamp": "2024-01-15T10:30:00Z",
  "invoice": {
    "invoiceId": "inv_abc123",
    "invoiceNumber": "INV-2024-001",
    "amount": 5000,
    "currency": "INR",
    "dueDate": "2024-01-20T23:59:59Z",
    "paidAt": "2024-01-15T10:30:00Z",
    "paidEarly": true,
    "daysBeforeDue": 5
  },
  "customer": {
    "leadId": "lead_id",
    "name": "John Doe",
    "email": "john@example.com"
  },
  "payment": {
    "paymentId": "pay_abc123",
    "paymentMethod": "card",
    "transactionId": "txn_xyz789"
  }
}
```

**Available Variables:**
- `{{invoice.invoiceNumber}}` - Invoice number
- `{{invoice.amount}}` - Amount paid
- `{{invoice.paidEarly}}` - Paid before due date
- `{{customer.name}}` - Customer name

---

#### **6.6 Subscription Created** (`subscription_created`)

**Trigger Conditions:**
- New subscription is activated

**Payload Data Provided:**
```json
{
  "eventType": "subscription_created",
  "timestamp": "2024-01-15T10:30:00Z",
  "subscription": {
    "subscriptionId": "sub_abc123",
    "planName": "Monthly Premium",
    "planType": "monthly",
    "amount": 1500,
    "currency": "INR",
    "startDate": "2024-01-15T00:00:00Z",
    "nextBillingDate": "2024-02-15T00:00:00Z",
    "status": "active"
  },
  "customer": {
    "leadId": "lead_id",
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+1234567890"
  },
  "benefits": {
    "features": ["Feature 1", "Feature 2"],
    "credits": 100,
    "accessLevel": "premium"
  }
}
```

**Available Variables:**
- `{{subscription.planName}}` - Plan name
- `{{subscription.amount}}` - Monthly/yearly amount
- `{{subscription.nextBillingDate}}` - Next billing date
- `{{customer.name}}` - Customer name

---

#### **6.7 Subscription Cancelled** (`subscription_cancelled`)

**Trigger Conditions:**
- Subscription is cancelled by user or system

**Payload Data Provided:**
```json
{
  "eventType": "subscription_cancelled",
  "timestamp": "2024-01-15T10:30:00Z",
  "subscription": {
    "subscriptionId": "sub_abc123",
    "planName": "Monthly Premium",
    "amount": 1500,
    "currency": "INR",
    "cancelledAt": "2024-01-15T10:30:00Z",
    "activeUntil": "2024-02-15T00:00:00Z",
    "totalMonthsActive": 6
  },
  "customer": {
    "leadId": "lead_id",
    "name": "John Doe",
    "email": "john@example.com"
  },
  "cancellation": {
    "cancelledBy": "customer", // or "admin", "system"
    "reason": "Too expensive",
    "feedbackProvided": true,
    "refundIssued": false
  }
}
```

**Available Variables:**
- `{{subscription.planName}}` - Cancelled plan
- `{{subscription.activeUntil}}` - Access until
- `{{cancellation.reason}}` - Cancellation reason
- `{{subscription.totalMonthsActive}}` - Months subscribed

---

#### **6.8 Card Expired** (`card_expired`)

**Trigger Conditions:**
- Payment card expiration date has passed

**Payload Data Provided:**
```json
{
  "eventType": "card_expired",
  "timestamp": "2024-01-01T00:00:00Z",
  "card": {
    "cardId": "card_abc123",
    "last4": "1234",
    "brand": "Visa",
    "expiryMonth": 12,
    "expiryYear": 2023,
    "expiredAt": "2023-12-31T23:59:59Z"
  },
  "customer": {
    "leadId": "lead_id",
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+1234567890"
  },
  "subscription": {
    "subscriptionId": "sub_abc123",
    "planName": "Monthly Premium",
    "nextBillingDate": "2024-01-15T00:00:00Z",
    "atRisk": true
  }
}
```

**Available Variables:**
- `{{card.last4}}` - Last 4 digits
- `{{card.brand}}` - Card brand (Visa, Mastercard)
- `{{subscription.planName}}` - Active subscription
- `{{subscription.nextBillingDate}}` - Next billing date

---

## ⚡ **ACTIONS & THEIR REQUIRED CONFIGURATION**

Below are all actions with exact configuration requirements.

---

### **1. LEAD DATA & FUNNEL ACTIONS**

#### **1.1 Update Lead Score** (`update_lead_score`)

**Purpose:** Modify a lead's engagement score

**Required Configuration:**
```json
{
  "type": "update_lead_score",
  "config": {
    "scoreChange": 10,
    "operation": "increase",
    "reason": "Attended webinar"
  }
}
```

**Configuration Fields:**
| Field | Type | Required | Description | Example |
|-------|------|----------|-------------|---------|
| `scoreChange` | Number | Yes | Points to add/subtract | `10`, `-5`, `20` |
| `operation` | String | Yes | `increase`, `decrease`, `set` | `increase` |
| `reason` | String | No | Why score changed | `"Attended webinar"` |

**Validation Rules:**
- `scoreChange` must be between -100 and 100
- `operation` must be one of: `increase`, `decrease`, `set`
- If `operation` is `set`, `scoreChange` is the new absolute score (0-100)

---

#### **1.2 Add Lead Tag** (`add_lead_tag`)

**Purpose:** Add a tag to categorize the lead

**Required Configuration:**
```json
{
  "type": "add_lead_tag",
  "config": {
    "tag": "Hot Lead"
  }
}
```

**Configuration Fields:**
| Field | Type | Required | Description | Example |
|-------|------|----------|-------------|---------|
| `tag` | String | Yes | Tag name to add | `"Hot Lead"`, `"VIP"` |

**Validation Rules:**
- `tag` must be 1-50 characters
- Tag is case-insensitive
- Duplicates are automatically ignored

---

#### **1.3 Remove Lead Tag** (`remove_lead_tag`)

**Purpose:** Remove a tag from lead

**Required Configuration:**
```json
{
  "type": "remove_lead_tag",
  "config": {
    "tag": "Cold Lead"
  }
}
```

**Configuration Fields:**
| Field | Type | Required | Description | Example |
|-------|------|----------|-------------|---------|
| `tag` | String | Yes | Tag name to remove | `"Cold Lead"` |

**Validation Rules:**
- If tag doesn't exist, action is silently skipped

---

#### **1.4 Add to Funnel** (`add_to_funnel`)

**Purpose:** Add lead to a specific funnel and stage

**Required Configuration:**
```json
{
  "type": "add_to_funnel",
  "config": {
    "funnelId": "funnel_id_here",
    "stageId": "stage_id_here",
    "stageName": "Initial Contact"
  }
}
```

**Configuration Fields:**
| Field | Type | Required | Description | Example |
|-------|------|----------|-------------|---------|
| `funnelId` | String (ObjectId) | Yes | Funnel ID | `"65abc123..."` |
| `stageId` | String (ObjectId) | Yes | Stage ID | `"65def456..."` |
| `stageName` | String | No | Stage name (for reference) | `"Initial Contact"` |

**Validation Rules:**
- Funnel must exist and belong to coach
- Stage must exist within the funnel
- If lead already in funnel, this will update their stage

---

#### **1.5 Move to Funnel Stage** (`move_to_funnel_stage`)

**Purpose:** Move lead to different stage within same or different funnel

**Required Configuration:**
```json
{
  "type": "move_to_funnel_stage",
  "config": {
    "funnelId": "funnel_id_here",
    "stageId": "stage_id_here",
    "stageName": "Qualified Leads"
  }
}
```

**Configuration Fields:**
| Field | Type | Required | Description | Example |
|-------|------|----------|-------------|---------|
| `funnelId` | String (ObjectId) | Yes | Target funnel ID | `"65abc123..."` |
| `stageId` | String (ObjectId) | Yes | Target stage ID | `"65def456..."` |
| `stageName` | String | No | Stage name | `"Qualified"` |

**Validation Rules:**
- Funnel and stage must exist
- Can move forward or backward in funnel
- Previous stage data is preserved in history

---

#### **1.6 Remove from Funnel** (`remove_from_funnel`)

**Purpose:** Remove lead from a funnel

**Required Configuration:**
```json
{
  "type": "remove_from_funnel",
  "config": {
    "funnelId": "funnel_id_here",
    "reason": "Disqualified"
  }
}
```

**Configuration Fields:**
| Field | Type | Required | Description | Example |
|-------|------|----------|-------------|---------|
| `funnelId` | String (ObjectId) | Yes | Funnel to remove from | `"65abc123..."` |
| `reason` | String | No | Removal reason | `"Disqualified"` |

---

#### **1.7 Update Lead Field** (`update_lead_field`)

**Purpose:** Update any field in lead record

**Required Configuration:**
```json
{
  "type": "update_lead_field",
  "config": {
    "field": "status",
    "value": "Qualified",
    "dataType": "string"
  }
}
```

**Configuration Fields:**
| Field | Type | Required | Description | Example |
|-------|------|----------|-------------|---------|
| `field` | String | Yes | Field name to update | `"status"`, `"temperature"`, `"customField1"` |
| `value` | Any | Yes | New value | `"Qualified"`, `5000`, `true` |
| `dataType` | String | No | Data type | `"string"`, `"number"`, `"boolean"`, `"date"` |

**Allowed Fields:**
- `status`, `temperature`, `notes`, `budget`, `source`, `customFields.*`

**Validation Rules:**
- Cannot update protected fields: `_id`, `coachId`, `createdAt`
- Value must match expected type for the field

---

#### **1.8 Create Deal** (`create_deal`)

**Purpose:** Create a deal/opportunity for the lead

**Required Configuration:**
```json
{
  "type": "create_deal",
  "config": {
    "dealName": "Premium Coaching Package",
    "amount": 5000,
    "currency": "INR",
    "stage": "Proposal Sent",
    "closeProbability": 70,
    "expectedCloseDate": "2024-02-15"
  }
}
```

**Configuration Fields:**
| Field | Type | Required | Description | Example |
|-------|------|----------|-------------|---------|
| `dealName` | String | Yes | Deal/opportunity name | `"Premium Package"` |
| `amount` | Number | Yes | Deal value | `5000`, `10000` |
| `currency` | String | No | Currency code | `"INR"` (default) |
| `stage` | String | Yes | Deal stage | `"Proposal Sent"` |
| `closeProbability` | Number | No | Chance of closing (%) | `70` |
| `expectedCloseDate` | String (Date) | No | Expected close date | `"2024-02-15"` |

**Validation Rules:**
- `amount` must be positive
- `closeProbability` must be 0-100
- `expectedCloseDate` must be ISO 8601 date format

---

### **2. COMMUNICATION ACTIONS**

#### **2.1 Send WhatsApp Message** (`send_whatsapp_message`)

**Purpose:** Send WhatsApp message to lead

**Required Configuration:**
```json
{
  "type": "send_whatsapp_message",
  "config": {
    "message": "Hi {{lead.name}}, thanks for your interest!",
    "templateId": "welcome_template",
    "templateParams": {
      "1": "{{lead.name}}",
      "2": "Premium Package"
    },
    "phoneNumber": "{{lead.phone}}",
    "countryCode": "{{lead.countryCode}}",
    "mediaUrl": "https://example.com/image.jpg",
    "mediaType": "image"
  }
}
```

**Configuration Fields:**
| Field | Type | Required | Description | Example |
|-------|------|----------|-------------|---------|
| `message` | String | Yes* | Message text (if no template) | `"Hi {{lead.name}}"` |
| `templateId` | String | Yes* | Template ID (if using template) | `"welcome_template"` |
| `templateParams` | Object | No | Template parameters | `{"1": "John", "2": "Package"}` |
| `phoneNumber` | String | Yes | Recipient phone | `"+1234567890"` or `"{{lead.phone}}"` |
| `countryCode` | String | No | Country code | `"+1"` or `"{{lead.countryCode}}"` |
| `mediaUrl` | String | No | Media file URL | `"https://..."` |
| `mediaType` | String | No | Media type | `"image"`, `"video"`, `"document"`, `"audio"` |

**Validation Rules:**
- Must provide either `message` OR `templateId` (not both)
- Phone number must be in international format with country code
- Template must exist and be approved
- Template params must match template placeholders
- Media URL must be publicly accessible
- Message length: max 4096 characters
- Credit will be deducted from coach's WhatsApp credits

**Variables Supported:**
- `{{lead.name}}`, `{{lead.email}}`, `{{lead.phone}}`
- `{{coach.name}}`, `{{coach.company}}`
- `{{appointment.date}}`, `{{appointment.time}}`
- Any custom field: `{{customFields.fieldName}}`

---

#### **2.2 Create Email Message** (`create_email_message`)

**Purpose:** Send email to lead

**Required Configuration:**
```json
{
  "type": "create_email_message",
  "config": {
    "to": "{{lead.email}}",
    "subject": "Welcome {{lead.name}}!",
    "body": "<h1>Welcome!</h1><p>Thanks for joining us.</p>",
    "templateId": "welcome_email",
    "templateParams": {
      "name": "{{lead.name}}",
      "link": "https://coach.com/start"
    },
    "fromName": "{{coach.name}}",
    "fromEmail": "{{coach.email}}",
    "replyTo": "support@coach.com",
    "cc": ["manager@coach.com"],
    "bcc": [],
    "attachments": [
      {
        "filename": "guide.pdf",
        "url": "https://coach.com/files/guide.pdf"
      }
    ]
  }
}
```

**Configuration Fields:**
| Field | Type | Required | Description | Example |
|-------|------|----------|-------------|---------|
| `to` | String | Yes | Recipient email | `"john@example.com"` or `"{{lead.email}}"` |
| `subject` | String | Yes* | Email subject (if no template) | `"Welcome!"` |
| `body` | String | Yes* | Email body HTML (if no template) | `"<p>Hello</p>"` |
| `templateId` | String | Yes* | Email template ID | `"welcome_email"` |
| `templateParams` | Object | No | Template variables | `{"name": "John"}` |
| `fromName` | String | No | Sender name | `"Coach Name"` |
| `fromEmail` | String | No | Sender email | `"coach@example.com"` |
| `replyTo` | String | No | Reply-to email | `"support@coach.com"` |
| `cc` | Array | No | CC recipients | `["manager@coach.com"]` |
| `bcc` | Array | No | BCC recipients | `["admin@coach.com"]` |
| `attachments` | Array | No | File attachments | See structure above |

**Validation Rules:**
- Must provide either (`subject` + `body`) OR `templateId`
- Email addresses must be valid format
- Subject: max 200 characters
- Body: max 100KB
- Attachments: max 10MB total
- Template must exist and be active
- Credit will be deducted from coach's email credits

**Variables Supported:**
- All lead fields: `{{lead.*}}`
- All coach fields: `{{coach.*}}`
- Appointment data: `{{appointment.*}}`
- Custom fields: `{{customFields.*}}`

---

#### **2.3 Send Internal Notification** (`send_internal_notification`)

**Purpose:** Send notification to coach or staff members

**Required Configuration:**
```json
{
  "type": "send_internal_notification",
  "config": {
    "recipients": ["staff_id_1", "staff_id_2", "coach_id"],
    "message": "Hot lead {{lead.name}} needs immediate attention!",
    "priority": "high",
    "actionUrl": "/leads/{{lead._id}}",
    "actionLabel": "View Lead",
    "notificationType": "lead_alert"
  }
}
```

**Configuration Fields:**
| Field | Type | Required | Description | Example |
|-------|------|----------|-------------|---------|
| `recipients` | Array | Yes | User IDs to notify | `["staff_id", "coach_id"]` |
| `message` | String | Yes | Notification message | `"Hot lead needs attention"` |
| `priority` | String | No | Priority level | `"high"`, `"medium"`, `"low"` |
| `actionUrl` | String | No | Link to related resource | `"/leads/123"` |
| `actionLabel` | String | No | Button text | `"View Lead"` |
| `notificationType` | String | No | Notification category | `"lead_alert"`, `"task_reminder"` |

**Validation Rules:**
- Recipients must be valid user IDs belonging to the coach
- Message: max 500 characters
- Priority defaults to `"medium"`
- ActionUrl is relative to application domain

---

#### **2.4 Send Push Notification** (`send_push_notification`)

**Purpose:** Send push notification to lead's mobile app

**Required Configuration:**
```json
{
  "type": "send_push_notification",
  "config": {
    "title": "New Message from {{coach.name}}",
    "body": "You have a new appointment scheduled!",
    "data": {
      "type": "appointment",
      "appointmentId": "{{appointment._id}}",
      "deepLink": "/appointments/{{appointment._id}}"
    },
    "icon": "https://coach.com/icon.png",
    "image": "https://coach.com/banner.jpg",
    "badge": 1,
    "sound": "default",
    "clickAction": "/appointments"
  }
}
```

**Configuration Fields:**
| Field | Type | Required | Description | Example |
|-------|------|----------|-------------|---------|
| `title` | String | Yes | Notification title | `"New Message"` |
| `body` | String | Yes | Notification body | `"You have a new..."` |
| `data` | Object | No | Custom payload data | `{"type": "appointment"}` |
| `icon` | String | No | Notification icon URL | `"https://..."` |
| `image` | String | No | Large image URL | `"https://..."` |
| `badge` | Number | No | Badge count | `1`, `5` |
| `sound` | String | No | Sound to play | `"default"`, `"custom.mp3"` |
| `clickAction` | String | No | Action on click | `"/appointments"` |

**Validation Rules:**
- Title: max 100 characters
- Body: max 300 characters
- Lead must have mobile app installed and push enabled
- Icon and image must be publicly accessible URLs

---

#### **2.5 Schedule Drip Sequence** (`schedule_drip_sequence`)

**Purpose:** Enroll lead in nurturing sequence

**Required Configuration:**
```json
{
  "type": "schedule_drip_sequence",
  "config": {
    "sequenceId": "nurturing_sequence_id",
    "sequenceName": "Warm Lead 5-Day Sequence",
    "startDelay": 0,
    "startDate": "2024-01-16T09:00:00Z"
  }
}
```

**Configuration Fields:**
| Field | Type | Required | Description | Example |
|-------|------|----------|-------------|---------|
| `sequenceId` | String (ObjectId) | Yes | Nurturing sequence ID | `"65abc123..."` |
| `sequenceName` | String | No | Sequence name (reference) | `"5-Day Warm Lead"` |
| `startDelay` | Number | No | Delay before starting (hours) | `0`, `24`, `48` |
| `startDate` | String (Date) | No | Specific start date/time | `"2024-01-16T09:00:00Z"` |

**Validation Rules:**
- Sequence must exist and belong to coach
- Sequence must be active
- If `startDate` provided, `startDelay` is ignored
- Lead will not be enrolled if already in same sequence

---

### **3. TASK & WORKFLOW ACTIONS**

#### **3.1 Create Task** (`create_task`)

**Purpose:** Create a task for staff or coach

**Required Configuration:**
```json
{
  "type": "create_task",
  "config": {
    "title": "Follow up with {{lead.name}}",
    "description": "Discuss premium package details and answer questions",
    "assignee": "staff_id_here",
    "dueDate": "2024-01-18T17:00:00Z",
    "priority": "High",
    "category": "Follow-up",
    "relatedLead": "{{lead._id}}",
    "reminderBefore": 60
  }
}
```

**Configuration Fields:**
| Field | Type | Required | Description | Example |
|-------|------|----------|-------------|---------|
| `title` | String | Yes | Task title | `"Follow up with lead"` |
| `description` | String | No | Task description | `"Discuss package details"` |
| `assignee` | String (ObjectId) | Yes | Staff/coach ID | `"staff_id"` or `"{{assignedStaff._id}}"` |
| `dueDate` | String (Date) | Yes | Due date/time | `"2024-01-18T17:00:00Z"` |
| `priority` | String | No | Priority level | `"High"`, `"Medium"`, `"Low"` |
| `category` | String | No | Task category | `"Follow-up"`, `"Research"` |
| `relatedLead` | String (ObjectId) | No | Associated lead ID | `"{{lead._id}}"` |
| `reminderBefore` | Number | No | Reminder (minutes before due) | `60`, `120`, `1440` |

**Validation Rules:**
- Title: max 200 characters
- Description: max 2000 characters
- Assignee must be valid staff/coach under the coach
- Due date must be future date
- Priority defaults to `"Medium"`
- Reminder must be positive number

---

#### **3.2 Create Calendar Event** (`create_calendar_event`)

**Purpose:** Create a calendar event

**Required Configuration:**
```json
{
  "type": "create_calendar_event",
  "config": {
    "title": "Team Meeting - Discuss {{lead.name}}",
    "startTime": "2024-01-20T10:00:00Z",
    "endTime": "2024-01-20T11:00:00Z",
    "attendees": ["staff_id_1", "coach_id"],
    "location": "Conference Room A",
    "description": "Discuss strategy for hot lead",
    "reminderMinutes": 15,
    "isRecurring": false,
    "meetingLink": "https://zoom.us/j/123456789"
  }
}
```

**Configuration Fields:**
| Field | Type | Required | Description | Example |
|-------|------|----------|-------------|---------|
| `title` | String | Yes | Event title | `"Team Meeting"` |
| `startTime` | String (Date) | Yes | Start date/time | `"2024-01-20T10:00:00Z"` |
| `endTime` | String (Date) | Yes | End date/time | `"2024-01-20T11:00:00Z"` |
| `attendees` | Array | Yes | User IDs of attendees | `["staff_id", "coach_id"]` |
| `location` | String | No | Event location | `"Conference Room A"` |
| `description` | String | No | Event description | `"Discuss strategy"` |
| `reminderMinutes` | Number | No | Reminder before event | `15`, `30`, `60` |
| `isRecurring` | Boolean | No | Is recurring event | `false` |
| `meetingLink` | String | No | Video meeting link | `"https://zoom.us/..."` |

**Validation Rules:**
- Title: max 200 characters
- Start time must be before end time
- End time must be after start time
- Attendees must be valid user IDs
- Description: max 1000 characters

---

#### **3.3 Add Note to Lead** (`add_note_to_lead`)

**Purpose:** Add a note/comment to lead record

**Required Configuration:**
```json
{
  "type": "add_note_to_lead",
  "config": {
    "note": "Lead showed high interest in premium package. Budget confirmed: {{lead.budget}}",
    "noteType": "conversation",
    "isPrivate": false,
    "tags": ["interested", "premium"],
    "createdBy": "system"
  }
}
```

**Configuration Fields:**
| Field | Type | Required | Description | Example |
|-------|------|----------|-------------|---------|
| `note` | String | Yes | Note content | `"Lead showed interest..."` |
| `noteType` | String | No | Note category | `"conversation"`, `"observation"`, `"follow_up"` |
| `isPrivate` | Boolean | No | Only visible to creator | `false` |
| `tags` | Array | No | Note tags | `["interested", "premium"]` |
| `createdBy` | String | No | Who created note | `"system"`, `"automation"`, user ID |

**Validation Rules:**
- Note: max 5000 characters
- Note type defaults to `"general"`
- Private notes only visible to creator

---

#### **3.4 Add Follow-up Date** (`add_followup_date`)

**Purpose:** Schedule follow-up for lead

**Required Configuration:**
```json
{
  "type": "add_followup_date",
  "config": {
    "followupDate": "2024-01-22T10:00:00Z",
    "notes": "Check if lead reviewed proposal",
    "reminderEnabled": true,
    "assignedTo": "{{assignedStaff._id}}"
  }
}
```

**Configuration Fields:**
| Field | Type | Required | Description | Example |
|-------|------|----------|-------------|---------|
| `followupDate` | String (Date) | Yes | Follow-up date/time | `"2024-01-22T10:00:00Z"` |
| `notes` | String | No | Follow-up notes | `"Check if reviewed proposal"` |
| `reminderEnabled` | Boolean | No | Send reminder | `true` |
| `assignedTo` | String (ObjectId) | No | Staff/coach to follow up | `"staff_id"` |

**Validation Rules:**
- Follow-up date must be future date
- Notes: max 1000 characters
- If no assignedTo, uses lead's current assigned staff

---

### **4. ZOOM INTEGRATION ACTIONS**

#### **4.1 Create Zoom Meeting** (`create_zoom_meeting`)

**Purpose:** Create Zoom meeting and send invite

**Required Configuration:**
```json
{
  "type": "create_zoom_meeting",
  "config": {
    "topic": "Consultation with {{lead.name}}",
    "startTime": "2024-01-20T14:00:00Z",
    "duration": 60,
    "attendees": ["{{lead.email}}", "staff@coach.com"],
    "timezone": "Asia/Kolkata",
    "agenda": "Discuss premium coaching package and answer questions",
    "password": "12345",
    "waitingRoom": true,
    "recordMeeting": true,
    "sendInvite": true
  }
}
```

**Configuration Fields:**
| Field | Type | Required | Description | Example |
|-------|------|----------|-------------|---------|
| `topic` | String | Yes | Meeting topic | `"Consultation with John"` |
| `startTime` | String (Date) | Yes | Meeting start time | `"2024-01-20T14:00:00Z"` |
| `duration` | Number | Yes | Duration (minutes) | `30`, `60`, `90` |
| `attendees` | Array | Yes | Attendee emails | `["john@example.com"]` |
| `timezone` | String | No | Timezone | `"Asia/Kolkata"` |
| `agenda` | String | No | Meeting agenda | `"Discuss package"` |
| `password` | String | No | Meeting password | `"12345"` |
| `waitingRoom` | Boolean | No | Enable waiting room | `true` |
| `recordMeeting` | Boolean | No | Auto-record meeting | `false` |
| `sendInvite` | Boolean | No | Send email invite | `true` |

**Validation Rules:**
- Topic: max 200 characters
- Duration: 15-1440 minutes (24 hours max)
- Attendees must be valid emails
- Timezone must be valid IANA timezone
- Coach must have Zoom integration enabled
- Password must be 4-10 characters if provided

**Returns:**
- Meeting ID
- Join URL
- Password
- Start URL (for host)

---

### **5. PAYMENT ACTIONS**

#### **5.1 Create Invoice** (`create_invoice`)

**Purpose:** Generate invoice for lead

**Required Configuration:**
```json
{
  "type": "create_invoice",
  "config": {
    "amount": 5000,
    "currency": "INR",
    "description": "Premium Coaching Package - 3 Months",
    "dueDate": "2024-01-30T23:59:59Z",
    "items": [
      {
        "name": "Premium Coaching",
        "quantity": 3,
        "unitPrice": 1500,
        "total": 4500
      },
      {
        "name": "Bonus Material",
        "quantity": 1,
        "unitPrice": 500,
        "total": 500
      }
    ],
    "taxes": 0,
    "discount": 0,
    "notes": "Payment terms: 50% upfront, 50% after 45 days",
    "sendToLead": true
  }
}
```

**Configuration Fields:**
| Field | Type | Required | Description | Example |
|-------|------|----------|-------------|---------|
| `amount` | Number | Yes | Total invoice amount | `5000` |
| `currency` | String | No | Currency code | `"INR"`, `"USD"` |
| `description` | String | Yes | Invoice description | `"Premium Package"` |
| `dueDate` | String (Date) | Yes | Payment due date | `"2024-01-30T23:59:59Z"` |
| `items` | Array | No | Line items | See structure above |
| `taxes` | Number | No | Tax amount | `900` |
| `discount` | Number | No | Discount amount | `500` |
| `notes` | String | No | Payment terms/notes | `"Net 30 days"` |
| `sendToLead` | Boolean | No | Email invoice to lead | `true` |

**Validation Rules:**
- Amount must be positive
- Due date must be future date
- If items provided, sum must equal amount (minus taxes, plus discount)
- Description: max 500 characters
- Notes: max 1000 characters

**Returns:**
- Invoice ID
- Invoice number (auto-generated)
- PDF URL
- Payment link

---

#### **5.2 Issue Refund** (`issue_refund`)

**Purpose:** Process refund for a payment

**Required Configuration:**
```json
{
  "type": "issue_refund",
  "config": {
    "paymentId": "pay_abc123",
    "amount": 5000,
    "reason": "Customer not satisfied",
    "refundType": "full",
    "notifyCustomer": true,
    "notes": "Refund requested on 2024-01-15"
  }
}
```

**Configuration Fields:**
| Field | Type | Required | Description | Example |
|-------|------|----------|-------------|---------|
| `paymentId` | String | Yes | Original payment ID | `"pay_abc123"` |
| `amount` | Number | Yes | Refund amount | `5000`, `2500` |
| `reason` | String | Yes | Refund reason | `"Customer not satisfied"` |
| `refundType` | String | No | Type of refund | `"full"`, `"partial"` |
| `notifyCustomer` | Boolean | No | Send refund notification | `true` |
| `notes` | String | No | Internal notes | `"Approved by manager"` |

**Validation Rules:**
- Payment must exist and be successful
- Amount cannot exceed original payment amount
- Reason: max 500 characters
- Refund type auto-detected: `full` if amount = original, else `partial`

**Returns:**
- Refund ID
- Refund status
- Refund receipt URL

---

### **6. SYSTEM ACTIONS**

#### **6.1 Call Webhook** (`call_webhook`)

**Purpose:** Call external webhook/API

**Required Configuration:**
```json
{
  "type": "call_webhook",
  "config": {
    "url": "https://api.external-system.com/webhook",
    "method": "POST",
    "headers": {
      "Content-Type": "application/json",
      "Authorization": "Bearer your_api_key_here",
      "X-Custom-Header": "value"
    },
    "payload": {
      "event": "lead_created",
      "leadData": {
        "name": "{{lead.name}}",
        "email": "{{lead.email}}",
        "phone": "{{lead.phone}}"
      },
      "timestamp": "{{timestamp}}"
    },
    "timeout": 30,
    "retryOnFailure": true,
    "maxRetries": 3
  }
}
```

**Configuration Fields:**
| Field | Type | Required | Description | Example |
|-------|------|----------|-------------|---------|
| `url` | String | Yes | Webhook URL | `"https://api.example.com/webhook"` |
| `method` | String | No | HTTP method | `"POST"`, `"GET"`, `"PUT"`, `"PATCH"` |
| `headers` | Object | No | HTTP headers | `{"Authorization": "Bearer ..."}` |
| `payload` | Object | No | Request body/data | Any JSON object |
| `timeout` | Number | No | Request timeout (seconds) | `30` |
| `retryOnFailure` | Boolean | No | Retry on error | `true` |
| `maxRetries` | Number | No | Max retry attempts | `3` |

**Validation Rules:**
- URL must be valid HTTPS URL
- Method defaults to `"POST"`
- Timeout: 1-60 seconds (default 30)
- Max retries: 0-5 (default 3)
- Payload supports variable interpolation

**Variables Supported:**
- All event payload data
- `{{lead.*}}`, `{{coach.*}}`, `{{appointment.*}}`
- `{{timestamp}}` - Current timestamp

---

#### **6.2 Trigger Another Automation** (`trigger_another_automation`)

**Purpose:** Chain multiple automation rules together

**Required Configuration:**
```json
{
  "type": "trigger_another_automation",
  "config": {
    "automationRuleId": "rule_id_here",
    "automationRuleName": "Send Follow-up Sequence",
    "delay": 24,
    "delayUnit": "hours",
    "passPayload": true,
    "overrideData": {
      "customField": "value"
    }
  }
}
```

**Configuration Fields:**
| Field | Type | Required | Description | Example |
|-------|------|----------|-------------|---------|
| `automationRuleId` | String (ObjectId) | Yes | Target automation rule ID | `"65abc123..."` |
| `automationRuleName` | String | No | Rule name (reference) | `"Follow-up Sequence"` |
| `delay` | Number | No | Delay before triggering | `0`, `24`, `48` |
| `delayUnit` | String | No | Delay unit | `"minutes"`, `"hours"`, `"days"` |
| `passPayload` | Boolean | No | Pass current event data | `true` |
| `overrideData` | Object | No | Additional/override data | `{"key": "value"}` |

**Validation Rules:**
- Target automation rule must exist and be active
- Delay: 0-720 hours (30 days max)
- DelayUnit defaults to `"hours"`
- PassPayload defaults to `true`
- Prevents infinite loops (max chain depth: 5)

---

## 📋 **DATA VALIDATION RULES**

### **Global Rules:**
1. **ObjectId Validation:** All IDs must be valid MongoDB ObjectIds (24-character hex strings)
2. **Date Format:** ISO 8601 format (`YYYY-MM-DDTHH:mm:ssZ`)
3. **Email Format:** Valid RFC 5322 email format
4. **Phone Format:** International format with country code (e.g., `+1234567890`)
5. **URL Format:** Valid HTTP/HTTPS URLs
6. **Variable Interpolation:** `{{variableName}}` syntax supported in most text fields

### **Credit Deduction:**
- **WhatsApp Messages:** 1 credit per message (deducted from coach's WhatsApp credits)
- **Email Messages:** 1 credit per email (deducted from coach's email credits)
- **SMS Messages:** Credits vary by country (deducted from SMS credits)
- **All credits deducted from coach's account**, even if triggered by staff

### **Permission Requirements:**
- Actions inherit permissions from the automation rule creator
- Staff-created rules execute with coach's credentials for external services
- Sensitive actions (refunds, invoices) require coach approval

### **Error Handling:**
- Failed actions are logged but don't stop subsequent actions
- Retry logic: 3 attempts with exponential backoff (1min, 5min, 15min)
- Dead letter queue for permanently failed actions
- Coach/staff notified of critical failures

---

## 🔄 **EXAMPLE AUTOMATION FLOWS**

### **Example 1: New Lead Welcome Sequence**

**Trigger:** `lead_created`

**Actions:**
1. Add Lead Tag: "New Lead"
2. Send WhatsApp Message: Welcome message
3. Add to Funnel: "Sales Funnel 2024" → "Initial Contact" stage
4. Create Task: "Send introduction email" (Due in 1 hour)
5. Schedule Drip Sequence: "5-Day Warm Lead Sequence"
6. Send Internal Notification: Notify assigned staff

---

### **Example 2: Hot Lead Alert & Task Creation**

**Trigger:** `lead_temperature_changed` (to "Hot")

**Actions:**
1. Update Lead Score: +20 points
2. Send Internal Notification: "HOT LEAD - Immediate attention required!"
3. Create Task: "Call {{lead.name}} within 30 minutes" (High priority)
4. Send WhatsApp Message: "Hi {{lead.name}}, I noticed you're interested..."
5. Move to Funnel Stage: "Qualified Leads"

---

### **Example 3: Appointment Reminder**

**Trigger:** `appointment_reminder_time` (24 hours before)

**Actions:**
1. Send WhatsApp Message: "Reminder: Your appointment with {{coach.name}} is tomorrow at {{appointment.time}}"
2. Send Email: Appointment details with calendar invite
3. Send Push Notification: "Appointment tomorrow"
4. Create Task: "Prepare materials for appointment with {{lead.name}}"

---

### **Example 4: Payment Failed Recovery**

**Trigger:** `payment_failed`

**Actions:**
1. Send Email: "Payment issue detected - please update payment method"
2. Send WhatsApp Message: Payment recovery message with new link
3. Add Note to Lead: "Payment failed - {{payment.errorMessage}}"
4. Create Task: "Follow up on failed payment" (Due in 2 hours, High priority)
5. Update Lead Field: status = "Payment Failed"
6. Trigger Another Automation: "Payment Recovery Sequence" (delay: 24 hours)

---

### **Example 5: Subscription Cancellation Win-back**

**Trigger:** `subscription_cancelled`

**Actions:**
1. Send Email: Exit survey + win-back offer
2. Add Lead Tag: "Churned"
3. Create Task: "Conduct exit interview" (assigned to manager)
4. Update Lead Score: -30 points
5. Schedule Drip Sequence: "Win-back Campaign" (delay: 7 days)
6. Call Webhook: Update external CRM

---

### **Example 6: Appointment Completed Follow-up**

**Trigger:** `appointment_finished`

**Actions:**
1. Send WhatsApp Message: "Thank you for meeting with us!"
2. Create Task: "Send proposal to {{lead.name}}" (Due tomorrow)
3. Add Follow-up Date: 3 days from now
4. Create Invoice: Based on discussed package
5. Add Note to Lead: "Meeting notes: {{outcome.notes}}"
6. Move to Funnel Stage: "Proposal Sent"

---

## 📌 **IMPORTANT NOTES**

1. **Variable Safety:** All variables are sanitized to prevent injection attacks
2. **Rate Limiting:** 
   - WhatsApp: 100 messages/day per coach
   - Email: 500 emails/day per coach
   - API calls: 1000/hour per coach
3. **Execution Time:** Actions timeout after 30 seconds
4. **Parallel Execution:** Multiple actions execute in parallel where possible
5. **Order Matters:** Actions with dependencies execute sequentially
6. **Conditional Logic:** Coming soon - IF/THEN conditions for actions
7. **A/B Testing:** Coming soon - Split testing for different action paths

---

## 🔐 **SECURITY & COMPLIANCE**

- All webhook URLs must be HTTPS
- API keys stored encrypted
- GDPR compliant data handling
- Lead data anonymization options
- Audit log for all automation executions
- Data retention policies respected

---

**Document Version:** 1.0  
**Last Updated:** January 2025  
**Total Triggers:** 24  
**Total Actions:** 21  
**Total Configurations:** 200+

---

This comprehensive guide covers all automation capabilities in the system. Use this as a reference when creating, testing, and documenting automation rules.


