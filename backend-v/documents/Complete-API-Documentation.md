# Complete API Documentation for Frontend Implementation

## 📋 Table of Contents

1. [System Overview](#system-overview)
2. [Authentication](#authentication)
3. [Base URLs](#base-urls)
4. [Admin Endpoints](#admin-endpoints)
5. [Coach & Staff Endpoints](#coach--staff-endpoints)
6. [Unified Messaging Endpoints](#unified-messaging-endpoints)
7. [Error Handling](#error-handling)
8. [Frontend Implementation Guide](#frontend-implementation-guide)

## 🎯 System Overview

The unified messaging system provides:
- **Central WhatsApp Management** via Meta Business API
- **Central Email Management** via SMTP providers
- **Unified Inbox** for WhatsApp and Email messages
- **Role-based Access Control** (Admin, Coach, Staff)
- **Template Management** with parameter mapping
- **Bulk Messaging** capabilities
- **24-hour Window Tracking** for Meta compliance
- **RabbitMQ Queuing** for reliable message delivery

## 🔐 Authentication

### Admin Authentication
```javascript
// Headers for Admin requests
{
  "Authorization": "Bearer <admin_jwt_token>",
  "Content-Type": "application/json"
}
```

### Coach/Staff Authentication
```javascript
// Headers for Coach/Staff requests
{
  "Authorization": "Bearer <user_jwt_token>",
  "Content-Type": "application/json"
}
```

## 🌐 Base URLs

- **Main API**: `http://localhost:8080/api/whatsapp/v1`
- **Admin Central WhatsApp**: `http://localhost:8080/api/admin/central-whatsapp`
- **Unified Messaging**: `http://localhost:8080/api/whatsapp/v1/messagingv1`
- **Legacy Messaging**: `http://localhost:8080/api/whatsapp/v1/messaging`

---

## 👨‍💼 ADMIN ENDPOINTS

### 1. Central WhatsApp Configuration

#### Setup Central WhatsApp
```http
POST /api/whatsapp/v1/setup
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "businessAccountId": "123456789",
  "phoneNumberId": "987654321",
  "accessToken": "your_meta_access_token",
  "webhookVerifyToken": "your_webhook_token"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Central WhatsApp configured successfully",
  "data": {
    "businessAccountId": "123456789",
    "phoneNumberId": "987654321",
    "isConfigured": true,
    "lastUpdated": "2024-01-15T10:30:00Z"
  }
}
```

#### Get Central WhatsApp Config
```http
GET /api/whatsapp/v1/config
Authorization: Bearer <admin_token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "businessAccountId": "123456789",
    "phoneNumberId": "987654321",
    "isConfigured": true,
    "lastSyncAt": "2024-01-15T10:30:00Z",
    "templates": [
      {
        "templateId": "template_123",
        "templateName": "welcome_message",
        "status": "APPROVED",
        "category": "UTILITY",
        "language": "en_US"
      }
    ]
  }
}
```

#### Update Central WhatsApp Config
```http
PUT /api/whatsapp/v1/config
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "businessAccountId": "123456789",
  "phoneNumberId": "987654321",
  "accessToken": "updated_access_token"
}
```

#### Test WhatsApp Configuration
```http
GET /api/whatsapp/v1/test-config
Authorization: Bearer <admin_token>
```

**Response:**
```json
{
  "success": true,
  "message": "Configuration test successful",
  "data": {
    "isValid": true,
    "businessAccountId": "123456789",
    "phoneNumberId": "987654321",
    "webhookStatus": "active"
  }
}
```

#### Health Check
```http
GET /api/whatsapp/v1/health
Authorization: Bearer <admin_token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "timestamp": "2024-01-15T10:30:00Z",
    "services": {
      "metaApi": "connected",
      "database": "connected",
      "webhook": "active"
    }
  }
}
```

### 2. Template Management

#### Create WhatsApp Template
```http
POST /api/whatsapp/v1/templates
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "name": "welcome_message",
  "category": "UTILITY",
  "language": "en_US",
  "components": [
    {
      "type": "BODY",
      "text": "Hello {{1}}, welcome to our service!"
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "message": "Template created successfully",
  "data": {
    "templateId": "template_123",
    "templateName": "welcome_message",
    "status": "PENDING",
    "category": "UTILITY",
    "language": "en_US",
    "createdAt": "2024-01-15T10:30:00Z"
  }
}
```

#### Get All Templates
```http
GET /api/whatsapp/v1/templates
Authorization: Bearer <admin_token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "templates": [
      {
        "templateId": "template_123",
        "templateName": "welcome_message",
        "status": "APPROVED",
        "category": "UTILITY",
        "language": "en_US",
        "components": [
          {
            "type": "BODY",
            "text": "Hello {{1}}, welcome to our service!"
          }
        ],
        "createdAt": "2024-01-15T10:30:00Z",
        "approvedAt": "2024-01-15T11:00:00Z"
      }
    ],
    "total": 1
  }
}
```

#### Sync Templates from Meta
```http
POST /api/whatsapp/v1/templates/sync
Authorization: Bearer <admin_token>
```

**Response:**
```json
{
  "success": true,
  "message": "Templates synced successfully",
  "data": {
    "syncedTemplates": 5,
    "totalTemplates": 5,
    "changes": {
      "added": 2,
      "updated": 3,
      "removed": 0
    },
    "summary": "+2 added, 3 updated, -0 removed"
  }
}
```

### 3. Contact Management

#### Get Contacts
```http
GET /api/whatsapp/v1/contacts
Authorization: Bearer <admin_token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "contacts": [
      {
        "contactId": "contact_123",
        "name": "John Doe",
        "phone": "+1234567890",
        "email": "john@example.com",
        "lastMessage": "2024-01-15T10:30:00Z",
        "messageCount": 5
      }
    ],
    "total": 1
  }
}
```

#### Update Contact Name
```http
PUT /api/whatsapp/v1/contacts/update
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "contactId": "contact_123",
  "name": "John Smith"
}
```

### 4. Message Management

#### Send Message as Admin
```http
POST /api/whatsapp/v1/send-message
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "to": "+1234567890",
  "type": "text",
  "message": "Hello from admin!"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Message sent successfully",
  "data": {
    "messageId": "msg_123",
    "recipient": "+1234567890",
    "status": "sent",
    "timestamp": "2024-01-15T10:30:00Z"
  }
}
```

#### Send Template Message
```http
POST /api/whatsapp/v1/send-message
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "to": "+1234567890",
  "type": "template",
  "templateId": "template_123",
  "templateParameters": ["John"]
}
```

#### Send Bulk Messages
```http
POST /api/whatsapp/v1/send-bulk-messages
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "recipients": [
    "+1234567890",
    "+0987654321"
  ],
  "type": "text",
  "message": "Bulk message from admin"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Bulk messages sent successfully",
  "data": {
    "totalRecipients": 2,
    "successful": 2,
    "failed": 0,
    "messageIds": ["msg_123", "msg_124"],
    "timestamp": "2024-01-15T10:30:00Z"
  }
}
```

#### Get All Messages
```http
GET /api/whatsapp/v1/messages
Authorization: Bearer <admin_token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "messages": [
      {
        "messageId": "msg_123",
        "from": "+1234567890",
        "to": "+0987654321",
        "type": "text",
        "content": "Hello!",
        "direction": "inbound",
        "timestamp": "2024-01-15T10:30:00Z",
        "status": "delivered"
      }
    ],
    "total": 1,
    "pagination": {
      "current": 1,
      "pages": 1,
      "total": 1,
      "limit": 20
    }
  }
}
```

#### Get Conversation Messages
```http
GET /api/whatsapp/v1/messages/conversation/conversation_123
Authorization: Bearer <admin_token>
```

#### Get Messages by Coach
```http
GET /api/whatsapp/v1/messages/coach/coach_123
Authorization: Bearer <admin_token>
```

#### Get Messages by Lead
```http
GET /api/whatsapp/v1/messages/lead/lead_123
Authorization: Bearer <admin_token>
```

### 5. Analytics

#### Get WhatsApp Analytics
```http
GET /api/whatsapp/v1/analytics
Authorization: Bearer <admin_token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "totalMessages": 1500,
    "messagesToday": 50,
    "messagesThisWeek": 300,
    "messagesThisMonth": 1200,
    "templatesUsed": 8,
    "activeContacts": 250,
    "deliveryRate": 98.5,
    "responseRate": 75.2,
    "topTemplates": [
      {
        "templateName": "welcome_message",
        "usageCount": 100
      }
    ],
    "dailyStats": [
      {
        "date": "2024-01-15",
        "messages": 50,
        "delivered": 49,
        "failed": 1
      }
    ]
  }
}
```

### 6. Central Email Configuration

#### Get Email Config
```http
GET /api/whatsapp/v1/admin/email/config
Authorization: Bearer <admin_token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "provider": "gmail",
    "host": "smtp.gmail.com",
    "port": 587,
    "secure": false,
    "auth": {
      "user": "admin@example.com"
    },
    "isConfigured": true,
    "lastUpdated": "2024-01-15T10:30:00Z"
  }
}
```

#### Setup Email Config
```http
POST /api/whatsapp/v1/admin/email/setup
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "provider": "gmail",
  "host": "smtp.gmail.com",
  "port": 587,
  "secure": false,
  "auth": {
    "user": "admin@example.com",
    "pass": "app_password"
  }
}
```

#### Test Email Config
```http
POST /api/whatsapp/v1/admin/email/test-config
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "to": "test@example.com",
  "subject": "Test Email",
  "body": "This is a test email"
}
```

#### Get Email Status
```http
GET /api/whatsapp/v1/admin/email/status
Authorization: Bearer <admin_token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "isConfigured": true,
    "isConnected": true,
    "lastTest": "2024-01-15T10:30:00Z",
    "dailyLimit": 1000,
    "emailsSentToday": 50,
    "provider": "gmail"
  }
}
```

#### Send Test Email
```http
POST /api/whatsapp/v1/admin/email/send-test
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "to": "test@example.com",
  "subject": "Test Email from Admin",
  "body": "This is a test email from the admin panel"
}
```

---

## 👥 COACH & STAFF ENDPOINTS

### 1. Unified Inbox

#### Get Unified Inbox Messages
```http
GET /api/whatsapp/v1/messagingv1/unified/inbox
Authorization: Bearer <user_token>
```

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20)
- `contact` (optional): Filter by contact name/phone/email
- `type` (optional): Filter by message type (`whatsapp`, `email`)
- `within24Hours` (optional): Filter contacts within 24-hour window (`true`, `false`)

**Response:**
```json
{
  "success": true,
  "data": {
    "messages": [
      {
        "_id": "msg_123",
        "from": "+1234567890",
        "to": "+0987654321",
        "type": "text",
        "content": "Hello!",
        "direction": "inbound",
        "timestamp": "2024-01-15T10:30:00Z",
        "status": "delivered",
        "messageType": "whatsapp",
        "isRead": false
      },
      {
        "_id": "email_123",
        "from": {
          "name": "John Doe",
          "email": "john@example.com"
        },
        "to": [{
          "name": "Coach",
          "email": "coach@example.com"
        }],
        "subject": "Inquiry",
        "body": "Hello, I have a question...",
        "direction": "inbound",
        "timestamp": "2024-01-15T10:25:00Z",
        "status": "delivered",
        "messageType": "email",
        "isRead": false
      }
    ],
    "conversations": [
      {
        "_id": "+1234567890",
        "lastMessage": {
          "content": "Hello!",
          "timestamp": "2024-01-15T10:30:00Z",
          "messageType": "whatsapp"
        },
        "unreadCount": 2,
        "totalMessages": 5,
        "messageType": "whatsapp"
      }
    ],
    "userType": "coach",
    "stats": {
      "whatsapp": 10,
      "email": 5,
      "total": 15
    },
    "pagination": {
      "current": 1,
      "pages": 1,
      "total": 15,
      "limit": 20
    }
  }
}
```

#### Get Unified Conversation
```http
GET /api/whatsapp/v1/messagingv1/unified/inbox/conversation/contact_123
Authorization: Bearer <user_token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "contactId": "contact_123",
    "contact": {
      "name": "John Doe",
      "phone": "+1234567890",
      "email": "john@example.com"
    },
    "messages": [
      {
        "_id": "msg_123",
        "from": "+1234567890",
        "to": "+0987654321",
        "type": "text",
        "content": "Hello!",
        "direction": "inbound",
        "timestamp": "2024-01-15T10:30:00Z",
        "status": "delivered",
        "messageType": "whatsapp"
      },
      {
        "_id": "email_123",
        "from": {
          "name": "John Doe",
          "email": "john@example.com"
        },
        "to": [{
          "name": "Coach",
          "email": "coach@example.com"
        }],
        "subject": "Follow up",
        "body": "Thank you for your response!",
        "direction": "outbound",
        "timestamp": "2024-01-15T10:35:00Z",
        "status": "sent",
        "messageType": "email"
      }
    ],
    "total": 2,
    "userType": "coach"
  }
}
```

### 2. Unified Templates

#### Get Unified Templates
```http
GET /api/whatsapp/v1/messagingv1/unified/templates
Authorization: Bearer <user_token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "templates": [
      {
        "templateId": "template_123",
        "templateName": "welcome_message",
        "status": "APPROVED",
        "category": "UTILITY",
        "language": "en_US",
        "components": [
          {
            "type": "BODY",
            "text": "Hello {{1}}, welcome to our service!"
          }
        ],
        "createdAt": "2024-01-15T10:30:00Z",
        "approvedAt": "2024-01-15T11:00:00Z"
      }
    ],
    "total": 1,
    "userType": "coach"
  }
}
```

### 3. Send Messages

#### Send Unified Message
```http
POST /api/whatsapp/v1/messagingv1/unified/send
Authorization: Bearer <user_token>
Content-Type: application/json

{
  "to": "+1234567890",
  "messageType": "whatsapp",
  "type": "text",
  "message": "Hello from coach!"
}
```

**WhatsApp Template Message:**
```json
{
  "to": "+1234567890",
  "messageType": "whatsapp",
  "type": "template",
  "templateName": "welcome_message",
  "templateParameters": ["John"]
}
```

**Email Message:**
```json
{
  "to": "john@example.com",
  "messageType": "email",
  "subject": "Follow up",
  "emailBody": "Hello John, thank you for your inquiry..."
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "messageId": "queued_1642248600000",
    "status": "queued",
    "recipient": "+1234567890",
    "messageType": "whatsapp"
  },
  "userType": "coach",
  "message": "Message sent successfully"
}
```

#### Send Bulk Messages
```http
POST /api/whatsapp/v1/messagingv1/unified/send-bulk
Authorization: Bearer <user_token>
Content-Type: application/json

{
  "recipients": [
    "+1234567890",
    "+0987654321"
  ],
  "messageType": "whatsapp",
  "type": "text",
  "message": "Bulk message from coach"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "totalRecipients": 2,
    "successful": 2,
    "failed": 0,
    "messageIds": ["queued_1642248600000", "queued_1642248600001"],
    "timestamp": "2024-01-15T10:30:00Z"
  },
  "userType": "coach",
  "message": "Bulk messages sent successfully"
}
```

### 4. Parameter Options

#### Get Parameter Options
```http
GET /api/whatsapp/v1/messagingv1/unified/parameter-options
Authorization: Bearer <user_token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "lead": {
      "firstName": "Lead First Name",
      "lastName": "Lead Last Name",
      "fullName": "Lead Full Name",
      "phone": "Lead Phone Number",
      "email": "Lead Email Address",
      "company": "Lead Company",
      "source": "Lead Source",
      "status": "Lead Status"
    },
    "coach": {
      "firstName": "Coach First Name",
      "lastName": "Coach Last Name",
      "fullName": "Coach Full Name",
      "phone": "Coach Phone Number",
      "email": "Coach Email Address",
      "company": "Coach Company"
    },
    "system": {
      "currentDate": "Current Date",
      "currentTime": "Current Time",
      "currentDateTime": "Current Date & Time",
      "platformName": "Platform Name (FunnelsEye)"
    },
    "custom": {}
  },
  "userType": "coach"
}
```

### 5. 24-Hour Window Contacts

#### Get 24-Hour Contacts
```http
GET /api/whatsapp/v1/messagingv1/unified/24hr-contacts
Authorization: Bearer <user_token>
```

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20)

**Response:**
```json
{
  "success": true,
  "data": {
    "contacts": [
      {
        "_id": "+1234567890",
        "lastMessage": {
          "content": "Hello!",
          "timestamp": "2024-01-15T10:30:00Z",
          "messageType": "whatsapp"
        },
        "messageCount": 3,
        "windowExpiresAt": "2024-01-16T10:30:00Z",
        "messageType": "whatsapp"
      }
    ],
    "stats": {
      "whatsapp": 5,
      "email": 2,
      "total": 7
    },
    "pagination": {
      "current": 1,
      "pages": 1,
      "total": 7,
      "limit": 20
    }
  },
  "userType": "coach"
}
```

### 6. Queue Statistics

#### Get Queue Stats (Admin Only)
```http
GET /api/whatsapp/v1/messagingv1/unified/queue-stats
Authorization: Bearer <admin_token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "whatsappQueue": {
      "name": "whatsapp_messages",
      "messageCount": 15,
      "consumerCount": 1
    },
    "emailQueue": {
      "name": "email_messages",
      "messageCount": 8,
      "consumerCount": 1
    }
  },
  "userType": "admin"
}
```

---

## 🔧 ERROR HANDLING

### Common Error Responses

#### 400 Bad Request
```json
{
  "success": false,
  "message": "Validation error",
  "error": "Missing required field: 'to'"
}
```

#### 401 Unauthorized
```json
{
  "success": false,
  "message": "Unauthorized access",
  "error": "Invalid or expired token"
}
```

#### 403 Forbidden
```json
{
  "success": false,
  "message": "Access forbidden",
  "error": "Insufficient permissions"
}
```

#### 404 Not Found
```json
{
  "success": false,
  "message": "Resource not found",
  "error": "Template 'invalid_template' not found"
}
```

#### 500 Internal Server Error
```json
{
  "success": false,
  "message": "Internal server error",
  "error": "Database connection failed"
}
```

### WhatsApp-Specific Errors

#### Template Not Found
```json
{
  "success": false,
  "message": "Template Error: Template 'otp_v1' not found or not approved",
  "error": {
    "code": "TEMPLATE_NOT_FOUND",
    "details": "Template name does not exist in the translation"
  }
}
```

#### Insufficient Credits
```json
{
  "success": false,
  "message": "Insufficient credits to send messages",
  "data": {
    "balance": 0,
    "required": 1
  }
}
```

---

## 📝 API IMPLEMENTATION NOTES

### Key Changes Made

1. **RabbitMQ Queue Access**: Now restricted to Admin only
2. **Message Sending Logic**: Updated to match admin panel implementation
3. **Template Parameters**: Changed from `templateId` to `templateName` for consistency
4. **Error Handling**: Enhanced with specific template error handling

### Important Implementation Details

- **Admin Messages**: Don't use credits and have full access to all features
- **Coach/Staff Messages**: Use credits and have role-based restrictions
- **Template Messages**: Use `templateName` instead of `templateId` in requests
- **Queue Statistics**: Only accessible by Admin users
- **24-Hour Window**: Tracks Meta's messaging window for compliance

### Request/Response Patterns

All endpoints follow consistent patterns:
- **Success Responses**: Always include `success: true` and `data` object
- **Error Responses**: Include `success: false`, `message`, and `error` details
- **Pagination**: Standard format with `current`, `pages`, `total`, `limit`
- **User Context**: Responses include `userType` for role-based handling

This documentation provides everything needed for frontend implementation with clear endpoint specifications, request/response examples, and implementation guidelines.
