// ReceiptManager.jsx - FINAL UPDATED VERSION
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
  Share2
} from 'lucide-react';
// Import recharts for visualization
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, LabelList,
  LineChart, Line, ReferenceLine
} from 'recharts';
// Import html2pdf for client-side PDF generation
import html2pdf from 'html2pdf.js';

// Utility function for consistent price formatting in KSH
const formatPrice = (price) => {
  if (price === undefined || price === null) return '0';
  const cleanStr = price.toString().replace(/,/g, '');
  const num = parseInt(cleanStr, 10);
  return isNaN(num) ? price : num.toLocaleString();
};

// Mock company info to match your design
const COMPANY_INFO = {
  name: "OPTIMAS FIBER",
  tagline: "High-Speed Internet Solutions",
  logoUrl: "/oppo.jpg", // Use the logo from your public folder
  bankName: "Equity Bank",
  accountName: "Optimas Fiber Ltd",
  accountNumber: "1234567890",
  branch: "Nairobi Main",
  supportEmail: "support@optimasfiber.co.ke",
  supportPhone: "+254 741 874 200"
};

// Authentication check function
const checkAuth = async (API_BASE_URL) => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Authentication session expired. Please log in again.');
    }
    // Verify token with backend
    const response = await fetch(`${API_BASE_URL}/api/auth/verify`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    if (!response.ok) {
      // Token is invalid, clear storage and redirect
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      throw new Error('Authentication failed. Please log in again.');
    }
    return true;
  } catch (error) {
    console.error('Auth check failed:', error);
    throw error;
  }
};

