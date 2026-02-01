# Technical Implementation Details - Client Account Numbers

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend (React)                         │
│  ┌──────────────────┐  ┌──────────────────┐                │
│  │ InvoiceManager   │  │ ReceiptManager   │                │
│  │ - Form with      │  │ - Form with      │                │
│  │   FBI- input     │  │   FBI- input     │                │
│  └────────┬─────────┘  └────────┬─────────┘                │
│           │                     │                           │
│           └──────────┬──────────┘                           │
│                      │ API Calls                           │
├──────────────────────┼──────────────────────────────────────┤
│                      │ (JSON with clientAccountNumber)      │
│                      ▼                                       │
│            Backend (Node.js + Express)                     │
│  ┌──────────────────────────────────────┐                 │
│  │ Routes                               │                 │
│  │ - POST /api/invoices                 │                 │
│  │ - POST /api/receipts                 │                 │
│  │ - POST /api/invoices/:id/send        │                 │
│  │ - POST /api/receipts/:id/send        │                 │
│  └────────┬─────────────────────────────┘                 │
│           │                                                │
│           ▼                                                │
│  ┌──────────────────────────────────────┐                 │
│  │ Controllers                          │                 │
│  │ invoiceController.js                 │                 │
│  │ receiptController.js                 │                 │
│  │ - Validate clientAccountNumber       │                 │
│  │ - Generate PDF with account number   │                 │
│  │ - Send email with attachment         │                 │
│  └────────┬─────────────────────────────┘                 │
│           │                                                │
│           ▼                                                │
│  ┌──────────────────────────────────────┐                 │
│  │ Email Service                        │                 │
│  │ (Resend API)                         │                 │
│  │ - Formats email                      │                 │
│  │ - Attaches PDF                       │                 │
│  │ - Sends from support@optimaswifi...  │                 │
│  └────────┬─────────────────────────────┘                 │
│           │                                                │
├───────────┼────────────────────────────────────────────────┤
│           │                                                │
│           ▼                                                │
│      MongoDB Database                                      │
│  ┌──────────────────────────────────────┐                 │
│  │ invoices collection                  │                 │
│  │ {                                    │                 │
│  │   _id, invoiceNumber,                │                 │
│  │   clientAccountNumber: "FBI-00456"   │◄─────┐          │
│  │   ...                                │      │ Indexed  │
│  │ }                                    │      │ & Unique │
│  │                                      │      │          │
│  │ receipts collection                  │      │          │
│  │ {                                    │      │          │
│  │   _id, receiptNumber,                │      │          │
│  │   clientAccountNumber: "FBI-00456"   │◄─────┘          │
│  │   ...                                │                 │
│  │ }                                    │                 │
│  └──────────────────────────────────────┘                 │
│                                                             │
│         External: Resend Email API                        │
└─────────────────────────────────────────────────────────────┘
```

---

## Database Schema Changes

### Invoice Model Changes
```javascript
// File: backend/src/models/Invoice.js

// NEW FIELD:
clientAccountNumber: {
  type: String,
  trim: true,
  uppercase: true,
  match: [/^FBI-/, 'Client account number must start with FBI-'],
  index: true  // For fast queries
}
```

### Receipt Model Changes
```javascript
// File: backend/src/models/Receipt.js

// NEW FIELD:
clientAccountNumber: {
  type: String,
  trim: true,
  uppercase: true,
  match: [/^FBI-/, 'Client account number must start with FBI-'],
  index: true  // For fast queries
}
```

**Validation Rules:**
- Required field
- Must start with "FBI-"
- Auto-converted to uppercase
- Indexed for performance
- Allows queries like: `db.invoices.find({clientAccountNumber: "FBI-00456"})`

---

## API Endpoints

### Create Invoice
```
POST /api/invoices/

