# Central Messaging API Endpoints

**Base URL:** `/api/central-messaging/v1/`

---

## 📋 TABLE OF CONTENTS

1. [Template Variables](#template-variables)
2. [Message Sending](#message-sending)
3. [Inbox Management](#inbox-management)
4. [Contacts Management](#contacts-management)
5. [Analytics](#analytics)
6. [Template Management](#template-management)
7. [Admin Configuration](#admin-configuration)
8. [Conversation Management](#conversation-management)
9. [Bulk Messaging](#bulk-messaging)
10. [Credits Management](#credits-management)
11. [Email Configuration (Admin)](#email-configuration-admin)
12. [WhatsApp Configuration (Admin)](#whatsapp-configuration-admin)
13. [Staff Routes](#staff-routes)
14. [Advanced Features](#advanced-features)
15. [Automation Integration](#automation-integration)

---

## 🔤 TEMPLATE VARIABLES

### Get Available Template Variables
```http
GET /api/central-messaging/v1/variables
Authorization: Bearer <token>
```

**Description:** Get all available template variables that can be used in messages

**Access:** Coach, Staff, Admin

**Response:**
```json
{
  "success": true,
  "data": {
    "lead": { "name": {...}, "email": {...}, ... },
    "client": { "name": {...}, "age": {...}, ... },
    "coach": { "name": {...}, "email": {...}, ... },
    "system": { "currentDate": {...}, ... }
  }
}
```

### Preview Template with Variables
```http
POST /api/central-messaging/v1/variables/preview
Authorization: Bearer <token>
Content-Type: application/json

{
  "templateText": "Hello {{lead.name}}, welcome!",
  "variables": {
    "lead.name": "John Doe",
    "system.currentDate": "2024-01-15"
  }
}
```

**Description:** Preview how a template will look after variable replacement

**Access:** Coach, Staff, Admin

---

## 📨 MESSAGE SENDING

### Send Message (WhatsApp or Email)
```http
POST /api/central-messaging/v1/send
Authorization: Bearer <token>
Content-Type: application/json

{
  "to": "+1234567890",           // or "user@email.com"
  "messageType": "whatsapp",     // or "email"
  "type": "text",                // "text", "template", or "media"
  "message": "Hello!",
  "templateName": "welcome",     // if type is "template"
  "templateParameters": ["John"],
  "subject": "Email Subject",    // for email
  "emailBody": "Email content",  // for email
  "leadId": "lead_123",          // optional
  "clientId": "client_123",      // optional
  "variables": {                 // custom variables
    "custom.var": "value"
  }
}
```

**Description:** Send a message via WhatsApp or Email with variable support

**Access:** Coach, Staff, Admin

**Features:**
- Automatic variable extraction from lead/client data
- Template parameter support
- Credit deduction
- Role-based access control

---

## 📬 INBOX MANAGEMENT

### Get Unified Inbox
```http
GET /api/central-messaging/v1/inbox?page=1&limit=20&type=whatsapp&within24Hours=true&contact=john
Authorization: Bearer <token>
```

**Query Parameters:**
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 20)
- `contact` - Filter by contact phone/email
- `type` - Filter by type (`whatsapp`, `email`)
- `within24Hours` - Filter contacts within 24hr window (`true`/`false`)

**Description:** Get unified inbox for WhatsApp and Email messages

**Access:** Coach, Staff, Admin

**Notes:**
- Admin sees all messages
- Coach sees own messages
- Staff sees only assigned leads

---

## 👥 CONTACTS MANAGEMENT

### Get All Contacts
```http
GET /api/central-messaging/v1/contacts?page=1&limit=20&within24Hours=true
Authorization: Bearer <token>
```

**Query Parameters:**
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 20)
- `within24Hours` - Filter by 24hr window

**Description:** Get all contacts with message history and 24hr window info

**Access:** Coach, Staff, Admin

**Response includes:**
- Contact info
- Last message
- Message count
- 24hr window status
- Window expiration time

---

## 📊 ANALYTICS

### Get Messaging Analytics
```http
GET /api/central-messaging/v1/analytics?startDate=2024-01-01&endDate=2024-01-31
Authorization: Bearer <token>
```

**Query Parameters:**
- `startDate` - Start date (ISO format)
- `endDate` - End date (ISO format)

**Description:** Get messaging statistics

**Access:** Coach, Staff, Admin

**Response:**
```json
{
  "success": true,
  "data": {
    "whatsapp": { "sent": 150, "total": 200 },
    "email": { "sent": 80, "total": 100 },
    "totalCreditsUsed": 230,
    "creditsBalance": 500,
    "userType": "coach"
  }
}
```

---

## 🎨 TEMPLATE MANAGEMENT

### Get Templates
```http
GET /api/central-messaging/v1/templates?type=whatsapp&category=welcome
Authorization: Bearer <token>
```

**Description:** Get Meta templates (admin-created) and local templates

**Query Parameters:**
- `type` - Filter by type (`whatsapp`, `email`, `universal`)
- `category` - Filter by category

**Access:** Coach, Staff, Admin

**Response:**
```json
{
  "success": true,
  "data": {
    "metaTemplates": [...],      // Admin-created Meta templates
    "localTemplates": [...],     // Coach/Staff created templates
    "userType": "coach"
  }
}
```

**Notes:**
- Meta templates can be used anytime (Meta approved)
- Local templates can only be used within 24hr window

### Create Template (Coach/Staff Only)
```http
POST /api/central-messaging/v1/templates
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "welcome_template",
  "description": "Welcome message template",
  "type": "universal",
  "category": "welcome",
  "content": {
    "body": "Hello {{lead.name}}, welcome to {{system.platformName}}!"
  },
  "availableVariables": [
    { "name": "lead.name", "description": "Lead name", "required": true }
  ]
}
```

**Description:** Create local template with variable support

**Access:** Coach, Staff (Admin creates via Meta Business Manager)

**Available Variables:**
- `{{lead.name}}`, `{{lead.email}}`, `{{lead.phone}}`, etc.
- `{{client.age}}`, `{{client.goal}}`, etc.
- `{{coach.name}}`, `{{coach.email}}`, etc.
- `{{system.currentDate}}`, `{{system.platformName}}`, etc.

---

## 🔧 ADMIN CONFIGURATION

### Get Configuration
```http
GET /api/central-messaging/v1/admin/config
Authorization: Bearer <admin_token>
```

### Update Configuration
```http
PUT /api/central-messaging/v1/admin/config
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "whatsapp": { "phoneNumberId": "...", "businessAccountId": "..." },
  "email": { "user": "...", "pass": "..." }
}
```

### Get System Overview
```http
GET /api/central-messaging/v1/admin/overview
Authorization: Bearer <admin_token>
```

### Get System Stats
```http
GET /api/central-messaging/v1/admin/stats
Authorization: Bearer <admin_token>
```

---

## 💬 CONVERSATION MANAGEMENT

### Get Conversation
```http
GET /api/central-messaging/v1/conversation/:contactId?page=1&limit=50
Authorization: Bearer <token>
```

**Description:** Get complete conversation history with a contact (WhatsApp + Email)

**Access:** Coach, Staff, Admin

**Notes:**
- Returns all messages (WhatsApp and Email combined)
- Role-based filtering applied
- Sorted by timestamp

---

## 📣 BULK MESSAGING

### Send Bulk Messages
```http
POST /api/central-messaging/v1/bulk
Authorization: Bearer <token>
Content-Type: application/json

{
  "recipients": ["+1234567890", "user@email.com"],
  "messageType": "whatsapp",
  "type": "text",
  "message": "Bulk message content",
  "templateName": "welcome_template",
  "variables": { "lead.name": "John" },
  "leadIds": ["lead_1", "lead_2"]
}
```

**Description:** Send messages to multiple recipients

**Access:** Coach, Staff, Admin

**Features:**
- Supports WhatsApp and Email
- Automatic variable extraction per recipient
- Credit deduction per message
- Returns detailed results

---

## 💳 CREDITS MANAGEMENT

### Get Credit Balance
```http
GET /api/central-messaging/v1/credits/balance
Authorization: Bearer <token>
```

### Get Credit Packages
```http
GET /api/central-messaging/v1/credits/packages
```

### Purchase Credits
```http
POST /api/central-messaging/v1/credits/purchase
Authorization: Bearer <token>
Content-Type: application/json

{
  "packageId": "package_123",
  "amount": 100
}
```

### Get Credit Transactions
```http
GET /api/central-messaging/v1/credits/transactions?page=1&limit=20
Authorization: Bearer <token>
```

---

## 📧 EMAIL CONFIGURATION (Admin)

### Get Email Config
```http
GET /api/central-messaging/v1/admin/email/config
Authorization: Bearer <admin_token>
```

### Setup Email
```http
POST /api/central-messaging/v1/admin/email/setup
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "email": "admin@funnelseye.com",
  "password": "app_password",
  "fromName": "FunnelsEye"
}
```

### Test Email
```http
POST /api/central-messaging/v1/admin/email/test
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "to": "test@example.com",
  "subject": "Test",
  "body": "Test email"
}
```

---

## 📱 WHATSAPP CONFIGURATION (Admin)

### Get WhatsApp Config
```http
GET /api/central-messaging/v1/admin/whatsapp/config
Authorization: Bearer <admin_token>
```

### Setup WhatsApp
```http
POST /api/central-messaging/v1/admin/whatsapp/setup
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "phoneNumberId": "...",
  "accessToken": "...",
  "businessAccountId": "...",
  "webhookVerifyToken": "..."
}
```

### Test WhatsApp
```http
POST /api/central-messaging/v1/admin/whatsapp/test
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "to": "+1234567890",
  "message": "Test message"
}
```

### Get Meta Templates
```http
GET /api/central-messaging/v1/admin/whatsapp/templates
Authorization: Bearer <admin_token>
```

### Sync Meta Templates
```http
POST /api/central-messaging/v1/admin/whatsapp/templates/sync
Authorization: Bearer <admin_token>
```

---

## 👨‍💼 STAFF ROUTES

### Get Assigned Leads
```http
GET /api/central-messaging/v1/staff/assigned-leads
Authorization: Bearer <staff_token>
```

**Description:** Get all leads assigned to the staff member

### Get Staff Contacts
```http
GET /api/central-messaging/v1/staff/contacts?page=1&limit=20
Authorization: Bearer <staff_token>
```

**Description:** Get contacts from assigned leads only

### Get Staff Inbox
```http
GET /api/central-messaging/v1/staff/inbox?page=1&limit=20
Authorization: Bearer <staff_token>
```

**Description:** Get inbox filtered by assigned leads

**Notes:**
- Staff can only see messages from/for their assigned leads
- Enforces strict data isolation

---

## ⚡ ADVANCED FEATURES

### Preview Message
```http
POST /api/central-messaging/v1/preview
Authorization: Bearer <token>
Content-Type: application/json

{
  "messageType": "whatsapp",
  "type": "text",
  "message": "Hello {{lead.name}}!",
  "leadId": "lead_123",
  "variables": { "custom.var": "value" }
}
```

**Description:** Preview message before sending with variables filled

### Get 24-Hour Window Contacts
```http
GET /api/central-messaging/v1/24hr-window?page=1&limit=20
Authorization: Bearer <token>
```

**Description:** Get contacts within Meta's 24-hour messaging window

**Access:** Coach, Staff, Admin

---

## 🤖 AUTOMATION INTEGRATION

### Send via Automation
```http
POST /api/central-messaging/v1/automation/send
Content-Type: application/json

{
  "automationRuleId": "rule_123",
  "leadId": "lead_123",
  "templateName": "welcome",
  "messageType": "whatsapp",
  "type": "template"
}
```

**Description:** Send message via automation system

### Handle Automation Webhook
```http
POST /api/central-messaging/v1/automation/webhook
Content-Type: application/json

{
  "event": "lead_created",
  "data": {...}
}
```

**Description:** Handle automation webhook events

---

## 🔑 AUTHENTICATION

All endpoints require authentication:

**Coach/Staff:**
```http
Authorization: Bearer <jwt_token>
```

**Admin:**
```http
Authorization: Bearer <admin_jwt_token>
```

---

## 📈 KEY FEATURES

1. **Unified Messaging** - Single API for WhatsApp and Email
2. **Credits System** - Automatic credit deduction
3. **Variable Support** - Dynamic template variables from database
4. **Role-Based Access** - Admin/Coach/Staff permissions
5. **Staff Isolation** - Staff sees only assigned leads
6. **24-Hour Window** - Meta compliance tracking
7. **Template Management** - Meta + Local templates
8. **Analytics** - Detailed messaging statistics
9. **Bulk Messaging** - Send to multiple recipients
10. **Automation Ready** - Integration hooks available

---

## 📝 IMPLEMENTATION STATUS

✅ **Fully Implemented:**
- Template variable service
- Send message (WhatsApp/Email)
- Get inbox
- Get contacts
- Get analytics
- Get/create templates
- Admin configuration

🚧 **Placeholder Endpoints (Ready to implement):**
- Bulk messaging details
- Credit management details
- Email/WhatsApp admin setup
- Staff routes
- Automation integration

---

**Total Endpoints:** 40+

**Base Route:** `/api/central-messaging/v1`

