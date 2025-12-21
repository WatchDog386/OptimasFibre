// InvoiceManager.jsx - UPDATED VERSION
import React, { useState, useEffect, useRef } from 'react';
import { 
  FileText, 
  DollarSign, 
  Calendar, 
  Filter, 
  CheckCircle, 
  XCircle, 
  Mail,
  MessageCircle, 
  Download, 
  Eye,
  RefreshCw,
  Search,
  Plus,
  AlertCircle,
  Edit,
  Trash2,
  User,
  CreditCard,
  X,
  FileSpreadsheet,
  Printer,
  Send,
  FileDown,
  Wifi,
  Clock,
  Zap,
  ArrowUpRight,
  ClipboardPaste,
  AlertTriangle,
  Loader2,
  Copy,
  CreditCard as CardIcon,
  Building,
  Phone,
  MapPin,
  Globe
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, LabelList,
  LineChart, Line, ReferenceLine
} from 'recharts';

// ✅ CLIENT-SIDE PDF GENERATION
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const formatPrice = (price) => {
  if (price === undefined || price === null) return '0.00';
  const num = parseFloat(price);
  return isNaN(num) ? price : num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

const WIFI_PLANS = [
  { id: 1, name: "Jumbo", price: "1499", speed: "8Mbps", features: ["Great for browsing", "24/7 Support", "Free Installation"], type: "home", popular: false },
  { id: 2, name: "Buffalo", price: "1999", speed: "15Mbps", features: ["Streaming & Social Media", "24/7 Support", "Free Installation"], type: "home", popular: false },
  { id: 3, name: "Ndovu", price: "2499", speed: "25Mbps", features: ["Work from Home", "Streaming", "24/7 Support", "Free Installation"], type: "home", popular: false },
  { id: 4, name: "Gazzelle", price: "2999", speed: "30Mbps", features: ["Multiple Devices", "Low Latency", "24/7 Support", "Free Installation"], type: "home", popular: true },
  { id: 5, name: "Tiger", price: "3999", speed: "40Mbps", features: ["Heavy Streaming", "Gaming Ready", "24/7 Support", "Free Installation"], type: "home", popular: false },
  { id: 6, name: "Chui", price: "4999", speed: "60Mbps", features: ["High-Speed Everything", "Gaming & 4K", "24/7 Support", "Free Installation"], type: "home", popular: false },
];

const COMPANY_INFO = {
  name: "OPTIMAS FIBER",
  tagline: "High-Speed Internet Solutions",
  logoUrl: "/oppo.jpg",
  bankName: "Equity Bank",
  accountName: "Optimas Fiber Ltd",
  accountNumber: "1234567890",
  branch: "Nairobi Main",
  supportEmail: "support@optimaswifi.co.ke",
  supportPhone: "+254 741 874 200",
  paybill: "123456",
  address: "Nairobi, Kenya",
  website: "www.optimaswifi.co.ke",
  vatNumber: "VAT00123456"
};

const initialFormState = {
  invoiceNumber: '',
  customerName: '',
  customerEmail: '',
  customerPhone: '',
  customerLocation: '',
  planName: '',
  planPrice: 0,
  planSpeed: '',
  features: [],
  connectionType: 'Fiber Optic',
  invoiceDate: new Date().toISOString().split('T')[0],
  dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  items: [],
  subtotal: 0,
  taxRate: 16, // Default VAT rate for Kenya
  taxAmount: 0,
  discount: 0,
  discountType: 'none',
  totalAmount: 0,
  amountPaid: 0,
  balanceDue: 0,
  status: 'pending',
  paymentMethod: 'mobile_money',
  paymentTerms: 'Due upon receipt',
  notes: '',
  terms: 'Payment due within 30 days. Late payments may attract a penalty fee of 5% per month. All payments should be made to the bank details provided.',
  billingCycle: 'monthly'
};

// ✅ UPGRADED: ENHANCED PDF GENERATOR WITH BETTER LAYOUT
const generateInvoicePDF = async (invoice, showNotification) => {
  const printContainer = document.createElement('div');
  printContainer.style.position = 'absolute';
  printContainer.style.left = '-10000px';
  printContainer.style.top = '-10000px';
  printContainer.style.width = '800px';
  printContainer.style.backgroundColor = 'white';
  printContainer.style.padding = '40px';
  printContainer.style.fontFamily = "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif";
  printContainer.style.color = '#333';

  const logo = COMPANY_INFO.logoUrl 
    ? `<img src="${COMPANY_INFO.logoUrl}" alt="Logo" style="height:70px; margin-bottom:10px;" onerror="this.style.display='none'" />` 
    : `<div style="height:70px; background:#003366; color:white; display:flex; align-items:center; justify-content:center; font-size:24px; font-weight:bold; border-radius:8px;">${COMPANY_INFO.name}</div>`;

  // ✅ Enhanced invoice items table
  let itemsHtml = '';
  (invoice.items || []).forEach((item, index) => {
    itemsHtml += `<tr style="border-bottom:1px solid #eee;">
      <td style="padding:12px 8px; width:50%;">${item.description || ''}</td>
      <td style="padding:12px 8px; text-align:center;">${item.quantity || 1}</td>
      <td style="padding:12px 8px; text-align:right;">Ksh ${formatPrice(item.unitPrice || item.amount)}</td>
      <td style="padding:12px 8px; text-align:right; font-weight:600;">Ksh ${formatPrice(item.amount)}</td>
    </tr>`;
  });

  // ✅ Enhanced invoice summary
  const subtotal = invoice.subtotal || 0;
  const taxAmount = invoice.taxAmount || 0;
  const discountAmount = invoice.discountType === 'percentage' 
    ? (subtotal * (invoice.discount || 0)) / 100 
    : (invoice.discountType === 'fixed' ? (invoice.discount || 0) : 0);
  const totalAmount = invoice.totalAmount || subtotal + taxAmount - discountAmount;
  const amountPaid = invoice.amountPaid || 0;
  const balanceDue = totalAmount - amountPaid;

  // ✅ Payment status badge
  const statusBadge = invoice.status === 'paid' 
    ? '<span style="background:#28a745; color:white; padding:4px 12px; border-radius:20px; font-size:12px; font-weight:600;">PAID</span>'
    : invoice.status === 'partially_paid'
    ? '<span style="background:#17a2b8; color:white; padding:4px 12px; border-radius:20px; font-size:12px; font-weight:600;">PARTIALLY PAID</span>'
    : '<span style="background:#ffc107; color:#333; padding:4px 12px; border-radius:20px; font-size:12px; font-weight:600;">PENDING</span>';

  printContainer.innerHTML = `
    <div style="border:2px solid #003366; border-radius:12px; padding:40px; background:white;">
      <!-- Header -->
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:30px; border-bottom:2px solid #f0f0f0; padding-bottom:20px;">
        <div>
          ${logo}
          <h1 style="margin:10px 0 5px 0; font-size:28px; color:#003366; font-weight:700;">${COMPANY_INFO.name}</h1>
          <p style="margin:0; color:#666; font-size:14px;">${COMPANY_INFO.tagline}</p>
          <p style="margin:5px 0 0 0; color:#666; font-size:12px;">
            <span style="display:inline-flex; align-items:center; margin-right:15px;"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right:5px;"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>${COMPANY_INFO.address}</span>
            <span style="display:inline-flex; align-items:center;"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right:5px;"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>${COMPANY_INFO.supportPhone}</span>
          </p>
        </div>
        <div style="text-align:right;">
          <h2 style="margin:0 0 10px 0; font-size:32px; color:#003366; font-weight:800;">INVOICE</h2>
          ${statusBadge}
        </div>
      </div>

      <!-- Company & Customer Info -->
      <div style="display:flex; justify-content:space-between; margin-bottom:40px;">
        <div style="flex:1;">
          <h3 style="margin:0 0 10px 0; font-size:16px; color:#003366; font-weight:600;">FROM:</h3>
          <div style="background:#f8f9fa; padding:15px; border-radius:8px; border-left:4px solid #003366;">
            <p style="margin:0 0 5px 0; font-weight:600; color:#003366;">${COMPANY_INFO.name}</p>
            <p style="margin:0 0 5px 0; font-size:13px; color:#555;">${COMPANY_INFO.address}</p>
            <p style="margin:0 0 5px 0; font-size:13px; color:#555;">Phone: ${COMPANY_INFO.supportPhone}</p>
            <p style="margin:0 0 5px 0; font-size:13px; color:#555;">Email: ${COMPANY_INFO.supportEmail}</p>
            <p style="margin:0; font-size:13px; color:#555;">VAT: ${COMPANY_INFO.vatNumber}</p>
          </div>
        </div>
        
        <div style="flex:1; margin-left:40px;">
          <h3 style="margin:0 0 10px 0; font-size:16px; color:#003366; font-weight:600;">BILL TO:</h3>
          <div style="background:#f8f9fa; padding:15px; border-radius:8px; border-left:4px solid #FFCC00;">
            <p style="margin:0 0 5px 0; font-weight:600; color:#333;">${invoice.customerName || 'N/A'}</p>
            <p style="margin:0 0 5px 0; font-size:13px; color:#555;">${invoice.customerEmail || ''}</p>
            <p style="margin:0 0 5px 0; font-size:13px; color:#555;">Phone: ${invoice.customerPhone || ''}</p>
            <p style="margin:0; font-size:13px; color:#555;">Location: ${invoice.customerLocation || ''}</p>
          </div>
        </div>
        
        <div style="flex:1; margin-left:40px;">
          <h3 style="margin:0 0 10px 0; font-size:16px; color:#003366; font-weight:600;">INVOICE DETAILS:</h3>
          <div style="background:#f8f9fa; padding:15px; border-radius:8px; border-left:4px solid #28a745;">
            <p style="margin:0 0 8px 0; font-size:13px;"><span style="font-weight:600; color:#333;">Invoice #:</span> ${invoice.invoiceNumber || invoice._id?.substring(0,8) || 'N/A'}</p>
            <p style="margin:0 0 8px 0; font-size:13px;"><span style="font-weight:600; color:#333;">Date:</span> ${new Date(invoice.invoiceDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
            <p style="margin:0 0 8px 0; font-size:13px;"><span style="font-weight:600; color:#333;">Due Date:</span> ${new Date(invoice.dueDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
            <p style="margin:0 0 8px 0; font-size:13px;"><span style="font-weight:600; color:#333;">Payment Terms:</span> ${invoice.paymentTerms || '30 days'}</p>
            <p style="margin:0; font-size:13px;"><span style="font-weight:600; color:#333;">Plan:</span> ${invoice.planName || 'N/A'}</p>
          </div>
        </div>
      </div>

      <!-- Items Table -->
      <div style="margin-bottom:30px;">
        <table style="width:100%; border-collapse:collapse; border:1px solid #e0e0e0; border-radius:8px; overflow:hidden;">
          <thead>
            <tr style="background:#003366; color:white;">
              <th style="padding:15px; text-align:left; font-weight:600;">DESCRIPTION</th>
              <th style="padding:15px; text-align:center; font-weight:600;">QTY</th>
              <th style="padding:15px; text-align:right; font-weight:600;">UNIT PRICE</th>
              <th style="padding:15px; text-align:right; font-weight:600;">AMOUNT</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml || `<tr><td colspan="4" style="padding:20px; text-align:center; color:#999;">No items</td></tr>`}
          </tbody>
        </table>
      </div>

      <!-- Summary Section -->
      <div style="display:flex; justify-content:space-between; margin-bottom:40px;">
        <div style="width:60%;">
          <h3 style="margin:0 0 15px 0; font-size:16px; color:#003366; font-weight:600;">NOTES & TERMS:</h3>
          <div style="background:#f8f9fa; padding:20px; border-radius:8px; border:1px dashed #ddd;">
            <p style="margin:0 0 10px 0; font-size:13px; line-height:1.6;">${invoice.notes || 'Thank you for your business!'}</p>
            <p style="margin:0; font-size:13px; line-height:1.6; color:#666;">${invoice.terms || COMPANY_INFO.terms}</p>
          </div>
        </div>
        
        <div style="width:35%;">
          <div style="background:#f8f9fa; padding:25px; border-radius:8px; border:1px solid #e0e0e0;">
            <h3 style="margin:0 0 20px 0; font-size:18px; color:#003366; font-weight:700; text-align:center;">INVOICE SUMMARY</h3>
            
            <div style="margin-bottom:15px; padding-bottom:15px; border-bottom:1px solid #e0e0e0;">
              <div style="display:flex; justify-content:space-between; margin-bottom:8px;">
                <span style="color:#666;">Subtotal:</span>
                <span style="font-weight:600;">Ksh ${formatPrice(subtotal)}</span>
              </div>
              
              ${invoice.taxRate > 0 ? `
              <div style="display:flex; justify-content:space-between; margin-bottom:8px;">
                <span style="color:#666;">VAT (${invoice.taxRate || 0}%):</span>
                <span style="font-weight:600;">Ksh ${formatPrice(taxAmount)}</span>
              </div>
              ` : ''}
              
              ${discountAmount > 0 ? `
              <div style="display:flex; justify-content:space-between; margin-bottom:8px;">
                <span style="color:#666;">Discount:</span>
                <span style="font-weight:600; color:#28a745;">- Ksh ${formatPrice(discountAmount)}</span>
              </div>
              ` : ''}
            </div>
            
            <div style="display:flex; justify-content:space-between; margin-bottom:20px; padding:15px; background:white; border-radius:6px; border:2px solid #003366;">
              <span style="font-size:18px; font-weight:700; color:#003366;">TOTAL AMOUNT:</span>
              <span style="font-size:20px; font-weight:800; color:#003366;">Ksh ${formatPrice(totalAmount)}</span>
            </div>
            
            <div style="display:flex; justify-content:space-between; margin-bottom:10px;">
              <span style="color:#666;">Amount Paid:</span>
              <span style="font-weight:600; color:#28a745;">Ksh ${formatPrice(amountPaid)}</span>
            </div>
            
            <div style="display:flex; justify-content:space-between; padding-top:15px; border-top:2px solid #e0e0e0;">
              <span style="font-size:16px; font-weight:700;">BALANCE DUE:</span>
              <span style="font-size:18px; font-weight:800; color:${balanceDue > 0 ? '#dc3545' : '#28a745'};">Ksh ${formatPrice(balanceDue)}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Payment Instructions -->
      <div style="margin-bottom:30px; padding:20px; background:linear-gradient(135deg, #003366 0%, #002244 100%); border-radius:8px; color:white;">
        <h3 style="margin:0 0 15px 0; font-size:18px; font-weight:600; color:#FFCC00;">PAYMENT INSTRUCTIONS</h3>
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:20px;">
          <div>
            <p style="margin:0 0 10px 0; font-size:14px; font-weight:600;">Bank Transfer</p>
            <p style="margin:0 0 5px 0; font-size:13px;">Bank: ${COMPANY_INFO.bankName}</p>
            <p style="margin:0 0 5px 0; font-size:13px;">Account: ${COMPANY_INFO.accountName}</p>
            <p style="margin:0 0 5px 0; font-size:13px;">Account No: ${COMPANY_INFO.accountNumber}</p>
            <p style="margin:0; font-size:13px;">Branch: ${COMPANY_INFO.branch}</p>
          </div>
          <div>
            <p style="margin:0 0 10px 0; font-size:14px; font-weight:600;">Mobile Money</p>
            <p style="margin:0 0 5px 0; font-size:13px;">Paybill: ${COMPANY_INFO.paybill}</p>
            <p style="margin:0 0 5px 0; font-size:13px;">Account: ${invoice.invoiceNumber || 'Your Name'}</p>
            <p style="margin:0; font-size:13px;">Please include invoice number as reference</p>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div style="padding-top:20px; border-top:2px solid #f0f0f0; text-align:center; color:#666; font-size:12px;">
        <p style="margin:0 0 10px 0;">Thank you for choosing ${COMPANY_INFO.name}!</p>
        <p style="margin:0; display:flex; justify-content:center; gap:20px;">
          <span>📧 ${COMPANY_INFO.supportEmail}</span>
          <span>📱 ${COMPANY_INFO.supportPhone}</span>
          <span>🌐 ${COMPANY_INFO.website}</span>
        </p>
        <p style="margin:10px 0 0 0; font-size:11px; color:#999;">This is a computer-generated invoice. No signature required.</p>
      </div>
    </div>
  `;

  document.body.appendChild(printContainer);

  try {
    const canvas = await html2canvas(printContainer, { 
      scale: 2, 
      useCORS: true,
      backgroundColor: '#ffffff',
      logging: false
    });
    
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const imgWidth = 190; // Slightly smaller for margins
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    
    pdf.setFillColor(0, 51, 102);
    pdf.rect(0, 0, 210, 20, 'F');
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(16);
    pdf.text('INVOICE', 105, 12, { align: 'center' });
    
    pdf.addImage(imgData, 'PNG', 10, 25, imgWidth, imgHeight);
    
    const filename = `Invoice_${invoice.invoiceNumber || invoice._id || Date.now()}_${COMPANY_INFO.name}.pdf`;
    pdf.save(filename);
    
    showNotification('✅ Professional PDF invoice downloaded successfully!', 'success');
    return { success: true, filename };
  } catch (err) {
    console.error('PDF generation error:', err);
    showNotification('❌ Failed to generate PDF. Please try again.', 'error');
    return { success: false };
  } finally {
    document.body.removeChild(printContainer);
  }
};

// ✅ UPDATED: ENHANCED EMAIL CLIENT WITH ALL INVOICE CONTENTS & CC SUPPORT
const openEmailClient = (invoice, showNotification) => {
  if (!invoice.customerEmail?.trim()) {
    showNotification('⚠️ Customer email is required to send invoice.', 'warning');
    return;
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(invoice.customerEmail.trim())) {
    showNotification('⚠️ Invalid email format.', 'warning');
    return;
  }

  // ✅ Enhanced email subject
  const subject = `Invoice #${invoice.invoiceNumber || invoice._id?.substring(0,8)} from ${COMPANY_INFO.name}`;
  
  // ✅ Enhanced email body with ALL invoice contents
  const bodyLines = [
    `Dear ${invoice.customerName || 'Valued Customer'},`,
    ``,
    `We hope this email finds you well. Please find your invoice details below:`,
    ``,
    `========================================`,
    `            INVOICE DETAILS`,
    `========================================`,
    ``,
    `📋 **Invoice Information**`,
    `• Invoice Number: ${invoice.invoiceNumber || 'N/A'}`,
    `• Invoice Date: ${new Date(invoice.invoiceDate).toLocaleDateString()}`,
    `• Due Date: ${new Date(invoice.dueDate).toLocaleDateString()}`,
    `• Payment Terms: ${invoice.paymentTerms || 'Due upon receipt'}`,
    `• Status: ${invoice.status.toUpperCase().replace('_', ' ')}`,
    ``,
    `👤 **Customer Information**`,
    `• Name: ${invoice.customerName}`,
    `• Email: ${invoice.customerEmail}`,
    `• Phone: ${invoice.customerPhone || 'Not provided'}`,
    `• Location: ${invoice.customerLocation || 'Not provided'}`,
    ``,
    `📦 **Plan Details**`,
    `• Plan Name: ${invoice.planName || 'N/A'}`,
    `• Plan Speed: ${invoice.planSpeed || 'N/A'}`,
    `• Connection Type: ${invoice.connectionType || 'Fiber Optic'}`,
    `• Billing Cycle: ${invoice.billingCycle || 'Monthly'}`,
    ``,
    `🧾 **Invoice Items**`,
    ...(invoice.items && invoice.items.length > 0 
      ? invoice.items.map((item, index) => 
          `• ${item.description || 'Item'}: ${item.quantity || 1} x Ksh ${formatPrice(item.unitPrice || item.amount)} = Ksh ${formatPrice(item.amount)}`
        )
      : [`• ${invoice.planName || 'Plan'}: Ksh ${formatPrice(invoice.planPrice || invoice.totalAmount)}`]
    ),
    ``,
    `💰 **Payment Summary**`,
    `• Subtotal: Ksh ${formatPrice(invoice.subtotal)}`,
    `• VAT (${invoice.taxRate || 0}%): Ksh ${formatPrice(invoice.taxAmount)}`,
    `• Discount: Ksh ${formatPrice(invoice.discountType === 'percentage' ? (invoice.subtotal * (invoice.discount || 0) / 100) : (invoice.discount || 0))}`,
    `• Total Amount: Ksh ${formatPrice(invoice.totalAmount)}`,
    `• Amount Paid: Ksh ${formatPrice(invoice.amountPaid)}`,
    `• Balance Due: Ksh ${formatPrice(invoice.balanceDue)}`,
    ``,
    `💳 **Payment Instructions**`,
    `• Bank Transfer:`,
    `  - Bank: ${COMPANY_INFO.bankName}`,
    `  - Account Name: ${COMPANY_INFO.accountName}`,
    `  - Account Number: ${COMPANY_INFO.accountNumber}`,
    `  - Branch: ${COMPANY_INFO.branch}`,
    ``,
    `• Mobile Money:`,
    `  - Paybill: ${COMPANY_INFO.paybill}`,
    `  - Account Number: ${invoice.invoiceNumber || 'Your Name'}`,
    `  - Please include invoice number as reference`,
    ``,
    `• Payment Methods Accepted: M-Pesa, Airtel Money, Bank Transfer, Credit Card`,
    ``,
    `📝 **Notes & Terms**`,
    `${invoice.notes || 'Thank you for your business!'}`,
    ``,
    `${invoice.terms || 'Payment due within 30 days. Late payments may attract a penalty fee of 5% per month.'}`,
    ``,
    `========================================`,
    `            CONTACT INFORMATION`,
    `========================================`,
    ``,
    `For any queries or support, please contact us:`,
    `• Email: ${COMPANY_INFO.supportEmail}`,
    `• Phone: ${COMPANY_INFO.supportPhone}`,
    `• Website: ${COMPANY_INFO.website}`,
    ``,
    `Thank you for choosing ${COMPANY_INFO.name}!`,
    ``,
    `Best regards,`,
    `The ${COMPANY_INFO.name} Team`,
    ``,
    `---`,
    `This is an automated email. Please do not reply directly to this message.`,
    `If you need assistance, please contact ${COMPANY_INFO.supportEmail}`
  ];

  const body = encodeURIComponent(bodyLines.join('\n'));
  
  // ✅ ADD CC: support@optimaswifi.co.ke
  const mailtoLink = `mailto:${encodeURIComponent(invoice.customerEmail.trim())}?cc=${encodeURIComponent(COMPANY_INFO.supportEmail)}&subject=${encodeURIComponent(subject)}&body=${body}`;
  
  window.open(mailtoLink, '_blank');
  
  showNotification(
    `📧 Email client opened with invoice details. CC added to ${COMPANY_INFO.supportEmail}. Please attach the downloaded PDF manually.`,
    'info'
  );
};

const InvoiceManager = ({ darkMode, themeClasses, API_BASE_URL, showNotification, invoices, setInvoices, receipts, setReceipts }) => {
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showPDFModal, setShowPDFModal] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState(null);
  const [exportLoading, setExportLoading] = useState(false);
  const [sendingInvoice, setSendingInvoice] = useState(null);
  const [showPlanSelection, setShowPlanSelection] = useState(false);
  const [invoiceForm, setInvoiceForm] = useState(initialFormState);
  const [whatsappText, setWhatsappText] = useState('');
  const [showPasteModal, setShowPasteModal] = useState(false);

  const resetForm = () => {
    setInvoiceForm(initialFormState);
    setWhatsappText('');
  };

  const calculateTotals = (items, taxRate = 16, discount = 0, discountType = 'none') => {
    const subtotal = items.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0);
    const numericSubtotal = parseFloat(subtotal) || 0;
    const numericTaxRate = parseFloat(taxRate) || 0;
    const taxAmount = (numericSubtotal * numericTaxRate) / 100;
    let discountAmount = 0;
    const numericDiscount = parseFloat(discount) || 0;
    if (discountType === 'percentage') {
      discountAmount = (numericSubtotal * numericDiscount) / 100;
    } else if (discountType === 'fixed') {
      discountAmount = numericDiscount;
    }
    const totalAmount = numericSubtotal + taxAmount - discountAmount;
    return { subtotal, taxAmount, discountAmount, totalAmount: Math.max(0, totalAmount) };
  };

  useEffect(() => {
    const { subtotal, taxAmount, totalAmount } = calculateTotals(
      invoiceForm.items, 
      invoiceForm.taxRate, 
      invoiceForm.discount, 
      invoiceForm.discountType
    );
    setInvoiceForm(prev => {
      const amountPaid = parseFloat(prev.amountPaid) || 0;
      const newBalanceDue = Math.max(0, totalAmount - amountPaid);
      let newStatus = prev.status;
      if (amountPaid > 0) {
        if (amountPaid >= totalAmount) newStatus = 'paid';
        else if (amountPaid < totalAmount) newStatus = 'partially_paid';
      } else if (prev.status !== 'draft') newStatus = 'pending';
      return {
        ...prev,
        subtotal,
        taxAmount,
        totalAmount,
        balanceDue: newBalanceDue,
        status: newStatus
      };
    });
  }, [invoiceForm.items, invoiceForm.taxRate, invoiceForm.discount, invoiceForm.discountType, invoiceForm.amountPaid]);

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Authentication session expired. Please log in again.');
      const response = await fetch(`${API_BASE_URL}/api/invoices`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to fetch invoices: ${response.status} - ${errorText}`);
      }
      const data = await response.json();
      let invoicesData = data.invoices || data.data || [];
      setInvoices(invoicesData);
    } catch (error) {
      console.error('Error fetching invoices:', error);
      showNotification(`🚨 Error loading invoices: ${error.message}`, 'error');
      setInvoices([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!invoices || invoices.length === 0) {
      fetchInvoices();
    } else {
      setLoading(false);
    }
  }, []);

  const generateInvoiceNumber = () => {
    if (!invoices || invoices.length === 0) return 'INV-0001';
    const latestNumber = invoices.reduce((max, invoice) => {
      const match = invoice.invoiceNumber?.match(/INV-(\d+)/);
      return match ? Math.max(max, parseInt(match[1])) : max;
    }, 0);
    return `INV-${String(latestNumber + 1).padStart(4, '0')}`;
  };

  const parseAndPopulateFromWhatsApp = () => {
    const text = whatsappText;
    if (!text) {
      showNotification('⚠️ Please paste the WhatsApp message first.', 'warning');
      return;
    }
    const nameMatch = text.match(/Name:\s*(.+)/i);
    const phoneMatch = text.match(/Phone:\s*(.+)/i);
    const locationMatch = text.match(/Location:\s*(.+)/i);
    const emailMatch = text.match(/Email:\s*(.+)/i);
    const planMatch = text.match(/Plan:\s*(.+)/i);
    const speedMatch = text.match(/Speed:\s*(.+)/i);
    const priceMatch = text.match(/Price:\s*Ksh\s*([\d,]+)/i);
    const customerName = nameMatch ? nameMatch[1].trim() : '';
    const customerPhone = phoneMatch ? phoneMatch[1].trim() : '';
    const customerLocation = locationMatch ? locationMatch[1].trim() : '';
    const customerEmail = emailMatch ? emailMatch[1].trim() : '';
    const planName = planMatch ? planMatch[1].trim() : '';
    const planSpeed = speedMatch ? speedMatch[1].trim() : '';
    const planPrice = priceMatch ? parseFloat(priceMatch[1].replace(/,/g, '')) || 0 : 0;
    let selectedPlan = null;
    if (planName) {
      selectedPlan = WIFI_PLANS.find(p => p.name.toLowerCase() === planName.toLowerCase());
      if (!selectedPlan) {
        const planNameParts = planName.split(' \\(');
        if (planNameParts.length > 1) {
          const actualPlanName = planNameParts[1].replace('\\)', '');
          selectedPlan = WIFI_PLANS.find(p => p.name.toLowerCase() === actualPlanName.toLowerCase());
        }
      }
    }
    const finalPlanName = selectedPlan ? selectedPlan.name : planName;
    const finalPlanSpeed = selectedPlan ? selectedPlan.speed : planSpeed;
    const finalPlanPrice = selectedPlan ? parseFloat(selectedPlan.price) : planPrice;
    const finalFeatures = selectedPlan ? selectedPlan.features : [];
    const items = [{
      description: `${finalPlanName} Internet Plan - ${finalPlanSpeed}`,
      quantity: 1,
      unitPrice: finalPlanPrice,
      amount: finalPlanPrice
    }];
    const { subtotal, taxAmount, totalAmount } = calculateTotals(items);
    setInvoiceForm(prev => ({
      ...prev,
      customerName: customerName || prev.customerName,
      customerEmail: customerEmail || prev.customerEmail,
      customerPhone: customerPhone || prev.customerPhone,
      customerLocation: customerLocation || prev.customerLocation,
      planName: finalPlanName,
      planPrice: finalPlanPrice,
      planSpeed: finalPlanSpeed,
      features: finalFeatures,
      items: items,
      subtotal: subtotal,
      taxAmount: taxAmount,
      totalAmount: totalAmount,
      balanceDue: totalAmount - (prev.amountPaid || 0)
    }));
    showNotification('✅ Form populated from WhatsApp message!', 'success');
    setShowPasteModal(false);
    setWhatsappText('');
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setInvoiceForm(prev => ({ ...prev, [name]: value }));
  };

  const selectPlan = (plan) => {
    const planPrice = parseFloat(plan.price) || 0;
    const items = [{
      description: `${plan.name} Internet Plan - ${plan.speed}`,
      quantity: 1,
      unitPrice: planPrice,
      amount: planPrice
    }];
    const { subtotal, taxAmount, totalAmount } = calculateTotals(items);
    setInvoiceForm(prev => ({
      ...prev,
      planName: plan.name,
      planPrice: planPrice,
      planSpeed: plan.speed,
      features: plan.features,
      items: items,
      subtotal: subtotal,
      taxAmount: taxAmount,
      totalAmount: totalAmount,
      balanceDue: totalAmount - (prev.amountPaid || 0)
    }));
    setShowPlanSelection(false);
    showNotification(`✅ ${plan.name} plan selected!`, 'success');
  };

  const handleItemChange = (index, field, value) => {
    const updatedItems = [...invoiceForm.items];
    const item = updatedItems[index];
    if (field === 'quantity' || field === 'unitPrice') {
      const quantity = field === 'quantity' ? parseFloat(value) || 0 : parseFloat(item.quantity) || 0;
      const unitPrice = field === 'unitPrice' ? parseFloat(value) || 0 : parseFloat(item.unitPrice) || 0;
      updatedItems[index] = { ...item, [field]: parseFloat(value) || 0, amount: quantity * unitPrice };
    } else {
      updatedItems[index] = { ...item, [field]: value };
    }
    setInvoiceForm(prev => ({ ...prev, items: updatedItems }));
  };

  const addItem = () => {
    setInvoiceForm(prev => ({
      ...prev,
      items: [...prev.items, { description: '', quantity: 1, unitPrice: 0, amount: 0 }]
    }));
  };

  const removeItem = (index) => {
    if (invoiceForm.items.length > 0) {
      const updatedItems = invoiceForm.items.filter((_, i) => i !== index);
      setInvoiceForm(prev => ({ ...prev, items: updatedItems }));
    }
  };

  const markAsPaid = async (invoiceId) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Authentication session expired. Please log in again.');
      const invoiceToPay = invoices.find(inv => inv._id === invoiceId);
      if (!invoiceToPay) throw new Error('Invoice not found.');
      const response = await fetch(`${API_BASE_URL}/api/invoices/${invoiceId}/paid`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ amount: invoiceToPay.totalAmount || invoiceToPay.planPrice })
      });
      if (response.ok) {
        const updatedInvoice = await response.json();
        setInvoices(prev => prev.map(inv => 
          inv._id === invoiceId ? (updatedInvoice.invoice || updatedInvoice.data || updatedInvoice) : inv
        ));
        showNotification('✅ Invoice marked as paid successfully!', 'success');
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update invoice status');
      }
    } catch (error) {
      console.error('Error marking invoice as paid:', error);
      showNotification(`🚨 Error: ${error.message}`, 'error');
    }
  };

  const createInvoice = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Authentication session expired.');
      if (!invoiceForm.customerName?.trim() || !invoiceForm.customerEmail?.trim() || !invoiceForm.planName?.trim()) {
        let missing = [];
        if (!invoiceForm.customerName?.trim()) missing.push('Customer Name');
        if (!invoiceForm.customerEmail?.trim()) missing.push('Customer Email');
        if (!invoiceForm.planName?.trim()) missing.push('Plan Name');
        showNotification(`⚠️ Missing: ${missing.join(', ')}`, 'warning');
        return;
      }
      const invoiceData = {
        ...invoiceForm,
        invoiceNumber: invoiceForm.invoiceNumber || generateInvoiceNumber(),
        invoiceDate: new Date(invoiceForm.invoiceDate),
        dueDate: new Date(invoiceForm.dueDate),
        planPrice: parseFloat(invoiceForm.planPrice) || 0,
        subtotal: parseFloat(invoiceForm.subtotal) || 0,
        taxRate: parseFloat(invoiceForm.taxRate) || 0,
        taxAmount: parseFloat(invoiceForm.taxAmount) || 0,
        discount: parseFloat(invoiceForm.discount) || 0,
        totalAmount: parseFloat(invoiceForm.totalAmount) || 0,
        amountPaid: parseFloat(invoiceForm.amountPaid) || 0,
        balanceDue: parseFloat(invoiceForm.balanceDue) || 0,
      };
      const response = await fetch(`${API_BASE_URL}/api/invoices`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(invoiceData)
      });
      if (response.ok) {
        const newInvoice = await response.json();
        const saved = newInvoice.invoice || newInvoice.data || newInvoice;
        if (!saved.invoiceNumber) saved.invoiceNumber = generateInvoiceNumber();
        setInvoices(prev => [...prev, saved]);
        setShowCreateModal(false);
        resetForm();
        showNotification('✅ Invoice created!', 'success');
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create invoice');
      }
    } catch (error) {
      console.error('Error creating invoice:', error);
      showNotification(`🚨 Error: ${error.message}`, 'error');
    }
  };

  const updateInvoice = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Authentication session expired.');
      if (!invoiceForm.customerName?.trim() || !invoiceForm.customerEmail?.trim() || !invoiceForm.planName?.trim()) {
        let missing = [];
        if (!invoiceForm.customerName?.trim()) missing.push('Customer Name');
        if (!invoiceForm.customerEmail?.trim()) missing.push('Customer Email');
        if (!invoiceForm.planName?.trim()) missing.push('Plan Name');
        showNotification(`⚠️ Missing: ${missing.join(', ')}`, 'warning');
        return;
      }
      const invoiceData = {
        ...invoiceForm,
        invoiceDate: new Date(invoiceForm.invoiceDate),
        dueDate: new Date(invoiceForm.dueDate),
        planPrice: parseFloat(invoiceForm.planPrice) || 0,
        subtotal: parseFloat(invoiceForm.subtotal) || 0,
        taxRate: parseFloat(invoiceForm.taxRate) || 0,
        taxAmount: parseFloat(invoiceForm.taxAmount) || 0,
        discount: parseFloat(invoiceForm.discount) || 0,
        totalAmount: parseFloat(invoiceForm.totalAmount) || 0,
        amountPaid: parseFloat(invoiceForm.amountPaid) || 0,
        balanceDue: parseFloat(invoiceForm.balanceDue) || 0,
      };
      const response = await fetch(`${API_BASE_URL}/api/invoices/${editingInvoice._id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(invoiceData)
      });
      if (response.ok) {
        const updatedInvoice = await response.json();
        setInvoices(prev => prev.map(inv => 
          inv._id === editingInvoice._id ? (updatedInvoice.invoice || updatedInvoice.data || updatedInvoice) : inv
        ));
        setShowCreateModal(false);
        setEditingInvoice(null);
        resetForm();
        showNotification('✅ Invoice updated!', 'success');
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update invoice');
      }
    } catch (error) {
      console.error('Error updating invoice:', error);
      showNotification(`🚨 Error: ${error.message}`, 'error');
    }
  };

  const deleteInvoice = async (invoiceId) => {
    if (!window.confirm('Are you sure you want to delete this invoice? This action cannot be undone.')) return;
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Session expired.');
      const response = await fetch(`${API_BASE_URL}/api/invoices/${invoiceId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        setInvoices(prev => prev.filter(inv => inv._id !== invoiceId));
        showNotification('✅ Invoice deleted successfully!', 'success');
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete invoice');
      }
    } catch (error) {
      console.error('Error deleting invoice:', error);
      showNotification(`🚨 Error: ${error.message}`, 'error');
    }
  };

  // ✅ UPDATED: Enhanced PDF Download
  const downloadPDFHandler = async (invoice) => {
    if (!invoice) {
      showNotification('⚠️ Invalid invoice.', 'warning');
      return;
    }
    await generateInvoicePDF(invoice, showNotification);
  };

  // ✅ UPDATED: Enhanced Email Sending
  const sendInvoiceViaEmailHandler = (invoice) => {
    if (!invoice || !invoice.customerEmail?.trim()) {
      showNotification('⚠️ Customer email is required to send invoice.', 'warning');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(invoice.customerEmail.trim())) {
      showNotification('⚠️ Invalid email format.', 'warning');
      return;
    }

    setSendingInvoice(invoice._id);
    setTimeout(() => {
      setSendingInvoice(null);
      openEmailClient(invoice, showNotification);
    }, 300);
  };

  const exportInvoicesToExcel = async () => {
    try {
      setExportLoading(true);
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Session expired.');
      const response = await fetch(`${API_BASE_URL}/api/invoices/export/excel`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to export: ${response.status}`);
      }
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `invoices_${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      showNotification('✅ Invoices exported to Excel successfully!', 'success');
    } catch (error) {
      console.error('Export error:', error);
      showNotification(`🚨 Error: ${error.message}`, 'error');
    } finally {
      setExportLoading(false);
    }
  };

  const editInvoice = (invoice) => {
    setInvoiceForm({
      invoiceNumber: invoice.invoiceNumber || '',
      customerName: invoice.customerName || '',
      customerEmail: invoice.customerEmail || '',
      customerPhone: invoice.customerPhone || '',
      customerLocation: invoice.customerLocation || '',
      planName: invoice.planName || '',
      planPrice: invoice.planPrice || 0,
      planSpeed: invoice.planSpeed || '',
      features: invoice.features || [],
      connectionType: invoice.connectionType || 'Fiber Optic',
      invoiceDate: invoice.invoiceDate ? new Date(invoice.invoiceDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      dueDate: invoice.dueDate ? new Date(invoice.dueDate).toISOString().split('T')[0] : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      items: invoice.items && invoice.items.length > 0 ? invoice.items.map(item => ({
        ...item,
        quantity: parseFloat(item.quantity) || 1,
        unitPrice: parseFloat(item.unitPrice) || 0,
        amount: parseFloat(item.amount) || 0
      })) : [{
        description: `${invoice.planName} - ${invoice.planSpeed}`,
        quantity: 1,
        unitPrice: invoice.planPrice,
        amount: invoice.planPrice
      }],
      subtotal: invoice.subtotal || 0,
      taxRate: invoice.taxRate || 16,
      taxAmount: invoice.taxAmount || 0,
      discount: invoice.discount || 0,
      discountType: invoice.discountType || 'none',
      totalAmount: invoice.totalAmount || 0,
      amountPaid: invoice.amountPaid || 0,
      balanceDue: invoice.balanceDue || 0,
      status: invoice.status || 'pending',
      paymentMethod: invoice.paymentMethod || 'mobile_money',
      paymentTerms: invoice.paymentTerms || 'Due upon receipt',
      notes: invoice.notes || '',
      terms: invoice.terms || 'Payment due within 30 days. Late payments may attract a penalty fee of 5% per month. All payments should be made to the bank details provided.',
      billingCycle: invoice.billingCycle || 'monthly'
    });
    setEditingInvoice(invoice);
    setShowCreateModal(true);
  };

  const viewInvoice = (invoice) => {
    setSelectedInvoice(invoice);
    setShowInvoiceModal(true);
  };

  const filteredInvoices = Array.isArray(invoices) 
    ? invoices.filter(invoice => {
        if (!invoice || typeof invoice !== 'object') return false;
        const matchesFilter = filter === 'all' || 
          (filter === 'paid' && invoice.status === 'paid') ||
          (filter === 'pending' && invoice.status === 'pending') ||
          (filter === 'overdue' && invoice.status === 'overdue') ||
          (filter === 'partially_paid' && invoice.status === 'partially_paid');
        const lowerSearchTerm = searchTerm.toLowerCase();
        const matchesSearch = 
          (invoice.customerName?.toLowerCase() || '').includes(lowerSearchTerm) ||
          (invoice.invoiceNumber?.toLowerCase() || '').includes(lowerSearchTerm) ||
          (invoice.customerEmail?.toLowerCase() || '').includes(lowerSearchTerm) ||
          (invoice.customerPhone?.toLowerCase() || '').includes(lowerSearchTerm) ||
          (invoice.planName?.toLowerCase() || '').includes(lowerSearchTerm);
        return matchesFilter && matchesSearch;
      })
    : [];

  const stats = {
    totalInvoices: invoices.length,
    pendingInvoices: invoices.filter(inv => inv.status === 'pending').length,
    paidInvoices: invoices.filter(inv => inv.status === 'paid').length,
    overdueInvoices: invoices.filter(inv => inv.status === 'overdue').length,
    totalRevenue: invoices.reduce((sum, inv) => sum + (parseFloat(inv.totalAmount) || parseFloat(inv.planPrice) || 0), 0),
    monthlyRevenue: invoices.filter(inv => inv.billingCycle === 'monthly').reduce((sum, inv) => sum + (parseFloat(inv.totalAmount) || parseFloat(inv.planPrice) || 0), 0),
    quarterlyRevenue: invoices.filter(inv => inv.billingCycle === 'quarterly').reduce((sum, inv) => sum + (parseFloat(inv.totalAmount) || parseFloat(inv.planPrice) || 0), 0),
    annualRevenue: invoices.filter(inv => inv.billingCycle === 'annually').reduce((sum, inv) => sum + (parseFloat(inv.totalAmount) || parseFloat(inv.planPrice) || 0), 0),
    oneTimeRevenue: invoices.filter(inv => inv.billingCycle === 'one_time').reduce((sum, inv) => sum + (parseFloat(inv.totalAmount) || parseFloat(inv.planPrice) || 0), 0)
  };

  const statusData = [
    { name: 'Paid', value: stats.paidInvoices, color: '#28a745' },
    { name: 'Pending', value: stats.pendingInvoices, color: '#ffc107' },
    { name: 'Overdue', value: stats.overdueInvoices, color: '#dc3545' },
    { name: 'Draft/Other', value: stats.totalInvoices - stats.paidInvoices - stats.pendingInvoices - stats.overdueInvoices, color: '#6c757d' }
  ].filter(d => d.value > 0);

  const revenueData = [
    { name: 'Monthly', value: stats.monthlyRevenue },
    { name: 'Quarterly', value: stats.quarterlyRevenue },
    { name: 'Annually', value: stats.annualRevenue },
    { name: 'One Time', value: stats.oneTimeRevenue }
  ].filter(d => d.value > 0);

  const timeSeriesMap = invoices
    .filter(inv => inv.invoiceDate)
    .reduce((acc, inv) => {
      const dateKey = new Date(inv.invoiceDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      const amount = parseFloat(inv.totalAmount) || parseFloat(inv.planPrice) || 0;
      acc[dateKey] = (acc[dateKey] || 0) + amount;
      return acc;
    }, {});

  const timeSeriesData = Object.keys(timeSeriesMap)
    .map(date => ({ date, amount: timeSeriesMap[date] }))
    .sort((a, b) => new Date(a.date) - new Date(b.date));

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-t-2 border-[#003366]"></div>
      </div>
    );
  }

  return (
    <div>
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold mb-2 bg-gradient-to-r from-[#003366] to-[#FFCC00] bg-clip-text text-transparent">
            Invoice Management
          </h2>
          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Total: {invoices.length} invoices | Total Revenue: Ksh {formatPrice(stats.totalRevenue)}
          </p>
        </div>
        <div className="flex flex-wrap gap-3 mt-4 md:mt-0">
          <button 
            onClick={fetchInvoices}
            className={`${themeClasses.button.small.base} ${darkMode ? themeClasses.button.small.dark : themeClasses.button.small.light} flex items-center`}
          >
            <RefreshCw size={16} className="mr-1.5" />
            Refresh
          </button>
          <button 
            onClick={exportInvoicesToExcel}
            disabled={exportLoading}
            className={`${themeClasses.button.small.base} ${darkMode ? themeClasses.button.small.dark : themeClasses.button.small.light} flex items-center ${
              exportLoading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            <FileSpreadsheet size={16} className="mr-1.5" />
            {exportLoading ? 'Exporting...' : 'Export Excel'}
          </button>
          <button 
            onClick={() => {
              setEditingInvoice(null);
              resetForm();
              setInvoiceForm(prev => ({
                ...prev,
                invoiceNumber: generateInvoiceNumber()
              }));
              setShowCreateModal(true);
            }}
            className={`${themeClasses.button.primary.base} ${darkMode ? themeClasses.button.primary.dark : themeClasses.button.primary.light} flex items-center`}
          >
            <Plus size={16} className="mr-1.5" />
            New Invoice
          </button>
          <button 
            onClick={() => setShowPasteModal(true)}
            className={`${themeClasses.button.small.base} ${darkMode ? themeClasses.button.secondary.dark : themeClasses.button.secondary.light} flex items-center`}
          >
            <ClipboardPaste size={16} className="mr-1.5" />
            Paste from WhatsApp
          </button>
        </div>
      </div>

      {/* STATS CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className={`${themeClasses.card} rounded-xl p-4 border-l-4 border-[#003366]`}>
          <div className="flex items-center">
            <FileText className={`h-8 w-8 mr-3 ${darkMode ? 'text-blue-400' : 'text-[#003366]'}`} />
            <div>
              <p className="text-sm font-medium">Total Invoices</p>
              <p className="text-2xl font-bold">{stats.totalInvoices}</p>
            </div>
          </div>
        </div>
        <div className={`${themeClasses.card} rounded-xl p-4 border-l-4 border-[#FFCC00]`}>
          <div className="flex items-center">
            <Clock className={`h-8 w-8 mr-3 ${darkMode ? 'text-yellow-400' : 'text-[#FFCC00]'}`} />
            <div>
              <p className="text-sm font-medium">Pending</p>
              <p className="text-2xl font-bold">{stats.pendingInvoices}</p>
            </div>
          </div>
        </div>
        <div className={`${themeClasses.card} rounded-xl p-4 border-l-4 border-[#28a745]`}>
          <div className="flex items-center">
            <CheckCircle className={`h-8 w-8 mr-3 ${darkMode ? 'text-green-400' : 'text-[#28a745]'}`} />
            <div>
              <p className="text-sm font-medium">Paid</p>
              <p className="text-2xl font-bold">{stats.paidInvoices}</p>
            </div>
          </div>
        </div>
        <div className={`${themeClasses.card} rounded-xl p-4 border-l-4 border-[#dc3545]`}>
          <div className="flex items-center">
            <AlertCircle className={`h-8 w-8 mr-3 ${darkMode ? 'text-red-400' : 'text-[#dc3545]'}`} />
            <div>
              <p className="text-sm font-medium">Overdue</p>
              <p className="text-2xl font-bold">{stats.overdueInvoices}</p>
            </div>
          </div>
        </div>
      </div>

      {/* FILTERS & SEARCH */}
      <div className={`${themeClasses.card} rounded-xl p-4 mb-6`}>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${filter === 'all' 
                ? 'bg-[#003366] text-white' 
                : darkMode ? 'bg-gray-700' : 'bg-gray-200'}`}
            >
              All Invoices
            </button>
            <button
              onClick={() => setFilter('pending')}
              className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center ${filter === 'pending' 
                ? 'bg-yellow-500 text-white' 
                : darkMode ? 'bg-gray-700' : 'bg-gray-200'}`}
            >
              <Clock size={14} className="mr-1" /> Pending
            </button>
            <button
              onClick={() => setFilter('paid')}
              className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center ${filter === 'paid' 
                ? 'bg-green-500 text-white' 
                : darkMode ? 'bg-gray-700' : 'bg-gray-200'}`}
            >
              <CheckCircle size={14} className="mr-1" /> Paid
            </button>
            <button
              onClick={() => setFilter('overdue')}
              className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center ${filter === 'overdue' 
                ? 'bg-red-500 text-white' 
                : darkMode ? 'bg-gray-700' : 'bg-gray-200'}`}
            >
              <AlertCircle size={14} className="mr-1" /> Overdue
            </button>
          </div>
          <div className="relative w-full md:w-64">
            <Search size={18} className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
            <input
              type="text"
              placeholder="Search invoices..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full pl-10 pr-4 py-2 rounded-lg border ${themeClasses.input}`}
            />
          </div>
        </div>
      </div>

      {/* TABLE */}
      <div className={`${themeClasses.card} rounded-xl shadow-lg border backdrop-blur-sm overflow-hidden`}>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider">Invoice #</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider hidden md:table-cell">Customer</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider hidden lg:table-cell">Plan/Details</th>
                <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider">Total</th>
                <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider hidden sm:table-cell">Balance</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${darkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
              {filteredInvoices.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-8 text-center">
                    <FileText size={48} className={`mb-4 ${darkMode ? 'text-gray-600' : 'text-gray-400'}`} />
                    <p className={`text-lg font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      {invoices.length === 0 ? 'No invoices yet' : 'No matching invoices found'}
                    </p>
                    <button 
                      onClick={() => {
                        setEditingInvoice(null);
                        resetForm();
                        setInvoiceForm(prev => ({...prev, invoiceNumber: generateInvoiceNumber()}));
                        setShowCreateModal(true);
                      }}
                      className="px-4 py-2 bg-[#003366] text-white rounded-lg hover:bg-[#002244] transition-colors"
                    >
                      Create Your First Invoice
                    </button>
                  </td>
                </tr>
              ) : (
                filteredInvoices.map((invoice) => (
                  <tr key={invoice._id} className={`${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}`}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {invoice.invoiceNumber || `INV-${invoice._id?.substring(0,4)}`}
                      </div>
                      <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        Due: {invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString() : 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap hidden md:table-cell">
                      <div className="text-sm font-medium">{invoice.customerName}</div>
                      <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        {invoice.customerEmail}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap hidden lg:table-cell">
                      <div className="text-sm font-medium">{invoice.planName}</div>
                      <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        {invoice.planSpeed}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        Ksh {formatPrice(invoice.totalAmount || invoice.planPrice || 0)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right hidden sm:table-cell">
                      <div className={`text-sm font-semibold ${invoice.balanceDue > 0 ? 'text-red-500' : 'text-green-500'}`}>
                        Ksh {formatPrice(invoice.balanceDue)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        invoice.status === 'paid' 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                          : invoice.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                          : invoice.status === 'overdue'
                          ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                          : invoice.status === 'partially_paid'
                          ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                          : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                      }`}>
                        {invoice.status === 'paid' ? <><CheckCircle size={12} className="mr-1" /> Paid</> :
                         invoice.status === 'pending' ? <><Clock size={12} className="mr-1" /> Pending</> :
                         invoice.status === 'overdue' ? <><AlertCircle size={12} className="mr-1" /> Overdue</> :
                         invoice.status === 'partially_paid' ? <><CreditCard size={12} className="mr-1" /> Partial</> :
                         <><FileText size={12} className="mr-1" /> {invoice.status}</>}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex justify-end space-x-1">
                        <button
                          onClick={() => viewInvoice(invoice)}
                          className={`p-2 rounded-lg ${darkMode ? 'text-gray-400 hover:bg-gray-600' : 'text-gray-600 hover:bg-gray-100'}`}
                          title="View Details"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          onClick={() => editInvoice(invoice)}
                          className={`p-2 rounded-lg ${darkMode ? 'text-yellow-400 hover:bg-gray-600' : 'text-yellow-600 hover:bg-gray-100'}`}
                          title="Edit Invoice"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => downloadPDFHandler(invoice)}
                          className={`p-2 rounded-lg ${darkMode ? 'text-blue-400 hover:bg-gray-600' : 'text-blue-600 hover:bg-gray-100'}`}
                          title="Download PDF"
                        >
                          <Download size={16} />
                        </button>
                        <button
                          onClick={() => sendInvoiceViaEmailHandler(invoice)}
                          disabled={sendingInvoice === invoice._id}
                          className={`p-2 rounded-lg flex items-center justify-center w-8 h-8 ${darkMode ? 'text-green-400 hover:bg-gray-600' : 'text-green-600 hover:bg-gray-100'} ${
                            sendingInvoice === invoice._id ? 'opacity-50 cursor-not-allowed' : ''
                          }`}
                          title="Send via Email"
                        >
                          {sendingInvoice === invoice._id ? (
                            <Loader2 size={16} className="animate-spin" />
                          ) : (
                            <Send size={16} />
                          )}
                        </button>
                        {invoice.status !== 'paid' && (
                          <button
                            onClick={() => markAsPaid(invoice._id)}
                            className={`p-2 rounded-lg ${darkMode ? 'text-blue-400 hover:bg-gray-600' : 'text-blue-600 hover:bg-gray-100'}`}
                            title="Mark as Paid"
                          >
                            <CreditCard size={16} />
                          </button>
                        )}
                        <button
                          onClick={() => deleteInvoice(invoice._id)}
                          className={`p-2 rounded-lg ${darkMode ? 'text-red-400 hover:bg-gray-600' : 'text-red-600 hover:bg-gray-100'}`}
                          title="Delete Invoice"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CHARTS SECTION */}
      {filteredInvoices.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          <div className={`${themeClasses.card} rounded-xl p-4`}>
            <h3 className="text-lg font-semibold mb-4">Invoice Status Distribution</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value} invoices`, 'Count']} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className={`${themeClasses.card} rounded-xl p-4`}>
            <h3 className="text-lg font-semibold mb-4">Revenue Over Time</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={timeSeriesData}>
                  <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? "#374151" : "#e5e7eb"} />
                  <XAxis dataKey="date" stroke={darkMode ? "#9ca3af" : "#6b7280"} />
                  <YAxis stroke={darkMode ? "#9ca3af" : "#6b7280"} />
                  <Tooltip 
                    formatter={(value) => [`Ksh ${formatPrice(value)}`, 'Revenue']}
                    labelStyle={{ color: darkMode ? '#fff' : '#333' }}
                    contentStyle={{ 
                      backgroundColor: darkMode ? '#1f2937' : '#fff',
                      borderColor: darkMode ? '#374151' : '#e5e7eb'
                    }}
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="amount" 
                    stroke="#003366" 
                    strokeWidth={2}
                    dot={{ fill: '#003366', r: 4 }}
                    activeDot={{ r: 6, fill: '#FFCC00' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* MODALS */}
      {/* Paste WhatsApp Modal */}
      {showPasteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className={`${themeClasses.card} rounded-xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto`}>
            <div className="flex justify-between items-center border-b p-4">
              <h3 className="text-xl font-semibold">Paste WhatsApp Message</h3>
              <button onClick={() => setShowPasteModal(false)} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
                <X size={20} />
              </button>
            </div>
            <div className="p-4">
              <p className="mb-4 text-sm">Paste WhatsApp message to auto-fill:</p>
              <textarea
                value={whatsappText}
                onChange={(e) => setWhatsappText(e.target.value)}
                placeholder={`Example:
Name: John Doe
Phone: +254712345678
Location: Nairobi
Email: john@example.com
Plan: Gazzelle
Speed: 30Mbps
Price: Ksh 2999`}
                className={`w-full h-48 p-3 border rounded-lg resize-none ${themeClasses.input}`}
              />
              <div className="flex justify-end gap-3 mt-6">
                <button onClick={() => setShowPasteModal(false)} className={`px-4 py-2 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>Cancel</button>
                <button onClick={parseAndPopulateFromWhatsApp} disabled={!whatsappText.trim()} className="px-4 py-2 rounded-lg bg-[#003366] text-white">Populate Form</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create/Edit Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className={`${themeClasses.card} rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto`}>
            <div className="flex justify-between items-center border-b p-4">
              <h3 className="text-xl font-semibold">{editingInvoice ? 'Edit Invoice' : 'Create New Invoice'}</h3>
              <button onClick={() => { setShowCreateModal(false); setEditingInvoice(null); resetForm(); }} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
                <X size={20} />
              </button>
            </div>
            <div className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium mb-1">Invoice Number *</label>
                  <input type="text" name="invoiceNumber" value={invoiceForm.invoiceNumber} onChange={handleInputChange} className={`w-full p-2 border rounded ${themeClasses.input}`} required />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Invoice Date *</label>
                  <input type="date" name="invoiceDate" value={invoiceForm.invoiceDate} onChange={handleInputChange} className={`w-full p-2 border rounded ${themeClasses.input}`} required />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Customer Name *</label>
                  <input type="text" name="customerName" value={invoiceForm.customerName} onChange={handleInputChange} className={`w-full p-2 border rounded ${themeClasses.input}`} required />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Customer Email *</label>
                  <input type="email" name="customerEmail" value={invoiceForm.customerEmail} onChange={handleInputChange} className={`w-full p-2 border rounded ${themeClasses.input}`} required />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Customer Phone</label>
                  <input type="text" name="customerPhone" value={invoiceForm.customerPhone} onChange={handleInputChange} className={`w-full p-2 border rounded ${themeClasses.input}`} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Customer Location</label>
                  <input type="text" name="customerLocation" value={invoiceForm.customerLocation} onChange={handleInputChange} className={`w-full p-2 border rounded ${themeClasses.input}`} />
                </div>
                <div className="md:col-span-2">
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-sm font-medium">Select Plan *</label>
                    <button type="button" onClick={() => setShowPlanSelection(true)} className={`text-sm ${darkMode ? 'text-blue-400' : 'text-blue-600'} flex items-center`}>
                      <Wifi size={14} className="mr-1" /> Browse Plans
                    </button>
                  </div>
                  <div className="flex gap-2">
                    <input type="text" name="planName" value={invoiceForm.planName} onChange={handleInputChange} className={`flex-1 p-2 border rounded ${themeClasses.input}`} required />
                    <input type="text" name="planSpeed" value={invoiceForm.planSpeed} onChange={handleInputChange} className={`w-32 p-2 border rounded ${themeClasses.input}`} />
                    <input type="number" name="planPrice" value={invoiceForm.planPrice} onChange={handleInputChange} className={`w-32 p-2 border rounded ${themeClasses.input}`} step="0.01" />
                  </div>
                </div>
              </div>
              
              {/* Tax & Discount */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium mb-1">Tax Rate (%)</label>
                  <input type="number" name="taxRate" value={invoiceForm.taxRate} onChange={handleInputChange} className={`w-full p-2 border rounded ${themeClasses.input}`} step="0.01" min="0" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Discount Type</label>
                  <select name="discountType" value={invoiceForm.discountType} onChange={handleInputChange} className={`w-full p-2 border rounded ${themeClasses.input}`}>
                    <option value="none">No Discount</option>
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed Amount</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Discount Value</label>
                  <input type="number" name="discount" value={invoiceForm.discount} onChange={handleInputChange} className={`w-full p-2 border rounded ${themeClasses.input}`} step="0.01" min="0" />
                </div>
              </div>
              
              {/* Items */}
              <div className="mb-6">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="text-lg font-medium">Invoice Items</h4>
                  <button onClick={addItem} className={`px-3 py-1 text-sm rounded ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>+ Add Item</button>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-800">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium">Description</th>
                        <th className="px-4 py-2 text-left text-xs font-medium w-20">Qty</th>
                        <th className="px-4 py-2 text-left text-xs font-medium w-32">Unit Price</th>
                        <th className="px-4 py-2 text-left text-xs font-medium w-32">Amount</th>
                        <th className="px-4 py-2 text-left text-xs font-medium w-16">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {invoiceForm.items.map((item, index) => (
                        <tr key={index}>
                          <td className="px-4 py-2"><input type="text" value={item.description} onChange={(e) => handleItemChange(index, 'description', e.target.value)} className={`w-full p-1 border rounded ${themeClasses.input}`} placeholder="Item description" /></td>
                          <td className="px-4 py-2"><input type="number" value={item.quantity} onChange={(e) => handleItemChange(index, 'quantity', e.target.value)} className={`w-full p-1 border rounded ${themeClasses.input}`} min="1" step="1" /></td>
                          <td className="px-4 py-2"><input type="number" value={item.unitPrice} onChange={(e) => handleItemChange(index, 'unitPrice', e.target.value)} className={`w-full p-1 border rounded ${themeClasses.input}`} step="0.01" placeholder="0.00" /></td>
                          <td className="px-4 py-2 font-medium">Ksh {formatPrice(item.amount)}</td>
                          <td className="px-4 py-2">
                            {invoiceForm.items.length > 1 && (
                              <button onClick={() => removeItem(index)} className={`p-1 rounded ${darkMode ? 'text-red-400' : 'text-red-600'}`}>
                                <Trash2 size={16} />
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              
              {/* Summary & Payment */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-1">Payment Method</label>
                    <select name="paymentMethod" value={invoiceForm.paymentMethod} onChange={handleInputChange} className={`w-full p-2 border rounded ${themeClasses.input}`}>
                      <option value="mobile_money">Mobile Money</option>
                      <option value="bank_transfer">Bank Transfer</option>
                      <option value="cash">Cash</option>
                      <option value="credit_card">Credit Card</option>
                    </select>
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-1">Payment Terms</label>
                    <input type="text" name="paymentTerms" value={invoiceForm.paymentTerms} onChange={handleInputChange} className={`w-full p-2 border rounded ${themeClasses.input}`} />
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-1">Notes</label>
                    <textarea name="notes" value={invoiceForm.notes} onChange={handleInputChange} className={`w-full p-2 border rounded h-24 ${themeClasses.input}`} placeholder="Additional notes for the customer..." />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Terms & Conditions</label>
                    <textarea name="terms" value={invoiceForm.terms} onChange={handleInputChange} className={`w-full p-2 border rounded h-24 ${themeClasses.input}`} />
                  </div>
                </div>
                <div>
                  <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-gray-50'} border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                    <h4 className="text-lg font-medium mb-3">Invoice Summary</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between"><span>Subtotal:</span><span>Ksh {formatPrice(invoiceForm.subtotal)}</span></div>
                      <div className="flex justify-between"><span>VAT ({invoiceForm.taxRate}%):</span><span>Ksh {formatPrice(invoiceForm.taxAmount)}</span></div>
                      {invoiceForm.discount > 0 && (
                        <div className="flex justify-between text-green-600 dark:text-green-400">
                          <span>Discount:</span>
                          <span>- Ksh {formatPrice(invoiceForm.discountType === 'percentage' ? (invoiceForm.subtotal * invoiceForm.discount / 100) : invoiceForm.discount)}</span>
                        </div>
                      )}
                      <div className="flex justify-between border-t pt-2">
                        <span className="font-semibold">Total Amount:</span>
                        <span className="font-bold text-lg text-[#003366]">Ksh {formatPrice(invoiceForm.totalAmount)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Amount Paid:</span>
                        <input type="number" name="amountPaid" value={invoiceForm.amountPaid} onChange={handleInputChange} className={`w-32 p-1 border rounded text-right ${themeClasses.input}`} step="0.01" min="0" />
                      </div>
                      <div className="flex justify-between border-t pt-2">
                        <span className="font-semibold">Balance Due:</span>
                        <span className={`font-bold ${invoiceForm.balanceDue > 0 ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>
                          Ksh {formatPrice(invoiceForm.balanceDue)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-8 pt-4 border-t">
                <button onClick={() => { setShowCreateModal(false); setEditingInvoice(null); resetForm(); }} className={`px-4 py-2 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>Cancel</button>
                <button onClick={editingInvoice ? updateInvoice : createInvoice} className="px-6 py-2 rounded-lg bg-[#003366] text-white hover:bg-[#002244] transition-colors">
                  {editingInvoice ? 'Update Invoice' : 'Create Invoice'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Plan Selection Modal */}
      {showPlanSelection && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className={`${themeClasses.card} rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto`}>
            <div className="flex justify-between items-center border-b p-4">
              <h3 className="text-xl font-semibold">Select Internet Plan</h3>
              <button onClick={() => setShowPlanSelection(false)} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
                <X size={20} />
              </button>
            </div>
            <div className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {WIFI_PLANS.map((plan) => (
                  <div
                    key={plan.id}
                    className={`border rounded-xl p-4 cursor-pointer transition-all hover:shadow-lg ${
                      plan.popular ? 'border-[#FFCC00] ring-2 ring-[#FFCC00]' : ''
                    } ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}
                    onClick={() => selectPlan(plan)}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="text-lg font-bold">{plan.name}</h4>
                        <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{plan.speed}</p>
                      </div>
                      {plan.popular && (
                        <span className="px-2 py-1 text-xs font-bold bg-[#FFCC00] text-black rounded-full">POPULAR</span>
                      )}
                    </div>
                    <div className="mb-4">
                      <div className="text-2xl font-bold text-[#003366]">
                        Ksh {plan.price}<span className="text-sm font-normal text-gray-500">/month</span>
                      </div>
                    </div>
                    <ul className="space-y-2 mb-4">
                      {plan.features.map((feature, idx) => (
                        <li key={idx} className="flex items-center text-sm">
                          <CheckCircle size={14} className="mr-2 text-green-500" /> {feature}
                        </li>
                      ))}
                    </ul>
                    <button className={`w-full py-2 rounded-lg font-medium ${darkMode ? 'bg-[#003366] text-white' : 'bg-[#003366] text-white'}`}>
                      Select Plan
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* View Invoice Modal */}
      {showInvoiceModal && selectedInvoice && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className={`${themeClasses.card} rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto`}>
            <div className="flex justify-between items-center border-b p-4">
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-semibold">Invoice Preview</h3>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  selectedInvoice.status === 'paid' 
                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                    : selectedInvoice.status === 'pending'
                    ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                    : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                }`}>
                  {selectedInvoice.status.toUpperCase().replace('_', ' ')}
                </span>
              </div>
              <button onClick={() => setShowInvoiceModal(false)} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
                <X size={20} />
              </button>
            </div>
            <div className="p-4">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-[#003366]">{COMPANY_INFO.name}</h2>
                <p className="text-gray-600 dark:text-gray-400">{COMPANY_INFO.tagline}</p>
              </div>
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <h4 className="font-semibold text-[#003366] mb-2">Bill To:</h4>
                  <div className={`p-3 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
                    <p className="font-medium">{selectedInvoice.customerName}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{selectedInvoice.customerEmail}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{selectedInvoice.customerPhone}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{selectedInvoice.customerLocation}</p>
                  </div>
                </div>
                <div className="text-right">
                  <h4 className="font-semibold text-[#003366] mb-2">Invoice Details:</h4>
                  <div className={`p-3 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
                    <p className="font-medium">#{selectedInvoice.invoiceNumber || selectedInvoice._id.substring(0,8)}</p>
                    <p className="text-sm">Date: {new Date(selectedInvoice.invoiceDate).toLocaleDateString()}</p>
                    <p className="text-sm">Due: {new Date(selectedInvoice.dueDate).toLocaleDateString()}</p>
                    <p className="text-sm">Plan: {selectedInvoice.planName}</p>
                  </div>
                </div>
              </div>
              <div className="mb-6">
                <h4 className="font-semibold text-[#003366] mb-3">Items:</h4>
                <div className={`border rounded-lg overflow-hidden ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                  <div className="grid grid-cols-4 gap-2 p-3 bg-gray-50 dark:bg-gray-800 font-medium">
                    <div>Description</div>
                    <div className="text-right">Quantity</div>
                    <div className="text-right">Unit Price</div>
                    <div className="text-right">Amount</div>
                  </div>
                  {selectedInvoice.items?.map((item, idx) => (
                    <div key={idx} className="grid grid-cols-4 gap-2 p-3 border-t dark:border-gray-700">
                      <div>{item.description}</div>
                      <div className="text-right">{item.quantity || 1}</div>
                      <div className="text-right">Ksh {formatPrice(item.unitPrice)}</div>
                      <div className="text-right font-medium">Ksh {formatPrice(item.amount)}</div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="border-t pt-4">
                <div className="space-y-2">
                  <div className="flex justify-between"><span>Subtotal:</span><span>Ksh {formatPrice(selectedInvoice.subtotal)}</span></div>
                  {selectedInvoice.taxRate > 0 && (
                    <div className="flex justify-between"><span>VAT ({selectedInvoice.taxRate || 0}%):</span><span>Ksh {formatPrice(selectedInvoice.taxAmount)}</span></div>
                  )}
                  <div className="flex justify-between font-bold text-lg mt-2 border-t pt-2">
                    <span>Total Amount:</span>
                    <span className="text-[#003366]">Ksh {formatPrice(selectedInvoice.totalAmount)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Amount Paid:</span>
                    <span className="text-green-600 dark:text-green-400">Ksh {formatPrice(selectedInvoice.amountPaid)}</span>
                  </div>
                  <div className="flex justify-between border-t pt-2 font-bold">
                    <span>Balance Due:</span>
                    <span className={selectedInvoice.balanceDue > 0 ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}>
                      Ksh {formatPrice(selectedInvoice.balanceDue)}
                    </span>
                  </div>
                </div>
              </div>
              <div className="mt-6 text-sm text-gray-600 dark:text-gray-400">
                <p>{selectedInvoice.terms || 'Payment due within 30 days. Late payments may attract a penalty fee of 5% per month.'}</p>
              </div>
              <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
                <button
                  onClick={() => downloadPDFHandler(selectedInvoice)}
                  className="px-4 py-2 bg-[#003366] text-white rounded-lg hover:bg-[#002244] transition-colors flex items-center"
                >
                  <Download size={16} className="mr-2" /> Download PDF
                </button>
                <button
                  onClick={() => sendInvoiceViaEmailHandler(selectedInvoice)}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center"
                >
                  <Send size={16} className="mr-2" /> Send via Email
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InvoiceManager;