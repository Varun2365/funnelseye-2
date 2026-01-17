# Unified Messaging System - Complete Testing Guide

## Overview
This document provides comprehensive testing instructions for the unified messaging system that supports both WhatsApp and Email messaging for Admin, Coach, and Staff users.

## Base URL
```
http://localhost:8080/api/whatsapp/v1
```

## Authentication
All endpoints require JWT token authentication. Include the token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

---

## 1. ADMIN ENDPOINTS

### 1.1 Central WhatsApp Configuration

#### Setup Central WhatsApp
```http
POST /setup
Content-Type: application/json
Authorization: Bearer <admin_token>

{
  "businessAccountId": "123456789",
  "phoneNumberId": "987654321",
  "accessToken": "your_meta_access_token",
  "webhookVerifyToken": "your_webhook_token"
}
```

#### Get Central WhatsApp Config
```http
GET /config
Authorization: Bearer <admin_token>
```

#### Test WhatsApp Configuration
```http
GET /test-config
Authorization: Bearer <admin_token>
```

#### Health Check
```http
GET /health
Authorization: Bearer <admin_token>
```

### 1.2 Template Management

#### Create Template
```http
POST /templates
Content-Type: application/json
Authorization: Bearer <admin_token>

{
  "name": "welcome_message",
  "category": "UTILITY",
  "language": "en_US",
  "components": [
    {
      "type": "BODY",
      "text": "Welcome {{1}}! Your account is ready."
    }
  ]
}
```

#### Get All Templates
```http
GET /templates
Authorization: Bearer <admin_token>
```

#### Sync Templates from Meta
```http
POST /templates/sync
Authorization: Bearer <admin_token>
```

### 1.3 Message Management

#### Send Admin Message
```http
POST /send-message
Content-Type: application/json
Authorization: Bearer <admin_token>

{
  "to": "+1234567890",
  "message": "Hello from admin!",
  "type": "text"
}
```

#### Send Template Message
```http
POST /send-message
Content-Type: application/json
Authorization: Bearer <admin_token>

{
  "to": "+1234567890",
  "templateName": "welcome_message",
  "language": "en_US",
  "parameters": ["John Doe"]
}
```

#### Send Bulk Messages
```http
POST /send-bulk-messages
Content-Type: application/json
Authorization: Bearer <admin_token>

{
  "contacts": ["+1234567890", "+0987654321"],
  "message": "Bulk message content",
  "templateName": "welcome_message",
  "parameters": ["John", "Jane"]
}
```

#### Get All Messages
```http
GET /messages?page=1&limit=20
Authorization: Bearer <admin_token>
```

#### Get Conversation Messages
```http
GET /messages/conversation/1234567890
Authorization: Bearer <admin_token>
```

### 1.4 Contact Management

#### Get All Contacts
```http
GET /contacts?page=1&limit=20
Authorization: Bearer <admin_token>
```

#### Update Contact Name
```http
PUT /contacts/update
Content-Type: application/json
Authorization: Bearer <admin_token>

{
  "phoneNumber": "+1234567890",
  "name": "John Doe"
}
```

### 1.5 Analytics

#### Get WhatsApp Analytics
```http
GET /analytics
Authorization: Bearer <admin_token>
```

### 1.6 Email Configuration

#### Setup Email Configuration
```http
POST /admin/email/setup
Content-Type: application/json
Authorization: Bearer <admin_token>

{
  "email": "admin@funnelseye.com",
  "password": "app_password",
  "fromName": "FunnelsEye"
}
```

#### Get Email Configuration
```http
GET /admin/email/config
Authorization: Bearer <admin_token>
```

#### Test Email Configuration
```http
POST /admin/email/test-config
Authorization: Bearer <admin_token>
```

#### Get Email Status
```http
GET /admin/email/status
Authorization: Bearer <admin_token>
```

#### Send Test Email
```http
POST /admin/email/send-test
Content-Type: application/json
Authorization: Bearer <admin_token>

{
  "to": "test@example.com",
  "subject": "Test Email",
  "message": "This is a test email from FunnelsEye"
}
```

---

## 2. COACH & STAFF ENDPOINTS

### 2.1 Unified Inbox

#### Get Unified Inbox Messages
```http
GET /messagingv1/unified/inbox?page=1&limit=20&type=whatsapp&within24Hours=true
Authorization: Bearer <coach_or_staff_token>
```

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20)
- `contact`: Filter by contact phone/email
- `type`: Filter by message type (`whatsapp`, `email`, or omit for all)
- `within24Hours`: Filter contacts within Meta 24-hour window (`true`/`false`)

**Response:**
```json
{
  "success": true,
  "data": {
    "messages": [
      {
        "_id": "message_id",
        "messageType": "whatsapp",
        "from": "+1234567890",
        "to": "+0987654321",
        "body": "Hello!",
        "timestamp": "2024-01-01T10:00:00Z",
        "isRead": false,
        "direction": "inbound"
      }
    ],
    "conversations": [
      {
        "_id": "+1234567890",
        "lastMessage": {...},
        "unreadCount": 2,
        "totalMessages": 5,
        "messageType": "whatsapp"
      }
    ],
    "stats": {
      "whatsapp": 15,
      "email": 8,
      "total": 23
    },
    "pagination": {
      "current": 1,
      "pages": 2,
      "total": 23,
      "limit": 20
    }
  }
}
```

### 2.2 Unified Templates

#### Get Available Templates
```http
GET /messagingv1/unified/templates
Authorization: Bearer <coach_or_staff_token>
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "templateId": "template_id",
      "templateName": "welcome_message",
      "category": "UTILITY",
      "status": "APPROVED",
      "language": "en_US",
      "components": [...]
    }
  ]
}
```

### 2.3 Send Messages

#### Send Unified Message (WhatsApp)
```http
POST /messagingv1/unified/send
Content-Type: application/json
Authorization: Bearer <coach_or_staff_token>

{
  "to": "+1234567890",
  "message": "Hello from coach!",
  "messageType": "whatsapp",
  "type": "text"
}
```

#### Send Unified Message (Email)
```http
POST /messagingv1/unified/send
Content-Type: application/json
Authorization: Bearer <coach_or_staff_token>

{
  "to": "customer@example.com",
  "subject": "Important Update",
  "emailBody": "Hello! This is an important update.",
  "messageType": "email"
}
```

#### Send Template Message
```http
POST /messagingv1/unified/send
Content-Type: application/json
Authorization: Bearer <coach_or_staff_token>

{
  "to": "+1234567890",
  "templateName": "welcome_message",
  "language": "en_US",
  "parameters": ["John Doe"],
  "messageType": "whatsapp",
  "type": "template"
}
```

#### Send Media Message
```http
POST /messagingv1/unified/send
Content-Type: application/json
Authorization: Bearer <coach_or_staff_token>

{
  "to": "+1234567890",
  "mediaUrl": "https://example.com/image.jpg",
  "mediaType": "image",
  "caption": "Check this out!",
  "messageType": "whatsapp",
  "type": "media"
}
```

### 2.4 Bulk Messages

#### Send Bulk Messages
```http
POST /messagingv1/unified/send-bulk
Content-Type: application/json
Authorization: Bearer <coach_or_staff_token>

{
  "recipients": ["+1234567890", "+0987654321"],
  "message": "Bulk message content",
  "templateName": "welcome_message",
  "templateParameters": ["John", "Jane"],
  "messageType": "whatsapp"
}
```

### 2.5 Conversation History

#### Get Conversation Messages
```http
GET /messagingv1/unified/inbox/conversation/+1234567890?page=1&limit=50
Authorization: Bearer <coach_or_staff_token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "messages": [
      {
        "_id": "message_id",
        "messageType": "whatsapp",
        "from": "+1234567890",
        "to": "+0987654321",
        "body": "Hello!",
        "timestamp": "2024-01-01T10:00:00Z",
        "direction": "inbound"
      }
    ],
    "stats": {
      "whatsapp": 10,
      "email": 5,
      "total": 15
    },
    "pagination": {
      "current": 1,
      "pages": 1,
      "total": 15,
      "limit": 50
    }
  }
}
```

### 2.6 Parameter Options

#### Get Available Parameters
```http
GET /messagingv1/unified/parameter-options
Authorization: Bearer <coach_or_staff_token>
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
  }
}
```

### 2.7 24-Hour Window Contacts

#### Get Contacts Within Meta 24-Hour Window
```http
GET /messagingv1/unified/24hr-contacts?page=1&limit=20
Authorization: Bearer <coach_or_staff_token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "contacts": [
      {
        "_id": "+1234567890",
        "lastMessage": {...},
        "messageCount": 3,
        "windowExpiresAt": "2024-01-02T10:00:00Z",
        "messageType": "whatsapp"
      }
    ],
    "stats": {
      "whatsapp": 8,
      "email": 3,
      "total": 11
    },
    "pagination": {
      "current": 1,
      "pages": 1,
      "total": 11,
      "limit": 20
    }
  }
}
```

### 2.8 Queue Management

#### Send Message via Queue
```http
POST /messagingv1/unified/send-with-queue
Content-Type: application/json
Authorization: Bearer <coach_or_staff_token>

{
  "to": "+1234567890",
  "message": "Queued message",
  "messageType": "whatsapp",
  "type": "text",
  "scheduleFor": "2024-01-01T15:00:00Z"
}
```

#### Get Queue Statistics
```http
GET /messagingv1/unified/queue-stats
Authorization: Bearer <coach_or_staff_token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "whatsapp": {
      "name": "whatsapp_messages",
      "messageCount": 5,
      "consumerCount": 1
    },
    "email": {
      "name": "email_messages",
      "messageCount": 3,
      "consumerCount": 1
    },
    "bulk": {
      "name": "bulk_messages",
      "messageCount": 0,
      "consumerCount": 1
    },
    "scheduled": {
      "name": "scheduled_messages",
      "messageCount": 2,
      "consumerCount": 1
    }
  }
}
```

---

## 3. TESTING SCENARIOS

### 3.1 Admin Testing

1. **Setup Central WhatsApp**
   - Configure business account ID, phone number ID, and access token
   - Test configuration with health check
   - Create and sync templates

