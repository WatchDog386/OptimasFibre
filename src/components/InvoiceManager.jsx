// InvoiceManager.jsx - UPDATED VERSION WITH IMPROVED EMAIL ATTACHMENT FLOW
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
  Globe,
  Share2,
  Smartphone,
  QrCode,
  Link,
  Paperclip,
  FolderOpen
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, LabelList,
  LineChart, Line, ReferenceLine
} from 'recharts';

// ✅ ENHANCED CLIENT-SIDE PDF GENERATION
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

// ✅ HELPER: Create attachment guidance for email
const createAttachmentGuide = (fileName) => {
  return `
    <div style="background:#e8f4fd; border:2px solid #2196f3; border-radius:10px; padding:20px; margin:25px 0; font-family:Arial,sans-serif;">
      <div style="display:flex; align-items:center; gap:15px; margin-bottom:15px;">
        <div style="width:40px; height:40px; background:#2196f3; color:white; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:18px; flex-shrink:0;">
          📎
        </div>
        <div>
          <h4 style="margin:0 0 5px 0; font-size:18px; color:#1565c0; font-weight:bold;">ATTACHMENT REQUIRED</h4>
          <p style="margin:0; font-size:14px; color:#333;">Please attach the invoice PDF before sending this email</p>
        </div>
      </div>
      
      <div style="background:white; border-radius:8px; padding:15px; margin-bottom:15px; border:1px solid #ddd;">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
          <span style="font-size:14px; font-weight:600; color:#333;">File to attach:</span>
          <span style="font-size:12px; color:#2196f3; background:#e3f2fd; padding:3px 8px; border-radius:4px;">
            Downloaded to your device
          </span>
        </div>
        <div style="background:#f8f9fa; padding:12px 15px; border-radius:6px; border:2px dashed #ccc; font-family:'Courier New',monospace; font-size:14px; color:#333; display:flex; align-items:center; gap:10px;">
          <span style="color:#2196f3; font-size:16px;">📄</span>
          <span style="font-weight:600;">${fileName}</span>
        </div>
        <div style="margin-top:10px; font-size:12px; color:#666;">
          <strong>Location:</strong> Your browser's Downloads folder
        </div>
      </div>
      
      <div style="background:#f0f7ff; border-radius:8px; padding:15px;">
        <h5 style="margin:0 0 10px 0; font-size:14px; color:#1565c0;">Quick Attachment Steps:</h5>
        <ol style="margin:0; padding-left:20px; font-size:13px; color:#444; line-height:1.6;">
          <li>Click the <strong>"Attach"</strong> or <strong>"📎"</strong> button in your email client</li>
          <li>Navigate to your <strong>Downloads</strong> folder</li>
          <li>Select the file: <code style="background:#e9ecef; padding:2px 6px; border-radius:3px; font-family:monospace;">${fileName}</code></li>
          <li>Click <strong>"Open"</strong> or <strong>"Choose"</strong></li>
          <li>Verify the attachment appears in your email</li>
          <li>Click <strong>"Send"</strong> to deliver the invoice</li>
        </ol>
      </div>
      
      <div style="margin-top:15px; padding-top:15px; border-top:1px dashed #ccc; font-size:12px; color:#777; text-align:center;">
        The PDF file has been automatically saved to your device. If you can't find it, check your Downloads folder.
      </div>
    </div>
  `;
};

// ✅ UPDATED: OFFLINE PDF GENERATOR WITH EMAIL ATTACHMENT FLOW
const generateInvoicePDF = async (invoice, showNotification, includeShareOptions = false) => {
  // Create a unique invoice ID for offline storage
  const invoiceId = invoice._id || `local-inv-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  
  // ✅ Save invoice to localStorage for offline access
  try {
    const savedInvoices = JSON.parse(localStorage.getItem('localInvoices') || '{}');
    savedInvoices[invoiceId] = {
      ...invoice,
      _id: invoiceId,
      savedAt: new Date().toISOString(),
      isLocal: true
    };
    localStorage.setItem('localInvoices', JSON.stringify(savedInvoices));
  } catch (e) {
    console.log('Local storage save skipped:', e);
  }

  const printContainer = document.createElement('div');
  printContainer.style.position = 'absolute';
  printContainer.style.left = '-10000px';
  printContainer.style.top = '-10000px';
  printContainer.style.width = '800px';
  printContainer.style.backgroundColor = 'white';
  printContainer.style.padding = '40px';
  printContainer.style.fontFamily = "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif";
  printContainer.style.color = '#333';

  // ✅ Add QR Code for mobile payments
  const qrCodeSection = includeShareOptions ? `
    <div style="margin:20px 0; padding:15px; background:#f8f9fa; border-radius:8px; border-left:4px solid #28a745;">
      <div style="display:flex; align-items:center; gap:15px;">
        <div style="width:80px; height:80px; background:#e9ecef; display:flex; align-items:center; justify-content:center; border-radius:6px; font-size:12px; color:#666;">
          [QR Code]
        </div>
        <div>
          <h4 style="margin:0 0 8px 0; font-size:14px; font-weight:600; color:#333;">Quick Pay via M-Pesa</h4>
          <p style="margin:0 0 5px 0; font-size:12px; color:#555;">
            <strong>Paybill:</strong> ${COMPANY_INFO.paybill}
          </p>
          <p style="margin:0 0 5px 0; font-size:12px; color:#555;">
            <strong>Account:</strong> ${invoice.invoiceNumber || 'Your Name'}
          </p>
          <p style="margin:0; font-size:11px; color:#777;">Scan or share this invoice for quick payment</p>
        </div>
      </div>
    </div>
  ` : '';

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
          <p style="margin:5px 0 0 0; font-size:11px; color:#999;">Generated: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}</p>
        </div>
      </div>

      <!-- QR Code Section (optional) -->
      ${qrCodeSection}

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

      <!-- Footer with Share Options -->
      <div style="padding-top:20px; border-top:2px solid #f0f0f0; text-align:center; color:#666; font-size:12px;">
        <div style="display:flex; justify-content:center; gap:10px; margin-bottom:15px;">
          <button style="padding:6px 12px; background:#003366; color:white; border:none; border-radius:6px; font-size:11px; cursor:pointer; display:inline-flex; align-items:center; gap:4px;">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>
            Share via WhatsApp
          </button>
          <button style="padding:6px 12px; background:#28a745; color:white; border:none; border-radius:6px; font-size:11px; cursor:pointer; display:inline-flex; align-items:center; gap:4px;">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
            Email Invoice
          </button>
        </div>
        <p style="margin:0 0 10px 0;">Thank you for choosing ${COMPANY_INFO.name}!</p>
        <p style="margin:0; display:flex; justify-content:center; gap:20px;">
          <span>📧 ${COMPANY_INFO.supportEmail}</span>
          <span>📱 ${COMPANY_INFO.supportPhone}</span>
          <span>🌐 ${COMPANY_INFO.website}</span>
        </p>
        <p style="margin:10px 0 0 0; font-size:11px; color:#999;">Invoice ID: ${invoiceId} | Generated client-side | No signature required</p>
      </div>
    </div>
  `;

  document.body.appendChild(printContainer);

  try {
    const canvas = await html2canvas(printContainer, { 
      scale: 2, 
      useCORS: true,
      backgroundColor: '#ffffff',
      logging: false,
      onclone: (clonedDoc) => {
        // Ensure images are loaded
        const images = clonedDoc.querySelectorAll('img');
        images.forEach(img => {
          if (!img.complete) {
            img.src = img.src;
          }
        });
      }
    });
    
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const imgWidth = 190;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    
    // Add header
    pdf.setFillColor(0, 51, 102);
    pdf.rect(0, 0, 210, 15, 'F');
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(12);
    pdf.text('INVOICE', 105, 9, { align: 'center' });
    
    pdf.addImage(imgData, 'PNG', 10, 20, imgWidth, imgHeight);
    
    // Add footer
    pdf.setFontSize(8);
    pdf.setTextColor(100, 100, 100);
    pdf.text(`Generated: ${new Date().toLocaleDateString()} | Page 1/1`, 105, 290, { align: 'center' });
    
    const filename = `Invoice_${invoice.invoiceNumber || invoice._id || Date.now()}_${COMPANY_INFO.name.replace(/\s+/g, '_')}.pdf`;
    
    // ✅ Save the PDF file
    pdf.save(filename);
    
    showNotification(`✅ PDF saved as "${filename}" in your Downloads folder`, 'success');
    
    // Store for potential sharing
    const invoiceData = {
      ...invoice,
      pdfData: imgData.substring(0, 500) + '...', // Truncated for storage
      generatedAt: new Date().toISOString(),
      companyInfo: COMPANY_INFO,
      filename: filename
    };
    
    sessionStorage.setItem(`lastInvoice_${invoiceId}`, JSON.stringify(invoiceData));
    
    return { success: true, filename, invoiceId, pdfData: imgData };
  } catch (err) {
    console.error('PDF generation error:', err);
    showNotification('❌ Failed to generate PDF. Please try again.', 'error');
    return { success: false, error: err.message };
  } finally {
    document.body.removeChild(printContainer);
  }
};

