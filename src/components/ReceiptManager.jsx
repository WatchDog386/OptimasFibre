// ReceiptManager.jsx - FULLY UPDATED WITH ENHANCED PDF & EMAIL
import React, { useState, useEffect } from 'react';
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
  X,
  FileSpreadsheet,
  Printer,
  Send,
  FileDown,
  Receipt,
  User,
  CreditCard,
  TrendingUp,
  Check,
  Shield,
  Clock,
  Loader2,
  Copy,
  Building,
  Phone,
  MapPin,
  Globe,
  AlertTriangle,
  Wifi,
  CheckSquare,
  FileCheck,
  ArrowUpRight,
  Link,
  QrCode,
  BarChart3,
  PieChart as PieChartIcon
} from 'lucide-react';

// Import recharts for visualization
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart as RechartsPie, Pie, Cell,
  LineChart, Line
} from 'recharts';

// Import html2pdf for client-side PDF generation
import html2pdf from 'html2pdf.js';

// Utility function for consistent price formatting in KSH
const formatPrice = (price) => {
  if (price === undefined || price === null) return '0.00';
  const cleanStr = price.toString().replace(/,/g, '');
  const num = parseFloat(cleanStr);
  return isNaN(num) ? price : num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

// WiFi Plans
const WIFI_PLANS = [
  { id: 1, name: "Jumbo", price: "1499", speed: "8Mbps", features: ["Great for browsing", "24/7 Support", "Free Installation"], type: "home", popular: false },
  { id: 2, name: "Buffalo", price: "1999", speed: "15Mbps", features: ["Streaming & Social Media", "24/7 Support", "Free Installation"], type: "home", popular: false },
  { id: 3, name: "Ndovu", price: "2499", speed: "25Mbps", features: ["Work from Home", "Streaming", "24/7 Support", "Free Installation"], type: "home", popular: false },
  { id: 4, name: "Gazzelle", price: "2999", speed: "30Mbps", features: ["Multiple Devices", "Low Latency", "24/7 Support", "Free Installation"], type: "home", popular: true },
  { id: 5, name: "Tiger", price: "3999", speed: "40Mbps", features: ["Heavy Streaming", "Gaming Ready", "24/7 Support", "Free Installation"], type: "home", popular: false },
  { id: 6, name: "Chui", price: "4999", speed: "60Mbps", features: ["High-Speed Everything", "Gaming & 4K", "24/7 Support", "Free Installation"], type: "home", popular: false },
];

// Brand configuration
const BRAND = {
  name: "OPTIMAS FIBER",
  tagline: "High-Speed Internet Solutions",
  logoUrl: "/oppo.jpg",
  colors: {
    primary: '#00356B',
    accent: '#D85C2C',
    success: '#86bc25',
    warning: '#f59e0b',
    danger: '#ef4444',
    info: '#3b82f6'
  },
  contact: {
    email: "support@optimaswifi.co.ke",
    phone: "+254 741 874 200",
    address: "Nairobi, Kenya",
    website: "www.optimaswifi.co.ke",
    vatNumber: "VAT00123456",
    bank: {
      name: "Equity Bank",
      accountName: "Optimas Fiber Ltd",
      accountNumber: "1234567890",
      branch: "Nairobi Main",
      swiftCode: "EQBLKENA"
    },
    paybill: {
      number: "4092707",
      name: "OPTIMAS FIBER"
    }
  }
};

// ✅ ENHANCED: Generate professional receipt PDF (client-side)
const generateReceiptPDF = async (receipt, showNotification) => {
  const printContainer = document.createElement('div');
  printContainer.style.position = 'absolute';
  printContainer.style.left = '-10000px';
  printContainer.style.top = '-10000px';
  printContainer.style.width = '800px';
  printContainer.style.backgroundColor = 'white';
  printContainer.style.padding = '40px';
  printContainer.style.fontFamily = "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif";
  printContainer.style.color = '#1a1a1a';
  printContainer.style.lineHeight = '1.6';

  // Calculate totals
  const subtotal = receipt.subtotal || 0;
  const taxAmount = receipt.taxAmount || 0;
  const total = receipt.total || 0;
  const amountPaid = receipt.amountPaid || 0;
  const balance = Math.max(0, total - amountPaid);
  
  // Payment status
  const isFullyPaid = balance === 0;
  const statusText = isFullyPaid ? 'PAID IN FULL' : 'PARTIAL PAYMENT';
  const statusColor = isFullyPaid ? BRAND.colors.success : BRAND.colors.warning;

  // Format payment method
  const paymentMethodMap = {
    'mobile_money': 'Mobile Money',
    'bank_transfer': 'Bank Transfer',
    'cash': 'Cash',
    'card': 'Credit/Debit Card',
    'cheque': 'Cheque',
    'other': 'Other'
  };
  const paymentMethod = paymentMethodMap[receipt.paymentMethod] || receipt.paymentMethod || 'Cash';

  printContainer.innerHTML = `
    <div style="border:2px solid ${BRAND.colors.primary}; border-radius:12px; padding:40px; background:white; box-shadow:0 10px 30px rgba(0,0,0,0.1);">
      <!-- Header -->
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:30px; padding-bottom:20px; border-bottom:2px solid ${BRAND.colors.primary};">
        <div>
          ${BRAND.logoUrl ? `<img src="${BRAND.logoUrl}" alt="${BRAND.name} Logo" style="height:70px; margin-bottom:15px; border-radius:8px;" onerror="this.style.display='none'" />` : ''}
          <h1 style="margin:5px 0; font-size:28px; color:${BRAND.colors.primary}; font-weight:800; letter-spacing:-0.5px;">${BRAND.name}</h1>
          <p style="margin:0; color:#666; font-size:14px; font-weight:500;">${BRAND.tagline}</p>
          <div style="margin-top:10px; display:flex; align-items:center; gap:15px; font-size:12px; color:#666;">
            <span style="display:inline-flex; align-items:center;">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right:5px;">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                <circle cx="12" cy="10" r="3"></circle>
              </svg>
              ${BRAND.contact.address}
            </span>
            <span style="display:inline-flex; align-items:center;">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right:5px;">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
              </svg>
              ${BRAND.contact.phone}
            </span>
            <span style="display:inline-flex; align-items:center;">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right:5px;">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                <polyline points="22,6 12,13 2,6"></polyline>
              </svg>
              ${BRAND.contact.email}
            </span>
          </div>
        </div>
        <div style="text-align:right;">
          <div style="background:${BRAND.colors.accent}; color:white; padding:8px 20px; border-radius:20px; display:inline-block; font-weight:700; font-size:12px; letter-spacing:1px; margin-bottom:10px;">
            OFFICIAL RECEIPT
          </div>
          <h2 style="margin:0 0 10px 0; font-size:36px; color:${BRAND.colors.primary}; font-weight:900; letter-spacing:-1px;">RECEIPT</h2>
          <div style="background:${statusColor}; color:white; padding:10px 25px; border-radius:25px; display:inline-block; font-weight:700; font-size:14px; box-shadow:0 4px 6px rgba(0,0,0,0.1);">
            ${statusText}
          </div>
        </div>
      </div>

      <!-- Receipt Details -->
      <div style="display:grid; grid-template-columns:repeat(3, 1fr); gap:30px; margin-bottom:40px;">
        <!-- Customer Information -->
        <div>
          <h3 style="margin:0 0 15px 0; font-size:16px; color:${BRAND.colors.primary}; font-weight:700; padding-bottom:8px; border-bottom:2px solid #f0f0f0;">CUSTOMER INFORMATION</h3>
          <div style="background:#f8f9fa; padding:20px; border-radius:10px; border-left:4px solid ${BRAND.colors.primary}; box-shadow:0 4px 6px rgba(0,0,0,0.05);">
            <p style="margin:0 0 8px 0; font-size:16px; font-weight:700; color:#333;">${receipt.customerName || 'Customer'}</p>
            <p style="margin:0 0 6px 0; font-size:14px; color:#555;">
              <span style="font-weight:600;">Email:</span> ${receipt.customerEmail || 'N/A'}
            </p>
            <p style="margin:0 0 6px 0; font-size:14px; color:#555;">
              <span style="font-weight:600;">Phone:</span> ${receipt.customerPhone || 'N/A'}
            </p>
            <p style="margin:0; font-size:14px; color:#555;">
              <span style="font-weight:600;">Location:</span> ${receipt.customerLocation || receipt.customerAddress || 'N/A'}
            </p>
          </div>
        </div>
        
        <!-- Receipt Information -->
        <div>
          <h3 style="margin:0 0 15px 0; font-size:16px; color:${BRAND.colors.primary}; font-weight:700; padding-bottom:8px; border-bottom:2px solid #f0f0f0;">RECEIPT DETAILS</h3>
          <div style="background:#f8f9fa; padding:20px; border-radius:10px; border-left:4px solid ${BRAND.colors.accent}; box-shadow:0 4px 6px rgba(0,0,0,0.05);">
            <p style="margin:0 0 8px 0; font-size:14px;">
              <span style="font-weight:700; color:#333;">Receipt #:</span> 
              <span style="font-weight:800; color:${BRAND.colors.primary}; font-size:16px;">${receipt.receiptNumber || 'N/A'}</span>
            </p>
            <p style="margin:0 0 8px 0; font-size:14px;">
              <span style="font-weight:600; color:#333;">Invoice #:</span> ${receipt.invoiceNumber || 'N/A'}
            </p>
            <p style="margin:0 0 8px 0; font-size:14px;">
              <span style="font-weight:600; color:#333;">Receipt Date:</span> ${receipt.receiptDate ? new Date(receipt.receiptDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : 'N/A'}
            </p>
            <p style="margin:0 0 8px 0; font-size:14px;">
              <span style="font-weight:600; color:#333;">Payment Date:</span> ${receipt.paymentDate ? new Date(receipt.paymentDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : 'N/A'}
            </p>
            <p style="margin:0; font-size:14px;">
              <span style="font-weight:600; color:#333;">Payment Method:</span> 
              <span style="font-weight:700; color:${BRAND.colors.success};">${paymentMethod}</span>
            </p>
          </div>
        </div>
        
        <!-- Service Details -->
        <div>
          <h3 style="margin:0 0 15px 0; font-size:16px; color:${BRAND.colors.primary}; font-weight:700; padding-bottom:8px; border-bottom:2px solid #f0f0f0;">SERVICE DETAILS</h3>
          <div style="background:#f8f9fa; padding:20px; border-radius:10px; border-left:4px solid ${BRAND.colors.success}; box-shadow:0 4px 6px rgba(0,0,0,0.05);">
            <p style="margin:0 0 8px 0; font-size:14px;">
              <span style="font-weight:600; color:#333;">Plan:</span> ${receipt.planName || 'N/A'}
            </p>
            <p style="margin:0 0 8px 0; font-size:14px;">
              <span style="font-weight:600; color:#333;">Speed:</span> ${receipt.planSpeed || 'N/A'}
            </p>
            <p style="margin:0 0 8px 0; font-size:14px;">
              <span style="font-weight:600; color:#333;">Service:</span> ${receipt.serviceDescription || 'Internet Service'}
            </p>
            ${receipt.paymentReference ? `
            <p style="margin:0; font-size:14px;">
              <span style="font-weight:600; color:#333;">Reference:</span> ${receipt.paymentReference}
            </p>
            ` : ''}
            ${receipt.transactionId ? `
            <p style="margin:8px 0 0 0; font-size:14px;">
              <span style="font-weight:600; color:#333;">Transaction ID:</span> ${receipt.transactionId}
            </p>
            ` : ''}
          </div>
        </div>
      </div>

      <!-- Items Table -->
      <div style="margin-bottom:40px;">
        <h3 style="margin:0 0 20px 0; font-size:18px; color:${BRAND.colors.primary}; font-weight:700;">PAYMENT BREAKDOWN</h3>
        <table style="width:100%; border-collapse:separate; border-spacing:0; border:1px solid #e0e0e0; border-radius:10px; overflow:hidden; box-shadow:0 5px 15px rgba(0,0,0,0.05);">
          <thead>
            <tr style="background:linear-gradient(135deg, ${BRAND.colors.primary} 0%, #002244 100%); color:white;">
              <th style="padding:18px 20px; text-align:left; font-weight:700; font-size:14px; border-right:1px solid rgba(255,255,255,0.1);">DESCRIPTION</th>
              <th style="padding:18px 20px; text-align:center; font-weight:700; font-size:14px; border-right:1px solid rgba(255,255,255,0.1);">QUANTITY</th>
              <th style="padding:18px 20px; text-align:right; font-weight:700; font-size:14px; border-right:1px solid rgba(255,255,255,0.1);">UNIT PRICE</th>
              <th style="padding:18px 20px; text-align:right; font-weight:700; font-size:14px;">AMOUNT</th>
            </tr>
          </thead>
          <tbody>
            ${(receipt.items && receipt.items.length > 0 ? receipt.items : [{
                description: receipt.serviceDescription || (receipt.planName ? `${receipt.planName} - ${receipt.planSpeed}` : 'Internet Service'),
                quantity: 1,
                unitPrice: receipt.planPrice || receipt.total || 0,
                amount: receipt.total || 0
              }]).map((item, index) => `
                <tr style="${index % 2 === 0 ? 'background:#f8f9fa;' : 'background:white;'} border-bottom:1px solid #eee;">
                  <td style="padding:15px 20px; text-align:left; font-size:14px; border-right:1px solid #eee;">${item.description || 'Service'}</td>
                  <td style="padding:15px 20px; text-align:center; font-size:14px; border-right:1px solid #eee;">${item.quantity || 1}</td>
                  <td style="padding:15px 20px; text-align:right; font-size:14px; border-right:1px solid #eee;">Ksh ${formatPrice(item.unitPrice || 0)}</td>
                  <td style="padding:15px 20px; text-align:right; font-size:14px; font-weight:600;">Ksh ${formatPrice(item.amount || 0)}</td>
                </tr>
              `).join('')}
          </tbody>
        </table>
      </div>

      <!-- Payment Summary -->
      <div style="display:flex; justify-content:space-between; margin-bottom:40px; gap:40px;">
        <div style="flex:1;">
          <h3 style="margin:0 0 15px 0; font-size:16px; color:${BRAND.colors.primary}; font-weight:700;">PAYMENT NOTES</h3>
          <div style="background:#f8f9fa; padding:25px; border-radius:10px; border:1px solid #e0e0e0; min-height:150px;">
            <p style="margin:0 0 10px 0; font-size:14px; line-height:1.6; color:#333;">
              ${receipt.notes || 'Thank you for your payment! Your business is greatly appreciated.'}
            </p>
            <div style="margin-top:15px; padding:12px; background:rgba(0,51,102,0.05); border-radius:6px; border-left:3px solid ${BRAND.colors.primary};">
              <p style="margin:0; font-size:12px; color:#666; line-height:1.5;">
                <strong>Important:</strong> This receipt serves as official proof of payment. Please retain for your records.
                For any billing inquiries, please quote receipt number: <strong>${receipt.receiptNumber || 'N/A'}</strong>
              </p>
            </div>
          </div>
        </div>
        
        <div style="width:380px;">
          <div style="background:#f8f9fa; padding:30px; border-radius:10px; border:1px solid #e0e0e0; box-shadow:0 5px 15px rgba(0,0,0,0.05);">
            <h3 style="margin:0 0 25px 0; font-size:20px; color:${BRAND.colors.primary}; font-weight:800; text-align:center; padding-bottom:15px; border-bottom:2px solid ${BRAND.colors.primary};">PAYMENT SUMMARY</h3>
            
            <div style="margin-bottom:20px;">
              <div style="display:flex; justify-content:space-between; margin-bottom:12px; padding-bottom:12px; border-bottom:1px dashed #ddd;">
                <span style="color:#666; font-size:15px;">Subtotal:</span>
                <span style="font-weight:600; font-size:15px;">Ksh ${formatPrice(subtotal)}</span>
              </div>
              
              ${receipt.taxRate > 0 ? `
              <div style="display:flex; justify-content:space-between; margin-bottom:12px; padding-bottom:12px; border-bottom:1px dashed #ddd;">
                <span style="color:#666; font-size:15px;">VAT (${receipt.taxRate || 0}%):</span>
                <span style="font-weight:600; font-size:15px;">Ksh ${formatPrice(taxAmount)}</span>
              </div>
              ` : ''}
            </div>
            
            <div style="display:flex; justify-content:space-between; margin-bottom:25px; padding:20px; background:white; border-radius:8px; border:2px solid ${BRAND.colors.primary};">
              <span style="font-size:18px; font-weight:700; color:${BRAND.colors.primary};">TOTAL AMOUNT:</span>
              <span style="font-size:22px; font-weight:900; color:${BRAND.colors.primary};">Ksh ${formatPrice(total)}</span>
            </div>
            
            <div style="display:flex; justify-content:space-between; margin-bottom:15px; padding:15px; background:rgba(40,167,69,0.1); border-radius:8px; border-left:4px solid ${BRAND.colors.success};">
              <span style="font-size:16px; font-weight:700; color:#333;">Amount Paid:</span>
              <span style="font-size:18px; font-weight:800; color:${BRAND.colors.success};">Ksh ${formatPrice(amountPaid)}</span>
            </div>
            
            ${balance > 0 ? `
            <div style="display:flex; justify-content:space-between; margin-bottom:15px; padding:15px; background:rgba(220,53,69,0.1); border-radius:8px; border-left:4px solid ${BRAND.colors.danger};">
              <span style="font-size:16px; font-weight:700; color:#333;">Balance Due:</span>
              <span style="font-size:18px; font-weight:800; color:${BRAND.colors.danger};">Ksh ${formatPrice(balance)}</span>
            </div>
            ` : ''}
            
            <div style="display:flex; justify-content:space-between; padding-top:20px; border-top:2px solid #e0e0e0;">
              <span style="font-size:16px; font-weight:700;">PAYMENT STATUS:</span>
              <span style="font-size:18px; font-weight:900; color:${statusColor};">${statusText}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Company Information -->
      <div style="margin-bottom:30px; padding:25px; background:linear-gradient(135deg, ${BRAND.colors.primary} 0%, #002244 100%); border-radius:10px; color:white; box-shadow:0 8px 25px rgba(0,51,102,0.2);">
        <h3 style="margin:0 0 20px 0; font-size:20px; font-weight:700; color:${BRAND.colors.accent}; text-align:center; letter-spacing:0.5px;">${BRAND.name} - BANKING INFORMATION</h3>
        <div style="display:grid; grid-template-columns:repeat(2, 1fr); gap:30px;">
          <div>
            <div style="display:flex; align-items:center; margin-bottom:15px;">
              <div style="width:40px; height:40px; background:rgba(255,255,255,0.1); border-radius:8px; display:flex; align-items:center; justify-content:center; margin-right:15px;">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
                  <rect x="2" y="4" width="20" height="16" rx="2"></rect>
                  <path d="M6 10h4"></path><path d="M14 10h4"></path>
                  <path d="M6 14h12"></path>
                </svg>
              </div>
              <div>
                <p style="margin:0 0 5px 0; font-size:16px; font-weight:700;">Bank Transfer</p>
              </div>
            </div>
            <div style="padding-left:55px;">
              <p style="margin:0 0 8px 0; font-size:14px;"><strong>Bank:</strong> ${BRAND.contact.bank.name}</p>
              <p style="margin:0 0 8px 0; font-size:14px;"><strong>Account Name:</strong> ${BRAND.contact.bank.accountName}</p>
              <p style="margin:0 0 8px 0; font-size:14px;"><strong>Account Number:</strong> ${BRAND.contact.bank.accountNumber}</p>
              <p style="margin:0 0 8px 0; font-size:14px;"><strong>Branch:</strong> ${BRAND.contact.bank.branch}</p>
              <p style="margin:0; font-size:14px;"><strong>SWIFT Code:</strong> ${BRAND.contact.bank.swiftCode}</p>
            </div>
          </div>
          
          <div>
            <div style="display:flex; align-items:center; margin-bottom:15px;">
              <div style="width:40px; height:40px; background:rgba(255,255,255,0.1); border-radius:8px; display:flex; align-items:center; justify-content:center; margin-right:15px;">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
                  <rect x="2" y="6" width="20" height="12" rx="2"></rect>
                  <circle cx="12" cy="12" r="2"></circle>
                  <path d="M6 12h.01M18 12h.01"></path>
                </svg>
              </div>
              <div>
                <p style="margin:0 0 5px 0; font-size:16px; font-weight:700;">Mobile Payments</p>
              </div>
            </div>
            <div style="padding-left:55px;">
              <p style="margin:0 0 8px 0; font-size:14px;"><strong>Paybill:</strong> ${BRAND.contact.paybill.number}</p>
              <p style="margin:0 0 8px 0; font-size:14px;"><strong>Business:</strong> ${BRAND.contact.paybill.name}</p>
              <p style="margin:0 0 8px 0; font-size:14px; color:#ff6b35; font-weight:600;"><strong>Account:</strong> ${receipt.clientAccountNumber || 'NOT SET'}</p>
              <p style="margin:0 0 8px 0; font-size:14px;"><strong>VAT Number:</strong> ${BRAND.contact.vatNumber}</p>
              <p style="margin:0; font-size:14px;"><strong>Website:</strong> ${BRAND.contact.website}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div style="padding-top:25px; border-top:2px solid #f0f0f0; text-align:center; color:#666; font-size:12px;">
        <div style="display:flex; justify-content:center; align-items:center; gap:30px; margin-bottom:15px; flex-wrap:wrap;">
          <div style="display:flex; align-items:center; background:rgba(0,51,102,0.05); padding:8px 15px; border-radius:20px;">
            <Check size={14} style="margin-right:8px; color:${BRAND.colors.success};" />
            <span style="font-weight:600;">Payment Confirmed</span>
          </div>
          <div style="display:flex; align-items:center; background:rgba(0,51,102,0.05); padding:8px 15px; border-radius:20px;">
            <Shield size={14} style="margin-right:8px; color:${BRAND.colors.primary};" />
            <span style="font-weight:600;">Official Document</span>
          </div>
          <div style="display:flex; align-items:center; background:rgba(0,51,102,0.05); padding:8px 15px; border-radius:20px;">
            <Clock size={14} style="margin-right:8px; color:${BRAND.colors.warning};" />
            <span style="font-weight:600;">Generated: ${new Date().toLocaleString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
          </div>
        </div>
        <p style="margin:0 0 15px 0; font-size:16px; font-weight:700; color:${BRAND.colors.primary};">Thank you for choosing ${BRAND.name}!</p>
        <div style="display:flex; justify-content:center; gap:30px; margin-bottom:10px; flex-wrap:wrap;">
          <span style="display:flex; align-items:center; font-size:13px;">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right:6px;">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
              <polyline points="22,6 12,13 2,6"></polyline>
            </svg>
            ${BRAND.contact.email}
          </span>
          <span style="display:flex; align-items:center; font-size:13px;">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right:6px;">
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
            </svg>
            ${BRAND.contact.phone}
          </span>
          <span style="display:flex; align-items:center; font-size:13px;">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right:6px;">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"></path>
              <circle cx="12" cy="9" r="3"></circle>
            </svg>
            ${BRAND.contact.website}
          </span>
        </div>
        <p style="margin:10px 0 0 0; font-size:11px; color:#999; line-height:1.4;">
          This is an official receipt generated by ${BRAND.name}. Please retain for your records.<br/>
          For any billing inquiries, please contact ${BRAND.contact.email} or call ${BRAND.contact.phone}
        </p>
      </div>
    </div>
  `;

  document.body.appendChild(printContainer);

  try {
    const opt = {
      margin: [10, 10, 10, 10],
      filename: `Receipt_${receipt.receiptNumber || receipt._id || Date.now()}_${BRAND.name}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { 
        scale: 2, 
        useCORS: true, 
        allowTaint: true,
        windowWidth: 800,
        width: 800,
        backgroundColor: '#ffffff',
        logging: false
      },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    await html2pdf().from(printContainer).set(opt).save();
    showNotification('✅ Professional receipt PDF downloaded successfully!', 'success');
    return { success: true };
  } catch (err) {
    console.error('PDF generation error:', err);
    showNotification('❌ Failed to generate PDF. Please try again.', 'error');
    return { success: false };
  } finally {
    document.body.removeChild(printContainer);
  }
};

// ✅ ENHANCED: Prepare comprehensive email content
const prepareReceiptEmailContent = (receipt) => {
  const paymentMethodMap = {
    'mobile_money': 'Mobile Money',
    'bank_transfer': 'Bank Transfer',
    'cash': 'Cash',
    'card': 'Credit/Debit Card',
    'cheque': 'Cheque',
    'other': 'Other'
  };
  
  const paymentMethod = paymentMethodMap[receipt.paymentMethod] || receipt.paymentMethod || 'Cash';
  const total = receipt.total || 0;
  const amountPaid = receipt.amountPaid || 0;
  const balance = Math.max(0, total - amountPaid);
  const isFullyPaid = balance === 0;

  const subject = `Payment Receipt #${receipt.receiptNumber} from ${BRAND.name} - ${isFullyPaid ? 'PAID' : 'PARTIAL PAYMENT'}`;
  
  const bodyLines = [
    `Dear ${receipt.customerName || 'Valued Customer'},`,
    ``,
    `We are pleased to confirm receipt of your payment. Thank you for choosing ${BRAND.name}!`,
    ``,
    `========================================`,
    `            PAYMENT RECEIPT SUMMARY`,
    `========================================`,
    ``,
    `📋 **RECEIPT INFORMATION**`,
    `• Receipt Number: ${receipt.receiptNumber || 'N/A'}`,
    `• Invoice Number: ${receipt.invoiceNumber || 'Not specified'}`,
    `• Receipt Date: ${receipt.receiptDate ? new Date(receipt.receiptDate).toLocaleDateString() : 'N/A'}`,
    `• Payment Date: ${receipt.paymentDate ? new Date(receipt.paymentDate).toLocaleDateString() : 'N/A'}`,
    `• Payment Method: ${paymentMethod}`,
    `• Payment Status: ${isFullyPaid ? '✅ PAID IN FULL' : '⚠️ PARTIAL PAYMENT'}`,
    `${receipt.paymentReference ? `• Payment Reference: ${receipt.paymentReference}` : ''}`,
    `${receipt.transactionId ? `• Transaction ID: ${receipt.transactionId}` : ''}`,
    ``,
    `👤 **CUSTOMER INFORMATION**`,
    `• Name: ${receipt.customerName || 'Customer'}`,
    `• Email: ${receipt.customerEmail || 'N/A'}`,
    `• Phone: ${receipt.customerPhone || 'Not provided'}`,
    `• Location: ${receipt.customerLocation || receipt.customerAddress || 'Not provided'}`,
    ``,
    `📦 **SERVICE DETAILS**`,
    `• Plan: ${receipt.planName || 'N/A'}`,
    `• Speed: ${receipt.planSpeed || 'N/A'}`,
    `• Service Description: ${receipt.serviceDescription || 'Internet Service'}`,
    `• Connection Type: Fiber Optic`,
    ``,
    `🧾 **PAYMENT BREAKDOWN**`,
    ...(receipt.items && receipt.items.length > 0 
      ? receipt.items.map((item, index) => 
          `• ${item.description || 'Service'}: ${item.quantity || 1} x Ksh ${formatPrice(item.unitPrice)} = Ksh ${formatPrice(item.amount)}`
        )
      : [`• ${receipt.planName || 'Internet Service'}: Ksh ${formatPrice(receipt.total || 0)}`]
    ),
    ``,
    `💰 **PAYMENT SUMMARY**`,
    `• Subtotal: Ksh ${formatPrice(receipt.subtotal || 0)}`,
    `• VAT (${receipt.taxRate || 0}%): Ksh ${formatPrice(receipt.taxAmount || 0)}`,
    `• Total Amount Due: Ksh ${formatPrice(receipt.total || 0)}`,
    `• Amount Paid: Ksh ${formatPrice(receipt.amountPaid || 0)}`,
    `${balance > 0 ? `• Balance Due: Ksh ${formatPrice(balance)}` : ''}`,
    `• Payment Status: ${isFullyPaid ? '✅ PAID IN FULL - Thank you!' : '⚠️ PARTIAL PAYMENT - Balance due'}`,
    ``,
    `💳 **BANKING INFORMATION**`,
    `For future payments, please use the following details:`,
    ``,
    `🏦 **Bank Transfer**`,
    `• Bank: ${BRAND.contact.bank.name}`,
    `• Account Name: ${BRAND.contact.bank.accountName}`,
    `• Account Number: ${BRAND.contact.bank.accountNumber}`,
    `• Branch: ${BRAND.contact.bank.branch}`,
    `• SWIFT Code: ${BRAND.contact.bank.swiftCode}`,
    ``,
    `📱 **Mobile Payments**`,
    `• Paybill Number: ${BRAND.contact.paybill.number}`,
    `• Business Name: ${BRAND.contact.paybill.name}`,
    `• Account Name: ${receipt.customerName?.split(' ')[0] || 'Customer'}`,
    ``,
    `💳 **Other Payment Methods**`,
    `• Cash (at our offices)`,
    `• Credit/Debit Cards`,
    `• Cheques (payable to ${BRAND.contact.bank.accountName})`,
    ``,
    `📝 **RECEIPT NOTES**`,
    `${receipt.notes || 'Thank you for your payment! This receipt serves as official proof of payment for services rendered.'}`,
    ``,
    `========================================`,
    `            IMPORTANT INFORMATION`,
    `========================================`,
    ``,
    `🔸 This receipt is an official document from ${BRAND.name}`,
    `🔸 Please retain this receipt for your records and future reference`,
    `🔸 For billing inquiries, please quote your receipt number: ${receipt.receiptNumber}`,
    `🔸 The attached PDF is your official receipt document`,
    `🔸 This receipt has been CC'd to our support team for record keeping`,
    ``,
    `========================================`,
    `            CONTACT & SUPPORT`,
    `========================================`,
    ``,
    `For any queries, technical support, or billing assistance:`,
    ``,
    `📧 **Email Support:** ${BRAND.contact.email}`,
    `📞 **Phone Support:** ${BRAND.contact.phone}`,
    `🌐 **Website:** ${BRAND.contact.website}`,
    `📍 **Address:** ${BRAND.contact.address}`,
    ``,
    `Our support team is available:`,
    `• Monday - Friday: 8:00 AM - 6:00 PM`,
    `• Saturday: 9:00 AM - 4:00 PM`,
    `• Sunday: Emergency Support Only`,
    ``,
    `========================================`,
    ``,
    `Thank you for choosing ${BRAND.name} for your internet needs!`,
    ``,
    `Best regards,`,
    `**The ${BRAND.name} Team**`,
    `${BRAND.tagline}`,
    ``,
    `---`,
    `This is an automated email. Please do not reply directly to this message.`,
    `If you need assistance, please contact ${BRAND.contact.email}`,
    `This email has been CC'd to our support team at ${BRAND.contact.email} for record keeping.`
  ];

  return {
    subject: encodeURIComponent(subject),
    body: encodeURIComponent(bodyLines.join('\n'))
  };
};

const ReceiptManager = ({ darkMode, themeClasses, API_BASE_URL, showNotification, receipts, setReceipts, invoices }) => {
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showPDFModal, setShowPDFModal] = useState(false);
  const [editingReceipt, setEditingReceipt] = useState(null);
  const [exportLoading, setExportLoading] = useState(false);
  const [sendingReceipt, setSendingReceipt] = useState(null);
  const [searchInvoiceTerm, setSearchInvoiceTerm] = useState('');
  const [showInvoiceSearch, setShowInvoiceSearch] = useState(false);
  const [copiedReceipt, setCopiedReceipt] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  
  // Form state
  const [receiptForm, setReceiptForm] = useState({
    receiptNumber: '',
    invoiceId: '',
    invoiceNumber: '',
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    customerAddress: '',
    receiptDate: new Date().toISOString().split('T')[0],
    paymentDate: new Date().toISOString().split('T')[0],
    items: [{ description: 'Monthly Internet Service', quantity: 1, unitPrice: 0, amount: 0 }],
    subtotal: 0,
    taxRate: 16,
    taxAmount: 0,
    discount: 0,
    discountType: 'none',
    total: 0,
    amountPaid: 0,
    balance: 0,
    paymentMethod: 'mobile_money',
    status: 'issued',
    serviceDescription: '',
    planName: '',
    planPrice: 0,
    planSpeed: '',
    notes: '',
    terms: 'Thank you for your business!',
    paymentReference: '',
    transactionId: '',
    bankReference: '',
    clientAccountNumber: '' // ✅ NEW: Client account number (FBI-XXXXXXXXX)
  });

  // Fetch receipts
  const fetchReceipts = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication session expired. Please log in again.');
      }
      const response = await fetch(`${API_BASE_URL}/api/receipts`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch receipts: ${response.status}`);
      }
      
      const data = await response.json();
      let receiptsData = [];
      
      if (Array.isArray(data)) {
        receiptsData = data;
      } else if (data && Array.isArray(data.data)) {
        receiptsData = data.data;
      } else if (data && Array.isArray(data.receipts)) {
        receiptsData = data.receipts;
      } else {
        receiptsData = [];
      }
      
      setReceipts(receiptsData);
    } catch (error) {
      console.error('Error fetching receipts:', error);
      showNotification(`🚨 Error loading receipts: ${error.message}`, 'error');
      setReceipts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!receipts || receipts.length === 0) {
      fetchReceipts();
    } else {
      setLoading(false);
    }
  }, []);

  // Generate receipt number
  const generateReceiptNumber = () => {
    if (receipts.length === 0) return 'RCP-001';
    const latestNumber = receipts.reduce((max, receipt) => {
      const match = receipt.receiptNumber?.match(/RCP-(\d+)/);
      if (match) {
        const num = parseInt(match[1]);
        return num > max ? num : max;
      }
      return max;
    }, 0);
    return `RCP-${String(latestNumber + 1).padStart(3, '0')}`;
  };

  // Calculate totals
  const calculateTotals = (items, taxRate = 16, discount = 0, discountType = 'none') => {
    const subtotal = items.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0);
    const taxAmount = (subtotal * (parseFloat(taxRate) || 0)) / 100;
    let discountAmount = 0;
    if (discountType === 'percentage') {
      discountAmount = (subtotal * (parseFloat(discount) || 0)) / 100;
    } else if (discountType === 'fixed') {
      discountAmount = parseFloat(discount) || 0;
    }
    const total = subtotal + taxAmount - discountAmount;
    return { subtotal, taxAmount, total };
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setReceiptForm(prev => {
      const updatedForm = { ...prev, [name]: value };
      if (['taxRate', 'discount', 'discountType'].includes(name)) {
        const { subtotal, taxAmount, total } = calculateTotals(
          updatedForm.items, 
          updatedForm.taxRate, 
          updatedForm.discount, 
          updatedForm.discountType
        );
        return {
          ...updatedForm,
          subtotal,
          taxAmount,
          total,
          amountPaid: updatedForm.amountPaid || total,
          balance: Math.max(0, total - (updatedForm.amountPaid || 0))
        };
      }
      if (name === 'amountPaid') {
        const amountPaid = parseFloat(value) || 0;
        const balance = Math.max(0, updatedForm.total - amountPaid);
        const status = balance === 0 ? 'paid' : (amountPaid > 0 ? 'partially_paid' : 'issued');
        return {
          ...updatedForm,
          amountPaid,
          balance,
          status
        };
      }
      return updatedForm;
    });
  };

  // Handle item changes
  const handleItemChange = (index, field, value) => {
    const updatedItems = [...receiptForm.items];
    const item = updatedItems[index];
    
    if (field === 'quantity' || field === 'unitPrice') {
      const quantity = field === 'quantity' ? parseFloat(value) || 0 : item.quantity;
      const unitPrice = field === 'unitPrice' ? parseFloat(value) || 0 : item.unitPrice;
      const amount = quantity * unitPrice;
      updatedItems[index] = { ...item, [field]: parseFloat(value) || 0, amount };
    } else {
      updatedItems[index] = { ...item, [field]: value };
    }
    
    const { subtotal, taxAmount, total } = calculateTotals(
      updatedItems, 
      receiptForm.taxRate, 
      receiptForm.discount, 
      receiptForm.discountType
    );
    
    setReceiptForm(prev => ({
      ...prev,
      items: updatedItems,
      subtotal,
      taxAmount,
      total,
      amountPaid: prev.amountPaid || total,
      balance: Math.max(0, total - (prev.amountPaid || 0))
    }));
  };

  // Add new item
  const addItem = () => {
    setReceiptForm(prev => ({
      ...prev,
      items: [...prev.items, { description: '', quantity: 1, unitPrice: 0, amount: 0 }]
    }));
  };

  // Remove item
  const removeItem = (index) => {
    if (receiptForm.items.length > 1) {
      const updatedItems = receiptForm.items.filter((_, i) => i !== index);
      const { subtotal, taxAmount, total } = calculateTotals(
        updatedItems, 
        receiptForm.taxRate, 
        receiptForm.discount, 
        receiptForm.discountType
      );
      
      setReceiptForm(prev => ({
        ...prev,
        items: updatedItems,
        subtotal,
        taxAmount,
        total,
        amountPaid: prev.amountPaid || total,
        balance: Math.max(0, total - (prev.amountPaid || 0))
      }));
    }
  };

  // Create new receipt
  const createReceipt = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication session expired. Please log in again.');
      }
      
      if (!receiptForm.customerName?.trim()) {
        showNotification('⚠️ Customer name is required', 'warning');
        return;
      }
      
      if (!receiptForm.customerEmail?.trim()) {
        showNotification('⚠️ Customer email is required', 'warning');
        return;
      }
      
      const receiptData = {
        receiptNumber: receiptForm.receiptNumber || generateReceiptNumber(),
        invoiceNumber: receiptForm.invoiceNumber || '',
        customerName: receiptForm.customerName.trim(),
        customerEmail: receiptForm.customerEmail.trim(),
        customerPhone: receiptForm.customerPhone?.trim() || '',
        customerLocation: receiptForm.customerAddress?.trim() || 'Not specified',
        receiptDate: new Date(receiptForm.receiptDate),
        paymentDate: new Date(receiptForm.paymentDate),
        items: receiptForm.items.map(item => ({
          description: item.description?.trim() || 'Service',
          quantity: parseFloat(item.quantity) || 1,
          unitPrice: parseFloat(item.unitPrice) || 0,
          amount: parseFloat(item.amount) || 0
        })),
        subtotal: parseFloat(receiptForm.subtotal) || 0,
        taxRate: parseFloat(receiptForm.taxRate) || 16,
        taxAmount: parseFloat(receiptForm.taxAmount) || 0,
        discount: parseFloat(receiptForm.discount) || 0,
        discountType: receiptForm.discountType || 'none',
        total: parseFloat(receiptForm.total) || 0,
        amountPaid: parseFloat(receiptForm.amountPaid) || 0,
        balance: parseFloat(receiptForm.balance) || 0,
        paymentMethod: receiptForm.paymentMethod || 'mobile_money',
        status: receiptForm.amountPaid >= receiptForm.total ? 'paid' : 'issued',
        serviceDescription: receiptForm.serviceDescription?.trim() || '',
        planName: receiptForm.planName?.trim() || '',
        planPrice: parseFloat(receiptForm.planPrice) || 0,
        planSpeed: receiptForm.planSpeed?.trim() || '',
        notes: receiptForm.notes?.trim() || '',
        terms: receiptForm.terms?.trim() || 'Thank you for your business!',
        paymentReference: receiptForm.paymentReference?.trim() || '',
        transactionId: receiptForm.transactionId?.trim() || '',
        bankReference: receiptForm.bankReference?.trim() || ''
      };
      
      const response = await fetch(`${API_BASE_URL}/api/receipts`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(receiptData)
      });
      
      const responseData = await response.json();
      
      if (response.ok) {
        const newReceipt = responseData.receipt || responseData.data || responseData;
        setReceipts(prev => [...prev, newReceipt]);
        setShowCreateModal(false);
        resetForm();
        showNotification('✅ Receipt created successfully!', 'success');
      } else {
        if (responseData.errors) {
          const errorMessages = Object.values(responseData.errors).join(', ');
          throw new Error(`Validation failed: ${errorMessages}`);
        }
        throw new Error(responseData.message || `Failed to create receipt: ${response.status}`);
      }
    } catch (error) {
      console.error('Error creating receipt:', error);
      showNotification(`🚨 Error: ${error.message}`, 'error');
    }
  };

  // Update receipt
  const updateReceipt = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication session expired. Please log in again.');
      }
      
      const receiptData = {
        receiptNumber: receiptForm.receiptNumber,
        invoiceNumber: receiptForm.invoiceNumber,
        customerName: receiptForm.customerName.trim(),
        customerEmail: receiptForm.customerEmail.trim(),
        customerPhone: receiptForm.customerPhone?.trim() || '',
        customerLocation: receiptForm.customerAddress?.trim() || 'Not specified',
        receiptDate: new Date(receiptForm.receiptDate),
        paymentDate: new Date(receiptForm.paymentDate),
        items: receiptForm.items.map(item => ({
          description: item.description?.trim() || 'Service',
          quantity: parseFloat(item.quantity) || 1,
          unitPrice: parseFloat(item.unitPrice) || 0,
          amount: parseFloat(item.amount) || 0
        })),
        subtotal: parseFloat(receiptForm.subtotal) || 0,
        taxRate: parseFloat(receiptForm.taxRate) || 16,
        taxAmount: parseFloat(receiptForm.taxAmount) || 0,
        discount: parseFloat(receiptForm.discount) || 0,
        discountType: receiptForm.discountType || 'none',
        total: parseFloat(receiptForm.total) || 0,
        amountPaid: parseFloat(receiptForm.amountPaid) || 0,
        balance: parseFloat(receiptForm.balance) || 0,
        paymentMethod: receiptForm.paymentMethod || 'mobile_money',
        status: receiptForm.amountPaid >= receiptForm.total ? 'paid' : 'issued',
        serviceDescription: receiptForm.serviceDescription?.trim() || '',
        planName: receiptForm.planName?.trim() || '',
        planPrice: parseFloat(receiptForm.planPrice) || 0,
        planSpeed: receiptForm.planSpeed?.trim() || '',
        notes: receiptForm.notes?.trim() || '',
        terms: receiptForm.terms?.trim() || 'Thank you for your business!',
        paymentReference: receiptForm.paymentReference?.trim() || '',
        transactionId: receiptForm.transactionId?.trim() || '',
        bankReference: receiptForm.bankReference?.trim() || ''
      };
      
      const response = await fetch(`${API_BASE_URL}/api/receipts/${editingReceipt._id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(receiptData)
      });
      
      const responseData = await response.json();
      
      if (response.ok) {
        const updatedReceipt = responseData.receipt || responseData.data || responseData;
        setReceipts(prev => prev.map(rec => 
          rec._id === editingReceipt._id ? updatedReceipt : rec
        ));
        setShowCreateModal(false);
        setEditingReceipt(null);
        resetForm();
        showNotification('✅ Receipt updated successfully!', 'success');
      } else {
        if (responseData.errors) {
          const errorMessages = Object.values(responseData.errors).join(', ');
          throw new Error(`Validation failed: ${errorMessages}`);
        }
        throw new Error(responseData.message || 'Failed to update receipt');
      }
    } catch (error) {
      console.error('Error updating receipt:', error);
      showNotification(`🚨 Error: ${error.message}`, 'error');
    }
  };

  // Delete receipt
  const deleteReceipt = async (receiptId) => {
    if (!window.confirm('Are you sure you want to delete this receipt? This action cannot be undone.')) {
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication session expired. Please log in again.');
      }
      
      const response = await fetch(`${API_BASE_URL}/api/receipts/${receiptId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        setReceipts(prev => prev.filter(rec => rec._id !== receiptId));
        showNotification('✅ Receipt deleted successfully!', 'success');
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete receipt');
      }
    } catch (error) {
      console.error('Error deleting receipt:', error);
      showNotification(`🚨 Error: ${error.message}`, 'error');
    }
  };

  // Generate receipt from invoice
  const generateReceiptFromInvoice = (invoice) => {
    const items = invoice.items && invoice.items.length > 0 
      ? invoice.items 
      : [{ 
          description: `Internet Service - ${invoice.planName}`, 
          quantity: 1, 
          unitPrice: invoice.planPrice || 0, 
          amount: invoice.planPrice || 0 
        }];
    
    const { subtotal, taxAmount, total } = calculateTotals(
      items, 
      invoice.taxRate || 16, 
      invoice.discount || 0, 
      invoice.discountType || 'none'
    );
    
    setReceiptForm({
      receiptNumber: generateReceiptNumber(),
      invoiceId: invoice._id,
      invoiceNumber: invoice.invoiceNumber || '',
      customerName: invoice.customerName || '',
      customerEmail: invoice.customerEmail || '',
      customerPhone: invoice.customerPhone || '',
      customerAddress: invoice.customerLocation || invoice.customerAddress || '',
      receiptDate: new Date().toISOString().split('T')[0],
      paymentDate: new Date().toISOString().split('T')[0],
      items: items,
      subtotal: subtotal,
      taxRate: invoice.taxRate || 16,
      taxAmount: taxAmount,
      discount: invoice.discount || 0,
      discountType: invoice.discountType || 'none',
      total: total,
      amountPaid: total,
      balance: 0,
      paymentMethod: invoice.paymentMethod || 'mobile_money',
      status: 'paid',
      serviceDescription: `Internet Service - ${invoice.planName} (${invoice.planSpeed})`,
      planName: invoice.planName || '',
      planPrice: invoice.planPrice || 0,
      planSpeed: invoice.planSpeed || '',
      notes: `Payment received for invoice ${invoice.invoiceNumber || ''}`,
      terms: 'Thank you for your business!',
      paymentReference: '',
      transactionId: '',
      bankReference: ''
    });
    
    setShowInvoiceSearch(false);
    setShowCreateModal(true);
  };

  // ✅ ENHANCED: Download PDF with professional receipt design
  const exportReceiptPDF = async (receipt) => {
    await generateReceiptPDF(receipt, showNotification);
  };

  // ✅ ENHANCED: Send receipt via email with all details and CC support
  const sendReceiptToClient = async (receipt) => {
    try {
      setSendingReceipt(receipt._id);
      
      // Validate email
      if (!receipt.customerEmail?.trim()) {
        showNotification('⚠️ Customer email address is required', 'warning');
        return;
      }
      
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(receipt.customerEmail.trim())) {
        showNotification('⚠️ Invalid customer email format', 'warning');
        return;
      }
      
      // Prepare enhanced email content
      const { subject, body } = prepareReceiptEmailContent(receipt);
      
      // Create mailto link with CC to support
      const mailtoLink = `mailto:${encodeURIComponent(receipt.customerEmail.trim())}?cc=${encodeURIComponent(BRAND.contact.email)}&subject=${subject}&body=${body}`;
      
      // Open email client
      window.open(mailtoLink, '_blank');
      
      showNotification(
        `📧 Email client opened with receipt details. CC added to ${BRAND.contact.email}. Please attach the downloaded PDF manually.`,
        'info'
      );
      
    } catch (error) {
      console.error('Error preparing receipt email:', error);
      showNotification(`🚨 Error: ${error.message}`, 'error');
    } finally {
      setSendingReceipt(null);
    }
  };

  // Export to Excel
  const exportReceiptsToExcel = async () => {
    try {
      setExportLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication session expired. Please log in again.');
      }
      
      const response = await fetch(`${API_BASE_URL}/api/receipts/export/excel`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = `receipts_${new Date().toISOString().split('T')[0]}.xlsx`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        showNotification('✅ Receipts exported to Excel successfully!', 'success');
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to export Excel');
      }
    } catch (error) {
      console.error('Error exporting to Excel:', error);
      showNotification(`🚨 Error exporting receipts to Excel: ${error.message}`, 'error');
    } finally {
      setExportLoading(false);
    }
  };

  // Copy receipt number to clipboard
  const copyReceiptNumber = (receiptNumber) => {
    navigator.clipboard.writeText(receiptNumber)
      .then(() => {
        setCopiedReceipt(receiptNumber);
        setTimeout(() => setCopiedReceipt(null), 2000);
        showNotification('📋 Receipt number copied to clipboard!', 'success');
      })
      .catch(err => {
        console.error('Failed to copy:', err);
        showNotification('❌ Failed to copy receipt number', 'error');
      });
  };

  // Reset form
  const resetForm = () => {
    setReceiptForm({
      receiptNumber: '',
      invoiceId: '',
      invoiceNumber: '',
      customerName: '',
      customerEmail: '',
      customerPhone: '',
      customerAddress: '',
      receiptDate: new Date().toISOString().split('T')[0],
      paymentDate: new Date().toISOString().split('T')[0],
      items: [{ description: 'Monthly Internet Service', quantity: 1, unitPrice: 0, amount: 0 }],
      subtotal: 0,
      taxRate: 16,
      taxAmount: 0,
      discount: 0,
      discountType: 'none',
      total: 0,
      amountPaid: 0,
      balance: 0,
      paymentMethod: 'mobile_money',
      status: 'issued',
      serviceDescription: '',
      planName: '',
      planPrice: 0,
      planSpeed: '',
      notes: '',
      terms: 'Thank you for your business!',
      paymentReference: '',
      transactionId: '',
      bankReference: ''
    });
  };

  // Edit receipt
  const editReceipt = (receipt) => {
    setReceiptForm({
      receiptNumber: receipt.receiptNumber || '',
      invoiceId: receipt.invoiceId || '',
      invoiceNumber: receipt.invoiceNumber || '',
      customerName: receipt.customerName || '',
      customerEmail: receipt.customerEmail || '',
      customerPhone: receipt.customerPhone || '',
      customerAddress: receipt.customerLocation || receipt.customerAddress || '',
      receiptDate: receipt.receiptDate ? new Date(receipt.receiptDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      paymentDate: receipt.paymentDate ? new Date(receipt.paymentDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      items: receipt.items || [{ description: 'Monthly Internet Service', quantity: 1, unitPrice: 0, amount: 0 }],
      subtotal: receipt.subtotal || 0,
      taxRate: receipt.taxRate || 16,
      taxAmount: receipt.taxAmount || 0,
      discount: receipt.discount || 0,
      discountType: receipt.discountType || 'none',
      total: receipt.total || 0,
      amountPaid: receipt.amountPaid || 0,
      balance: receipt.balance || 0,
      paymentMethod: receipt.paymentMethod || 'mobile_money',
      status: receipt.status || 'issued',
      serviceDescription: receipt.serviceDescription || '',
      planName: receipt.planName || '',
      planPrice: receipt.planPrice || 0,
      planSpeed: receipt.planSpeed || '',
      notes: receipt.notes || '',
      terms: receipt.terms || 'Thank you for your business!',
      paymentReference: receipt.paymentReference || '',
      transactionId: receipt.transactionId || '',
      bankReference: receipt.bankReference || ''
    });
    
    setEditingReceipt(receipt);
    setShowCreateModal(true);
  };

  // View receipt details
  const viewReceipt = (receipt) => {
    setSelectedReceipt(receipt);
    setShowReceiptModal(true);
  };

  // Filter receipts
  const filteredReceipts = Array.isArray(receipts) 
    ? receipts.filter(receipt => {
        if (!receipt || typeof receipt !== 'object') return false;
        
        // Filter by status
        if (filterStatus !== 'all' && receipt.status !== filterStatus) return false;
        
        // Filter by search term
        const term = searchTerm.toLowerCase();
        return (
          (receipt.customerName?.toLowerCase() || '').includes(term) ||
          (receipt.receiptNumber?.toLowerCase() || '').includes(term) ||
          (receipt.invoiceNumber?.toLowerCase() || '').includes(term) ||
          (receipt.customerEmail?.toLowerCase() || '').includes(term) ||
          (receipt.customerPhone?.toLowerCase() || '').includes(term)
        );
      })
    : [];

  // Calculate statistics
  const stats = {
    totalReceipts: receipts.length,
    totalRevenue: receipts.reduce((sum, r) => sum + (parseFloat(r.total) || 0), 0),
    paidReceipts: receipts.filter(r => r.status === 'paid').length,
    issuedReceipts: receipts.filter(r => r.status === 'issued').length,
    partiallyPaidReceipts: receipts.filter(r => r.status === 'partially_paid').length,
    refundedReceipts: receipts.filter(r => r.status === 'refunded').length,
    monthlyRevenue: receipts
      .filter(r => {
        const date = new Date(r.receiptDate || r.createdAt);
        const now = new Date();
        return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
      })
      .reduce((sum, r) => sum + (parseFloat(r.total) || 0), 0),
    todayRevenue: receipts
      .filter(r => {
        const date = new Date(r.receiptDate || r.createdAt);
        const today = new Date();
        return date.getDate() === today.getDate() && 
               date.getMonth() === today.getMonth() && 
               date.getFullYear() === today.getFullYear();
      })
      .reduce((sum, r) => sum + (parseFloat(r.total) || 0), 0)
  };

  // Calculate chart data
  const prepareChartData = () => {
    if (!receipts || receipts.length === 0) return { statusData: [], revenueData: [], trendData: [] };
    
    const statusData = [
      { name: 'Paid', value: stats.paidReceipts, color: BRAND.colors.success },
      { name: 'Issued', value: stats.issuedReceipts, color: BRAND.colors.warning },
      { name: 'Partial', value: stats.partiallyPaidReceipts, color: BRAND.colors.info },
      { name: 'Refunded', value: stats.refundedReceipts, color: BRAND.colors.danger }
    ].filter(d => d.value > 0);
    
    const now = new Date();
    const monthly = stats.monthlyRevenue;
    
    const quarterly = receipts.filter(r => {
      const date = new Date(r.receiptDate || r.createdAt);
      const currentQuarter = Math.floor(now.getMonth() / 3);
      const receiptQuarter = Math.floor(date.getMonth() / 3);
      return date.getFullYear() === now.getFullYear() && receiptQuarter === currentQuarter;
    }).reduce((sum, r) => sum + (r.total || 0), 0);
    
    const annually = receipts.filter(r => {
      const date = new Date(r.receiptDate || r.createdAt);
      return date.getFullYear() === now.getFullYear();
    }).reduce((sum, r) => sum + (r.total || 0), 0);
    
    const revenueData = [
      { name: 'Today', value: stats.todayRevenue },
      { name: 'Monthly', value: monthly },
      { name: 'Quarterly', value: quarterly },
      { name: 'Annual', value: annually }
    ].filter(d => d.value > 0);
    
    const trendData = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthKey = date.toLocaleString('default', { month: 'short' });
      const amount = receipts
        .filter(r => {
          const receiptDate = new Date(r.receiptDate || r.createdAt);
          return receiptDate.getMonth() === date.getMonth() && receiptDate.getFullYear() === date.getFullYear();
        })
        .reduce((sum, r) => sum + (r.total || 0), 0);
      trendData.push({ name: monthKey, revenue: amount });
    }
    
    return { statusData, revenueData, trendData };
  };

  const { statusData, revenueData, trendData } = prepareChartData();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-t-2 border-[#003366]"></div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold mb-2 bg-gradient-to-r from-[#003366] to-[#FFCC00] bg-clip-text text-transparent">
            Receipt Management
          </h2>
          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Total: {receipts.length} receipts • Revenue: Ksh {formatPrice(stats.totalRevenue)}
          </p>
        </div>
        <div className="flex flex-wrap gap-3 mt-4 md:mt-0">
          <button 
            onClick={fetchReceipts}
            className={`${themeClasses.button.small.base} ${darkMode ? themeClasses.button.small.dark : themeClasses.button.small.light} flex items-center`}
          >
            <RefreshCw size={16} className="mr-1.5" /> Refresh
          </button>
          <button 
            onClick={exportReceiptsToExcel}
            disabled={exportLoading}
            className={`${themeClasses.button.small.base} ${darkMode ? themeClasses.button.small.dark : themeClasses.button.small.light} flex items-center ${
              exportLoading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            <FileSpreadsheet size={16} className="mr-1.5" />
            {exportLoading ? 'Exporting...' : 'Export Excel'}
          </button>
          <button 
            onClick={() => setShowInvoiceSearch(true)}
            className={`${themeClasses.button.secondary.base} ${darkMode ? themeClasses.button.secondary.dark : themeClasses.button.secondary.light} flex items-center`}
          >
            <FileText size={16} className="mr-1.5" /> From Invoice
          </button>
          <button 
            onClick={() => {
              setEditingReceipt(null);
              resetForm();
              setReceiptForm(prev => ({
                ...prev,
                receiptNumber: generateReceiptNumber()
              }));
              setShowCreateModal(true);
            }}
            className={`${themeClasses.button.primary.base} ${darkMode ? themeClasses.button.primary.dark : themeClasses.button.primary.light} flex items-center`}
          >
            <Plus size={16} className="mr-1.5" /> New Receipt
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className={`${themeClasses.card} rounded-xl p-4 border-l-4 border-[#003366]`}>
          <div className="flex items-center">
            <Receipt className={`h-8 w-8 mr-3 ${darkMode ? 'text-blue-400' : 'text-[#003366]'}`} />
            <div>
              <p className="text-sm font-medium">Total Receipts</p>
              <p className="text-2xl font-bold">{stats.totalReceipts}</p>
            </div>
          </div>
        </div>
        <div className={`${themeClasses.card} rounded-xl p-4 border-l-4 border-[#FFCC00]`}>
          <div className="flex items-center">
            <DollarSign className={`h-8 w-8 mr-3 ${darkMode ? 'text-yellow-400' : 'text-[#FFCC00]'}`} />
            <div>
              <p className="text-sm font-medium">Total Revenue</p>
              <p className="text-2xl font-bold">Ksh {formatPrice(stats.totalRevenue)}</p>
            </div>
          </div>
        </div>
        <div className={`${themeClasses.card} rounded-xl p-4 border-l-4 border-[#28a745]`}>
          <div className="flex items-center">
            <CheckCircle className={`h-8 w-8 mr-3 ${darkMode ? 'text-green-400' : 'text-[#28a745]'}`} />
            <div>
              <p className="text-sm font-medium">Paid Receipts</p>
              <p className="text-2xl font-bold">{stats.paidReceipts}</p>
            </div>
          </div>
        </div>
        <div className={`${themeClasses.card} rounded-xl p-4 border-l-4 border-[#17a2b8]`}>
          <div className="flex items-center">
            <Clock className={`h-8 w-8 mr-3 ${darkMode ? 'text-blue-400' : 'text-[#17a2b8]'}`} />
            <div>
              <p className="text-sm font-medium">Issued Receipts</p>
              <p className="text-2xl font-bold">{stats.issuedReceipts}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      {receipts.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div className={`${themeClasses.card} p-4 rounded-xl border backdrop-blur-sm`}>
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <PieChartIcon size={18} className="mr-2" /> Receipt Status
            </h3>
            <ResponsiveContainer width="100%" height={200}>
              <RechartsPie>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`Count: ${value}`, '']} />
                <Legend />
              </RechartsPie>
            </ResponsiveContainer>
          </div>
          
          <div className={`${themeClasses.card} p-4 rounded-xl border backdrop-blur-sm`}>
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <BarChart3 size={18} className="mr-2" /> Revenue Overview
            </h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis tickFormatter={(value) => `Ksh ${formatPrice(value)}`} />
                <Tooltip formatter={(value) => [`Ksh ${formatPrice(value)}`, 'Revenue']} />
                <Legend />
                <Bar dataKey="value" fill="#003366" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          
          <div className={`${themeClasses.card} p-4 rounded-xl border backdrop-blur-sm`}>
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <TrendingUp size={18} className="mr-2" /> Revenue Trend (6 Months)
            </h3>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis tickFormatter={(value) => `Ksh ${formatPrice(value)}`} />
                <Tooltip formatter={(value) => [`Ksh ${formatPrice(value)}`, 'Revenue']} />
                <Legend />
                <Line type="monotone" dataKey="revenue" stroke="#FFCC00" strokeWidth={3} dot={{ fill: '#003366', strokeWidth: 2, r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Filters and Search */}
      <div className={`${themeClasses.card} p-4 mb-6 rounded-xl shadow-sm border backdrop-blur-sm`}>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setFilterStatus('all')}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${filterStatus === 'all' 
                ? 'bg-[#003366] text-white' 
                : darkMode ? 'bg-gray-700' : 'bg-gray-200'}`}
            >
              All Receipts
            </button>
            <button
              onClick={() => setFilterStatus('paid')}
              className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center ${filterStatus === 'paid' 
                ? 'bg-green-500 text-white' 
                : darkMode ? 'bg-gray-700' : 'bg-gray-200'}`}
            >
              <CheckCircle size={14} className="mr-1" /> Paid
            </button>
            <button
              onClick={() => setFilterStatus('issued')}
              className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center ${filterStatus === 'issued' 
                ? 'bg-yellow-500 text-white' 
                : darkMode ? 'bg-gray-700' : 'bg-gray-200'}`}
            >
              <Clock size={14} className="mr-1" /> Issued
            </button>
            <button
              onClick={() => setFilterStatus('partially_paid')}
              className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center ${filterStatus === 'partially_paid' 
                ? 'bg-blue-500 text-white' 
                : darkMode ? 'bg-gray-700' : 'bg-gray-200'}`}
            >
              <CreditCard size={14} className="mr-1" /> Partial
            </button>
          </div>
          <div className="relative w-full md:w-64">
            <Search size={18} className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
            <input
              type="text"
              placeholder="Search receipts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full pl-10 pr-4 py-2 border rounded-lg ${themeClasses.input}`}
            />
          </div>
        </div>
      </div>

      {/* Receipts Table */}
      <div className={`${themeClasses.card} rounded-xl shadow-lg border backdrop-blur-sm overflow-hidden`}>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-900 dark:text-white">Receipt #</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-900 dark:text-white hidden md:table-cell">Customer</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-900 dark:text-white hidden lg:table-cell">Invoice #</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-900 dark:text-white">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-900 dark:text-white hidden md:table-cell">Payment</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-900 dark:text-white">Status</th>
                <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-900 dark:text-white">Actions</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${darkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
              {filteredReceipts.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-8 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <Receipt size={48} className={`mb-4 ${darkMode ? 'text-gray-600' : 'text-gray-400'}`} />
                      <p className={`text-lg font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        {receipts.length === 0 ? 'No receipts available' : 'No receipts match your search'}
                      </p>
                      <button 
                        onClick={() => {
                          setEditingReceipt(null);
                          resetForm();
                          setReceiptForm(prev => ({
                            ...prev,
                            receiptNumber: generateReceiptNumber()
                          }));
                          setShowCreateModal(true);
                        }}
                        className="px-4 py-2 bg-[#003366] text-white rounded-lg hover:bg-[#002244] transition-colors mt-4"
                      >
                        Create Your First Receipt
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredReceipts.map((receipt) => (
                  <tr key={receipt._id} className={`${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'} transition-colors`}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <Receipt size={20} className={`${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                        </div>
                        <div className="ml-3">
                          <div className="text-sm font-medium text-gray-900 dark:text-gray-100 flex items-center">
                            {receipt.receiptNumber || 'N/A'}
                            <button
                              onClick={() => copyReceiptNumber(receipt.receiptNumber)}
                              className="ml-2 p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                              title="Copy receipt number"
                            >
                              <Copy size={12} className={copiedReceipt === receipt.receiptNumber ? 'text-green-500' : 'text-gray-400'} />
                            </button>
                          </div>
                          <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                            {receipt.receiptDate ? new Date(receipt.receiptDate).toLocaleDateString() : 
                             receipt.createdAt ? new Date(receipt.createdAt).toLocaleDateString() : 'N/A'}
                          </div>
                        </div>
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap hidden md:table-cell">
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          {receipt.customerName || 'N/A'}
                        </div>
                        <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          {receipt.customerEmail || 'N/A'}
                        </div>
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap hidden lg:table-cell text-sm text-gray-600 dark:text-gray-400">
                      {receipt.invoiceNumber || 'N/A'}
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        Ksh {formatPrice(receipt.total || 0)}
                      </div>
                      <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        Paid: Ksh {formatPrice(receipt.amountPaid || 0)}
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap hidden md:table-cell">
                      <div className="text-sm text-gray-600 dark:text-gray-400 capitalize">
                        {receipt.paymentMethod?.replace('_', ' ') || 'cash'}
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        receipt.status === 'paid' 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                          : receipt.status === 'issued'
                          ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                          : receipt.status === 'refunded'
                          ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                          : receipt.status === 'partially_paid'
                          ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                          : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                      }`}>
                        {receipt.status === 'paid' ? <><CheckCircle size={12} className="mr-1" /> Paid</> :
                         receipt.status === 'issued' ? <><Clock size={12} className="mr-1" /> Issued</> :
                         receipt.status === 'refunded' ? <><AlertCircle size={12} className="mr-1" /> Refunded</> :
                         receipt.status === 'partially_paid' ? <><CreditCard size={12} className="mr-1" /> Partial</> :
                         <><Receipt size={12} className="mr-1" /> {receipt.status}</>}
                      </span>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-1">
                        <button
                          onClick={() => viewReceipt(receipt)}
                          className={`p-2 rounded-lg ${darkMode ? 'text-gray-400 hover:bg-gray-600' : 'text-gray-600 hover:bg-gray-100'} transition-colors`}
                          title="View Details"
                        >
                          <Eye size={16} />
                        </button>
                        
                        <button
                          onClick={() => exportReceiptPDF(receipt)}
                          className={`p-2 rounded-lg ${darkMode ? 'text-blue-400 hover:bg-gray-600' : 'text-blue-600 hover:bg-gray-100'} transition-colors`}
                          title="Download PDF"
                        >
                          <Download size={16} />
                        </button>
                        
                        <button
                          onClick={() => sendReceiptToClient(receipt)}
                          disabled={sendingReceipt === receipt._id}
                          className={`p-2 rounded-lg flex items-center justify-center w-8 h-8 ${darkMode ? 'text-green-400 hover:bg-gray-600' : 'text-green-600 hover:bg-gray-100'} transition-colors ${
                            sendingReceipt === receipt._id ? 'opacity-50 cursor-not-allowed' : ''
                          }`}
                          title="Send via Email"
                        >
                          {sendingReceipt === receipt._id ? (
                            <Loader2 size={16} className="animate-spin" />
                          ) : (
                            <Send size={16} />
                          )}
                        </button>
                        
                        <button
                          onClick={() => editReceipt(receipt)}
                          className={`p-2 rounded-lg ${darkMode ? 'text-yellow-400 hover:bg-gray-600' : 'text-yellow-600 hover:bg-gray-100'} transition-colors`}
                          title="Edit Receipt"
                        >
                          <Edit size={16} />
                        </button>
                        
                        <button
                          onClick={() => deleteReceipt(receipt._id)}
                          className={`p-2 rounded-lg ${darkMode ? 'text-red-400 hover:bg-gray-600' : 'text-red-600 hover:bg-gray-100'} transition-colors`}
                          title="Delete Receipt"
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

      {/* Create/Edit Receipt Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className={`${themeClasses.card} rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto`}>
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                  {editingReceipt ? 'Edit Receipt' : 'Create New Receipt'}
                </h3>
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    setEditingReceipt(null);
                    resetForm();
                  }}
                  className={`p-2 rounded-lg ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} transition-colors`}
                >
                  <X size={20} />
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Receipt Number *
                  </label>
                  <input
                    type="text"
                    name="receiptNumber"
                    value={receiptForm.receiptNumber}
                    onChange={handleInputChange}
                    placeholder="Auto-generated if empty"
                    className={`w-full p-3 border rounded-lg text-sm transition-all duration-200 focus:ring-2 focus:ring-[#003366] focus:border-transparent ${themeClasses.input}`}
                    required
                  />
                </div>
                
                <div>
                  <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Invoice Number
                  </label>
                  <input
                    type="text"
                    name="invoiceNumber"
                    value={receiptForm.invoiceNumber}
                    onChange={handleInputChange}
                    placeholder="Related invoice number (optional)"
                    className={`w-full p-3 border rounded-lg text-sm transition-all duration-200 focus:ring-2 focus:ring-[#003366] focus:border-transparent ${themeClasses.input}`}
                  />
                </div>
                
                <div>
                  <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Customer Name *
                  </label>
                  <input
                    type="text"
                    name="customerName"
                    value={receiptForm.customerName}
                    onChange={handleInputChange}
                    className={`w-full p-3 border rounded-lg text-sm transition-all duration-200 focus:ring-2 focus:ring-[#003366] focus:border-transparent ${themeClasses.input}`}
                    required
                  />
                </div>
                
                <div>
                  <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Customer Email *
                  </label>
                  <input
                    type="email"
                    name="customerEmail"
                    value={receiptForm.customerEmail}
                    onChange={handleInputChange}
                    className={`w-full p-3 border rounded-lg text-sm transition-all duration-200 focus:ring-2 focus:ring-[#003366] focus:border-transparent ${themeClasses.input}`}
                    required
                  />
                </div>
                
                <div>
                  <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Customer Phone
                  </label>
                  <input
                    type="tel"
                    name="customerPhone"
                    value={receiptForm.customerPhone}
                    onChange={handleInputChange}
                    className={`w-full p-3 border rounded-lg text-sm transition-all duration-200 focus:ring-2 focus:ring-[#003366] focus:border-transparent ${themeClasses.input}`}
                  />
                </div>
                
                <div>
                  <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Customer Address
                  </label>
                  <input
                    type="text"
                    name="customerAddress"
                    value={receiptForm.customerAddress}
                    onChange={handleInputChange}
                    placeholder="Customer location/address"
                    className={`w-full p-3 border rounded-lg text-sm transition-all duration-200 focus:ring-2 focus:ring-[#003366] focus:border-transparent ${themeClasses.input}`}
                  />
                </div>
                
                <div>
                  <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Client Account Number (FBI-XXXXXXXX) *
                  </label>
                  <input
                    type="text"
                    name="clientAccountNumber"
                    value={receiptForm.clientAccountNumber}
                    onChange={handleInputChange}
                    placeholder="FBI-00001"
                    className={`w-full p-3 border rounded-lg text-sm transition-all duration-200 focus:ring-2 focus:ring-[#003366] focus:border-transparent ${themeClasses.input}`}
                    required
                  />
                  <p className={`text-xs mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Each client has a unique account number starting with FBI-</p>
                </div>
                
                <div>
                  <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Receipt Date *
                  </label>
                  <input
                    type="date"
                    name="receiptDate"
                    value={receiptForm.receiptDate}
                    onChange={handleInputChange}
                    className={`w-full p-3 border rounded-lg text-sm transition-all duration-200 focus:ring-2 focus:ring-[#003366] focus:border-transparent ${themeClasses.input}`}
                    required
                  />
                </div>
                
                <div>
                  <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Payment Date *
                  </label>
                  <input
                    type="date"
                    name="paymentDate"
                    value={receiptForm.paymentDate}
                    onChange={handleInputChange}
                    className={`w-full p-3 border rounded-lg text-sm transition-all duration-200 focus:ring-2 focus:ring-[#003366] focus:border-transparent ${themeClasses.input}`}
                    required
                  />
                </div>
                
                <div>
                  <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Payment Method
                  </label>
                  <select
                    name="paymentMethod"
                    value={receiptForm.paymentMethod}
                    onChange={handleInputChange}
                    className={`w-full p-3 border rounded-lg text-sm transition-all duration-200 focus:ring-2 focus:ring-[#003366] focus:border-transparent ${themeClasses.input}`}
                  >
                    <option value="mobile_money">Mobile Money</option>
                    <option value="bank_transfer">Bank Transfer</option>
                    <option value="cash">Cash</option>
                    <option value="card">Credit/Debit Card</option>
                    <option value="cheque">Cheque</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                
                <div>
                  <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Payment Reference
                  </label>
                  <input
                    type="text"
                    name="paymentReference"
                    value={receiptForm.paymentReference}
                    onChange={handleInputChange}
                    placeholder="Payment reference number"
                    className={`w-full p-3 border rounded-lg text-sm transition-all duration-200 focus:ring-2 focus:ring-[#003366] focus:border-transparent ${themeClasses.input}`}
                  />
                </div>
              </div>
              
              {/* Plan Information */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Select Plan
                  </label>
                  <select 
                    name="planName" 
                    value={receiptForm.planName} 
                    onChange={(e) => {
                      const selectedPlan = WIFI_PLANS.find(p => p.name === e.target.value);
                      if (selectedPlan) {
                        handleInputChange({ 
                          target: { 
                            name: 'planName', 
                            value: selectedPlan.name 
                          } 
                        });
                        handleInputChange({ 
                          target: { 
                            name: 'planSpeed', 
                            value: selectedPlan.speed 
                          } 
                        });
                        handleInputChange({ 
                          target: { 
                            name: 'planPrice', 
                            value: selectedPlan.price 
                          } 
                        });
                        // Auto-populate items
                        const updatedItems = [{
                          description: `${selectedPlan.name} - ${selectedPlan.speed}`,
                          quantity: 1,
                          unitPrice: parseFloat(selectedPlan.price),
                          amount: parseFloat(selectedPlan.price)
                        }];
                        setReceiptForm(prev => ({
                          ...prev,
                          items: updatedItems,
                          planName: selectedPlan.name,
                          planSpeed: selectedPlan.speed,
                          planPrice: parseFloat(selectedPlan.price)
                        }));
                      }
                    }}
                    className={`w-full p-3 border rounded-lg text-sm transition-all duration-200 focus:ring-2 focus:ring-[#003366] focus:border-transparent ${themeClasses.input}`}
                  >
                    <option value="">Choose a plan...</option>
                    {WIFI_PLANS.map(plan => (
                      <option key={plan.id} value={plan.name}>
                        {plan.name} - Ksh {plan.price} ({plan.speed})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Plan Speed
                  </label>
                  <input
                    type="text"
                    name="planSpeed"
                    value={receiptForm.planSpeed}
                    onChange={handleInputChange}
                    className={`w-full p-3 border rounded-lg text-sm transition-all duration-200 focus:ring-2 focus:ring-[#003366] focus:border-transparent ${themeClasses.input} bg-gray-100 dark:bg-gray-700`}
                    readOnly
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Plan Price (Ksh)
                  </label>
                  <input
                    type="number"
                    name="planPrice"
                    value={receiptForm.planPrice}
                    onChange={handleInputChange}
                    className={`w-full p-3 border rounded-lg text-sm transition-all duration-200 focus:ring-2 focus:ring-[#003366] focus:border-transparent ${themeClasses.input} bg-gray-100 dark:bg-gray-700`}
                    step="1"
                    min="0"
                    readOnly
                  />
                </div>
              </div>
              
              {/* Receipt Items */}
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h4 className={`font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Receipt Items</h4>
                  <button
                    type="button"
                    onClick={addItem}
                    className={`${themeClasses.button.small.base} ${darkMode ? themeClasses.button.small.dark : themeClasses.button.small.light} flex items-center`}
                  >
                    <Plus size={14} className="mr-1" />
                    Add Item
                  </button>
                </div>
                <div className="space-y-3">
                  {receiptForm.items.map((item, index) => (
                    <div key={index} className="grid grid-cols-1 md:grid-cols-12 gap-3 items-start">
                      <div className="md:col-span-5">
                        <input
                          type="text"
                          placeholder="Item description"
                          value={item.description}
                          onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                          className={`w-full p-2 border rounded-lg text-sm transition-all duration-200 focus:ring-2 focus:ring-[#003366] focus:border-transparent ${themeClasses.input}`}
                        />
                      </div>
                      <div className="md:col-span-2">
                        <input
                          type="number"
                          placeholder="Qty"
                          value={item.quantity}
                          onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                          className={`w-full p-2 border rounded-lg text-sm transition-all duration-200 focus:ring-2 focus:ring-[#003366] focus:border-transparent ${themeClasses.input}`}
                          step="1"
                          min="1"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <input
                          type="number"
                          placeholder="Unit Price"
                          value={item.unitPrice}
                          onChange={(e) => handleItemChange(index, 'unitPrice', e.target.value)}
                          className={`w-full p-2 border rounded-lg text-sm transition-all duration-200 focus:ring-2 focus:ring-[#003366] focus:border-transparent ${themeClasses.input}`}
                          step="1"
                          min="0"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <input
                          type="number"
                          placeholder="Amount"
                          value={item.amount}
                          readOnly
                          className={`w-full p-2 border rounded-lg text-sm bg-gray-50 dark:bg-gray-700 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}
                        />
                      </div>
                      {receiptForm.items.length > 1 && (
                        <div className="md:col-span-1">
                          <button
                            type="button"
                            onClick={() => removeItem(index)}
                            className={`p-2 rounded-lg ${darkMode ? 'text-red-400 hover:bg-gray-700' : 'text-red-600 hover:bg-gray-100'} transition-colors`}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Financial Summary */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Tax Rate (%)
                  </label>
                  <input
                    type="number"
                    name="taxRate"
                    value={receiptForm.taxRate}
                    onChange={handleInputChange}
                    className={`w-full p-3 border rounded-lg text-sm transition-all duration-200 focus:ring-2 focus:ring-[#003366] focus:border-transparent ${themeClasses.input}`}
                    step="0.01"
                    min="0"
                    max="100"
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Discount
                  </label>
                  <input
                    type="number"
                    name="discount"
                    value={receiptForm.discount}
                    onChange={handleInputChange}
                    className={`w-full p-3 border rounded-lg text-sm transition-all duration-200 focus:ring-2 focus:ring-[#003366] focus:border-transparent ${themeClasses.input}`}
                    step="1"
                    min="0"
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Discount Type
                  </label>
                  <select
                    name="discountType"
                    value={receiptForm.discountType}
                    onChange={handleInputChange}
                    className={`w-full p-3 border rounded-lg text-sm transition-all duration-200 focus:ring-2 focus:ring-[#003366] focus:border-transparent ${themeClasses.input}`}
                  >
                    <option value="none">None</option>
                    <option value="percentage">Percentage</option>
                    <option value="fixed">Fixed Amount</option>
                  </select>
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Amount Paid (Ksh) *
                  </label>
                  <input
                    type="number"
                    name="amountPaid"
                    value={receiptForm.amountPaid}
                    onChange={handleInputChange}
                    className={`w-full p-3 border rounded-lg text-sm transition-all duration-200 focus:ring-2 focus:ring-[#003366] focus:border-transparent ${themeClasses.input}`}
                    step="1"
                    min="0"
                    required
                  />
                </div>
              </div>
              
              {/* Totals Display */}
              <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <div className="font-medium">Subtotal:</div>
                    <div className="font-bold">Ksh {formatPrice(receiptForm.subtotal)}</div>
                  </div>
                  <div>
                    <div className="font-medium">Tax:</div>
                    <div className="font-bold">Ksh {formatPrice(receiptForm.taxAmount)}</div>
                  </div>
                  <div>
                    <div className="font-medium">Total:</div>
                    <div className="font-bold text-lg">Ksh {formatPrice(receiptForm.total)}</div>
                  </div>
                  <div>
                    <div className="font-medium">Balance:</div>
                    <div className={`font-bold ${receiptForm.balance > 0 ? 'text-red-600' : 'text-green-600'}`}>
                      Ksh {formatPrice(receiptForm.balance)}
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Notes and Terms */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Notes
                  </label>
                  <textarea
                    name="notes"
                    value={receiptForm.notes}
                    onChange={handleInputChange}
                    rows="3"
                    placeholder="Additional notes or payment details..."
                    className={`w-full p-3 border rounded-lg text-sm transition-all duration-200 focus:ring-2 focus:ring-[#003366] focus:border-transparent ${themeClasses.input}`}
                  ></textarea>
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Terms
                  </label>
                  <textarea
                    name="terms"
                    value={receiptForm.terms}
                    onChange={handleInputChange}
                    rows="3"
                    placeholder="Payment terms and conditions..."
                    className={`w-full p-3 border rounded-lg text-sm transition-all duration-200 focus:ring-2 focus:ring-[#003366] focus:border-transparent ${themeClasses.input}`}
                  ></textarea>
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    setEditingReceipt(null);
                    resetForm();
                  }}
                  className={`${themeClasses.button.secondary.base} ${darkMode ? themeClasses.button.secondary.dark : themeClasses.button.secondary.light}`}
                >
                  Cancel
                </button>
                <button
                  onClick={editingReceipt ? updateReceipt : createReceipt}
                  className={`${themeClasses.button.primary.base} ${darkMode ? themeClasses.button.primary.dark : themeClasses.button.primary.light}`}
                >
                  {editingReceipt ? 'Update Receipt' : 'Create Receipt'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Invoice Search Modal */}
      {showInvoiceSearch && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className={`${themeClasses.card} rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto`}>
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                  Generate Receipt from Invoice
                </h3>
                <button
                  onClick={() => setShowInvoiceSearch(false)}
                  className={`p-2 rounded-lg ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} transition-colors`}
                >
                  <X size={20} />
                </button>
              </div>
            </div>
            <div className="p-6">
              <div className="mb-4">
                <div className="relative">
                  <Search size={18} className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                  <input
                    type="text"
                    placeholder="Search invoices by customer name, invoice number, or email..."
                    value={searchInvoiceTerm}
                    onChange={(e) => setSearchInvoiceTerm(e.target.value)}
                    className={`w-full pl-10 pr-4 py-2 border rounded-lg text-sm transition-all duration-200 focus:ring-2 focus:ring-[#003366] focus:border-transparent ${themeClasses.input}`}
                  />
                </div>
              </div>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {invoices.filter(inv => 
                  inv.customerName?.toLowerCase().includes(searchInvoiceTerm.toLowerCase()) ||
                  inv.invoiceNumber?.toLowerCase().includes(searchInvoiceTerm.toLowerCase()) ||
                  inv.customerEmail?.toLowerCase().includes(searchInvoiceTerm.toLowerCase())
                ).length === 0 ? (
                  <div className="text-center py-8">
                    <FileText size={48} className={`mx-auto mb-4 ${darkMode ? 'text-gray-600' : 'text-gray-400'}`} />
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      {searchInvoiceTerm ? 'No invoices match your search' : 'No invoices available'}
                    </p>
                  </div>
                ) : (
                  invoices.filter(inv => 
                    inv.customerName?.toLowerCase().includes(searchInvoiceTerm.toLowerCase()) ||
                    inv.invoiceNumber?.toLowerCase().includes(searchInvoiceTerm.toLowerCase()) ||
                    inv.customerEmail?.toLowerCase().includes(searchInvoiceTerm.toLowerCase())
                  ).map((invoice) => (
                    <div
                      key={invoice._id}
                      className={`p-4 border rounded-lg cursor-pointer transition-all hover:shadow-md ${
                        darkMode ? 'border-gray-600 hover:border-gray-500' : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => generateReceiptFromInvoice(invoice)}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-semibold text-gray-900 dark:text-gray-100">
                            {invoice.invoiceNumber || 'N/A'}
                          </h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {invoice.customerName} • {invoice.customerEmail}
                          </p>
                          <p className="text-sm font-medium mt-1">
                            Ksh {formatPrice(invoice.totalAmount || invoice.planPrice || 0)}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {invoice.planName} • {invoice.planSpeed}
                          </p>
                        </div>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          invoice.status === 'paid' 
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                            : invoice.status === 'pending'
                            ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                            : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                        }`}>
                          {invoice.status || 'pending'}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Receipt Details Modal */}
      {showReceiptModal && selectedReceipt && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className={`${themeClasses.card} rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            {/* Header with Logo and Title */}
            <div className={`relative ${darkMode ? 'bg-gradient-to-r from-gray-900 to-gray-800' : 'bg-gradient-to-r from-[#003366] to-[#004488]'} p-8 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-4">
                  <img src="/oppo.jpg" alt="OPTIMAS Logo" className="h-16 w-16 rounded-lg shadow-lg object-cover" />
                  <div>
                    <h2 className="text-3xl font-bold text-white">{BRAND.name}</h2>
                    <p className="text-gray-200 text-sm mt-1">{BRAND.tagline}</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowReceiptModal(false)}
                  className={`p-2 rounded-lg ${darkMode ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-white hover:bg-opacity-20 text-white'}`}
                >
                  <X size={24} />
                </button>
              </div>
              <div className="flex gap-3 mt-4">
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                  selectedReceipt.status === 'paid' ? 'bg-green-500 text-white'
                    : selectedReceipt.status === 'issued' ? 'bg-blue-500 text-white'
                    : selectedReceipt.status === 'partially_paid' ? 'bg-amber-500 text-white'
                    : 'bg-gray-500 text-white'
                }`}>
                  {selectedReceipt.status?.toUpperCase() || 'ISSUED'}
                </span>
              </div>
            </div>

            {/* Content */}
            <div className="p-8 space-y-8">
              {/* Receipt Number and Dates */}
              <div className="grid grid-cols-3 gap-6">
                <div className={`p-4 rounded-xl ${darkMode ? 'bg-gray-800' : 'bg-gradient-to-br from-blue-50 to-blue-100'} border ${darkMode ? 'border-gray-700' : 'border-blue-200'}`}>
                  <p className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-blue-600'}`}>Receipt Number</p>
                  <p className="text-xl font-bold mt-2">{selectedReceipt.receiptNumber || 'N/A'}</p>
                </div>
                <div className={`p-4 rounded-xl ${darkMode ? 'bg-gray-800' : 'bg-gradient-to-br from-purple-50 to-purple-100'} border ${darkMode ? 'border-gray-700' : 'border-purple-200'}`}>
                  <p className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-purple-600'}`}>Receipt Date</p>
                  <p className="text-lg font-semibold mt-2">{selectedReceipt.receiptDate ? new Date(selectedReceipt.receiptDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : (selectedReceipt.createdAt ? new Date(selectedReceipt.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : 'N/A')}</p>
                </div>
                <div className={`p-4 rounded-xl ${darkMode ? 'bg-gray-800' : 'bg-gradient-to-br from-green-50 to-green-100'} border ${darkMode ? 'border-gray-700' : 'border-green-200'}`}>
                  <p className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-green-600'}`}>Payment Status</p>
                  <p className={`text-lg font-semibold mt-2 ${selectedReceipt.status === 'paid' ? 'text-green-600' : 'text-amber-600'}`}>
                    {selectedReceipt.status === 'paid' ? '✓ Paid' : 'Pending'}
                  </p>
                </div>
              </div>

              {/* Customer and Service Details */}
              <div className="grid grid-cols-2 gap-8">
                <div>
                  <h3 className={`text-sm font-bold uppercase tracking-wide ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Customer Information</h3>
                  <div className="mt-3 space-y-2">
                    <p className="text-lg font-semibold">{selectedReceipt.customerName || 'N/A'}</p>
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{selectedReceipt.customerEmail || 'N/A'}</p>
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{selectedReceipt.customerPhone || 'N/A'}</p>
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{selectedReceipt.customerLocation || selectedReceipt.customerAddress || 'N/A'}</p>
                  </div>
                </div>
                <div>
                  <h3 className={`text-sm font-bold uppercase tracking-wide ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Service & Account</h3>
                  <div className="mt-3 space-y-2">
                    <p className="text-lg font-semibold text-[#003366]">{selectedReceipt.planName || 'Internet Service'}</p>
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Speed: <span className="font-semibold">{selectedReceipt.planSpeed || 'N/A'}</span></p>
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Account: <span className="font-bold text-orange-600">{selectedReceipt.clientAccountNumber || 'N/A'}</span></p>
                  </div>
                </div>
              </div>

              {/* Items Table */}
              <div>
                <h3 className={`text-sm font-bold uppercase tracking-wide mb-4 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Payment Items</h3>
                <div className={`rounded-xl overflow-hidden border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                  <table className="w-full">
                    <thead className={`${darkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
                      <tr>
                        <th className="px-6 py-3 text-left text-sm font-semibold">Description</th>
                        <th className="px-6 py-3 text-center text-sm font-semibold">Qty</th>
                        <th className="px-6 py-3 text-right text-sm font-semibold">Unit Price</th>
                        <th className="px-6 py-3 text-right text-sm font-semibold">Amount</th>
                      </tr>
                    </thead>
                    <tbody className={`divide-y ${darkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
                      {(selectedReceipt.items || [{ description: 'Internet Service', quantity: 1, unitPrice: selectedReceipt.total || 0, amount: selectedReceipt.total || 0 }]).map((item, idx) => (
                        <tr key={idx} className={`${darkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-50'}`}>
                          <td className="px-6 py-4 text-sm">{item.description}</td>
                          <td className="px-6 py-4 text-sm text-center font-medium">{item.quantity || 1}</td>
                          <td className="px-6 py-4 text-sm text-right">Ksh {formatPrice(item.unitPrice || item.amount)}</td>
                          <td className="px-6 py-4 text-sm text-right font-semibold">Ksh {formatPrice(item.amount)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Summary Section */}
              <div className="grid grid-cols-2 gap-8">
                <div></div>
                <div className={`rounded-xl p-6 ${darkMode ? 'bg-gray-800' : 'bg-gradient-to-br from-gray-50 to-gray-100'} border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                  <h3 className={`text-sm font-bold uppercase tracking-wide mb-4 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Summary</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span>Subtotal</span>
                      <span className="font-medium">Ksh {formatPrice(selectedReceipt.subtotal || selectedReceipt.total || 0)}</span>
                    </div>
                    {selectedReceipt.taxAmount && selectedReceipt.taxAmount > 0 && (
                      <div className="flex justify-between text-sm">
                        <span>Tax</span>
                        <span className="font-medium">Ksh {formatPrice(selectedReceipt.taxAmount)}</span>
                      </div>
                    )}
                    <div className={`border-t pt-3 flex justify-between ${darkMode ? 'border-gray-700' : 'border-gray-300'}`}>
                      <span className="font-bold">Total Amount</span>
                      <span className="text-xl font-bold text-[#003366]">Ksh {formatPrice(selectedReceipt.total || 0)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Amount Paid</span>
                      <span className="font-medium text-green-600 dark:text-green-400">Ksh {formatPrice(selectedReceipt.amountPaid || 0)}</span>
                    </div>
                    {selectedReceipt.balance > 0 && (
                      <div className={`border-t pt-3 flex justify-between ${darkMode ? 'border-gray-700' : 'border-gray-300'}`}>
                        <span className="font-bold">Balance Due</span>
                        <span className="text-lg font-bold text-red-600 dark:text-red-400">Ksh {formatPrice(selectedReceipt.balance || 0)}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Notes Section */}
              {selectedReceipt.notes && (
                <div className={`p-4 rounded-xl ${darkMode ? 'bg-gray-800' : 'bg-blue-50'} border ${darkMode ? 'border-gray-700' : 'border-blue-200'}`}>
                  <h3 className={`text-sm font-bold uppercase tracking-wide mb-2 ${darkMode ? 'text-gray-400' : 'text-blue-600'}`}>Notes</h3>
                  <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{selectedReceipt.notes}</p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3 pt-6 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={() => exportReceiptPDF(selectedReceipt)}
                  className="px-6 py-2.5 bg-[#003366] hover:bg-[#002244] text-white rounded-lg font-medium transition-colors flex items-center gap-2"
                >
                  <Download size={18} />
                  Download PDF
                </button>
                <button
                  onClick={() => sendReceiptToClient(selectedReceipt)}
                  disabled={sendingReceipt === selectedReceipt._id}
                  className={`px-6 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2 ${sendingReceipt === selectedReceipt._id ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <Send size={18} />
                  {sendingReceipt === selectedReceipt._id ? 'Sending...' : 'Send Email'}
                </button>
                <button
                  onClick={() => {
                    setShowReceiptModal(false);
                    editReceipt(selectedReceipt);
                  }}
                  className="px-6 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
                >
                  <Edit size={18} />
                  Edit Receipt
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PDF Preview Modal */}
      {showPDFModal && selectedReceipt && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className={`${themeClasses.card} rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto`}>
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                  PDF Preview - {selectedReceipt.receiptNumber}
                </h3>
                <button
                  onClick={() => setShowPDFModal(false)}
                  className={`p-2 rounded-lg ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} transition-colors`}
                >
                  <X size={20} />
                </button>
              </div>
            </div>
            <div className="p-6">
              <div className={`border-2 border-dashed rounded-lg p-8 ${darkMode ? 'border-gray-600 bg-gray-800' : 'border-gray-300 bg-white'}`}>
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">RECEIPT PREVIEW</h2>
                  <p className="text-gray-600 dark:text-gray-400">Receipt #: {selectedReceipt.receiptNumber}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-8 mb-6">
                  <div>
                    <h3 className="font-semibold mb-2">Customer Information:</h3>
                    <p className="text-sm">{selectedReceipt.customerName}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{selectedReceipt.customerEmail}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{selectedReceipt.customerPhone}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{selectedReceipt.customerLocation || selectedReceipt.customerAddress}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm"><strong>Date:</strong> {selectedReceipt.receiptDate ? new Date(selectedReceipt.receiptDate).toLocaleDateString() : 
                                                    selectedReceipt.createdAt ? new Date(selectedReceipt.createdAt).toLocaleDateString() : 'N/A'}</p>
                    <p className="text-sm"><strong>Payment Date:</strong> {selectedReceipt.paymentDate ? new Date(selectedReceipt.paymentDate).toLocaleDateString() : 'N/A'}</p>
                    <p className="text-sm"><strong>Status:</strong> <span className={`font-semibold ${
                      selectedReceipt.status === 'paid' ? 'text-green-600' : 
                      selectedReceipt.status === 'issued' ? 'text-yellow-600' : 
                      'text-gray-600'
                    }`}>{selectedReceipt.status?.toUpperCase()}</span></p>
                    {selectedReceipt.planName && (
                      <p className="text-sm"><strong>Plan:</strong> {selectedReceipt.planName} • {selectedReceipt.planSpeed}</p>
                    )}
                  </div>
                </div>
                
                <table className="w-full mb-6">
                  <thead>
                    <tr className={`border-b ${darkMode ? 'border-gray-600' : 'border-gray-300'}`}>
                      <th className="text-left py-2">Description</th>
                      <th className="text-center py-2">Qty</th>
                      <th className="text-right py-2">Unit Price</th>
                      <th className="text-right py-2">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(selectedReceipt.items || [{ 
                      description: selectedReceipt.planName ? `${selectedReceipt.planName} - ${selectedReceipt.planSpeed}` : 'Internet Service', 
                      quantity: 1, 
                      unitPrice: selectedReceipt.planPrice || selectedReceipt.total || 0, 
                      amount: selectedReceipt.planPrice || selectedReceipt.total || 0 
                    }]).map((item, index) => (
                      <tr key={index} className={`border-b ${darkMode ? 'border-gray-600' : 'border-gray-300'}`}>
                        <td className="py-2 text-sm">{item.description}</td>
                        <td className="text-center py-2 text-sm">{item.quantity || 1}</td>
                        <td className="text-right py-2 text-sm">Ksh {formatPrice(item.unitPrice || item.amount)}</td>
                        <td className="text-right py-2 text-sm">Ksh {formatPrice(item.amount)}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr>
                      <td colSpan="3" className="py-2 font-semibold text-right">Subtotal</td>
                      <td className="text-right py-2">Ksh {formatPrice(selectedReceipt.subtotal || selectedReceipt.total || 0)}</td>
                    </tr>
                    <tr>
                      <td colSpan="3" className="py-2 font-semibold text-right">Tax</td>
                      <td className="text-right py-2">Ksh {formatPrice(selectedReceipt.taxAmount || 0)}</td>
                    </tr>
                    <tr className={`border-t ${darkMode ? 'border-gray-600' : 'border-gray-300'}`}>
                      <td colSpan="3" className="py-2 font-bold">Total</td>
                      <td className="text-right py-2 font-bold">Ksh {formatPrice(selectedReceipt.total || 0)}</td>
                    </tr>
                    <tr className={`border-t ${darkMode ? 'border-gray-600' : 'border-gray-300'}`}>
                      <td colSpan="3" className="py-2 font-bold text-green-600">Amount Paid</td>
                      <td className="text-right py-2 font-bold text-green-600">Ksh {formatPrice(selectedReceipt.amountPaid || 0)}</td>
                    </tr>
                    {selectedReceipt.balance > 0 && (
                      <tr>
                        <td colSpan="3" className="py-2 font-bold text-red-600">Balance Due</td>
                        <td className="text-right py-2 font-bold text-red-600">Ksh {formatPrice(selectedReceipt.balance || 0)}</td>
                      </tr>
                    )}
                  </tfoot>
                </table>
                
                {selectedReceipt.notes && (
                  <div className={`mt-4 p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                    <p className="text-sm font-semibold mb-1">Notes:</p>
                    <p className="text-sm">{selectedReceipt.notes}</p>
                  </div>
                )}
                
                <div className={`mt-8 p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                  <p className="text-sm text-center">
                    Thank you for your business!
                  </p>
                </div>
              </div>
              
              <div className="flex justify-center space-x-4 mt-6">
                <button
                  onClick={() => exportReceiptPDF(selectedReceipt)}
                  className={`${themeClasses.button.primary.base} ${darkMode ? themeClasses.button.primary.dark : themeClasses.button.primary.light} flex items-center`}
                >
                  <Download size={16} className="mr-1.5" />
                  Download PDF
                </button>
                <button
                  onClick={() => sendReceiptToClient(selectedReceipt)}
                  disabled={sendingReceipt === selectedReceipt._id}
                  className={`${themeClasses.button.secondary.base} ${darkMode ? themeClasses.button.secondary.dark : themeClasses.button.secondary.light} flex items-center ${
                    sendingReceipt === selectedReceipt._id ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  <Send size={16} className="mr-1.5" />
                  {sendingReceipt === selectedReceipt._id ? 'Sending...' : 'Send via Email'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReceiptManager;