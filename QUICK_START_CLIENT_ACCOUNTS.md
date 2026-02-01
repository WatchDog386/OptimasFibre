# Quick Start Guide - Client Account Numbers

## 🎯 What's New?

Every client now has a **unique account number starting with FBI-** (e.g., `FBI-00001`, `FBI-00542`)
- All clients pay to the **same Paybill: 123456**
- But each client uses their **own unique FBI- account number**

---

## 📋 STEP-BY-STEP USAGE

### 1️⃣ Creating an Invoice

1. Go to **Invoice Manager** → Click **"Add Invoice"**
2. Fill in customer details:
   - Customer Name
   - Customer Email
   - Customer Phone
   - Customer Location
3. **NEW**: Enter **Client Account Number** (e.g., `FBI-00456`)
   - Must start with `FBI-`
   - Each client gets their own unique number
4. Select plan, set dates, and save
5. The invoice will show:
   ```
   Paybill: 123456
   Account: FBI-00456  ← Client's unique number
   ```

### 2️⃣ Sending Invoice via Email

1. Open the invoice you created
2. Click **"Send Email"** or **"📧 Email"** button
3. The system will:
   - Generate a PDF with the client's FBI- account number
   - Attach it to an email
   - Send it to the customer's email address
   - Sender: `support@optimaswifi.co.ke`

### 3️⃣ Creating a Receipt

1. Go to **Receipt Manager** → Click **"Add Receipt"**
2. Fill in customer details:
   - Customer Name
   - Customer Email
   - Customer Phone
3. **NEW**: Enter **Client Account Number** (e.g., `FBI-00456`)
4. Add items and payment details
5. The receipt will show the client's FBI- account number

### 4️⃣ Sending Receipt via Email

1. Open the receipt you created
2. Click **"Send Email"** button
3. The system will:
   - Generate a PDF with the FBI- account number
   - Send it as an attachment to the customer
   - Sender: `support@optimaswifi.co.ke`

### 5️⃣ Sharing via WhatsApp

1. Download the invoice/receipt PDF
2. Open WhatsApp
3. Share the PDF with the customer
4. Include a message like:
   ```
   Hi [Name],
   
   Your invoice/receipt is attached.
   
   To pay via M-Pesa:
   📱 Paybill: 123456
   📝 Account: FBI-00456
   
   Thank you!
   ```

---

## 💰 How Your Customers Pay

### Payment Steps for Customer:

1. **Open M-Pesa** on their phone
2. **Select**: Lipa Na M-Pesa Online → Paybill
3. **Enter**:
   - **Paybill Number**: `123456` (same for all clients)
   - **Account Number**: `FBI-00456` (their unique account)
   - **Amount**: As shown on invoice/receipt
4. **Enter PIN** and complete payment
5. They'll receive an SMS confirmation

---

## 📧 Email Attachments

✅ **What Gets Sent:**
- Invoice/Receipt as PDF attachment
- Formatted with company branding
- Includes payment information
- Shows client's FBI- account number
- Professional and ready to print

✅ **Sent From:**
- Email: `support@optimaswifi.co.ke`
- Appears in customer's inbox as professional company email

✅ **Attachments Include:**
- Full invoice/receipt details
- Customer information
- Itemized charges
- **Payment Methods** with FBI- account number
- Terms and conditions

---

## 🔍 Finding Account Numbers

### To Look Up a Client's Account:

1. In **Invoice Manager**: Search by customer name
2. In **Receipt Manager**: Search by customer name or invoice number
3. The account number will be visible in the details
4. **Format**: Always starts with `FBI-`

---

## ⚙️ Setup Information

### Current Configuration:

| Setting | Value |
|---------|-------|
| **Common Paybill** | 123456 |
| **Account Format** | FBI-XXXXXXXX |
| **Email Service** | Resend API |
| **Email Sender** | support@optimaswifi.co.ke |
| **Company Name** | Optimas Fibre |
| **Support Phone** | +254741874200 |

### Environment Variables:
```
MPESA_PAYBILL=123456                           # Common for all
EMAIL_FROM=support@optimaswifi.co.ke          # Email sender
COMPANY_NAME=Optimas Fibre                    # Brand name
```

---

## 🆘 Troubleshooting

### ❌ "FBI- account number is required"
- Make sure you entered the account number
- Format: FBI-00001 (must start with FBI-)

### ❌ Email not sending?
- Check internet connection
- Verify customer email address is correct
- Check if email is spam folder
- Contact support: support@optimaswifi.co.ke

### ❌ PDF not downloading?
- Try different browser
- Check browser download settings
- Ensure popup blocker is disabled

### ❌ Client says they don't see the account number?
- Send them the PDF attachment
- Show them this guide
- Account number appears in "Payment Methods" section

---

## 📊 Example Scenarios

### Scenario 1: New Customer
```
Customer: Jane Wanjiru
Account: FBI-00789
Invoice: INV-0042
Amount: Ksh 3,500

Jane receives email with PDF showing:
- Invoice details
- Paybill: 123456
- Account: FBI-00789
```

### Scenario 2: Repeat Customer
```
Customer: John Mwangi
Account: FBI-00789 (SAME as before)
Receipt: RCP-015
Amount: Ksh 3,500 (paid)

John receives email with receipt showing:
- Payment confirmation
- Paybill: 123456
- Account: FBI-00789
- Status: PAID
```

### Scenario 3: Multiple Family Members
```
Same family, different services:
- Alice:  FBI-00550 → Gazzelle plan
- Bob:    FBI-00551 → Buffalo plan
- Carol:  FBI-00552 → Chui plan

Each pays to paybill 123456 with their own account
```

---

## ✅ Verification Checklist

Before sending invoices/receipts, verify:

- [ ] Customer name is correct
- [ ] Customer email is valid
- [ ] FBI- account number is entered
- [ ] Account number is unique to this customer
- [ ] Invoice/receipt details are complete
- [ ] All items/charges are correct
- [ ] Email will be sent from support@optimaswifi.co.ke

---

## 💡 Pro Tips

1. **Generate Account Numbers Systematically**
   - FBI-00001 for first customer
   - FBI-00002 for second customer
   - Keep a record of who has which number

2. **Send Immediately After Creating**
   - Don't delay sending emails
   - Customers appreciate prompt communication

3. **Keep Records**
   - Save customer email addresses
   - Note their FBI- account numbers
   - Makes future invoicing faster

4. **Resend Failed Emails**
   - If email fails, try again after checking internet
   - The PDF attachment ensures nothing is lost

5. **Use Description Fields**
   - Add notes about what service period is covered
   - Helps customers match payments with invoices

---

## 📞 Need Help?

**Support Email**: support@optimaswifi.co.ke
**Support Phone**: +254741874200
**Hours**: Available during business hours

---

**Remember**: The Paybill number is COMMON (123456), but each client's ACCOUNT number is UNIQUE (FBI-XXXXX) 🎯