// ✅ NEW: Direct WhatsApp sharing with invoice details
const shareViaWhatsApp = (invoice, showNotification) => {
  const message = encodeURIComponent(
    `📋 *INVOICE NOTIFICATION* 📋\n\n` +
    `Hello ${invoice.customerName || 'Valued Customer'},\n\n` +
    `Your invoice #${invoice.invoiceNumber || invoice._id?.substring(0,8)} from ${COMPANY_INFO.name} is ready.\n\n` +
    `*Amount Due:* Ksh ${formatPrice(invoice.totalAmount)}\n` +
    `*Due Date:* ${new Date(invoice.dueDate).toLocaleDateString()}\n` +
    `*Plan:* ${invoice.planName} (${invoice.planSpeed})\n\n` +
    `*Payment Instructions:*\n` +
    `Paybill: ${COMPANY_INFO.paybill}\n` +
    `Account: ${invoice.invoiceNumber || 'Your Name'}\n\n` +
    `Thank you for choosing ${COMPANY_INFO.name}!\n` +
    `Need help? Call ${COMPANY_INFO.supportPhone}`
  );
  
  const whatsappUrl = `https://wa.me/${invoice.customerPhone?.replace(/\D/g, '') || ''}?text=${message}`;
  
  if (invoice.customerPhone) {
    window.open(whatsappUrl, '_blank');
    showNotification('✅ WhatsApp opened with invoice details!', 'success');
  } else {
    // Copy to clipboard if no phone
    navigator.clipboard.writeText(message)
      .then(() => showNotification('📋 Invoice message copied to clipboard!', 'success'))
      .catch(() => showNotification('⚠️ Please manually copy the message', 'warning'));
  }
};

// ✅ NEW: Share as downloadable link
const createShareableLink = (invoice, showNotification) => {
  const invoiceData = {
    invoice: {
      ...invoice,
      companyInfo: COMPANY_INFO,
      generatedAt: new Date().toISOString()
    }
  };
  
  // Create a data URL
  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(invoiceData));
  const downloadAnchorNode = document.createElement('a');
  downloadAnchorNode.setAttribute("href", dataStr);
  downloadAnchorNode.setAttribute("download", `invoice_${invoice.invoiceNumber || invoice._id}.json`);
  document.body.appendChild(downloadAnchorNode);
  downloadAnchorNode.click();
  downloadAnchorNode.remove();
  
  showNotification('✅ Invoice data exported as JSON file!', 'success');
};

