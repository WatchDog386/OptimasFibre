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

// Redesigned PDF generator to match provided invoice layout
const generateInvoicePDF = async (invoice, showNotification, includeShareOptions = false, companyInfo = null) => {
  const COMPANY_INFO = companyInfo || DEFAULT_COMPANY_INFO;
  const invoiceId = invoice._id || `local-inv-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  const subtotal = invoice.subtotal || 0;
  const taxAmount = invoice.taxAmount || 0;
  const totalAmount = invoice.totalAmount || 0;
  const amountPaid = invoice.amountPaid || 0;
  const balanceDue = Math.max(0, totalAmount - amountPaid);
  const discountAmount = invoice.discount || 0;

  // Main container with flex for sidebar
  printContainer.innerHTML = `
    <div style="display:flex; flex-direction:row; width:1000px; min-height:700px; background:#fff; font-family:'Segoe UI',Arial,sans-serif;">
      <!-- Sidebar -->
      <div style="width:220px; background:linear-gradient(160deg, #00356B 80%, #00509e 100%); color:#fff; display:flex; flex-direction:column; align-items:center; justify-content:space-between; border-top-right-radius:32px; border-bottom-right-radius:32px; position:relative;">
        <div style="width:100%; padding:38px 0 0 0; text-align:center;">
          <div style="font-size:32px; font-weight:900; letter-spacing:2px; margin-bottom:12px;">INVOICE</div>
          <div style="font-size:13px; font-weight:600; margin-bottom:8px;">NO: <span style='font-weight:400;'>${invoice.invoiceNumber || invoiceId}</span></div>
        </div>
        <div style="margin:0 auto 0 auto;">
          <img src="${COMPANY_INFO.logoUrl || '/oppo.jpg'}" alt="Logo" style="width:110px; height:auto; margin:30px 0 0 0;" />
        </div>
        <div style="width:100%; text-align:center; padding-bottom:38px;">
          <div style="font-size:22px; font-weight:700; margin-top:30px;">Thank You!</div>
        </div>
        <div style="position:absolute; top:0; right:0; width:100%; height:100%; border-top-right-radius:32px; border-bottom-right-radius:32px; background:radial-gradient(circle at 80% 10%,rgba(255,255,255,0.08) 0,rgba(0,0,0,0) 80%); pointer-events:none;"></div>
      </div>
      <!-- Main Content -->
      <div style="flex:1; padding:38px 38px 28px 38px; display:flex; flex-direction:column; justify-content:space-between;">
        <div style="display:flex; flex-direction:row; justify-content:space-between; align-items:flex-start;">
          <!-- Bill To -->
          <div style="min-width:260px;">
            <div style="font-size:17px; font-weight:700; color:#00356B; margin-bottom:6px;">Bill To:</div>
            <div style="font-size:15px; font-weight:600; color:#222;">${invoice.customerName || 'Customer'}</div>
            <div style="font-size:13px; color:#444;">${invoice.customerEmail || ''}</div>
            <div style="font-size:13px; color:#444;">${invoice.customerPhone || ''}</div>
            <div style="font-size:13px; color:#444;">${invoice.customerLocation || ''}</div>
            <div style="font-size:13px; color:#444;">Account: <b>${invoice.clientAccountNumber || invoice.invoiceNumber || 'N/A'}</b></div>
            <div style="font-size:13px; color:#444; margin-top:10px;">Date: ${invoice.invoiceDate ? new Date(invoice.invoiceDate).toLocaleDateString() : ''}</div>
          </div>
          <!-- From -->
          <div style="min-width:220px; text-align:right;">
            <div style="font-size:17px; font-weight:700; color:#00356B; margin-bottom:6px;">From:</div>
            <div style="font-size:15px; font-weight:600; color:#222;">${COMPANY_INFO.name}</div>
            <div style="font-size:13px; color:#444;">${COMPANY_INFO.supportPhone}</div>
            <div style="font-size:13px; color:#444;">${COMPANY_INFO.address}</div>
          </div>
        </div>
        <!-- Table -->
        <div style="margin:32px 0 0 0;">
          <table style="width:100%; border-collapse:collapse; font-size:13px;">
            <thead>
              <tr style="background:#00356B; color:#fff;">
                <th style="padding:10px 8px; text-align:left; font-weight:700;">Description</th>
                <th style="padding:10px 8px; text-align:center; font-weight:700;">Qty</th>
                <th style="padding:10px 8px; text-align:right; font-weight:700;">Price</th>
                <th style="padding:10px 8px; text-align:right; font-weight:700;">Total</th>
              </tr>
            </thead>
            <tbody>
              ${(invoice.items && invoice.items.length > 0) ? invoice.items.map(item => `
                <tr style="border-bottom:1px solid #e0e0e0;">
                  <td style="padding:10px 8px; text-align:left;">${item.description || 'Service'}</td>
                  <td style="padding:10px 8px; text-align:center;">${item.quantity || 1}</td>
                  <td style="padding:10px 8px; text-align:right;">Ksh ${formatPrice(item.unitPrice || item.amount)}</td>
                  <td style="padding:10px 8px; text-align:right; font-weight:700;">Ksh ${formatPrice(item.amount)}</td>
                </tr>
              `).join('') : `
                <tr><td colspan="4" style="padding:15px; text-align:center; color:#999;">No line items</td></tr>
              `}
            </tbody>
          </table>
        </div>
        <!-- Totals and Payment Info -->
        <div style="display:flex; flex-direction:row; justify-content:space-between; align-items:flex-end; margin-top:32px;">
          <!-- Payment Info -->
          <div style="font-size:14px; color:#00356B; min-width:220px;">
            <div style="font-weight:700; margin-bottom:6px;">Payment Information:</div>
            <div>MPESA Paybill: <b>${COMPANY_INFO.paybill}</b></div>
            <div>Acc: <b>${invoice.clientAccountNumber || invoice.invoiceNumber || 'N/A'}</b></div>
            <div>Details: <b>${COMPANY_INFO.supportEmail}</b></div>
          </div>
          <!-- Totals -->
          <div style="min-width:220px;">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
              <span style="font-size:15px; font-weight:700; color:#00356B;">Sub Total</span>
              <span style="font-size:15px; font-weight:700; color:#00356B;">Ksh ${formatPrice(subtotal)}</span>
            </div>
            ${invoice.taxRate > 0 ? `<div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;"><span>VAT (${invoice.taxRate}%)</span><span>Ksh ${formatPrice(taxAmount)}</span></div>` : ''}
            ${discountAmount > 0 ? `<div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;"><span>Discount</span><span style='color:#28a745;'>- Ksh ${formatPrice(discountAmount)}</span></div>` : ''}
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px; border-top:2px solid #00356B; padding-top:8px;">
              <span style="font-size:16px; font-weight:900; color:#00356B;">TOTAL</span>
              <span style="font-size:16px; font-weight:900; color:#00356B;">Ksh ${formatPrice(totalAmount)}</span>
            </div>
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
              <span>Paid</span>
              <span style="font-weight:700; color:#28a745;">Ksh ${formatPrice(amountPaid)}</span>
            </div>
            ${balanceDue > 0 ? `<div style="display:flex; justify-content:space-between; align-items:center; color:#dc3545;"><span>Balance Due</span><span style='font-weight:700;'>Ksh ${formatPrice(balanceDue)}</span></div>` : ''}
          </div>
        </div>
        <!-- Note Section -->
        <div style="margin-top:24px; font-size:13px; color:#00356B;">
          <b>Note:</b> ${invoice.planName || ''} ${invoice.planSpeed ? `- ${invoice.planSpeed}` : ''}<br/>
          <b>Due Date:</b> ${invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString() : ''}
        </div>
      </div>
    </div>
  `;

  document.body.appendChild(printContainer);
  try {
    const opt = {
      margin: [0, 0, 0, 0],
      filename: `Invoice_${invoice.invoiceNumber || invoiceId}_${COMPANY_INFO.name}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true, allowTaint: true, windowWidth: 1000, width: 1000, backgroundColor: '#ffffff', logging: false },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'landscape' }
    };
    await html2canvas(printContainer, { scale: 2, useCORS: true });
    await jsPDF().html(printContainer, { callback: function (doc) { doc.save(opt.filename); } });
    showNotification('✅ Invoice PDF downloaded successfully!', 'success');
    return { success: true };
  } catch (err) {
    console.error('PDF generation error:', err);
    showNotification('❌ Failed to generate PDF. Please try again.', 'error');
    return { success: false };
  } finally {
    document.body.removeChild(printContainer);
  }
};
          <div style="font-size:12px; color:#222; margin-bottom:2px;"><b>Plan:</b> ${invoice.planName || 'Service'} ${invoice.planSpeed ? '(' + invoice.planSpeed + ')' : ''}</div>
          <div style="font-size:12px; color:#222; margin-bottom:2px;"><b>Invoice Date:</b> ${new Date(invoice.invoiceDate).toLocaleDateString()}</div>
          <div style="font-size:12px; color:#222;"><b>Due Date:</b> ${new Date(invoice.dueDate).toLocaleDateString()}</div>
        </div>
          <h4 style="margin:0 0 8px 0; font-size:14px; font-weight:600; color:#1a1a1a;">Quick Pay via M-Pesa</h4>
          <p style="margin:0 0 5px 0; font-size:12px; color:#555;">

      <!-- Items Table - Clean Minimal -->
      <table style="width:100%; margin-bottom:28px; border-collapse:collapse; font-size:12px;">
        <thead>
          <tr style="background:#f5f7fa; border-top:2px solid #e0e0e0; border-bottom:2px solid #e0e0e0;">
            <th style="padding:12px 8px; text-align:left; font-weight:800; color:${COMPANY_INFO.colors.primary}; letter-spacing:0.5px;">Description</th>
            <th style="padding:12px 8px; text-align:center; font-weight:800; color:${COMPANY_INFO.colors.primary}; letter-spacing:0.5px;">Qty</th>
            <th style="padding:12px 8px; text-align:right; font-weight:800; color:${COMPANY_INFO.colors.primary}; letter-spacing:0.5px;">Price</th>
            <th style="padding:12px 8px; text-align:right; font-weight:800; color:${COMPANY_INFO.colors.primary}; letter-spacing:0.5px;">Total</th>
          </tr>
        </thead>
        <tbody>
          ${(invoice.items && invoice.items.length > 0) ? invoice.items.map(item => `
          <tr style="border-bottom:1px solid #f0f0f0;">
            <td style="padding:12px 8px; text-align:left;">${item.description || 'Service'}</td>
            <td style="padding:12px 8px; text-align:center;">${item.quantity || 1}</td>
            <td style="padding:12px 8px; text-align:right;">Ksh ${formatPrice(item.unitPrice || item.amount)}</td>
            <td style="padding:12px 8px; text-align:right; font-weight:700;">Ksh ${formatPrice(item.amount)}</td>
          </tr>
          `).join('') : `
          <tr style="border-bottom:1px solid #eee;">
            <td colspan="4" style="padding:15px; text-align:center; color:#999;">No line items</td>
          </tr>
          `}
        </tbody>
      </table>
    ? `<span style="background:${COMPANY_INFO.colors.info}; color:white; padding:4px 12px; border-radius:20px; font-size:12px; font-weight:600;">PARTIALLY PAID</span>`

      <!-- Totals - Right Aligned -->
      <div style="display:flex; justify-content:flex-end; margin-bottom:24px; max-width:420px; margin-left:auto;">
        <div style="width:100%;">
          <div style="display:flex; justify-content:space-between; padding:7px 0; border-bottom:1px solid #eee; font-size:12px;">
            <span>Subtotal</span>
            <span>Ksh ${formatPrice(subtotal)}</span>
          </div>
          ${invoice.taxRate > 0 ? `
          <div style="display:flex; justify-content:space-between; padding:7px 0; border-bottom:1px solid #eee; font-size:12px;">
            <span>VAT (${invoice.taxRate}%)</span>
            <span>Ksh ${formatPrice(taxAmount)}</span>
          </div>
          ` : ''}
          ${discountAmount > 0 ? `
          <div style="display:flex; justify-content:space-between; padding:7px 0; border-bottom:1px solid #eee; font-size:12px;">
            <span>Discount</span>
            <span style="color:#28a745;">- Ksh ${formatPrice(discountAmount)}</span>
          </div>
          ` : ''}
          <div style="display:flex; justify-content:space-between; padding:12px 0; margin-top:8px; border-top:2px solid ${COMPANY_INFO.colors.primary}; font-weight:800; font-size:15px; color:${COMPANY_INFO.colors.primary}; letter-spacing:0.5px;">
            <span>TOTAL</span>
            <span>Ksh ${formatPrice(totalAmount)}</span>
          </div>
          <div style="display:flex; justify-content:space-between; padding:7px 0; margin-top:8px; font-size:12px; color:${amountPaid > 0 ? '#28a745' : '#999'};">
            <span>Paid</span>
            <span style="font-weight:700;">Ksh ${formatPrice(amountPaid)}</span>
          </div>
          ${balanceDue > 0 ? `
          <div style="display:flex; justify-content:space-between; padding:7px 0; font-size:12px; color:#dc3545;">
            <span>Balance Due</span>
            <span style="font-weight:700;">Ksh ${formatPrice(balanceDue)}</span>
          </div>
          ` : ''}
        </div>
      </div>


      <!-- Payment Section -->
      <div style="padding:16px 18px; background:#f6faff; border-left:5px solid ${COMPANY_INFO.colors.primary}; margin-bottom:22px; font-size:12px; border-radius:7px;">
        <div style="font-weight:800; color:${COMPANY_INFO.colors.primary}; margin-bottom:7px; letter-spacing:0.5px;">Payment Information</div>
        <div style="margin-bottom:2px;"><b>M-Pesa Paybill:</b> ${COMPANY_INFO.paybill}</div>
        <div style="margin-bottom:2px;"><b>Account Number:</b> ${invoice.clientAccountNumber || invoice.invoiceNumber || 'Account Name'}</div>
        <div style="margin-bottom:2px;"><b>Bank:</b> ${COMPANY_INFO.bankName} - ${COMPANY_INFO.accountNumber}</div>
        <div style="margin-bottom:2px;"><b>Branch:</b> ${COMPANY_INFO.branch || 'N/A'}</div>
        <div style="margin-bottom:2px;"><b>SWIFT:</b> ${COMPANY_INFO.bankSwiftCode || 'N/A'}</div>
        <div style="font-size:10px; color:#666; margin-top:6px;"><em>Include account/invoice number as payment reference</em></div>
      </div>
          <p style="margin:0 0 8px 0; font-size:11px; font-weight:700; color:#999; text-transform:uppercase; letter-spacing:0.5px;">INVOICE #</p>
      <!-- Footer Info -->
      <div style="padding-top:18px; border-top:1.5px solid #e0e0e0; font-size:10.5px; color:#666; text-align:center;">
        <div style="font-weight:800; color:${COMPANY_INFO.colors.primary}; margin-bottom:6px;">Thank you for your business!</div>
        <div style="margin-bottom:7px;">
          <span style="margin:0 10px;">📧 ${COMPANY_INFO.supportEmail}</span>
          <span style="margin:0 10px;">📱 ${COMPANY_INFO.supportPhone}</span>
          <span style="margin:0 10px;">🌐 ${COMPANY_INFO.website}</span>
        </div>
        <div style="color:#999;">Generated: ${new Date().toLocaleString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</div>
      </div>
            <th style="padding:10px; text-align:right; font-weight:700; color:#333;">PRICE</th>
            <th style="padding:10px; text-align:right; font-weight:700; color:#333;">TOTAL</th>
          </tr>
        </thead>
        <tbody>
          ${(invoice.items && invoice.items.length > 0) ? invoice.items.map(item => `
          <tr style="border-bottom:1px solid #eee;">
            <td style="padding:10px; text-align:left;">${item.description || 'Service'}</td>
            <td style="padding:10px; text-align:center;">${item.quantity || 1}</td>
            <td style="padding:10px; text-align:right;">Ksh ${formatPrice(item.unitPrice || item.amount)}</td>
            <td style="padding:10px; text-align:right; font-weight:600;">Ksh ${formatPrice(item.amount)}</td>
          </tr>
          `).join('') : `
          <tr style="border-bottom:1px solid #eee;">
            <td colspan="4" style="padding:15px; text-align:center; color:#999;">No line items</td>
          </tr>
          `}
        </tbody>
      </table>

      <!-- Totals - Right Aligned -->
      <div style="display:flex; justify-content:flex-end; margin-bottom:25px; max-width:400px; margin-left:auto;">
        <div style="width:100%;">
          <div style="display:flex; justify-content:space-between; padding:8px 0; border-bottom:1px solid #eee; font-size:12px;">
            <span>Subtotal:</span>
            <span>Ksh ${formatPrice(subtotal)}</span>
          </div>
          ${invoice.taxRate > 0 ? `
          <div style="display:flex; justify-content:space-between; padding:8px 0; border-bottom:1px solid #eee; font-size:12px;">
            <span>VAT (${invoice.taxRate}%):</span>
            <span>Ksh ${formatPrice(taxAmount)}</span>
          </div>
          ` : ''}
          ${discountAmount > 0 ? `
          <div style="display:flex; justify-content:space-between; padding:8px 0; border-bottom:1px solid #eee; font-size:12px;">
            <span>Discount:</span>
            <span style="color:#28a745;">- Ksh ${formatPrice(discountAmount)}</span>
          </div>
          ` : ''}
          <div style="display:flex; justify-content:space-between; padding:12px 0; margin-top:8px; border-top:2px solid ${COMPANY_INFO.colors.primary}; font-weight:700; font-size:14px; color:${COMPANY_INFO.colors.primary};">
            <span>TOTAL:</span>
            <span>Ksh ${formatPrice(totalAmount)}</span>
          </div>
          <div style="display:flex; justify-content:space-between; padding:8px 0; margin-top:8px; font-size:12px; color:${amountPaid > 0 ? '#28a745' : '#999'};">
            <span>Paid:</span>
            <span style="font-weight:700;">Ksh ${formatPrice(amountPaid)}</span>
          </div>
          ${balanceDue > 0 ? `
          <div style="display:flex; justify-content:space-between; padding:8px 0; font-size:12px; color:#dc3545;">
            <span>Balance Due:</span>
            <span style="font-weight:700;">Ksh ${formatPrice(balanceDue)}</span>
          </div>
          ` : ''}
        </div>
      </div>

      <!-- Payment Section -->
      <div style="padding:15px; background:#f0f7ff; border-left:4px solid ${COMPANY_INFO.colors.primary}; margin-bottom:20px; font-size:11px;">
        <p style="margin:0 0 8px 0; font-weight:700; color:${COMPANY_INFO.colors.primary};">PAYMENT DETAILS</p>
        <p style="margin:0 0 4px 0;"><span style="font-weight:600;">M-Pesa Paybill:</span> ${COMPANY_INFO.paybill}</p>
        <p style="margin:0 0 4px 0;"><span style="font-weight:600;">Account Number:</span> ${invoice.clientAccountNumber || invoice.invoiceNumber || 'Account Name'}</p>
        <p style="margin:0 0 4px 0;"><span style="font-weight:600;">Bank:</span> ${COMPANY_INFO.bankName} - ${COMPANY_INFO.accountNumber}</p>
        <p style="margin:0; font-size:10px; color:#666; margin-top:6px;"><em>Include account/invoice number as payment reference</em></p>
      </div>

      <!-- Footer Info -->
      <div style="padding-top:15px; border-top:1px solid #e0e0e0; font-size:10px; color:#666; text-align:center;">
        <p style="margin:0 0 8px 0; font-weight:700; color:${COMPANY_INFO.colors.primary};">Thank you for your business!</p>
        <div style="margin-bottom:8px;">
          <span style="margin:0 10px;">📧 ${COMPANY_INFO.supportEmail}</span>
          <span style="margin:0 10px;">📱 ${COMPANY_INFO.supportPhone}</span>
          <span style="margin:0 10px;">🌐 ${COMPANY_INFO.website}</span>
        </div>
        <p style="margin:0; color:#999;">Generated: ${new Date().toLocaleString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
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

// ✅ UPDATED: Download PDF then redirect to webmail
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

  // 1) Generate and download PDF
  const pdfResult = await generateInvoicePDF(invoice, showNotification, true, COMPANY_INFO);

  if (!pdfResult.success) {
    showNotification('❌ Failed to prepare invoice PDF. Please try again.', 'error');
    return;
  }

  // 2) Prepare email draft text for quick paste in webmail
  const subject = `Invoice #${invoice.invoiceNumber || invoice._id?.substring(0,8)} from ${COMPANY_INFO.name}`;
  const bodyLines = [
    `To: ${invoice.customerEmail?.trim() || ''}`,
    `CC: ${COMPANY_INFO.supportEmail}`,
    `Subject: ${subject}`,
    ``,
    `Dear ${invoice.customerName || 'Valued Customer'},`,
    `Please find attached your invoice ${invoice.invoiceNumber || invoice._id?.substring(0,8)}.`,
    `Total Amount: Ksh ${formatPrice(invoice.totalAmount)}`,
    `Due Date: ${invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString() : 'N/A'}`,
    ``,
    `Regards,`,
    `${COMPANY_INFO.name}`
  ];

  try {
    await navigator.clipboard.writeText(bodyLines.join('\n'));
    showNotification('📋 Email draft copied. Paste it in webmail compose.', 'success');
  } catch {
    showNotification('ℹ️ PDF downloaded. Compose email manually in webmail.', 'info');
  }

  // 3) Redirect admin to webmail login/compose page
  showNotification(`✅ PDF downloaded as "${pdfResult.filename}". Redirecting to webmail...`, 'info');
  setTimeout(() => {
    window.location.href = WEBMAIL_URL;
  }, 900);
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
  
  // ✅ NEW: Editable Company Settings State
  const [companySettings, setCompanySettings] = useState(DEFAULT_COMPANY_INFO);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [settingsForm, setSettingsForm] = useState({
    name: DEFAULT_COMPANY_INFO.name,
    tagline: DEFAULT_COMPANY_INFO.tagline,
    logoUrl: DEFAULT_COMPANY_INFO.logoUrl,
    address: DEFAULT_COMPANY_INFO.address,
    phone: DEFAULT_COMPANY_INFO.supportPhone,
    email: DEFAULT_COMPANY_INFO.supportEmail,
    website: DEFAULT_COMPANY_INFO.website,
    vatNumber: DEFAULT_COMPANY_INFO.vatNumber,
    paybill: DEFAULT_COMPANY_INFO.paybill,
    paybillName: DEFAULT_COMPANY_INFO.paybillName || DEFAULT_COMPANY_INFO.name,
    bankName: DEFAULT_COMPANY_INFO.bankName,
    bankAccountName: DEFAULT_COMPANY_INFO.accountName,
    bankAccountNumber: DEFAULT_COMPANY_INFO.accountNumber,
    bankBranch: DEFAULT_COMPANY_INFO.branch,
    bankSwiftCode: DEFAULT_COMPANY_INFO.bankSwiftCode || 'EQBLKENA'
  });
  const [savingSettings, setSavingSettings] = useState(false);
  
  // ✅ Dynamic COMPANY_INFO that uses state
  const COMPANY_INFO = {
    ...DEFAULT_COMPANY_INFO,
    name: companySettings.name || DEFAULT_COMPANY_INFO.name,
    tagline: companySettings.tagline || DEFAULT_COMPANY_INFO.tagline,
    logoUrl: companySettings.logoUrl || DEFAULT_COMPANY_INFO.logoUrl,
    bankName: companySettings.bankName || DEFAULT_COMPANY_INFO.bankName,
    accountName: companySettings.accountName || companySettings.bankAccountName || DEFAULT_COMPANY_INFO.accountName,
    accountNumber: companySettings.accountNumber || companySettings.bankAccountNumber || DEFAULT_COMPANY_INFO.accountNumber,
    branch: companySettings.branch || companySettings.bankBranch || DEFAULT_COMPANY_INFO.branch,
    supportEmail: companySettings.supportEmail || companySettings.email || DEFAULT_COMPANY_INFO.supportEmail,
    supportPhone: companySettings.supportPhone || companySettings.phone || DEFAULT_COMPANY_INFO.supportPhone,
    paybill: companySettings.paybill || DEFAULT_COMPANY_INFO.paybill,
    paybillName: companySettings.paybillName || DEFAULT_COMPANY_INFO.paybillName,
    address: companySettings.address || DEFAULT_COMPANY_INFO.address,
    website: companySettings.website || DEFAULT_COMPANY_INFO.website,
    vatNumber: companySettings.vatNumber || DEFAULT_COMPANY_INFO.vatNumber,
    bankSwiftCode: companySettings.bankSwiftCode || DEFAULT_COMPANY_INFO.bankSwiftCode
  };

  // ✅ Fetch company settings from API
  const fetchCompanySettings = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      
      const response = await fetch(`${API_BASE_URL}/api/settings`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.settings?.companyInfo) {
          const info = data.settings.companyInfo;
          setCompanySettings({
            name: info.name || DEFAULT_COMPANY_INFO.name,
            tagline: info.tagline || DEFAULT_COMPANY_INFO.tagline,
            logoUrl: data.settings.logoUrl || info.logoUrl || DEFAULT_COMPANY_INFO.logoUrl,
            address: info.address || DEFAULT_COMPANY_INFO.address,
            phone: info.phone || DEFAULT_COMPANY_INFO.supportPhone,
            email: info.email || DEFAULT_COMPANY_INFO.supportEmail,
            website: info.website || DEFAULT_COMPANY_INFO.website,
            vatNumber: info.vatNumber || DEFAULT_COMPANY_INFO.vatNumber,
            paybill: info.paybill || DEFAULT_COMPANY_INFO.paybill,
            paybillName: info.paybillName || DEFAULT_COMPANY_INFO.paybillName,
            bankName: info.bankName || DEFAULT_COMPANY_INFO.bankName,
            bankAccountName: info.bankAccountName || DEFAULT_COMPANY_INFO.accountName,
            bankAccountNumber: info.bankAccountNumber || DEFAULT_COMPANY_INFO.accountNumber,
            bankBranch: info.bankBranch || DEFAULT_COMPANY_INFO.branch,
            bankSwiftCode: info.bankSwiftCode || DEFAULT_COMPANY_INFO.bankSwiftCode,
            supportEmail: info.email || DEFAULT_COMPANY_INFO.supportEmail,
            supportPhone: info.phone || DEFAULT_COMPANY_INFO.supportPhone,
            accountName: info.bankAccountName || DEFAULT_COMPANY_INFO.accountName,
            accountNumber: info.bankAccountNumber || DEFAULT_COMPANY_INFO.accountNumber,
            branch: info.bankBranch || DEFAULT_COMPANY_INFO.branch
          });
          setSettingsForm({
            name: info.name || DEFAULT_COMPANY_INFO.name,
            tagline: info.tagline || DEFAULT_COMPANY_INFO.tagline,
            logoUrl: data.settings.logoUrl || info.logoUrl || DEFAULT_COMPANY_INFO.logoUrl,
            address: info.address || DEFAULT_COMPANY_INFO.address,
            phone: info.phone || DEFAULT_COMPANY_INFO.supportPhone,
            email: info.email || DEFAULT_COMPANY_INFO.supportEmail,
            website: info.website || DEFAULT_COMPANY_INFO.website,
            vatNumber: info.vatNumber || DEFAULT_COMPANY_INFO.vatNumber,
            paybill: info.paybill || DEFAULT_COMPANY_INFO.paybill,
            paybillName: info.paybillName || DEFAULT_COMPANY_INFO.paybillName,
            bankName: info.bankName || DEFAULT_COMPANY_INFO.bankName,
            bankAccountName: info.bankAccountName || DEFAULT_COMPANY_INFO.accountName,
            bankAccountNumber: info.bankAccountNumber || DEFAULT_COMPANY_INFO.accountNumber,
            bankBranch: info.bankBranch || DEFAULT_COMPANY_INFO.branch,
            bankSwiftCode: info.bankSwiftCode || DEFAULT_COMPANY_INFO.bankSwiftCode
          });
        }
      }
    } catch (error) {
      console.log('Could not fetch company settings:', error);
    }
  };
  
  // ✅ Save company settings to API
  const saveCompanySettings = async () => {
    try {
      setSavingSettings(true);
      const token = localStorage.getItem('token');
      if (!token) {
        showNotification('⚠️ Please log in to save settings', 'warning');
        return;
      }
      
      const response = await fetch(`${API_BASE_URL}/api/settings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          logoUrl: settingsForm.logoUrl,
          companyInfo: {
            name: settingsForm.name,
            tagline: settingsForm.tagline,
            address: settingsForm.address,
            phone: settingsForm.phone,
            email: settingsForm.email,
            website: settingsForm.website,
            vatNumber: settingsForm.vatNumber,
            paybill: settingsForm.paybill,
            paybillName: settingsForm.paybillName,
            bankName: settingsForm.bankName,
            bankAccountName: settingsForm.bankAccountName,
            bankAccountNumber: settingsForm.bankAccountNumber,
            bankBranch: settingsForm.bankBranch,
            bankSwiftCode: settingsForm.bankSwiftCode
          }
        })
      });
      
      const data = await response.json();
      if (data.success) {
        setCompanySettings({
          ...settingsForm,
          supportEmail: settingsForm.email,
          supportPhone: settingsForm.phone,
          accountName: settingsForm.bankAccountName,
          accountNumber: settingsForm.bankAccountNumber,
          branch: settingsForm.bankBranch,
          logoUrl: settingsForm.logoUrl
        });
        showNotification('✅ Company settings saved successfully!', 'success');
        setShowSettingsModal(false);
      } else {
        showNotification(`❌ ${data.message || 'Failed to save settings'}`, 'error');
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      showNotification('❌ Failed to save settings. Please try again.', 'error');
    } finally {
      setSavingSettings(false);
    }
  };
  
  // Load company settings on mount
  useEffect(() => {
    fetchCompanySettings();
  }, []);

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
    
    setInvoiceForm(prev => {
      const updated = { ...prev, [name]: value };
      
      // Auto-calculate if tax rate, discount, or amount paid changes
      if (name === 'taxRate' || name === 'discount' || name === 'discountType' || name === 'amountPaid') {
        const { subtotal, taxAmount, totalAmount } = calculateTotals(
          prev.items,
          name === 'taxRate' ? parseFloat(value) || 0 : prev.taxRate,
          name === 'discount' ? parseFloat(value) || 0 : prev.discount,
          name === 'discountType' ? value : prev.discountType
        );
        
        const amountPaid = name === 'amountPaid' ? parseFloat(value) || 0 : prev.amountPaid;
        const newBalanceDue = Math.max(0, totalAmount - amountPaid);
        
        // Auto-update status based on payment
        let newStatus = prev.status;
        if (amountPaid > 0) {
          if (amountPaid >= totalAmount) newStatus = 'paid';
          else if (amountPaid < totalAmount) newStatus = 'partially_paid';
        } else if (prev.status !== 'draft') newStatus = 'pending';
        
        return {
          ...updated,
          subtotal,
          taxAmount,
          totalAmount,
          balanceDue: newBalanceDue,
          status: newStatus
        };
      }
      
      return updated;
    });
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
    
    // Auto-calculate totals when items change
    const { subtotal, taxAmount, totalAmount, discountAmount } = calculateTotals(
      updatedItems,
      invoiceForm.taxRate,
      invoiceForm.discount,
      invoiceForm.discountType
    );
    
    setInvoiceForm(prev => ({
      ...prev,
      items: updatedItems,
      subtotal,
      taxAmount,
      totalAmount,
      balanceDue: Math.max(0, totalAmount - (parseFloat(prev.amountPaid) || 0))
    }));
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
      await generateInvoicePDF(invoice, showNotification, true, COMPANY_INFO);
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
      showNotification('🔄 Preparing invoice PDF...', 'info');
      await openEmailClient(invoice, showNotification);
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
          <button 
            onClick={() => {
              setSettingsForm({
                name: companySettings.name || DEFAULT_COMPANY_INFO.name,
                tagline: companySettings.tagline || DEFAULT_COMPANY_INFO.tagline,
                logoUrl: companySettings.logoUrl || DEFAULT_COMPANY_INFO.logoUrl,
                address: companySettings.address || DEFAULT_COMPANY_INFO.address,
                phone: companySettings.phone || companySettings.supportPhone || DEFAULT_COMPANY_INFO.supportPhone,
                email: companySettings.email || companySettings.supportEmail || DEFAULT_COMPANY_INFO.supportEmail,
                website: companySettings.website || DEFAULT_COMPANY_INFO.website,
                vatNumber: companySettings.vatNumber || DEFAULT_COMPANY_INFO.vatNumber,
                paybill: companySettings.paybill || DEFAULT_COMPANY_INFO.paybill,
                paybillName: companySettings.paybillName || DEFAULT_COMPANY_INFO.paybillName,
                bankName: companySettings.bankName || DEFAULT_COMPANY_INFO.bankName,
                bankAccountName: companySettings.bankAccountName || companySettings.accountName || DEFAULT_COMPANY_INFO.accountName,
                bankAccountNumber: companySettings.bankAccountNumber || companySettings.accountNumber || DEFAULT_COMPANY_INFO.accountNumber,
                bankBranch: companySettings.bankBranch || companySettings.branch || DEFAULT_COMPANY_INFO.branch,
                bankSwiftCode: companySettings.bankSwiftCode || DEFAULT_COMPANY_INFO.bankSwiftCode
              });
              setShowSettingsModal(true);
            }}
            className={`${themeClasses.button.small.base} bg-gradient-to-r from-purple-600 to-purple-800 text-white hover:from-purple-700 hover:to-purple-900 flex items-center`}
            title="Edit Company & Billing Settings"
          >
            <Edit size={16} className="mr-1.5" />
            Company Settings
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
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-900 dark:text-white">Invoice #</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-900 dark:text-white hidden md:table-cell">Customer</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-900 dark:text-white hidden lg:table-cell">Plan/Details</th>
                <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-900 dark:text-white">Total</th>
                <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-900 dark:text-white hidden sm:table-cell">Balance</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-900 dark:text-white">Status</th>
                <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-900 dark:text-white">Actions</th>
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
                  <span className="text-sm font-medium">Open Webmail</span>
                  <span className="text-xs text-gray-500">Download & send manually</span>
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
                  <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>Invoice Number *</label>
                  <input type="text" name="invoiceNumber" value={invoiceForm.invoiceNumber} onChange={handleInputChange} className={`w-full p-2 border rounded ${themeClasses.input}`} required />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>Invoice Date *</label>
                  <input type="date" name="invoiceDate" value={invoiceForm.invoiceDate} onChange={handleInputChange} className={`w-full p-2 border rounded ${themeClasses.input}`} required />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>Customer Name *</label>
                  <input type="text" name="customerName" value={invoiceForm.customerName} onChange={handleInputChange} className={`w-full p-2 border rounded ${themeClasses.input}`} required />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>Customer Email *</label>
                  <input type="email" name="customerEmail" value={invoiceForm.customerEmail} onChange={handleInputChange} className={`w-full p-2 border rounded ${themeClasses.input}`} required />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>Customer Phone</label>
                  <input type="text" name="customerPhone" value={invoiceForm.customerPhone} onChange={handleInputChange} className={`w-full p-2 border rounded ${themeClasses.input}`} />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>Customer Location</label>
                  <input type="text" name="customerLocation" value={invoiceForm.customerLocation} onChange={handleInputChange} className={`w-full p-2 border rounded ${themeClasses.input}`} />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>Client Account Number (FBI-XXXXXXXX) *</label>
                  <input 
                    type="text" 
                    name="clientAccountNumber" 
                    value={invoiceForm.clientAccountNumber} 
                    onChange={handleInputChange} 
                    placeholder="FBI-00001" 
                    className={`w-full p-2 border rounded ${themeClasses.input}`}
                    required 
                  />
                  <p className={`text-xs mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Each client has a unique account number starting with FBI-</p>
                </div>
                <div className="md:col-span-2">
                  <div className="flex justify-between items-center mb-2">
                    <label className={`block text-sm font-medium ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>Select Plan *</label>
                  </div>
                  <div className="flex flex-col gap-3">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                      <div>
                        <label className={`block text-xs font-medium mb-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Plan Name</label>
                        <select 
                          name="planName" 
                          value={invoiceForm.planName} 
                          onChange={(e) => {
                            const selectedPlan = WIFI_PLANS.find(p => p.name === e.target.value);
                            if (selectedPlan) {
                              setInvoiceForm(prev => ({
                                ...prev,
                                planName: selectedPlan.name,
                                planPrice: parseFloat(selectedPlan.price),
                                planSpeed: selectedPlan.speed,
                                features: selectedPlan.features,
                                items: [{
                                  description: `${selectedPlan.name} - ${selectedPlan.speed}`,
                                  quantity: 1,
                                  unitPrice: parseFloat(selectedPlan.price),
                                  amount: parseFloat(selectedPlan.price)
                                }]
                              }));
                            }
                          }}
                          className={`w-full p-2 border rounded ${themeClasses.input}`} 
                          required
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
                        <label className={`block text-xs font-medium mb-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Speed</label>
                        <input type="text" name="planSpeed" value={invoiceForm.planSpeed} onChange={handleInputChange} className={`w-full p-2 border rounded ${themeClasses.input} bg-gray-100 dark:bg-gray-700`} readOnly />
                      </div>
                      <div>
                        <label className={`block text-xs font-medium mb-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Price</label>
                        <input type="number" name="planPrice" value={invoiceForm.planPrice} onChange={handleInputChange} className={`w-full p-2 border rounded ${themeClasses.input} bg-gray-100 dark:bg-gray-700`} step="0.01" readOnly />
                      </div>
                      <div>
                        <label className={`block text-xs font-medium mb-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Type</label>
                        <input type="text" name="connectionType" value={invoiceForm.connectionType} className={`w-full p-2 border rounded ${themeClasses.input} bg-gray-100 dark:bg-gray-700`} readOnly />
                      </div>
                    </div>
                    {invoiceForm.features && invoiceForm.features.length > 0 && (
                      <div className={`p-3 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-blue-50'} border ${darkMode ? 'border-gray-700' : 'border-blue-200'}`}>
                        <p className={`text-xs font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Plan Features:</p>
                        <ul className="flex flex-wrap gap-2">
                          {invoiceForm.features.map((feature, idx) => (
                            <li key={idx} className={`text-xs px-2 py-1 rounded-full ${darkMode ? 'bg-gray-700 text-gray-200' : 'bg-blue-100 text-blue-700'}`}>
                              ✓ {feature}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Tax & Discount */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div>
                  <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>Tax Rate (%)</label>
                  <input type="number" name="taxRate" value={invoiceForm.taxRate} onChange={handleInputChange} className={`w-full p-2 border rounded ${themeClasses.input}`} step="0.01" min="0" />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>Discount Type</label>
                  <select name="discountType" value={invoiceForm.discountType} onChange={handleInputChange} className={`w-full p-2 border rounded ${themeClasses.input}`}>
                    <option value="none">No Discount</option>
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed Amount</option>
                  </select>
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>Discount Value</label>
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
          <div className={`${themeClasses.card} rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            {/* Header with Logo and Title */}
            <div className={`relative ${darkMode ? 'bg-gradient-to-r from-gray-900 to-gray-800' : 'bg-gradient-to-r from-[#003366] to-[#004488]'} p-8 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-4">
                  <img src="/oppo.jpg" alt="OPTIMAS Logo" className="h-16 w-16 rounded-lg shadow-lg object-cover" />
                  <div>
                    <h2 className="text-3xl font-bold text-white">{COMPANY_INFO.name}</h2>
                    <p className="text-gray-200 text-sm mt-1">{COMPANY_INFO.tagline}</p>
                  </div>
                </div>
                <button onClick={() => setShowInvoiceModal(false)} className={`p-2 rounded-lg ${darkMode ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-white hover:bg-opacity-20 text-white'}`}>
                  <X size={24} />
                </button>
              </div>
              <div className="flex gap-3 mt-4">
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                  selectedInvoice.status === 'paid' 
                    ? 'bg-green-500 text-white'
                    : selectedInvoice.status === 'pending'
                    ? 'bg-amber-500 text-white'
                    : selectedInvoice.status === 'partially_paid'
                    ? 'bg-blue-500 text-white'
                    : 'bg-red-500 text-white'
                }`}>
                  {selectedInvoice.status.toUpperCase().replace('_', ' ')}
                </span>
                {selectedInvoice.isLocal && (
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-yellow-500 text-white">OFFLINE</span>
                )}
              </div>
            </div>

            {/* Content */}
            <div className="p-8 space-y-8">
              {/* Invoice Number and Dates */}
              <div className="grid grid-cols-3 gap-6">
                <div className={`p-4 rounded-xl ${darkMode ? 'bg-gray-800' : 'bg-gradient-to-br from-blue-50 to-blue-100'} border ${darkMode ? 'border-gray-700' : 'border-blue-200'}`}>
                  <p className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-blue-600'}`}>Invoice Number</p>
                  <p className="text-xl font-bold mt-2">{selectedInvoice.invoiceNumber || selectedInvoice._id.substring(0,8)}</p>
                </div>
                <div className={`p-4 rounded-xl ${darkMode ? 'bg-gray-800' : 'bg-gradient-to-br from-purple-50 to-purple-100'} border ${darkMode ? 'border-gray-700' : 'border-purple-200'}`}>
                  <p className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-purple-600'}`}>Invoice Date</p>
                  <p className="text-lg font-semibold mt-2">{new Date(selectedInvoice.invoiceDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                </div>
                <div className={`p-4 rounded-xl ${darkMode ? 'bg-gray-800' : 'bg-gradient-to-br from-orange-50 to-orange-100'} border ${darkMode ? 'border-gray-700' : 'border-orange-200'}`}>
                  <p className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-orange-600'}`}>Due Date</p>
                  <p className="text-lg font-semibold mt-2">{new Date(selectedInvoice.dueDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                </div>
              </div>

              {/* Customer and Invoice Details */}
              <div className="grid grid-cols-2 gap-8">
                <div>
                  <h3 className={`text-sm font-bold uppercase tracking-wide ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Bill To</h3>
                  <div className="mt-3 space-y-2">
                    <p className="text-lg font-semibold">{selectedInvoice.customerName}</p>
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{selectedInvoice.customerEmail}</p>
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{selectedInvoice.customerPhone}</p>
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{selectedInvoice.customerLocation}</p>
                  </div>
                </div>
                <div>
                  <h3 className={`text-sm font-bold uppercase tracking-wide ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Plan & Account</h3>
                  <div className="mt-3 space-y-2">
                    <p className="text-lg font-semibold text-[#003366]">{selectedInvoice.planName}</p>
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Speed: <span className="font-semibold">{selectedInvoice.planSpeed}</span></p>
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Account: <span className="font-bold text-orange-600">{selectedInvoice.clientAccountNumber || 'N/A'}</span></p>
                  </div>
                </div>
              </div>

              {/* Items Table */}
              <div>
                <h3 className={`text-sm font-bold uppercase tracking-wide mb-4 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Invoice Items</h3>
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
                      {selectedInvoice.items?.map((item, idx) => (
                        <tr key={idx} className={`${darkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-50'}`}>
                          <td className="px-6 py-4 text-sm">{item.description}</td>
                          <td className="px-6 py-4 text-sm text-center font-medium">{item.quantity || 1}</td>
                          <td className="px-6 py-4 text-sm text-right">Ksh {formatPrice(item.unitPrice)}</td>
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
                      <span className="font-medium">Ksh {formatPrice(selectedInvoice.subtotal)}</span>
                    </div>
                    {selectedInvoice.taxRate > 0 && (
                      <div className="flex justify-between text-sm">
                        <span>VAT ({selectedInvoice.taxRate}%)</span>
                        <span className="font-medium">Ksh {formatPrice(selectedInvoice.taxAmount)}</span>
                      </div>
                    )}
                    {selectedInvoice.discount > 0 && (
                      <div className="flex justify-between text-sm text-green-600 dark:text-green-400">
                        <span>Discount</span>
                        <span className="font-medium">-Ksh {formatPrice(selectedInvoice.discountType === 'percentage' ? (selectedInvoice.subtotal * selectedInvoice.discount / 100) : selectedInvoice.discount)}</span>
                      </div>
                    )}
                    <div className={`border-t pt-3 flex justify-between ${darkMode ? 'border-gray-700' : 'border-gray-300'}`}>
                      <span className="font-bold">Total Amount</span>
                      <span className="text-xl font-bold text-[#003366]">Ksh {formatPrice(selectedInvoice.totalAmount)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Amount Paid</span>
                      <span className="font-medium text-green-600 dark:text-green-400">Ksh {formatPrice(selectedInvoice.amountPaid)}</span>
                    </div>
                    <div className={`border-t pt-3 flex justify-between ${darkMode ? 'border-gray-700' : 'border-gray-300'}`}>
                      <span className="font-bold">Balance Due</span>
                      <span className={`text-lg font-bold ${selectedInvoice.balanceDue > 0 ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>
                        Ksh {formatPrice(selectedInvoice.balanceDue)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3 pt-6 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={() => downloadPDFHandler(selectedInvoice)}
                  disabled={generatingPDF === selectedInvoice._id}
                  className="px-6 py-2.5 bg-[#003366] hover:bg-[#002244] text-white rounded-lg font-medium transition-colors flex items-center gap-2 disabled:opacity-50"
                >
                  {generatingPDF === selectedInvoice._id ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : (
                    <Download size={18} />
                  )}
                  Download PDF
                </button>
                <button
                  onClick={() => sendInvoiceViaEmailHandler(selectedInvoice)}
                  className="px-6 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
                >
                  <Mail size={18} /> Download & Open Webmail
                </button>
                <button
                  onClick={() => shareViaWhatsApp(selectedInvoice, showNotification)}
                  className="px-6 py-2.5 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
                >
                  <MessageCircle size={18} /> WhatsApp
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ✅ COMPANY SETTINGS MODAL - Editable by Admin */}
      {showSettingsModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className={`${themeClasses.card} rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl`}>
            <div className={`sticky top-0 z-10 ${darkMode ? 'bg-gray-900' : 'bg-white'} px-6 py-4 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'} flex justify-between items-center`}>
              <div>
                <h3 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-600">
                  ⚙️ Company & Billing Settings
                </h3>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Edit paybill, bank details, and company info for invoices & receipts
                </p>
              </div>
              <button
                onClick={() => setShowSettingsModal(false)}
                className={`p-2 rounded-full ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Company Information */}
              <div className={`p-4 rounded-xl ${darkMode ? 'bg-gray-800/50' : 'bg-gradient-to-br from-blue-50 to-indigo-50'} border ${darkMode ? 'border-gray-700' : 'border-blue-200'}`}>
                <h4 className="font-semibold mb-4 flex items-center gap-2 text-blue-600">
                  <Building size={18} /> Company Information
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Company Name *
                    </label>
                    <input
                      type="text"
                      value={settingsForm.name}
                      onChange={(e) => setSettingsForm(prev => ({ ...prev, name: e.target.value }))}
                      className={`w-full px-3 py-2 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'} focus:ring-2 focus:ring-blue-500`}
                      placeholder="OPTIMAS NETWORK"
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Tagline
                    </label>
                    <input
                      type="text"
                      value={settingsForm.tagline}
                      onChange={(e) => setSettingsForm(prev => ({ ...prev, tagline: e.target.value }))}
                      className={`w-full px-3 py-2 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'} focus:ring-2 focus:ring-blue-500`}
                      placeholder="High-Speed Internet Solutions"
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Email
                    </label>
                    <input
                      type="email"
                      value={settingsForm.email}
                      onChange={(e) => setSettingsForm(prev => ({ ...prev, email: e.target.value }))}
                      className={`w-full px-3 py-2 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'} focus:ring-2 focus:ring-blue-500`}
                      placeholder="support@optimaswifi.co.ke"
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Phone
                    </label>
                    <input
                      type="text"
                      value={settingsForm.phone}
                      onChange={(e) => setSettingsForm(prev => ({ ...prev, phone: e.target.value }))}
                      className={`w-full px-3 py-2 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'} focus:ring-2 focus:ring-blue-500`}
                      placeholder="+254 741 874 200"
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Address
                    </label>
                    <input
                      type="text"
                      value={settingsForm.address}
                      onChange={(e) => setSettingsForm(prev => ({ ...prev, address: e.target.value }))}
                      className={`w-full px-3 py-2 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'} focus:ring-2 focus:ring-blue-500`}
                      placeholder="Nairobi, Kenya"
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Website
                    </label>
                    <input
                      type="text"
                      value={settingsForm.website}
                      onChange={(e) => setSettingsForm(prev => ({ ...prev, website: e.target.value }))}
                      className={`w-full px-3 py-2 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'} focus:ring-2 focus:ring-blue-500`}
                      placeholder="www.optimaswifi.co.ke"
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      VAT Number
                    </label>
                    <input
                      type="text"
                      value={settingsForm.vatNumber}
                      onChange={(e) => setSettingsForm(prev => ({ ...prev, vatNumber: e.target.value }))}
                      className={`w-full px-3 py-2 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'} focus:ring-2 focus:ring-blue-500`}
                      placeholder="VAT00123456"
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Logo URL
                    </label>
                    <input
                      type="text"
                      value={settingsForm.logoUrl}
                      onChange={(e) => setSettingsForm(prev => ({ ...prev, logoUrl: e.target.value }))}
                      className={`w-full px-3 py-2 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'} focus:ring-2 focus:ring-blue-500`}
                      placeholder="/oppo.jpg"
                    />
                  </div>
                </div>
              </div>

              {/* M-Pesa Paybill Settings */}
              <div className={`p-4 rounded-xl ${darkMode ? 'bg-gray-800/50' : 'bg-gradient-to-br from-green-50 to-emerald-50'} border ${darkMode ? 'border-gray-700' : 'border-green-200'}`}>
                <h4 className="font-semibold mb-4 flex items-center gap-2 text-green-600">
                  <Smartphone size={18} /> M-Pesa Paybill Settings
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Paybill Number *
                    </label>
                    <input
                      type="text"
                      value={settingsForm.paybill}
                      onChange={(e) => setSettingsForm(prev => ({ ...prev, paybill: e.target.value }))}
                      className={`w-full px-3 py-2 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'} focus:ring-2 focus:ring-green-500 text-lg font-mono`}
                      placeholder="4092707"
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Paybill Business Name
                    </label>
                    <input
                      type="text"
                      value={settingsForm.paybillName}
                      onChange={(e) => setSettingsForm(prev => ({ ...prev, paybillName: e.target.value }))}
                      className={`w-full px-3 py-2 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'} focus:ring-2 focus:ring-green-500`}
                      placeholder="OPTIMAS NETWORK"
                    />
                  </div>
                </div>
              </div>

              {/* Bank Details */}
              <div className={`p-4 rounded-xl ${darkMode ? 'bg-gray-800/50' : 'bg-gradient-to-br from-amber-50 to-orange-50'} border ${darkMode ? 'border-gray-700' : 'border-amber-200'}`}>
                <h4 className="font-semibold mb-4 flex items-center gap-2 text-amber-600">
                  <CreditCard size={18} /> Bank Account Details
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Bank Name *
                    </label>
                    <input
                      type="text"
                      value={settingsForm.bankName}
                      onChange={(e) => setSettingsForm(prev => ({ ...prev, bankName: e.target.value }))}
                      className={`w-full px-3 py-2 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'} focus:ring-2 focus:ring-amber-500`}
                      placeholder="Equity Bank"
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Account Name
                    </label>
                    <input
                      type="text"
                      value={settingsForm.bankAccountName}
                      onChange={(e) => setSettingsForm(prev => ({ ...prev, bankAccountName: e.target.value }))}
                      className={`w-full px-3 py-2 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'} focus:ring-2 focus:ring-amber-500`}
                      placeholder="Optimas Network Ltd"
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Account Number *
                    </label>
                    <input
                      type="text"
                      value={settingsForm.bankAccountNumber}
                      onChange={(e) => setSettingsForm(prev => ({ ...prev, bankAccountNumber: e.target.value }))}
                      className={`w-full px-3 py-2 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'} focus:ring-2 focus:ring-amber-500 font-mono`}
                      placeholder="1234567890"
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Branch
                    </label>
                    <input
                      type="text"
                      value={settingsForm.bankBranch}
                      onChange={(e) => setSettingsForm(prev => ({ ...prev, bankBranch: e.target.value }))}
                      className={`w-full px-3 py-2 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'} focus:ring-2 focus:ring-amber-500`}
                      placeholder="Nairobi Main"
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      SWIFT Code
                    </label>
                    <input
                      type="text"
                      value={settingsForm.bankSwiftCode}
                      onChange={(e) => setSettingsForm(prev => ({ ...prev, bankSwiftCode: e.target.value }))}
                      className={`w-full px-3 py-2 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'} focus:ring-2 focus:ring-amber-500 font-mono`}
                      placeholder="EQBLKENA"
                    />
                  </div>
                </div>
              </div>

              {/* Preview */}
              <div className={`p-4 rounded-xl ${darkMode ? 'bg-blue-900/20' : 'bg-blue-50'} border ${darkMode ? 'border-blue-800' : 'border-blue-200'}`}>
                <h4 className="font-semibold mb-3 flex items-center gap-2 text-blue-600">
                  <Eye size={18} /> Preview (How it will appear on invoices)
                </h4>
                <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="font-bold text-lg">{settingsForm.name || 'Company Name'}</p>
                      <p className="text-gray-500">{settingsForm.tagline || 'Tagline'}</p>
                      <p className="mt-2">{settingsForm.email}</p>
                      <p>{settingsForm.phone}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">M-Pesa Paybill: <span className="text-green-600 font-mono">{settingsForm.paybill}</span></p>
                      <p className="text-xs text-gray-500 mt-1">Bank: {settingsForm.bankName}</p>
                      <p className="text-xs text-gray-500">A/C: {settingsForm.bankAccountNumber}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer Actions */}
            <div className={`sticky bottom-0 ${darkMode ? 'bg-gray-900 border-gray-700' : 'bg-gray-50 border-gray-200'} px-6 py-4 border-t flex justify-end gap-3`}>
              <button
                onClick={() => setShowSettingsModal(false)}
                className={`px-4 py-2 rounded-lg ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'} transition-colors`}
              >
                Cancel
              </button>
              <button
                onClick={saveCompanySettings}
                disabled={savingSettings}
                className={`px-6 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700 transition-colors flex items-center gap-2 ${savingSettings ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {savingSettings ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <CheckCircle size={18} />
                    Save Settings
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InvoiceManager;