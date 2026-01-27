# Backend Changes Summary - Profile & Email Attachment Support

## Overview
Added complete backend support for:
1. **User Profile Management** - Get and update user profiles
2. **Email with PDF Attachments** - Send invoices and receipts with base64 PDF attachments

---

## Files Modified

### 1. **authController.js** ✅
Added two new endpoints:

#### `GET /api/auth/me` 
- **Function**: `getMe()`
- **Purpose**: Fetch current user profile
- **Protected**: Yes (requires JWT token)
- **Response**:
```json
{
  "success": true,
  "user": {
    "id": "user_id",
    "name": "User Name",
    "email": "user@email.com",
    "phone": "+254...",
    "role": "admin",
    "profileImage": "image_url",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

#### `PUT /api/auth/update-profile`
- **Function**: `updateProfile()`
- **Purpose**: Update user profile (name, email, phone, profileImage)
- **Protected**: Yes (requires JWT token)
- **Request Body**:
```json
{
  "name": "New Name",
  "email": "newemail@example.com",
  "phone": "+254...",
  "profileImage": "image_url"
}
```
- **Features**:
  - Validates email uniqueness if changed
  - Validates all fields using User model validators
  - Returns updated user object

---

### 2. **authRoutes.js** ✅
Added imports and routes:
```javascript
import { getMe, updateProfile } from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

// Routes
router.get('/me', protect, getMe);
router.put('/update-profile', protect, updateProfile);
```

---

### 3. **invoiceController.js** ✅
Added new endpoint:

#### `POST /api/invoices/:id/send-with-pdf`
- **Function**: `sendInvoiceWithPdf()`
- **Purpose**: Send invoice with PDF attachment received from frontend (base64)
- **Protected**: Yes (via route middleware)
- **Request Body**:
```json
{
  "customerEmail": "customer@email.com",
  "customerName": "Customer Name",
  "invoiceNumber": "INV-001",
  "pdfData": "data:application/pdf;base64,JVBERi0xLjQK..."
}
```
- **Features**:
  - Accepts base64 PDF data from frontend
  - Automatically removes "data:application/pdf;base64," prefix
  - Converts base64 to Buffer
  - Validates PDF data integrity
  - Sends email via Resend with PDF attachment
  - Updates invoice record with send tracking (sentToCustomer, lastSentAt, sendCount)
  - Graceful fallback if invoice record doesn't exist
  - Comprehensive error handling with user-friendly messages

---

### 4. **invoiceRoutes.js** ✅
Added import and route:
```javascript
import { sendInvoiceWithPdf } from '../controllers/invoiceController.js';

router.post('/:id/send-with-pdf', sendInvoiceWithPdf);
```

---

### 5. **receiptController.js** ✅
Added new endpoint:

#### `POST /api/receipts/:id/send-with-pdf`
- **Function**: `sendReceiptWithPdf()`
- **Purpose**: Send receipt with PDF attachment received from frontend (base64)
- **Protected**: Yes (via route middleware)
- **Request Body**:
```json
{
  "customerEmail": "customer@email.com",
  "customerName": "Customer Name",
  "receiptNumber": "RCP-001",
  "pdfData": "data:application/pdf;base64,JVBERi0xLjQK..."
}
```
- **Features**: Same as invoiceWithPdf (base64 handling, email sending, tracking)

---

### 6. **receipts.js** ✅
Added import and route:
```javascript
import { sendReceiptWithPdf } from '../controllers/receiptController.js';