Request Body:
{
  "customerName": "John Doe",
  "customerEmail": "john@example.com",
  "customerPhone": "+254712345678",
  "customerLocation": "Nairobi",
  "planName": "Gazzelle",
  "planPrice": 2999,
  "planSpeed": "30Mbps",
  "invoiceDate": "2024-02-01",
  "dueDate": "2024-03-01",
  "clientAccountNumber": "FBI-00456",  // NEW
  "status": "pending"
}

Response:
{
  "success": true,
  "message": "Invoice created successfully",
  "invoice": {
    "_id": "...",
    "invoiceNumber": "INV-0001",
    "clientAccountNumber": "FBI-00456",
    ...
  }
}
```

### Create Receipt
```
POST /api/receipts/

Request Body:
{
  "customerName": "John Doe",
  "customerEmail": "john@example.com",
  "customerPhone": "+254712345678",
  "invoiceNumber": "INV-0001",
  "total": 3479,
  "paymentMethod": "mobile_money",
  "paymentDate": "2024-02-01",
  "clientAccountNumber": "FBI-00456",  // NEW
  "status": "issued"
}

Response:
{
  "success": true,
  "message": "Receipt created successfully",
  "receipt": {
    "_id": "...",
    "receiptNumber": "RCP-001",
    "clientAccountNumber": "FBI-00456",
    ...
  }
}
```

### Send Invoice via Email
```
POST /api/invoices/:id/send

Automatically:
1. Fetches invoice from database
2. Validates clientAccountNumber exists
3. Generates PDF with clientAccountNumber displayed
4. Sends email with PDF attachment
5. Updates sentToCustomer, lastSentAt, sendCount

Response:
{
  "success": true,
  "message": "Invoice sent successfully to john@example.com",
  "emailInfo": {
    "messageId": "...",
    "timestamp": "2024-02-01T10:30:00Z"
  }
}
```

### Send Receipt via Email
```
POST /api/receipts/:id/send

Same process as invoices:
1. Fetches receipt from database
2. Validates clientAccountNumber exists
3. Generates PDF with clientAccountNumber displayed
4. Sends email with PDF attachment
5. Updates sentToCustomer, lastSentAt, sendCount

Response:
{
  "success": true,
  "message": "Receipt sent successfully to john@example.com",
  "emailInfo": {
    "messageId": "...",
    "timestamp": "2024-02-01T10:35:00Z"
  }
}
```

### Search by Client Account
```
GET /api/invoices/?clientAccountNumber=FBI-00456

// Returns all invoices for this client account

GET /api/receipts/?clientAccountNumber=FBI-00456

// Returns all receipts for this client account
```

---

## Frontend Implementation

### InvoiceManager Form Updates
```jsx
// File: src/components/InvoiceManager.jsx

// 1. Form state updated:
const initialFormState = {
  // ... existing fields ...
  clientAccountNumber: ''  // NEW
};

// 2. Form input added:
<div>
  <label>Client Account Number (FBI-XXXXXXXX) *</label>
  <input 
    type="text" 
    name="clientAccountNumber" 
    value={invoiceForm.clientAccountNumber} 
    onChange={handleInputChange} 
    placeholder="FBI-00001" 
    required 
  />
  <p className="text-xs mt-1">
    Each client has a unique account number starting with FBI-
  </p>
</div>

// 3. PDF generation updated:
// In generateInvoicePDF():
<p style="color:#ff6b35; font-weight:600;">
  Account: ${invoice.clientAccountNumber || 'NOT SET'}
</p>

// 4. WhatsApp sharing updated:
// Message now includes clientAccountNumber
```

### ReceiptManager Form Updates
```jsx
// File: src/components/ReceiptManager.jsx

// 1. Form state updated:
const [receiptForm, setReceiptForm] = useState({
  // ... existing fields ...
  clientAccountNumber: ''  // NEW
});

// 2. Form input added:
<div>
  <label>Client Account Number (FBI-XXXXXXXX) *</label>
  <input 
    type="text" 
    name="clientAccountNumber" 
    value={receiptForm.clientAccountNumber} 
    onChange={handleInputChange} 
    placeholder="FBI-00001" 
    required 
  />
  <p className="text-xs mt-1">
    Each client has a unique account number starting with FBI-
  </p>