2. **Template Management**
   - Create new template with variables
   - Sync templates from Meta
   - Test template approval status

3. **Message Sending**
   - Send text message
   - Send template message with parameters
   - Send bulk messages to multiple contacts

4. **Email Configuration**
   - Setup email provider (Gmail, Outlook, etc.)
   - Test email configuration
   - Send test email

### 3.2 Coach Testing

1. **Inbox Management**
   - View unified inbox with WhatsApp and Email messages
   - Filter by message type
   - Filter by 24-hour window contacts
   - View conversation history

2. **Message Sending**
   - Send WhatsApp text message
   - Send email message
   - Send template message
   - Send media message

3. **Bulk Messaging**
   - Send bulk WhatsApp messages
   - Send bulk email messages
   - Use template parameters

4. **Queue Management**
   - Send messages via queue
   - Schedule messages for later
   - Monitor queue statistics

### 3.3 Staff Testing

1. **Access Control**
   - Verify staff can only see assigned coach's messages
   - Test role-based permissions
   - Verify data isolation

2. **Messaging Features**
   - Send messages on behalf of coach
   - View assigned templates only
   - Access 24-hour window contacts

### 3.4 Integration Testing

1. **RabbitMQ Queue**
   - Test message queuing
   - Verify message processing
   - Test error handling and retries

2. **Meta 24-Hour Window**
   - Test window tracking
   - Verify contact filtering
   - Test window expiration

3. **Unified Messaging**
   - Test WhatsApp and Email integration
   - Verify message type filtering
   - Test conversation grouping

---

## 4. ERROR HANDLING

### Common Error Responses

#### 400 Bad Request
```json
{
  "success": false,
  "message": "Recipient is required"
}
```

#### 401 Unauthorized
```json
{
  "success": false,
  "message": "Invalid or expired token"
}
```

#### 402 Payment Required
```json
{
  "success": false,
  "message": "Insufficient credits to send messages",
  "data": {
    "balance": 5,
    "required": 1
  }
}
```

#### 404 Not Found
```json
{
  "success": false,
  "message": "Template not found"
}
```

#### 500 Internal Server Error
```json
{
  "success": false,
  "message": "Failed to send message",
  "error": "Detailed error message"
}
```

### Template-Specific Errors
```json
{
  "success": false,
  "message": "Template Error: Template 'welcome_message' is not approved. Current status: PENDING"
}
```

---

## 5. PERFORMANCE TESTING

### Load Testing Scenarios

1. **Bulk Message Sending**
   - Test with 100, 500, 1000 recipients
   - Monitor queue processing time
   - Verify message delivery rates

2. **Concurrent Users**
   - Test with multiple coaches/staff sending messages simultaneously
   - Monitor system performance
   - Verify data consistency

3. **Large Inbox**
   - Test inbox with 10,000+ messages
   - Verify pagination performance
   - Test search and filtering

---

## 6. SECURITY TESTING

### Authentication & Authorization

1. **Token Validation**
   - Test with invalid tokens
   - Test with expired tokens
   - Test with tokens from different user types

2. **Role-Based Access**
   - Verify admin access to all data
   - Verify coach access to own data
   - Verify staff access to assigned coach's data

3. **Data Isolation**
   - Test cross-coach data access
   - Verify staff cannot access other coaches' data
   - Test admin override capabilities

---

## 7. MONITORING & LOGGING

### Key Metrics to Monitor

1. **Message Delivery**
   - Success rate
   - Failure rate
   - Average delivery time

2. **Queue Performance**
   - Queue depth
   - Processing time
   - Error rates

3. **System Health**
   - API response times
   - Database performance
   - Memory usage

### Log Analysis

Monitor logs for:
- Message processing errors
- Queue failures
- Authentication issues
- Performance bottlenecks

---

## 8. DEPLOYMENT CHECKLIST

### Pre-Deployment

- [ ] RabbitMQ server running
- [ ] Database connections configured
- [ ] Meta API credentials valid
- [ ] Email provider configured
- [ ] Webhook endpoints configured

### Post-Deployment

- [ ] Health checks passing
- [ ] Template sync working
- [ ] Message queuing functional
- [ ] Email sending working
- [ ] 24-hour window tracking active

---

## 9. TROUBLESHOOTING

### Common Issues

1. **Messages Not Sending**
   - Check RabbitMQ connection
   - Verify Meta API credentials
   - Check template approval status

2. **Queue Processing Failures**
   - Monitor queue statistics
   - Check error logs
   - Verify service dependencies

3. **24-Hour Window Issues**
   - Check webhook configuration
   - Verify message tracking
   - Monitor window expiration

4. **Email Delivery Problems**
   - Verify email provider configuration
   - Check SMTP credentials
   - Monitor email queue

---

## 10. API VERSIONING

Current API Version: `v1`

All endpoints are prefixed with `/api/whatsapp/v1/`

Future versions will maintain backward compatibility where possible.

---

## 11. SUPPORT

For technical support or questions:
- Check system logs
- Monitor queue statistics
- Verify configuration settings
- Contact system administrator

---

*Last Updated: January 2024*
*Version: 1.0*