router.post('/:id/send-with-pdf', sendReceiptWithPdf);
```

---

## Email Attachment Support

### `emailService.js` - No Changes Required ✅
The existing `sendEmail()` function already supports attachments:
```javascript
export const sendEmail = async ({ to, subject, text, html, attachments = [] }) => {
  // ... implementation handles attachments automatically
}
```

**Attachment Format**:
```javascript
attachments: [
  {
    filename: "invoice-optimas-fiber.pdf",
    content: pdfBuffer,  // Buffer or base64 string
    contentType: "application/pdf"
  }
]
```

---

## Frontend Integration

### Dashboard.jsx expects these endpoints:
1. ✅ `GET /api/auth/me` - Fetch current user profile on page load
2. ✅ `PUT /api/auth/update-profile` - Update profile when user saves changes
3. ✅ `POST /api/invoices/:id/send-with-pdf` - Send invoice with PDF
4. ✅ `POST /api/receipts/:id/send-with-pdf` - Send receipt with PDF

### Frontend functions that call these endpoints:
- `getMe()` - Fetches user profile in useEffect
- `handleUpdateProfile()` - Sends profile updates to backend
- `sendInvoiceViaEmail()` - Fetches PDF, converts to base64, sends via new endpoint
- `sendReceiptViaEmail()` - Same as invoice but for receipts

---

## Flow Diagram: Email with Attachment

```
Frontend (Dashboard.jsx)
    ↓
[Generate PDF via html2pdf]
    ↓
[Convert PDF to Base64 string]
    ↓
[Call POST /api/invoices/:id/send-with-pdf]
    ↓ with body: { customerEmail, customerName, invoiceNumber, pdfData }
    ↓
Backend (invoiceController.js)
    ↓
[Convert Base64 back to Buffer]
    ↓
[Call emailService.sendEmail() with attachments]
    ↓
Resend API
    ↓
[Send email with PDF attachment]
    ↓
Customer receives email with PDF
```

---

## Database Tracking

Both invoice and receipt endpoints update the following fields:
- `sentToCustomer` (Boolean) - Set to true when email is sent
- `lastSentAt` (Date) - Updated with current timestamp
- `sendCount` (Number) - Incremented by 1 (useful for tracking multiple sends)

---

## Error Handling

All new endpoints include:
- ✅ Input validation (required fields)
- ✅ Email format validation
- ✅ PDF data integrity checks
- ✅ Database error handling
- ✅ Email service error handling
- ✅ User-friendly error messages
- ✅ Detailed console logging for debugging

### Common Error Responses:
```json
{
  "success": false,
  "message": "Error message for user",
  "error": "Technical error details"
}
```

---

## Testing Checklist

- [ ] Test `GET /api/auth/me` - Should return logged-in user profile
- [ ] Test `PUT /api/auth/update-profile` - Should update user fields
- [ ] Test `POST /api/invoices/:id/send-with-pdf` - Should send invoice with PDF
- [ ] Test `POST /api/receipts/:id/send-with-pdf` - Should send receipt with PDF
- [ ] Test email validation (missing email should fail)
- [ ] Test PDF data validation (corrupted base64 should fail)
- [ ] Test database updates (check sentToCustomer flag)
- [ ] Test email delivery (check Resend logs)
- [ ] Test with different file sizes (small and large PDFs)
- [ ] Test fallback error handling

---

## Environment Variables Required

Ensure these are set in `.env`:
- `RESEND_API_KEY` - Resend email service API key
- `EMAIL_FROM` - Sender email address
- `COMPANY_NAME` - Used in email templates
- `MPESA_PAYBILL` - For payment info in emails (optional)
- `COMPANY_PHONE` - For contact info in emails (optional)

---

## Security Considerations

✅ All endpoints are protected with `protect` middleware (JWT authentication)
✅ Email validation prevents invalid recipients
✅ PDF data is validated before processing
✅ Base64 strings are converted to buffers safely
✅ User can only update their own profile (req.user._id is used)
✅ No sensitive data exposed in error messages

---

## Summary of Changes

| File | Change Type | Lines Added | Purpose |
|------|-------------|-------------|---------|
| authController.js | Add functions | ~90 | Profile get/update |
| authRoutes.js | Add routes | 3 | Profile endpoints |
| invoiceController.js | Add function | ~120 | Invoice send with PDF |
| invoiceRoutes.js | Add route + import | 2 | Invoice PDF route |
| receiptController.js | Add function | ~120 | Receipt send with PDF |
| receipts.js | Add route + import | 2 | Receipt PDF route |

**Total Lines Added**: ~337
**Endpoints Added**: 4
**Functions Added**: 4
**Routes Added**: 4

All changes are backward compatible and don't modify existing functionality.