</div>

// 3. PDF generation updated:
// In receipt PDF HTML:
<p style="font-weight:600; color:#ff6b35;">
  Account: ${receipt.clientAccountNumber || 'NOT SET'}
</p>

// 4. Email sending updated:
// sendReceiptToCustomer() includes clientAccountNumber
```

---

## Email Service Integration

### Resend API Configuration
```javascript
// File: backend/src/utils/emailService.js

import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendEmail = async ({ to, subject, text, html, attachments = [] }) => {
  try {
    const emailData = {
      from: process.env.EMAIL_FROM,  // "Optimas Fibre <support@optimaswifi.co.ke>"
      to: Array.isArray(to) ? to : [to],
      subject,
      html,
      attachments  // PDF attachments included here
    };

    const result = await resend.emails.send(emailData);

    if (result.error) {
      return {
        success: false,
        error: result.error.message
      };
    }

    return {
      success: true,
      messageId: result.data?.id,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('Email sending failed:', error.message);
    return {
      success: false,
      error: error.message
    };
  }
};
```

### PDF with Attachments
```javascript
// File: backend/src/controllers/invoiceController.js

// Generate PDF
const pdfBuffer = await generateInvoicePDF(invoice);

// Send with attachment
const emailResult = await emailService.sendEmail({
  to: invoice.customerEmail,
  subject: `Invoice #${invoice.invoiceNumber} - Optimas Fibre`,
  html: emailHtml,
  attachments: [{
    filename: `${invoice.invoiceNumber}-optimas-fiber.pdf`,
    content: pdfBuffer,
    contentType: 'application/pdf'
  }]
});
```

---

## PDF Generation with Account Number

### Invoice PDF Template
```html
<!-- Payment Options Section -->
<div style="display:grid; grid-template-columns:1fr 1fr; gap:20px;">
  <div>
    <p style="margin:0 0 10px 0; font-size:14px; font-weight:600;">
      Bank Transfer
    </p>
    <p style="margin:0 0 5px 0; font-size:13px;">
      Bank: Equity Bank
    </p>
    <p style="margin:0 0 5px 0; font-size:13px;">
      Account: 1234567890
    </p>
  </div>
  <div>
    <p style="margin:0 0 10px 0; font-size:14px; font-weight:600;">
      Mobile Money
    </p>
    <p style="margin:0 0 5px 0; font-size:13px;">
      Paybill: ${COMPANY_INFO.paybill}
    </p>
    <!-- NEW: Account number highlighted -->
    <p style="margin:0 0 5px 0; font-size:13px; color:#ff6b35; font-weight:600;">
      Account: ${invoice.clientAccountNumber || 'NOT SET'}
    </p>
  </div>
</div>
```

### Receipt PDF Template
```html
<!-- Payment Information Section -->
<div style="margin-top:30px; border-top:1px dashed #ddd; padding-top:15px;">
  <p><strong>Payment Method:</strong> ${receipt.paymentMethod || 'N/A'}</p>
  <p><strong>Paybill:</strong> ${COMPANY_INFO.paybill}</p>
  <!-- NEW: Account number highlighted -->
  <p>
    <strong>Account Number:</strong> 
    <span style="font-weight:600; color:#ff6b35;">
      ${receipt.clientAccountNumber || 'NOT SET'}
    </span>
  </p>
</div>
```

---

## Error Handling & Validation

### Invoice Controller Validation
```javascript
// In createInvoice():
if (!invoiceData.clientAccountNumber || 
    !invoiceData.clientAccountNumber.match(/^FBI-/)) {
  return res.status(400).json({
    success: false,
    message: 'Client account number must start with FBI-'
  });
}
```

### Receipt Controller Validation
```javascript
// In createReceipt():
if (!receiptData.clientAccountNumber || 
    !receiptData.clientAccountNumber.match(/^FBI-/)) {
  return res.status(400).json({
    success: false,
    message: 'Client account number must start with FBI-'
  });
}
```

### Email Sending Error Handling
```javascript
try {
  // Send email with PDF
  const emailResult = await emailService.sendEmail({ ... });
  
  if (!emailResult.success) {
    throw new Error(emailResult.error);
  }
  
  // Update record
  invoice.sentToCustomer = true;
  await invoice.save();
  
} catch (error) {
  console.error('Email failed:', error);
  res.status(500).json({
    success: false,
    message: 'Failed to send invoice',
    error: error.message
  });
}
```

---

## Testing Guide

### Unit Test Examples
```javascript
// Test: Create invoice with FBI- account
describe('Invoice Creation', () => {
  it('should accept FBI- account numbers', async () => {
    const invoice = await Invoice.create({
      customerName: 'Test User',
      clientAccountNumber: 'FBI-00001',
      // ... other fields
    });
    
    expect(invoice.clientAccountNumber).toBe('FBI-00001');
  });

  it('should reject non-FBI- account numbers', async () => {
    expect(() => {
      Invoice.create({
        clientAccountNumber: 'ABC-00001',  // Invalid
        // ... other fields
      });
    }).toThrow();
  });
});

// Test: Email sending with PDF
describe('Email Service', () => {
  it('should send invoice with PDF attachment', async () => {
    const result = await sendInvoiceToCustomer(invoiceId);
    
    expect(result.success).toBe(true);
    expect(result.messageId).toBeDefined();
  });
});
```

### Integration Test Examples
```javascript
// Full flow test
test('Complete invoice workflow', async () => {
  // 1. Create invoice
  const invoice = await createInvoice({
    customerName: 'John Doe',
    customerEmail: 'john@example.com',
    clientAccountNumber: 'FBI-00789',
    // ... other fields
  });
  
  // 2. Verify account number saved
  expect(invoice.clientAccountNumber).toBe('FBI-00789');
  
  // 3. Send email
  const sendResult = await sendInvoiceToCustomer(invoice._id);
  expect(sendResult.success).toBe(true);
  
  // 4. Verify PDF was generated and sent
  expect(sendResult.emailInfo.messageId).toBeDefined();
  
  // 5. Verify database updated
  const updatedInvoice = await Invoice.findById(invoice._id);
  expect(updatedInvoice.sentToCustomer).toBe(true);
  expect(updatedInvoice.lastSentAt).toBeDefined();
});
```

---

## Deployment Checklist

- [ ] MongoDB collections have indexes on clientAccountNumber
- [ ] .env file has RESEND_API_KEY configured
- [ ] .env file has EMAIL_FROM set to support@optimaswifi.co.ke
- [ ] .env file has MPESA_PAYBILL configured (default: 123456)
- [ ] All model changes deployed to MongoDB
- [ ] All controller updates deployed
- [ ] All frontend components updated
- [ ] Email service working with Resend API
- [ ] PDF generation includes clientAccountNumber
- [ ] Tests passing (unit & integration)
- [ ] Email templates reviewed
- [ ] Client documentation provided

---

## Monitoring & Maintenance

### Key Metrics to Track
- Email send success rate
- PDF generation time
- Failed email attempts
- Database query performance for FBI- accounts
- Customer account lookups per day

### Logs to Monitor
```
// Invoice email sent
[2024-02-01 10:30:00] ✅ Invoice INV-0001 (FBI-00456) sent to john@example.com

// Receipt email sent
[2024-02-01 10:35:00] ✅ Receipt RCP-001 (FBI-00456) sent to john@example.com

// Email failure
[2024-02-01 10:40:00] ❌ Failed to send invoice: Authentication error
```

### Database Backups
- Regular backups of Invoice and Receipt collections
- Backup strategy: Daily incremental, weekly full
- Retention: 30 days

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2024-02-01 | Initial implementation with FBI- account numbers, email with PDF attachments |

---

**Last Updated**: February 1, 2024
**Status**: Production Ready ✅