const ReceiptManager = ({ darkMode, themeClasses, API_BASE_URL, showNotification, receipts, setReceipts, invoices }) => {
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
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

  // Form state for creating/editing receipts - UPDATED TO MATCH YOUR MODEL
  const [receiptForm, setReceiptForm] = useState({
    receiptNumber: '',
    invoiceId: '',
    invoiceNumber: '',
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    customerAddress: '', // Frontend uses customerAddress
    receiptDate: new Date().toISOString().split('T')[0],
    paymentDate: new Date().toISOString().split('T')[0],
    items: [{ description: 'Monthly Internet Service', quantity: 1, unitPrice: 0, amount: 0 }],
    subtotal: 0,
    taxRate: 0,
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

  // Fetch receipts from backend
  const fetchReceipts = async () => {
    try {
      setLoading(true);
      await checkAuth(API_BASE_URL); // Check authentication first
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/receipts`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) {
        throw new Error(`Failed to fetch receipts: ${response.status}`);
      }
      const data = await response.json();
      // Ensure we always have an array
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
      console.log('📄 Fetched receipts:', receiptsData);
      setReceipts(receiptsData);
    } catch (error) {
      console.error('Error fetching receipts:', error);
      showNotification(`🚨 Error loading receipts: ${error.message}`, 'error');
      setReceipts([]);
      // Redirect to login if authentication fails
      if (error.message.includes('Authentication')) {
        setTimeout(() => {
          window.location.href = '/login';
        }, 2000);
      }
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

  // Generate sequential receipt number
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

  // Calculate totals based on your model structure
  const calculateTotals = (items, taxRate = 0, discount = 0, discountType = 'none') => {
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
      const updatedForm = {
        ...prev,
        [name]: value
      };
      // Recalculate totals if financial fields change
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
      // Update balance when amountPaid changes
      if (name === 'amountPaid') {
        const amountPaid = parseFloat(value) || 0;
        return {
          ...updatedForm,
          amountPaid,
          balance: Math.max(0, updatedForm.total - amountPaid)
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
      updatedItems[index] = {
        ...item,
        [field]: field === 'quantity' || field === 'unitPrice' ? parseFloat(value) || 0 : value,
        amount
      };
    } else {
      updatedItems[index] = {
        ...item,
        [field]: value
      };
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

  // Create new receipt - FIXED VALIDATION
  const createReceipt = async () => {
    try {
      await checkAuth(API_BASE_URL); // Check authentication first
      // Validate required fields
      if (!receiptForm.customerName?.trim()) {
        throw new Error('Customer name is required');
      }
      if (!receiptForm.customerEmail?.trim()) {
        throw new Error('Customer email is required');
      }
      // ✅ CRITICAL FIX: Map frontend customerAddress to backend customerLocation
      const receiptData = {
        receiptNumber: receiptForm.receiptNumber || generateReceiptNumber(),
        invoiceNumber: receiptForm.invoiceNumber || '',
        customerName: receiptForm.customerName.trim(),
        customerEmail: receiptForm.customerEmail.trim(),
        customerPhone: receiptForm.customerPhone?.trim() || '',
        // ✅ FIX: Map customerAddress to customerLocation for backend
        customerLocation: receiptForm.customerAddress?.trim() || 'Not specified', // Backend expects this field
        receiptDate: new Date(receiptForm.receiptDate),
        paymentDate: new Date(receiptForm.paymentDate),
        items: receiptForm.items.map(item => ({
          description: item.description?.trim() || 'Service',
          quantity: parseFloat(item.quantity) || 1,
          unitPrice: parseFloat(item.unitPrice) || 0,
          amount: parseFloat(item.amount) || 0
        })),
        subtotal: parseFloat(receiptForm.subtotal) || 0,
        taxRate: parseFloat(receiptForm.taxRate) || 0,
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
      console.log('📤 Creating receipt with data:', receiptData);
      const token = localStorage.getItem('token');
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
        // Enhanced error handling for validation errors
        console.error('❌ Server response:', responseData);
        if (responseData.errors) {
          const errorMessages = Object.values(responseData.errors).join(', ');
          throw new Error(`Validation failed: ${errorMessages}`);
        }
        throw new Error(responseData.message || `Failed to create receipt: ${response.status}`);
      }
    } catch (error) {
      console.error('❌ Error creating receipt:', error);
      showNotification(`🚨 Error: ${error.message}`, 'error');
      // Redirect to login if authentication fails
      if (error.message.includes('Authentication')) {
        setTimeout(() => {
          window.location.href = '/login';
        }, 2000);
      }
    }
  };

  // Update receipt
  const updateReceipt = async () => {
    try {
      await checkAuth(API_BASE_URL);
      // ✅ FIX: Map customerAddress to customerLocation for backend
      const receiptData = {
        receiptNumber: receiptForm.receiptNumber,
        invoiceNumber: receiptForm.invoiceNumber,
        customerName: receiptForm.customerName.trim(),
        customerEmail: receiptForm.customerEmail.trim(),
        customerPhone: receiptForm.customerPhone?.trim() || '',
        // ✅ FIX: Map customerAddress to customerLocation for backend
        customerLocation: receiptForm.customerAddress?.trim() || 'Not specified', // Backend expects this field
        receiptDate: new Date(receiptForm.receiptDate),
        paymentDate: new Date(receiptForm.paymentDate),
        items: receiptForm.items.map(item => ({
          description: item.description?.trim() || 'Service',
          quantity: parseFloat(item.quantity) || 1,
          unitPrice: parseFloat(item.unitPrice) || 0,
          amount: parseFloat(item.amount) || 0
        })),
        subtotal: parseFloat(receiptForm.subtotal) || 0,
        taxRate: parseFloat(receiptForm.taxRate) || 0,
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
      const token = localStorage.getItem('token');
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
      await checkAuth(API_BASE_URL);
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/receipts/${receiptId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
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
      invoice.taxRate || 0, 
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
      // ✅ FIX: Map customerLocation to customerAddress for frontend
      customerAddress: invoice.customerAddress || invoice.customerLocation || '', // Frontend uses customerAddress
      receiptDate: new Date().toISOString().split('T')[0],
      paymentDate: new Date().toISOString().split('T')[0],
      items: items,
      subtotal: subtotal,
      taxRate: invoice.taxRate || 0,
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

  // Export receipt as PDF - Using client-side generation only for now
  const exportReceiptPDF = async (receipt) => {
    try {
      // Always use client-side generation to avoid backend issues
      generateClientSidePDF(receipt);
    } catch (error) {
      console.error('Error exporting PDF:', error);
      showNotification('🚨 Error generating PDF', 'error');
    }
  };

  // Client-side PDF generation using html2pdf.js
  const generateClientSidePDF = (receipt) => {
    showNotification('📄 Generating PDF...', 'info');

    // Create a hidden div with the PDF content
    const pdfContent = document.createElement('div');
    pdfContent.style.display = 'none';
    document.body.appendChild(pdfContent);

    // Populate the div with the receipt HTML
    pdfContent.innerHTML = `
      <div id="pdf-receipt" style="font-family: Arial, sans-serif; padding: 30px; max-width: 800px; margin: 0 auto;">
        <!-- Header -->
        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #003366; padding-bottom: 20px; margin-bottom: 30px;">
          <div>
            <img src="${COMPANY_INFO.logoUrl}" alt="${COMPANY_INFO.name}" style="height: 60px; margin-right: 20px;" />
            <div style="display: inline-block; vertical-align: top;">
              <h1 style="font-size: 24px; font-weight: bold; color: #003366; margin: 0;">${COMPANY_INFO.name}</h1>
              <p style="font-size: 14px; color: #666; margin: 5px 0 0 0;">${COMPANY_INFO.tagline}</p>
            </div>
          </div>
          <div style="text-align: right;">
            <h1 style="font-size: 32px; font-weight: bold; color: #FFCC00; margin: 0;">RECEIPT</h1>
            <p style="font-size: 16px; color: #333; margin: 5px 0 0 0;"># ${receipt.receiptNumber}</p>
          </div>
        </div>

        <!-- Bill To & Receipt Details -->
        <div style="display: flex; justify-content: space-between; margin-bottom: 30px;">
          <div style="flex: 1; padding-right: 20px;">
            <h3 style="font-size: 16px; font-weight: bold; color: #333; margin: 0 0 10px 0;">Bill To:</h3>
            <p style="margin: 5px 0;">${receipt.customerName}</p>
            <p style="margin: 5px 0;">${receipt.customerEmail}</p>
            <p style="margin: 5px 0;">${receipt.customerPhone || 'N/A'}</p>
            <p style="margin: 5px 0;">${receipt.customerAddress || receipt.customerLocation || 'N/A'}</p>
          </div>
          <div style="flex: 1; text-align: right;">
            <p style="margin: 5px 0;"><strong>Receipt Date:</strong> ${receipt.receiptDate ? new Date(receipt.receiptDate).toLocaleDateString() : 'N/A'}</p>
            <p style="margin: 5px 0;"><strong>Payment Date:</strong> ${receipt.paymentDate ? new Date(receipt.paymentDate).toLocaleDateString() : 'N/A'}</p>
            <p style="margin: 5px 0;"><strong>Status:</strong> <span style="color: ${receipt.status === 'paid' ? '#28a745' : receipt.status === 'issued' ? '#ffc107' : '#dc3545'}">${receipt.status.toUpperCase()}</span></p>
          </div>
        </div>

        <!-- Receipt Items Table -->
        <div style="border: 1px solid #ddd; border-radius: 8px; overflow: hidden; margin-bottom: 30px;">
          <table style="width: 100%; border-collapse: collapse;">
            <thead style="background-color: #f8f9fa; border-bottom: 2px solid #dee2e6;">
              <tr>
                <th style="padding: 12px; text-align: left; font-weight: bold; width: 40%;">Description</th>
                <th style="padding: 12px; text-align: left; font-weight: bold; width: 30%;">Details</th>
                <th style="padding: 12px; text-align: right; font-weight: bold; width: 30%;">Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style="padding: 12px; border-top: 1px solid #dee2e6;">
                  <strong>${receipt.planName || 'Internet Service'}</strong><br/>
                  ${receipt.planSpeed || 'N/A'}
                </td>
                <td style="padding: 12px; border-top: 1px solid #dee2e6;">
                  Payment Method: ${receipt.paymentMethod || 'Mobile Money'}<br/>
                  ${receipt.paymentReference ? `Ref: ${receipt.paymentReference}` : ''}
                </td>
                <td style="padding: 12px; border-top: 1px solid #dee2e6; text-align: right;">
                  Ksh ${formatPrice(receipt.amountPaid)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Total Amount -->
        <div style="text-align: right; margin-bottom: 30px;">
          <h2 style="font-size: 28px; font-weight: bold; color: #333; margin: 0;">Total: Ksh ${formatPrice(receipt.amountPaid)}</h2>
          <p style="font-size: 14px; color: #666; margin: 5px 0 0 0;">Payment Received</p>
        </div>

        <!-- Payment Instructions -->
        <div style="border: 1px solid #ddd; border-radius: 8px; padding: 20px; margin-bottom: 30px; background-color: #f8f9fa;">
          <h3 style="font-size: 16px; font-weight: bold; color: #333; margin: 0 0 10px 0;">Payment Instructions:</h3>
          
          <div style="margin-bottom: 20px;">
            <h4 style="font-size: 14px; font-weight: bold; color: #333; margin: 0 0 5px 0;">Bank Transfer:</h4>
            <p style="margin: 5px 0 0 0;"><strong>Bank:</strong> ${COMPANY_INFO.bankName}</p>
            <p style="margin: 5px 0 0 0;"><strong>Account Name:</strong> ${COMPANY_INFO.accountName}</p>
            <p style="margin: 5px 0 0 0;"><strong>Account Number:</strong> ${COMPANY_INFO.accountNumber}</p>
            <p style="margin: 5px 0 0 0;"><strong>Branch:</strong> ${COMPANY_INFO.branch}</p>
          </div>

          <div style="border-top: 1px solid #ddd; padding-top: 20px;">
            <h4 style="font-size: 14px; font-weight: bold; color: #333; margin: 0 0 5px 0;">Mobile Money:</h4>
            <p style="margin: 5px 0 0 0;"><strong>Paybill:</strong> 123456</p>
            <p style="margin: 5px 0 0 0;"><strong>Account:</strong> ${receipt.customerName.split(' ')[0]}</p>
          </div>
        </div>

        <!-- Footer -->
        <div style="text-align: center; padding-top: 20px; border-top: 1px solid #ddd; color: #666; font-size: 14px;">
          <p style="margin: 5px 0;">Thank you for choosing Optimas Fiber!</p>
          <p style="margin: 5px 0;">For any queries, contact us at: <a href="mailto:${COMPANY_INFO.supportEmail}" style="color: #003366;">${COMPANY_INFO.supportEmail}</a> | <a href="tel:${COMPANY_INFO.supportPhone}" style="color: #003366;">${COMPANY_INFO.supportPhone}</a></p>
        </div>
      </div>
    `;

    // Configure html2pdf options
    const opt = {
      margin: [10, 10, 10, 10],
      filename: `${receipt.receiptNumber}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    // Generate the PDF
    html2pdf().from(pdfContent).set(opt).save().then(() => {
      showNotification('✅ PDF generated successfully!', 'success');
      // Clean up
      document.body.removeChild(pdfContent);
    }).catch(err => {
      console.error('PDF generation error:', err);
      showNotification('🚨 Failed to generate PDF', 'error');
      document.body.removeChild(pdfContent);
    });
  };

  // Helper function to generate WhatsApp message
  const generateWhatsAppMessage = (receipt) => {
    const customerName = receipt.customerName || 'Customer';
    const receiptNumber = receipt.receiptNumber || 'N/A';
    const amount = formatPrice(receipt.amountPaid);
    const receiptDate = receipt.receiptDate ? new Date(receipt.receiptDate).toLocaleDateString() : 'N/A';
    
    return `Hello ${customerName},\n\nThis is your receipt from Optimas Fiber.\n\nReceipt #: ${receiptNumber}\nAmount Paid: Ksh ${amount}\nReceipt Date: ${receiptDate}\n\nYou can pay via:\n- Bank Transfer to Equity Bank, Account: Optimas Fiber Ltd, Acc No: 1234567890\n- Mobile Money Paybill: 123456, Account: ${customerName.split(' ')[0]}\n\nThank you for choosing Optimas Fiber!`;
  };

  // Send receipt to client via WhatsApp
  const sendReceiptToClient = async (receipt) => {
    try {
      setSendingReceipt(receipt._id);
      
      // Get customer phone number
      const customerPhone = receipt.customerPhone?.replace(/\D/g, ''); // Remove non-digits
      
      if (!customerPhone) {
        showNotification('⚠️ Customer phone number not available', 'warning');
        return;
      }

      // Generate WhatsApp message
      const message = encodeURIComponent(generateWhatsAppMessage(receipt));

      // Open WhatsApp with pre-filled message
      const whatsappUrl = `https://wa.me/${customerPhone}?text=${message}`;
      window.open(whatsappUrl, '_blank');

      showNotification('✅ WhatsApp chat opened with receipt details!', 'success');
    } catch (error) {
      console.error('Error sending receipt via WhatsApp:', error);
      showNotification(`🚨 Error: ${error.message}`, 'error');
    } finally {
      setSendingReceipt(null);
    }
  };

  // Export all receipts to Excel
  const exportReceiptsToExcel = async () => {
    try {
      setExportLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/receipts/export/excel`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = `receipts-${new Date().toISOString().split('T')[0]}.xlsx`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        showNotification('✅ Receipts exported to Excel successfully!', 'success');
      } else {
        throw new Error('Failed to export Excel');
      }
    } catch (error) {
      console.error('Error exporting to Excel:', error);
      showNotification('🚨 Error exporting receipts to Excel', 'error');
    } finally {
      setExportLoading(false);
    }
  };

  // Preview PDF
  const previewPDF = (receipt) => {
    setSelectedReceipt(receipt);
    setShowPDFModal(true);
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
      customerAddress: '', // Frontend uses customerAddress
      receiptDate: new Date().toISOString().split('T')[0],
      paymentDate: new Date().toISOString().split('T')[0],
      items: [{ description: 'Monthly Internet Service', quantity: 1, unitPrice: 0, amount: 0 }],
      subtotal: 0,
      taxRate: 0,
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
      // ✅ FIX: Map customerLocation to customerAddress for frontend
      customerAddress: receipt.customerAddress || receipt.customerLocation || '', // Frontend uses customerAddress
      receiptDate: receipt.receiptDate ? new Date(receipt.receiptDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      paymentDate: receipt.paymentDate ? new Date(receipt.paymentDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      items: receipt.items || [{ description: 'Monthly Internet Service', quantity: 1, unitPrice: 0, amount: 0 }],
      subtotal: receipt.subtotal || 0,
      taxRate: receipt.taxRate || 0,
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

  // Filter and search receipts
  const filteredReceipts = Array.isArray(receipts) 
    ? receipts.filter(receipt => {
        if (!receipt || typeof receipt !== 'object') return false;
        const matchesSearch = 
          (receipt.customerName?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
          (receipt.receiptNumber?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
          (receipt.invoiceNumber?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
          (receipt.customerEmail?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
          (receipt.customerPhone?.toLowerCase() || '').includes(searchTerm.toLowerCase());
        return matchesSearch;
      })
    : [];

  // Calculate stats for charts
  const stats = {
    totalReceipts: receipts.length,
    paidReceipts: receipts.filter(rec => rec.status === 'paid').length,
    issuedReceipts: receipts.filter(rec => rec.status === 'issued').length,
    refundedReceipts: receipts.filter(rec => rec.status === 'refunded').length,
    totalRevenue: receipts.reduce((sum, rec) => sum + (rec.amountPaid || rec.total || 0), 0),
    monthlyRevenue: receipts.filter(rec => {
      const receiptDate = new Date(rec.receiptDate || rec.createdAt);
      const now = new Date();
      return receiptDate.getMonth() === now.getMonth() && receiptDate.getFullYear() === now.getFullYear();
    }).reduce((sum, rec) => sum + (rec.amountPaid || rec.total || 0), 0),
    quarterlyRevenue: receipts.filter(rec => {
      const receiptDate = new Date(rec.receiptDate || rec.createdAt);
      const now = new Date();
      const currentQuarter = Math.floor(now.getMonth() / 3);
      const receiptQuarter = Math.floor(receiptDate.getMonth() / 3);
      return receiptDate.getFullYear() === now.getFullYear() && receiptQuarter === currentQuarter;
    }).reduce((sum, rec) => sum + (rec.amountPaid || rec.total || 0), 0),
    annualRevenue: receipts.filter(rec => {
      const receiptDate = new Date(rec.receiptDate || rec.createdAt);
      const now = new Date();
      return receiptDate.getFullYear() === now.getFullYear();
    }).reduce((sum, rec) => sum + (rec.amountPaid || rec.total || 0), 0)
  };

  // Data for charts
  const statusData = [
    { name: 'Paid', value: stats.paidReceipts, color: '#28a745' },
    { name: 'Issued', value: stats.issuedReceipts, color: '#ffc107' },
    { name: 'Refunded', value: stats.refundedReceipts, color: '#dc3545' }
  ];

  const revenueData = [
    { name: 'Monthly', value: stats.monthlyRevenue },
    { name: 'Quarterly', value: stats.quarterlyRevenue },
    { name: 'Annually', value: stats.annualRevenue }
  ];

  const timeSeriesData = receipts
    .filter(rec => rec.receiptDate)
    .map(rec => ({
      date: new Date(rec.receiptDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
      amount: rec.amountPaid || rec.total || 0
    }))
    .reduce((acc, curr) => {
      const existing = acc.find(item => item.date === curr.date);
      if (existing) {
        existing.amount += curr.amount;
      } else {
        acc.push(curr);
      }
      return acc;
    }, [])
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
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold mb-2 bg-gradient-to-r from-[#003366] to-[#FFCC00] bg-clip-text text-transparent">
            Receipt Management
          </h2>
          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Generate, manage, and track customer receipts - Total: {receipts.length} receipts
          </p>
        </div>
        <div className="flex flex-wrap gap-3 mt-4 md:mt-0">
          <button 
            onClick={fetchReceipts}
            className={`${themeClasses.button.small.base} ${darkMode ? themeClasses.button.small.dark : themeClasses.button.small.light} flex items-center`}
          >
            <RefreshCw size={16} className="mr-1.5" />
            Refresh
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
            <FileText size={16} className="mr-1.5" />
            From Invoice
          </button>
          <button 
            onClick={() => {
              setEditingReceipt(null);
              resetForm();
              setShowCreateModal(true);
            }}
            className={`${themeClasses.button.primary.base} ${darkMode ? themeClasses.button.primary.dark : themeClasses.button.primary.light} flex items-center`}
          >
            <Plus size={16} className="mr-1.5" />
            New Receipt
          </button>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Status Pie Chart */}
        <div className={`${themeClasses.card} p-4 rounded-xl border backdrop-blur-sm`}>
          <h3 className="text-lg font-semibold mb-4">Receipt Status</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
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
              <Tooltip formatter={(value) => `Count: ${value}`} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Revenue by Time Period Bar Chart */}
        <div className={`${themeClasses.card} p-4 rounded-xl border backdrop-blur-sm`}>
          <h3 className="text-lg font-semibold mb-4">Revenue by Time Period</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis tickFormatter={(value) => `Ksh ${formatPrice(value)}`} />
              <Tooltip formatter={(value) => `Ksh ${formatPrice(value)}`} />
              <Legend />
              <Bar dataKey="value" fill="#003366" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Revenue Trend Line Chart */}
        <div className={`${themeClasses.card} p-4 rounded-xl border backdrop-blur-sm`}>
          <h3 className="text-lg font-semibold mb-4">Revenue Trend</h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={timeSeriesData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis tickFormatter={(value) => `Ksh ${formatPrice(value)}`} />
              <Tooltip formatter={(value) => `Ksh ${formatPrice(value)}`} />
              <Legend />
              <Line type="monotone" dataKey="amount" stroke="#FFCC00" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Filters and Search */}
      <div className={`${themeClasses.card} p-4 mb-6 rounded-xl shadow-sm border backdrop-blur-sm`}>
        <div className="flex flex-col md:flex-row gap-4 items-center">
          <div className="flex-1 w-full">
            <div className="relative">
              <Search size={18} className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
              <input
                type="text"
                placeholder="Search by customer name, receipt number, invoice number, email, or phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full pl-10 pr-4 py-2 border rounded-lg text-sm transition-all duration-200 focus:ring-2 focus:ring-[#003366] focus:border-transparent ${themeClasses.input}`}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Receipts Table - UPDATED WITH KSH PRICING */}
      <div className={`${themeClasses.card} rounded-xl shadow-lg border backdrop-blur-sm overflow-hidden`}>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider">
                  Receipt #
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider hidden md:table-cell">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider hidden lg:table-cell">
                  Invoice #
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider hidden md:table-cell">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className={`divide-y ${darkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
              {filteredReceipts.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <Receipt size={48} className={`mb-4 ${darkMode ? 'text-gray-600' : 'text-gray-400'}`} />
                      <p className={`text-lg font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        {Array.isArray(receipts) && receipts.length === 0 ? 'No receipts available' : 'No receipts match your search'}
                      </p>
                      <p className={`text-sm ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                        {searchTerm ? 'Try adjusting your search' : 'Generate your first receipt to get started'}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredReceipts.map((receipt) => (
                  <tr key={receipt._id} className={`${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}`}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          {receipt.receiptNumber || 'N/A'}
                        </div>
                        <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          {new Date(receipt.receiptDate || receipt.createdAt).toLocaleDateString()}
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
                        Ksh {formatPrice(receipt.amountPaid || receipt.total || 0)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap hidden md:table-cell">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        receipt.status === 'paid' 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                          : receipt.status === 'issued'
                          ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                          : receipt.status === 'refunded'
                          ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                          : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                      }`}>
                        {receipt.status?.toUpperCase() || 'ISSUED'}
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
                          onClick={() => previewPDF(receipt)}
                          className={`p-2 rounded-lg ${darkMode ? 'text-blue-400 hover:bg-gray-600' : 'text-blue-600 hover:bg-gray-100'} transition-colors`}
                          title="Preview PDF"
                        >
                          <FileDown size={16} />
                        </button>
                        <button
                          onClick={() => exportReceiptPDF(receipt)}
                          className={`p-2 rounded-lg ${darkMode ? 'text-purple-400 hover:bg-gray-600' : 'text-purple-600 hover:bg-gray-100'} transition-colors`}
                          title="Export PDF"
                        >
                          <Download size={16} />
                        </button>
                        <button
                          onClick={() => sendReceiptToClient(receipt)}
                          disabled={sendingReceipt === receipt._id}
                          className={`p-2 rounded-lg ${darkMode ? 'text-green-400 hover:bg-gray-600' : 'text-green-600 hover:bg-gray-100'} transition-colors ${
                            sendingReceipt === receipt._id ? 'opacity-50 cursor-not-allowed' : ''
                          }`}
                          title="Send to Client"
                        >
                          <Share2 size={16} />
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

      {/* Create/Edit Receipt Modal - UPDATED WITH ALL MODEL FIELDS */}
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
                    Receipt Number
                  </label>
                  <input
                    type="text"
                    name="receiptNumber"
                    value={receiptForm.receiptNumber}
                    onChange={handleInputChange}
                    placeholder="Auto-generated if empty"
                    className={`w-full p-3 border rounded-lg text-sm transition-all duration-200 focus:ring-2 focus:ring-[#003366] focus:border-transparent ${themeClasses.input}`}
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
                    <option value="cash">Cash</option>
                    <option value="card">Card</option>
                    <option value="bank_transfer">Bank Transfer</option>
                    <option value="mobile_money">Mobile Money</option>
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
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Plan Name
                  </label>
                  <input
                    type="text"
                    name="planName"
                    value={receiptForm.planName}
                    onChange={handleInputChange}
                    placeholder="e.g., Jumbo, Buffalo, etc."
                    className={`w-full p-3 border rounded-lg text-sm transition-all duration-200 focus:ring-2 focus:ring-[#003366] focus:border-transparent ${themeClasses.input}`}
                  />
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
                    placeholder="e.g., 8Mbps, 15Mbps, etc."
                    className={`w-full p-3 border rounded-lg text-sm transition-all duration-200 focus:ring-2 focus:ring-[#003366] focus:border-transparent ${themeClasses.input}`}
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
                    className={`w-full p-3 border rounded-lg text-sm transition-all duration-200 focus:ring-2 focus:ring-[#003366] focus:border-transparent ${themeClasses.input}`}
                    step="1"
                    min="0"
                  />
                </div>
              </div>
              {/* Receipt Items - UPDATED WITH QUANTITY AND UNIT PRICE */}
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
              {/* Financial Summary - UPDATED WITH KSH */}
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
                {filteredInvoices.length === 0 ? (
                  <div className="text-center py-8">
                    <FileText size={48} className={`mx-auto mb-4 ${darkMode ? 'text-gray-600' : 'text-gray-400'}`} />
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      {searchInvoiceTerm ? 'No invoices match your search' : 'No invoices available'}
                    </p>
                  </div>
                ) : (
                  filteredInvoices.map((invoice) => (
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

      {/* Receipt Details Modal - UPDATED WITH KSH PRICING */}
      {showReceiptModal && selectedReceipt && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className={`${themeClasses.card} rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto`}>
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                  Receipt Details - {selectedReceipt.receiptNumber || 'N/A'}
                </h3>
                <button
                  onClick={() => setShowReceiptModal(false)}
                  className={`p-2 rounded-lg ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} transition-colors`}
                >
                  <X size={20} />
                </button>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Customer Information</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    <strong>Name:</strong> {selectedReceipt.customerName || 'N/A'}<br/>
                    <strong>Email:</strong> {selectedReceipt.customerEmail || 'N/A'}<br/>
                    <strong>Phone:</strong> {selectedReceipt.customerPhone || 'N/A'}<br/>
                    <strong>Address:</strong> {selectedReceipt.customerAddress || selectedReceipt.customerLocation || 'N/A'}
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Receipt Details</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    <strong>Receipt Date:</strong> {selectedReceipt.receiptDate ? new Date(selectedReceipt.receiptDate).toLocaleDateString() : 
                                                  selectedReceipt.createdAt ? new Date(selectedReceipt.createdAt).toLocaleDateString() : 'N/A'}<br/>
                    <strong>Payment Date:</strong> {selectedReceipt.paymentDate ? new Date(selectedReceipt.paymentDate).toLocaleDateString() : 'N/A'}<br/>
                    <strong>Invoice #:</strong> {selectedReceipt.invoiceNumber || 'N/A'}<br/>
                    <strong>Payment Method:</strong> {selectedReceipt.paymentMethod?.toUpperCase() || 'CASH'}<br/>
                    <strong>Status:</strong> <span className={`font-semibold ${
                      selectedReceipt.status === 'paid' ? 'text-green-600' : 
                      selectedReceipt.status === 'issued' ? 'text-blue-600' : 
                      'text-gray-600'
                    }`}>{selectedReceipt.status?.toUpperCase() || 'ISSUED'}</span>
                  </p>
                </div>
              </div>
              {/* Plan Information */}
              {(selectedReceipt.planName || selectedReceipt.serviceDescription) && (
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Service Details</h4>
                  <div className={`p-3 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                    <p className="text-sm">
                      <strong>Plan:</strong> {selectedReceipt.planName || 'N/A'} • {selectedReceipt.planSpeed || 'N/A'}<br/>
                      <strong>Description:</strong> {selectedReceipt.serviceDescription || 'N/A'}
                    </p>
                  </div>
                </div>
              )}
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Items</h4>
                <div className={`border rounded-lg ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className={`${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                      <tr>
                        <th className="px-4 py-2 text-left text-sm font-medium">Description</th>
                        <th className="px-4 py-2 text-center text-sm font-medium">Qty</th>
                        <th className="px-4 py-2 text-right text-sm font-medium">Unit Price</th>
                        <th className="px-4 py-2 text-right text-sm font-medium">Amount</th>
                      </tr>
                    </thead>
                    <tbody className={`divide-y ${darkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
                      {(selectedReceipt.items || [{ description: 'Internet Service', quantity: 1, unitPrice: selectedReceipt.total || selectedReceipt.amountPaid || 0, amount: selectedReceipt.total || selectedReceipt.amountPaid || 0 }]).map((item, index) => (
                        <tr key={index}>
                          <td className="px-4 py-2 text-sm">{item.description}</td>
                          <td className="px-4 py-2 text-sm text-center">{item.quantity || 1}</td>
                          <td className="px-4 py-2 text-sm text-right">Ksh {formatPrice(item.unitPrice || item.amount)}</td>
                          <td className="px-4 py-2 text-sm text-right">Ksh {formatPrice(item.amount)}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className={`${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                      <tr>
                        <td colSpan="3" className="px-4 py-2 text-sm font-bold text-right">Subtotal</td>
                        <td className="px-4 py-2 text-sm font-bold text-right">Ksh {formatPrice(selectedReceipt.subtotal || selectedReceipt.total || 0)}</td>
                      </tr>
                      <tr>
                        <td colSpan="3" className="px-4 py-2 text-sm font-bold text-right">Tax</td>
                        <td className="px-4 py-2 text-sm font-bold text-right">Ksh {formatPrice(selectedReceipt.taxAmount || 0)}</td>
                      </tr>
                      <tr>
                        <td colSpan="3" className="px-4 py-2 text-sm font-bold text-right">Total</td>
                        <td className="px-4 py-2 text-sm font-bold text-right">Ksh {formatPrice(selectedReceipt.total || 0)}</td>
                      </tr>
                      <tr className="border-t">
                        <td colSpan="3" className="px-4 py-2 text-sm font-bold text-green-600 text-right">Amount Paid</td>
                        <td className="px-4 py-2 text-sm font-bold text-right text-green-600">Ksh {formatPrice(selectedReceipt.amountPaid || selectedReceipt.total || 0)}</td>
                      </tr>
                      {selectedReceipt.balance > 0 && (
                        <tr>
                          <td colSpan="3" className="px-4 py-2 text-sm font-bold text-red-600 text-right">Balance Due</td>
                          <td className="px-4 py-2 text-sm font-bold text-right text-red-600">Ksh {formatPrice(selectedReceipt.balance || 0)}</td>
                        </tr>
                      )}
                    </tfoot>
                  </table>
                </div>
              </div>
              {selectedReceipt.notes && (
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Notes</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                    {selectedReceipt.notes}
                  </p>
                </div>
              )}
              <div className="flex flex-wrap gap-3 pt-4">
                <button
                  onClick={() => exportReceiptPDF(selectedReceipt)}
                  className={`${themeClasses.button.small.base} ${darkMode ? themeClasses.button.small.dark : themeClasses.button.small.light} flex items-center`}
                >
                  <Download size={16} className="mr-1.5" />
                  Export PDF
                </button>
                <button
                  onClick={() => sendReceiptToClient(selectedReceipt)}
                  disabled={sendingReceipt === selectedReceipt._id}
                  className={`${themeClasses.button.small.base} ${darkMode ? themeClasses.button.small.dark : themeClasses.button.small.light} flex items-center ${
                    sendingReceipt === selectedReceipt._id ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  <Share2 size={16} className="mr-1.5" />
                  {sendingReceipt === selectedReceipt._id ? 'Sending...' : 'Send to Client'}
                </button>
                <button
                  onClick={() => {
                    setShowReceiptModal(false);
                    editReceipt(selectedReceipt);
                  }}
                  className={`${themeClasses.button.secondary.base} ${darkMode ? themeClasses.button.secondary.dark : themeClasses.button.secondary.light} flex items-center`}
                >
                  <Edit size={16} className="mr-1.5" />
                  Edit Receipt
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PDF Preview Modal - MATCHES SERVICE INVOICE DESIGN */}
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
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">RECEIPT</h2>
                  <p className="text-gray-600 dark:text-gray-400">Receipt #: {selectedReceipt.receiptNumber}</p>
                </div>
                <div className="grid grid-cols-2 gap-8 mb-6">
                  <div>
                    <h3 className="font-semibold mb-2">Bill To:</h3>
                    <p>{selectedReceipt.customerName}</p>
                    <p>{selectedReceipt.customerEmail}</p>
                    <p>{selectedReceipt.customerPhone}</p>
                    <p>{selectedReceipt.customerAddress || selectedReceipt.customerLocation}</p>
                  </div>
                  <div className="text-right">
                    <p><strong>Date:</strong> {selectedReceipt.receiptDate ? new Date(selectedReceipt.receiptDate).toLocaleDateString() : 
                                            selectedReceipt.createdAt ? new Date(selectedReceipt.createdAt).toLocaleDateString() : 'N/A'}</p>
                    <p><strong>Payment Date:</strong> {selectedReceipt.paymentDate ? new Date(selectedReceipt.paymentDate).toLocaleDateString() : 'N/A'}</p>
                    <p><strong>Status:</strong> {selectedReceipt.status}</p>
                    {selectedReceipt.planName && (
                      <p><strong>Plan:</strong> {selectedReceipt.planName} • {selectedReceipt.planSpeed}</p>
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
                        <td className="py-2">{item.description}</td>
                        <td className="text-center py-2">{item.quantity || 1}</td>
                        <td className="text-right py-2">Ksh {formatPrice(item.unitPrice || item.amount)}</td>
                        <td className="text-right py-2">Ksh {formatPrice(item.amount)}</td>
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
                  <Share2 size={16} className="mr-1.5" />
                  {sendingReceipt === selectedReceipt._id ? 'Sending...' : 'Send to Client'}
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