# Backend Setup Guide - Profile & Email Features

## 🎯 What's Been Implemented

Your backend now has full support for:

1. ✅ **User Profile Management**
   - Get current user profile
   - Update user profile (name, email, phone, profile image)

2. ✅ **Email with PDF Attachments**
   - Send invoices with PDF attachments
   - Send receipts with PDF attachments

---

## 🚀 Quick Start

### No Installation Required!
All code has been added to your existing files. No new dependencies needed. The `emailService` already supports attachments via Resend.

### 4 New API Endpoints

#### 1. **Get User Profile**
```
GET /api/auth/me
Authorization: Bearer <jwt_token>
```
Returns current user profile data.

#### 2. **Update User Profile**
```
PUT /api/auth/update-profile
Authorization: Bearer <jwt_token>
Content-Type: application/json

Body:
{
  "name": "New Name",
  "email": "newemail@example.com",
  "phone": "+254...",
  "profileImage": "image_url"
}
```

#### 3. **Send Invoice with PDF**
```
POST /api/invoices/:id/send-with-pdf
Authorization: Bearer <jwt_token>
Content-Type: application/json

Body:
{
  "customerEmail": "customer@example.com",
  "customerName": "Customer Name",
  "invoiceNumber": "INV-001",
  "pdfData": "data:application/pdf;base64,JVBERi0xLjQK..."
}
```

#### 4. **Send Receipt with PDF**
```
POST /api/receipts/:id/send-with-pdf
Authorization: Bearer <jwt_token>
Content-Type: application/json

Body:
{
  "customerEmail": "customer@example.com",
  "customerName": "Customer Name",
  "receiptNumber": "RCP-001",
  "pdfData": "data:application/pdf;base64,JVBERi0xLjQK..."
}
```

---

## 📋 Files Modified

### Backend Files:
- ✅ `backend/src/controllers/authController.js` - Added `getMe()` and `updateProfile()` functions
- ✅ `backend/src/routes/authRoutes.js` - Added routes for `/me` and `/update-profile`
- ✅ `backend/src/controllers/invoiceController.js` - Added `sendInvoiceWithPdf()` function
- ✅ `backend/src/routes/invoiceRoutes.js` - Added `/send-with-pdf` route
- ✅ `backend/src/controllers/receiptController.js` - Added `sendReceiptWithPdf()` function
- ✅ `backend/src/routes/receipts.js` - Added `/send-with-pdf` route

### Summary Document:
- ✅ `BACKEND_CHANGES_SUMMARY.md` - Detailed documentation of all changes

---

## 🔍 Frontend Integration

Your Frontend (Dashboard.jsx) is already updated and will call these endpoints:

1. **On Page Load**: `GET /api/auth/me` to fetch user profile
2. **When Editing Profile**: `PUT /api/auth/update-profile` to save changes
3. **When Sending Invoices**: `POST /api/invoices/:id/send-with-pdf` with base64 PDF
4. **When Sending Receipts**: `POST /api/receipts/:id/send-with-pdf` with base64 PDF

---

## 🧪 Testing

### Test with cURL:

**Test 1: Get User Profile**
```bash
curl -X GET http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Test 2: Update Profile**
```bash
curl -X PUT http://localhost:5000/api/auth/update-profile \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "New Name",
    "email": "newemail@example.com"
  }'
```

**Test 3: Send Invoice with PDF**
```bash
curl -X POST http://localhost:5000/api/invoices/INVOICE_ID/send-with-pdf \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "customerEmail": "customer@example.com",
    "customerName": "John Doe",
    "invoiceNumber": "INV-001",
    "pdfData": "data:application/pdf;base64,JVBERi0xLjQK..."
  }'
```

---

## ✨ Key Features

### Profile Management
- ✅ Get user with all fields (name, email, phone, role, profileImage, createdAt)
- ✅ Update any profile field individually
- ✅ Email uniqueness validation
- ✅ Protected routes (requires JWT)

### Email with Attachments
- ✅ Accept base64 PDF from frontend
- ✅ Convert base64 to Buffer safely
- ✅ Send email with PDF attachment via Resend
- ✅ Track email sends in database
- ✅ Graceful error handling

### Security
- ✅ All endpoints protected with JWT authentication
- ✅ User can only update their own profile
- ✅ Email validation prevents invalid recipients
- ✅ PDF data validated before processing

---

## 🐛 Debugging

### Check Email Logs
Look for messages like:
```
📤 Sending email via Resend to: customer@example.com
✅ Email sent successfully. Message ID: msg_...
```

### Check Database Updates
After sending an invoice/receipt, these fields should be updated:
```javascript
{
  sentToCustomer: true,
  lastSentAt: <current_date>,
  sendCount: <incremented>
}
```

### Common Issues

**"Email authentication failed"**
- Check `RESEND_API_KEY` in `.env`
- Verify domain is verified in Resend dashboard

**"Customer email is missing"**
- Ensure invoice/receipt has customerEmail field

**"Invalid PDF data"**
- Verify pdfData is valid base64 string
- Check it includes the "data:application/pdf;base64," prefix

---

## 📚 Environment Variables

Ensure your `.env` file has:
```
# Email Configuration
RESEND_API_KEY=<your_key>
EMAIL_FROM=support@optimaswifi.co.ke
EMAIL_TEST_RECIPIENT=test@example.com

# Company Info (for email templates)
COMPANY_NAME=Optimas Fiber
COMPANY_PHONE=+254741874200
COMPANY_ADDRESS=Nairobi, Kenya
MPESA_PAYBILL=123456
BANK_NAME=Equity Bank
BANK_ACCOUNT_NUMBER=1234567890

# JWT
JWT_SECRET=<your_secret>
JWT_REFRESH_SECRET=<your_refresh_secret>
```

---

## 🎓 Architecture Overview

```
Frontend (React/Vite)
    ↓
[Dashboard.jsx generates PDF via html2pdf]
    ↓
[Converts PDF to Base64 string]
    ↓
[Sends to Backend API]
    ↓
Backend
    ├─ authController: Profile get/update
    ├─ invoiceController: Send invoice with PDF
    └─ receiptController: Send receipt with PDF
    ↓
emailService.sendEmail()
    ↓
Resend API
    ↓
Customer Email
```

---

## ✅ Verification Checklist

Before deploying, verify:

- [ ] All imports are added correctly
- [ ] Routes are registered with middleware
- [ ] Environment variables are set
- [ ] JWT token is valid for testing
- [ ] emailService receives attachments correctly
- [ ] Database fields are updated after sending
- [ ] Error messages are user-friendly
- [ ] Base64 PDF conversion works
- [ ] Email headers contain proper From address

---

## 🆘 Need Help?

Check the `BACKEND_CHANGES_SUMMARY.md` file for:
- Detailed endpoint documentation
- Request/response examples
- Error handling details
- Database field tracking
- Flow diagrams

All the code is backward compatible. No existing functionality has been modified.

Happy deploying! 🚀