// ✅ UPDATED: Enhanced Email Client with PDF Attachment Flow
const openEmailClient = async (invoice, showNotification) => {
  if (!invoice.customerEmail?.trim()) {
    showNotification('⚠️ Customer email is required to send invoice.', 'warning');
    return;
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(invoice.customerEmail.trim())) {
    showNotification('⚠️ Invalid email format.', 'warning');
    return;
  }

  // ✅ First generate and save the PDF
  const pdfResult = await generateInvoicePDF(invoice, showNotification, true);
  
  if (!pdfResult.success) {
    showNotification('❌ Failed to prepare PDF for email. Please try again.', 'error');
    return;
  }

  const subject = `Invoice #${invoice.invoiceNumber || invoice._id?.substring(0,8)} from ${COMPANY_INFO.name}`;
  
  const fileName = pdfResult.filename;
  
  const bodyLines = [
    `Dear ${invoice.customerName || 'Valued Customer'},`,
    ``,
    `Please find your invoice #${invoice.invoiceNumber || invoice._id?.substring(0,8)} attached.`,
    ``,
    `**Invoice Summary:**`,
    `• Total Amount: Ksh ${formatPrice(invoice.totalAmount)}`,
    `• Due Date: ${new Date(invoice.dueDate).toLocaleDateString()}`,
    `• Plan: ${invoice.planName} (${invoice.planSpeed})`,
    ``,
    `**Payment Methods:**`,
    `1. *Mobile Money:* Paybill ${COMPANY_INFO.paybill}, Account: ${invoice.invoiceNumber}`,
    `2. *Bank Transfer:* ${COMPANY_INFO.bankName}, A/C: ${COMPANY_INFO.accountNumber}`,
    ``,
    `**Important:**`,
    `The invoice PDF has been downloaded to your device.`,
    `Please attach the file "${fileName}" before sending this email.`,
    ``,
    `For any queries, contact us at ${COMPANY_INFO.supportPhone} or ${COMPANY_INFO.supportEmail}`,
    ``,
    `Best regards,`,
    `The ${COMPANY_INFO.name} Team`,
    ``,
    `---`,
    `*Note: This email was generated by the ${COMPANY_INFO.name} Invoice System.*`
  ];

  const body = encodeURIComponent(bodyLines.join('\n'));
  
  // ✅ Create mailto link with attachment suggestion in body
  const mailtoLink = `mailto:${encodeURIComponent(invoice.customerEmail.trim())}?cc=${encodeURIComponent(COMPANY_INFO.supportEmail)}&subject=${encodeURIComponent(subject)}&body=${body}`;
  
  // ✅ Create a visual attachment guide
  setTimeout(() => {
    const attachmentGuide = document.createElement('div');
    attachmentGuide.className = 'fixed bottom-4 right-4 z-50 max-w-sm animate-fade-in-up';
    attachmentGuide.innerHTML = `
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-2xl border border-gray-300 dark:border-gray-700 p-5">
        <div class="flex items-start justify-between mb-3">
          <div class="flex items-center gap-2">
            <div class="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <Paperclip size={18} class="text-blue-600 dark:text-blue-300" />
            </div>
            <div>
              <h3 class="font-bold text-gray-900 dark:text-white">Attachment Required</h3>
              <p class="text-xs text-gray-600 dark:text-gray-300">Please attach the PDF before sending</p>
            </div>
          </div>
          <button onclick="this.parentElement.parentElement.parentElement.remove()" class="text-gray-400 hover:text-gray-600 p-1">
            <X size={16} />
          </button>
        </div>
        
        <div class="mb-3 p-3 bg-gray-50 dark:bg-gray-900 rounded border border-gray-200 dark:border-gray-700">
          <div class="flex items-center gap-2 mb-1">
            <FileText size={14} class="text-blue-500" />
            <span class="text-sm font-medium text-gray-700 dark:text-gray-300">File to attach:</span>
          </div>
          <div class="flex items-center gap-2 p-2 bg-white dark:bg-gray-800 border border-dashed border-gray-300 dark:border-gray-600 rounded">
            <FileDown size={16} class="text-green-500 flex-shrink-0" />
            <code class="text-xs font-mono text-gray-800 dark:text-gray-200 truncate">${fileName}</code>
          </div>
          <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Saved to: <strong>Downloads folder</strong>
          </p>
        </div>
        
        <div class="mb-4">
          <h4 class="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Quick Steps:</h4>
          <ol class="text-xs text-gray-600 dark:text-gray-400 space-y-1 pl-4">
            <li class="flex items-start gap-2">
              <span class="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full w-5 h-5 flex items-center justify-center text-xs flex-shrink-0">1</span>
              <span>Click <strong>"Attach"</strong> or <strong>📎</strong> in your email</span>
            </li>
            <li class="flex items-start gap-2">
              <span class="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full w-5 h-5 flex items-center justify-center text-xs flex-shrink-0">2</span>
              <span>Go to <strong>Downloads</strong> folder</span>
            </li>
            <li class="flex items-start gap-2">
              <span class="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full w-5 h-5 flex items-center justify-center text-xs flex-shrink-0">3</span>
              <span>Select <code class="bg-gray-100 dark:bg-gray-700 px-1 rounded">${fileName}</code></span>
            </li>
            <li class="flex items-start gap-2">
              <span class="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full w-5 h-5 flex items-center justify-center text-xs flex-shrink-0">4</span>
              <span>Click <strong>"Open"</strong> then <strong>"Send"</strong></span>
            </li>
          </ol>
        </div>
        
        <div class="flex justify-between items-center pt-3 border-t border-gray-200 dark:border-gray-700">
          <button onclick="window.open('${mailtoLink}', '_blank')" class="text-xs bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg flex items-center gap-1">
            <Mail size={12} /> Open Email Again
          </button>
          <button onclick="this.parentElement.parentElement.parentElement.remove()" class="text-xs text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100">
            Got it, thanks!
          </button>
        </div>
      </div>
    `;
    
    // Add CSS for animation
    const style = document.createElement('style');
    style.textContent = `
      @keyframes fade-in-up {
        from { opacity: 0; transform: translateY(10px); }
        to { opacity: 1; transform: translateY(0); }
      }
      .animate-fade-in-up {
        animation: fade-in-up 0.3s ease-out;
      }
    `;
    document.head.appendChild(style);
    
    document.body.appendChild(attachmentGuide);
    
    // Auto-remove guide after 20 seconds
    setTimeout(() => {
      if (attachmentGuide.parentElement) {
        attachmentGuide.remove();
      }
    }, 20000);
  }, 500);
  
  // ✅ Open the email client
  window.open(mailtoLink, '_blank');
  
  showNotification(
    `📧 Email client opened! The PDF "${fileName}" has been saved to your Downloads folder. Please attach it before sending.`,
    'info',
    8000
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
  const [showShareOptions, setShowShareOptions] = useState(null);
  const [generatingPDF, setGeneratingPDF] = useState(null);

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
      
      // ✅ Merge with locally stored invoices
      try {
        const localInvoices = JSON.parse(localStorage.getItem('localInvoices') || '{}');
        const localInvoiceList = Object.values(localInvoices);
        invoicesData = [...invoicesData, ...localInvoiceList];
      } catch (e) {
        console.log('Could not load local invoices:', e);
      }
      
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

  // ✅ NEW: Create offline invoice without backend
  const createOfflineInvoice = () => {
    if (!invoiceForm.customerName?.trim() || !invoiceForm.customerEmail?.trim() || !invoiceForm.planName?.trim()) {
      let missing = [];
      if (!invoiceForm.customerName?.trim()) missing.push('Customer Name');
      if (!invoiceForm.customerEmail?.trim()) missing.push('Customer Email');
      if (!invoiceForm.planName?.trim()) missing.push('Plan Name');
      showNotification(`⚠️ Missing: ${missing.join(', ')}`, 'warning');
      return;
    }

    const invoiceId = `local-inv-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const offlineInvoice = {
      ...invoiceForm,
      _id: invoiceId,
      invoiceNumber: invoiceForm.invoiceNumber || generateInvoiceNumber(),
      invoiceDate: new Date(invoiceForm.invoiceDate).toISOString(),
      dueDate: new Date(invoiceForm.dueDate).toISOString(),
      createdAt: new Date().toISOString(),
      isLocal: true,
      status: invoiceForm.amountPaid >= invoiceForm.totalAmount ? 'paid' : 'pending'
    };

    // Save to localStorage
    const savedInvoices = JSON.parse(localStorage.getItem('localInvoices') || '{}');
    savedInvoices[invoiceId] = offlineInvoice;
    localStorage.setItem('localInvoices', JSON.stringify(savedInvoices));

    // Update state
    setInvoices(prev => [...prev, offlineInvoice]);
    setShowCreateModal(false);
    resetForm();
    
    showNotification('✅ Invoice created offline! PDF can be downloaded.', 'success');
    
    // Auto-generate PDF
    setTimeout(() => {
      downloadPDFHandler(offlineInvoice);
    }, 500);
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

  // ✅ UPDATED: Enhanced PDF Download with offline support
  const downloadPDFHandler = async (invoice) => {
    if (!invoice) {
      showNotification('⚠️ Invalid invoice.', 'warning');
      return;
    }
    
    setGeneratingPDF(invoice._id);
    try {
      await generateInvoicePDF(invoice, showNotification, true);
    } catch (error) {
      showNotification('❌ Failed to generate PDF. Please try again.', 'error');
    } finally {
      setGeneratingPDF(null);
    }
  };

  // ✅ NEW: Quick share menu
  const handleShareInvoice = (invoice) => {
    setShowShareOptions(invoice._id);
  };

  // ✅ UPDATED: Enhanced Email Sending with PDF attachment flow
  const sendInvoiceViaEmailHandler = async (invoice) => {
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
    try {
      // Show preparing message
      showNotification('🔄 Preparing invoice PDF for email...', 'info');
      
      // Generate PDF first, then open email client
      const pdfResult = await generateInvoicePDF(invoice, showNotification, true);
      
      if (pdfResult.success) {
        // Wait a moment for file to save, then open email
        setTimeout(() => {
          openEmailClient(invoice, showNotification);
        }, 500);
      }
    } catch (error) {
      showNotification('❌ Failed to prepare email. Please try again.', 'error');
    } finally {
      setTimeout(() => setSendingInvoice(null), 2000);
    }
  };

  const markAsPaid = async (invoiceId) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Authentication session expired. Please log in again.');
      const invoiceToPay = invoices.find(inv => inv._id === invoiceId);
      if (!invoiceToPay) throw new Error('Invoice not found.');
      
      // Check if it's a local invoice
      if (invoiceToPay.isLocal) {
        // Update local invoice
        const savedInvoices = JSON.parse(localStorage.getItem('localInvoices') || '{}');
        if (savedInvoices[invoiceId]) {
          savedInvoices[invoiceId] = {
            ...savedInvoices[invoiceId],
            status: 'paid',
            amountPaid: invoiceToPay.totalAmount || invoiceToPay.planPrice,
            balanceDue: 0,
            paidAt: new Date().toISOString()
          };
          localStorage.setItem('localInvoices', JSON.stringify(savedInvoices));
          setInvoices(prev => prev.map(inv => 
            inv._id === invoiceId ? savedInvoices[invoiceId] : inv
          ));
          showNotification('✅ Invoice marked as paid offline!', 'success');
        }
        return;
      }
      
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
      if (!token) {
        // No token - create offline
        createOfflineInvoice();
        return;
      }
      
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
        // If backend fails, create offline
        createOfflineInvoice();
      }
    } catch (error) {
      console.error('Error creating invoice:', error);
      // Fallback to offline creation
      createOfflineInvoice();
    }
  };

  const updateInvoice = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        showNotification('⚠️ Cannot update offline invoice.', 'warning');
        return;
      }
      
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
      // Check if it's a local invoice
      const invoiceToDelete = invoices.find(inv => inv._id === invoiceId);
      if (invoiceToDelete?.isLocal) {
        // Delete from localStorage
        const savedInvoices = JSON.parse(localStorage.getItem('localInvoices') || '{}');
        delete savedInvoices[invoiceId];
        localStorage.setItem('localInvoices', JSON.stringify(savedInvoices));
        setInvoices(prev => prev.filter(inv => inv._id !== invoiceId));
        showNotification('✅ Invoice deleted successfully!', 'success');
        return;
      }
      
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

  const exportInvoicesToExcel = async () => {
    try {
      setExportLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        // Create offline export
        const csvContent = "data:text/csv;charset=utf-8," 
          + "Invoice Number,Customer Name,Email,Plan,Total Amount,Status,Due Date\n"
          + invoices.map(inv => 
              `"${inv.invoiceNumber || ''}","${inv.customerName || ''}","${inv.customerEmail || ''}","${inv.planName || ''}","${inv.totalAmount || 0}","${inv.status || ''}","${inv.dueDate || ''}"`
            ).join("\n");
        
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `invoices_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        showNotification('✅ Invoices exported to CSV successfully!', 'success');
        return;
      }
      
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
    oneTimeRevenue: invoices.filter(inv => inv.billingCycle === 'one_time').reduce((sum, inv) => sum + (parseFloat(inv.totalAmount) || parseFloat(inv.planPrice) || 0), 0),
    localInvoices: invoices.filter(inv => inv.isLocal).length
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
            Total: {invoices.length} invoices | Total Revenue: Ksh {formatPrice(stats.totalRevenue)} | Offline: {stats.localInvoices}
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
              {stats.localInvoices > 0 && (
                <p className="text-xs text-gray-500">({stats.localInvoices} offline)</p>
              )}
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
                        {invoice.isLocal && (
                          <span className="ml-1 px-1.5 py-0.5 text-xs bg-yellow-100 text-yellow-800 rounded">Offline</span>
                        )}
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
                          disabled={generatingPDF === invoice._id}
                          className={`p-2 rounded-lg ${darkMode ? 'text-blue-400 hover:bg-gray-600' : 'text-blue-600 hover:bg-gray-100'} ${
                            generatingPDF === invoice._id ? 'opacity-50 cursor-not-allowed' : ''
                          }`}
                          title="Download PDF"
                        >
                          {generatingPDF === invoice._id ? (
                            <Loader2 size={16} className="animate-spin" />
                          ) : (
                            <Download size={16} />
                          )}
                        </button>
                        <button
                          onClick={() => handleShareInvoice(invoice)}
                          className={`p-2 rounded-lg ${darkMode ? 'text-purple-400 hover:bg-gray-600' : 'text-purple-600 hover:bg-gray-100'}`}
                          title="Share Invoice"
                        >
                          <Share2 size={16} />
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

      {/* Share Options Popup */}
      {showShareOptions && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className={`${themeClasses.card} rounded-xl shadow-2xl max-w-md w-full mx-4`}>
            <div className="flex justify-between items-center border-b p-4">
              <h3 className="text-lg font-semibold">Share Invoice</h3>
              <button onClick={() => setShowShareOptions(null)} className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
                <X size={20} />
              </button>
            </div>
            <div className="p-4">
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => {
                    const invoice = invoices.find(inv => inv._id === showShareOptions);
                    if (invoice) {
                      downloadPDFHandler(invoice);
                      setShowShareOptions(null);
                    }
                  }}
                  className="p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 flex flex-col items-center"
                >
                  <Download size={24} className="mb-2 text-blue-500" />
                  <span className="text-sm font-medium">Download PDF</span>
                  <span className="text-xs text-gray-500">Professional invoice</span>
                </button>
                <button
                  onClick={() => {
                    const invoice = invoices.find(inv => inv._id === showShareOptions);
                    if (invoice) {
                      sendInvoiceViaEmailHandler(invoice);
                      setShowShareOptions(null);
                    }
                  }}
                  className="p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 flex flex-col items-center"
                >
                  <Mail size={24} className="mb-2 text-green-500" />
                  <span className="text-sm font-medium">Email</span>
                  <span className="text-xs text-gray-500">Send to customer</span>
                </button>
                <button
                  onClick={() => {
                    const invoice = invoices.find(inv => inv._id === showShareOptions);
                    if (invoice) {
                      shareViaWhatsApp(invoice, showNotification);
                      setShowShareOptions(null);
                    }
                  }}
                  className="p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 flex flex-col items-center"
                >
                  <MessageCircle size={24} className="mb-2 text-green-600" />
                  <span className="text-sm font-medium">WhatsApp</span>
                  <span className="text-xs text-gray-500">Share via chat</span>
                </button>
                <button
                  onClick={() => {
                    const invoice = invoices.find(inv => inv._id === showShareOptions);
                    if (invoice) {
                      createShareableLink(invoice, showNotification);
                      setShowShareOptions(null);
                    }
                  }}
                  className="p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 flex flex-col items-center"
                >
                  <Link size={24} className="mb-2 text-purple-500" />
                  <span className="text-sm font-medium">Export Data</span>
                  <span className="text-xs text-gray-500">JSON format</span>
                </button>
              </div>
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
              
              {/* Offline Mode Notice */}
              {!localStorage.getItem('token') && (
                <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                  <div className="flex items-center">
                    <AlertTriangle size={18} className="text-yellow-600 dark:text-yellow-400 mr-2" />
                    <span className="text-sm text-yellow-700 dark:text-yellow-300">
                      <strong>Offline Mode:</strong> Invoice will be saved locally and PDF generated client-side.
                    </span>
                  </div>
                </div>
              )}
              
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
                {selectedInvoice.isLocal && (
                  <span className="px-2 py-1 rounded-full text-xs bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                    Offline
                  </span>
                )}
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
              <div className="flex flex-wrap justify-end gap-3 mt-6 pt-4 border-t">
                <button
                  onClick={() => downloadPDFHandler(selectedInvoice)}
                  disabled={generatingPDF === selectedInvoice._id}
                  className="px-4 py-2 bg-[#003366] text-white rounded-lg hover:bg-[#002244] transition-colors flex items-center disabled:opacity-50"
                >
                  {generatingPDF === selectedInvoice._id ? (
                    <Loader2 size={16} className="mr-2 animate-spin" />
                  ) : (
                    <Download size={16} className="mr-2" />
                  )}
                  Download PDF
                </button>
                <button
                  onClick={() => sendInvoiceViaEmailHandler(selectedInvoice)}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center"
                >
                  <Mail size={16} className="mr-2" /> Send via Email
                </button>
                <button
                  onClick={() => shareViaWhatsApp(selectedInvoice, showNotification)}
                  className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center"
                >
                  <MessageCircle size={16} className="mr-2" /> WhatsApp
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