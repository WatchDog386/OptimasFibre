// ReceiptManager.jsx - UPDATED: sendReceiptToClient sends PDF via email
// ReceiptManager.jsx - UPDATED: exportReceiptsToExcel fetches from backend API
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
  Share2,
  TrendingUp // ✅ ADDED MISSING IMPORT
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
  if (price === undefined || price === null) return '0';
  const cleanStr = price.toString().replace(/,/g, '');
  const num = parseInt(cleanStr, 10);
  return isNaN(num) ? price : num.toLocaleString();
};

// Brand configuration to match your design
const BRAND = {
  name: "OPTIMAS FIBER",
  tagline: "High-Speed Internet Solutions",
  logoUrl: "/public/oppo.jpg", // Updated path to logo
  colors: {
    primary: '#003366',
    accent: '#FFCC00',
    success: '#28a745',
    warning: '#ffc107',
    danger: '#dc3545'
  },
  contact: {
    email: "support@optimasfiber.co.ke",
    phone: "+254 741 874 200",
    bank: {
      name: "Equity Bank",
      accountName: "Optimas Fiber Ltd",
      accountNumber: "1234567890",
      branch: "Nairobi Main"
    }
  }
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
  const [sendingReceipt, setSendingReceipt] = useState(null); // Tracks which receipt is being sent
  const [searchInvoiceTerm, setSearchInvoiceTerm] = useState('');
  const [showInvoiceSearch, setShowInvoiceSearch] = useState(false);

  // Form state for creating/editing receipts
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
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication session expired. Please log in again.');
      }
      const response = await fetch(`${API_BASE_URL}/api/receipts`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
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
      if (error.message.includes('401') || error.message.includes('token')) {
        setTimeout(() => {
          window.location.href = '/admin/login';
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

  // Calculate totals
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
        throw new Error('Customer name is required');
      }
      if (!receiptForm.customerEmail?.trim()) {
        throw new Error('Customer email is required');
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
      customerAddress: invoice.customerLocation || invoice.customerAddress || '',
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

  // ✅ FIXED: PDF Generation with complete, styled HTML and proper layout
  const exportReceiptPDF = (receipt) => {
    const element = document.createElement('div');
    element.innerHTML = `
      <div id="receipt-pdf" style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 20px; max-width: 800px; margin: 0 auto; background: white; color: #333; font-size: 12px;">
        <div style="display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 3px solid ${BRAND.colors.primary}; padding-bottom: 15px; margin-bottom: 20px;">
          <div>
            <h1 style="font-size: 22px; font-weight: bold; color: ${BRAND.colors.primary}; margin: 0;">${BRAND.name}</h1>
            <p style="font-size: 11px; color: #666; margin: 5px 0 0 0;">${BRAND.tagline}</p>
            <div style="font-size: 10px; color: #666; margin-top: 5px;">
                <p style="margin: 0;">Email: ${BRAND.contact.email}</p>
                <p style="margin: 0;">Phone: ${BRAND.contact.phone}</p>
            </div>
          </div>
          <div style="text-align: right; min-width: 130px;">
            <img src="${BRAND.logoUrl}" alt="${BRAND.name}" style="max-height: 50px; max-width: 90px; object-fit: contain; margin-bottom: 5px;" />
            <h1 style="font-size: 28px; font-weight: bold; color: ${BRAND.colors.accent}; margin: 0;">RECEIPT</h1>
            <p style="font-size: 14px; color: ${BRAND.colors.primary}; margin: 5px 0 0 0;">#${receipt.receiptNumber || 'N/A'}</p>
          </div>
        </div>
        <div style="display: flex; justify-content: space-between; margin-bottom: 20px; border: 1px solid #eee; padding: 12px; border-radius: 5px;">
          <div style="flex: 1;">
            <h3 style="font-size: 13px; font-weight: bold; color: #333; margin: 0 0 5px 0; padding-bottom: 5px; border-bottom: 1px solid #eee;">Bill To:</h3>
            <p style="margin: 2px 0; line-height: 1.4;"><strong>${receipt.customerName || 'N/A'}</strong></p>
            <p style="margin: 2px 0; line-height: 1.4;">${receipt.customerEmail || 'N/A'}</p>
            <p style="margin: 2px 0; line-height: 1.4;">${receipt.customerPhone || 'N/A'}</p>
            <p style="margin: 2px 0; line-height: 1.4;">${receipt.customerLocation || receipt.customerAddress || 'N/A'}</p>
          </div>
          <div style="flex: 1; text-align: right;">
            <p style="margin: 2px 0;"><strong>Receipt Date:</strong> ${receipt.receiptDate ? new Date(receipt.receiptDate).toLocaleDateString() : 'N/A'}</p>
            <p style="margin: 2px 0;"><strong>Payment Date:</strong> ${receipt.paymentDate ? new Date(receipt.paymentDate).toLocaleDateString() : 'N/A'}</p>
            <p style="margin: 2px 0;"><strong>Payment Method:</strong> ${receipt.paymentMethod?.replace('_', ' ')?.toUpperCase() || 'CASH'}</p>
            <p style="margin: 2px 0;">
              <strong>Status:</strong> 
              <span style="color: ${
                receipt.status === 'paid' ? BRAND.colors.success :
                receipt.status === 'issued' ? BRAND.colors.warning :
                BRAND.colors.danger
              };">
                ${receipt.status?.toUpperCase() || 'ISSUED'}
              </span>
            </p>
          </div>
        </div>
        <div style="border: 1px solid #ddd; border-radius: 5px; overflow: hidden; margin-bottom: 20px;">
          <table style="width: 100%; border-collapse: collapse; font-size: 12px;">
            <thead style="background-color: ${BRAND.colors.primary}; color: white;">
              <tr>
                <th style="padding: 8px 12px; text-align: left; width: 45%;">Description</th>
                <th style="padding: 8px 12px; text-align: center; width: 10%;">Qty</th>
                <th style="padding: 8px 12px; text-align: right; width: 20%;">Unit Price</th>
                <th style="padding: 8px 12px; text-align: right; width: 25%;">Amount</th>
              </tr>
            </thead>
            <tbody>
              ${(receipt.items && receipt.items.length > 0 ? receipt.items : [{
                description: receipt.serviceDescription || (receipt.planName ? `${receipt.planName} - ${receipt.planSpeed}` : 'Internet Service'),
                quantity: 1,
                unitPrice: receipt.planPrice || receipt.total || 0,
                amount: receipt.total || 0
              }]).map(item => `
                <tr style="border-bottom: 1px solid #eee;">
                  <td style="padding: 8px 12px;">${item.description || 'Service'}</td>
                  <td style="padding: 8px 12px; text-align: center;">${item.quantity || 1}</td>
                  <td style="padding: 8px 12px; text-align: right;">Ksh ${formatPrice(item.unitPrice || 0)}</td>
                  <td style="padding: 8px 12px; text-align: right;">Ksh ${formatPrice(item.amount || 0)}</td>
                </tr>
              `).join('')}
            </tbody>
            <tfoot>
              <tr style="background-color: #f8f9fa; font-weight: bold;">
                <td colspan="3" style="padding: 8px 12px; text-align: right;">Subtotal:</td>
                <td style="padding: 8px 12px; text-align: right;">Ksh ${formatPrice(receipt.subtotal || receipt.total || 0)}</td>
              </tr>
              <tr style="background-color: #f8f9fa; font-weight: bold;">
                <td colspan="3" style="padding: 8px 12px; text-align: right;">Tax ( ${receipt.taxRate || 0}% ):</td>
                <td style="padding: 8px 12px; text-align: right;">Ksh ${formatPrice(receipt.taxAmount || 0)}</td>
              </tr>
              <tr style="background-color: #f8f9fa; font-weight: bold; border-top: 2px solid #333;">
                <td colspan="3" style="padding: 8px 12px; text-align: right;">TOTAL:</td>
                <td style="padding: 8px 12px; text-align: right;">Ksh ${formatPrice(receipt.total || 0)}</td>
              </tr>
              <tr style="background-color: #e8f5e8; font-weight: bold; color: ${BRAND.colors.success};">
                <td colspan="3" style="padding: 8px 12px; text-align: right;">AMOUNT PAID:</td>
                <td style="padding: 8px 12px; text-align: right;">Ksh ${formatPrice(receipt.amountPaid || 0)}</td>
              </tr>
              ${receipt.balance > 0 ? `
                <tr style="background-color: #ffe8e8; font-weight: bold; color: ${BRAND.colors.danger};">
                  <td colspan="3" style="padding: 8px 12px; text-align: right;">BALANCE DUE:</td>
                  <td style="padding: 8px 12px; text-align: right;">Ksh ${formatPrice(receipt.balance || 0)}</td>
                </tr>
              ` : ''}
            </tfoot>
          </table>
        </div>
        <div style="display: flex; justify-content: space-between; font-size: 11px;">
            <div style="flex: 1; padding-right: 20px;">
                <h3 style="font-size: 13px; font-weight: bold; color: #333; margin: 0 0 5px 0;">Notes:</h3>
                <p style="margin: 0; white-space: pre-wrap; line-height: 1.4;">${receipt.notes || 'N/A'}</p>
            </div>
            <div style="width: 220px;">
                <table style="width: 100%; border-collapse: collapse; font-size: 11px;">
                    <tr>
                        <td colspan="2" style="padding: 5px 0; font-size: 12px; font-weight: bold; text-align: center; background-color: #f8f9fa; border-bottom: 2px solid #333;">Payment Instructions</td>
                    </tr>
                    <tr>
                        <td style="padding: 5px 0; font-size: 11px; text-align: left; vertical-align: top;">
                            <p style="margin: 3px 0;"><strong>Bank:</strong> ${BRAND.contact.bank.name}</p>
                            <p style="margin: 3px 0;"><strong>Acc Name:</strong> ${BRAND.contact.bank.accountName}</p>
                            <p style="margin: 3px 0;"><strong>Acc No:</strong> ${BRAND.contact.bank.accountNumber}</p>
                        </td>
                        <td style="padding: 5px 0; font-size: 11px; text-align: left; vertical-align: top;">
                            <p style="margin: 3px 0;"><strong>Paybill:</strong> 123456</p>
                            <p style="margin: 3px 0;"><strong>Account:</strong> ${receipt.customerName?.split(' ')[0] || 'Customer'}</p>
                        </td>
                    </tr>
                </table>
            </div>
        </div>
        <div style="text-align: center; padding-top: 20px; border-top: 1px solid #ddd; color: #666; font-size: 10px;">
          <p style="margin: 5px 0;"><strong>Thank you for choosing ${BRAND.name}!</strong></p>
          <p style="margin: 5px 0;">For support: <a href="mailto:${BRAND.contact.email}" style="color: ${BRAND.colors.primary};">${BRAND.contact.email}</a> | <a href="tel:${BRAND.contact.phone}" style="color: ${BRAND.colors.primary};">${BRAND.contact.phone}</a></p>
          <p style="margin: 5px 0; font-size: 10px; color: #999;">Receipt generated on ${new Date().toLocaleString()}</p>
        </div>
      </div>
    `;

    document.body.appendChild(element);
    const opt = {
      margin: [10, 10, 10, 10],
      filename: `receipt-${receipt.receiptNumber || 'N/A'}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { 
        scale: 2, 
        useCORS: true, 
        allowTaint: true,
        windowWidth: 800, // Set a specific width to avoid dynamic viewport issues
        width: 800, // Explicitly set width for canvas
      },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    html2pdf().from(element).set(opt).save().then(() => {
      showNotification('✅ PDF generated successfully!', 'success');
    }).catch(err => {
      console.error('PDF error:', err);
      showNotification('❌ Failed to generate PDF', 'error');
    }).finally(() => {
      document.body.removeChild(element);
    });
  };

  // NEW: Function to send receipt as PDF via email
  const sendReceiptToClient = async (receipt) => {
    try {
      setSendingReceipt(receipt._id);
      const customerEmail = receipt.customerEmail?.trim();
      if (!customerEmail) {
        showNotification('⚠️ Customer email address not available', 'warning');
        return;
      }
      // Generate the PDF content in memory (without saving)
      const element = document.createElement('div');
      element.innerHTML = `
        <div id="receipt-pdf" style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 20px; max-width: 800px; margin: 0 auto; background: white; color: #333; font-size: 12px;">
          <div style="display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 3px solid ${BRAND.colors.primary}; padding-bottom: 15px; margin-bottom: 20px;">
            <div>
              <h1 style="font-size: 22px; font-weight: bold; color: ${BRAND.colors.primary}; margin: 0;">${BRAND.name}</h1>
              <p style="font-size: 11px; color: #666; margin: 5px 0 0 0;">${BRAND.tagline}</p>
              <div style="font-size: 10px; color: #666; margin-top: 5px;">
                  <p style="margin: 0;">Email: ${BRAND.contact.email}</p>
                  <p style="margin: 0;">Phone: ${BRAND.contact.phone}</p>
              </div>
            </div>
            <div style="text-align: right; min-width: 130px;">
              <img src="${BRAND.logoUrl}" alt="${BRAND.name}" style="max-height: 50px; max-width: 90px; object-fit: contain; margin-bottom: 5px;" />
              <h1 style="font-size: 28px; font-weight: bold; color: ${BRAND.colors.accent}; margin: 0;">RECEIPT</h1>
              <p style="font-size: 14px; color: ${BRAND.colors.primary}; margin: 5px 0 0 0;">#${receipt.receiptNumber || 'N/A'}</p>
            </div>
          </div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 20px; border: 1px solid #eee; padding: 12px; border-radius: 5px;">
            <div style="flex: 1;">
              <h3 style="font-size: 13px; font-weight: bold; color: #333; margin: 0 0 5px 0; padding-bottom: 5px; border-bottom: 1px solid #eee;">Bill To:</h3>
              <p style="margin: 2px 0; line-height: 1.4;"><strong>${receipt.customerName || 'N/A'}</strong></p>
              <p style="margin: 2px 0; line-height: 1.4;">${receipt.customerEmail || 'N/A'}</p>
              <p style="margin: 2px 0; line-height: 1.4;">${receipt.customerPhone || 'N/A'}</p>
              <p style="margin: 2px 0; line-height: 1.4;">${receipt.customerLocation || receipt.customerAddress || 'N/A'}</p>
            </div>
            <div style="flex: 1; text-align: right;">
              <p style="margin: 2px 0;"><strong>Receipt Date:</strong> ${receipt.receiptDate ? new Date(receipt.receiptDate).toLocaleDateString() : 'N/A'}</p>
              <p style="margin: 2px 0;"><strong>Payment Date:</strong> ${receipt.paymentDate ? new Date(receipt.paymentDate).toLocaleDateString() : 'N/A'}</p>
              <p style="margin: 2px 0;"><strong>Payment Method:</strong> ${receipt.paymentMethod?.replace('_', ' ')?.toUpperCase() || 'CASH'}</p>
              <p style="margin: 2px 0;">
                <strong>Status:</strong> 
                <span style="color: ${
                  receipt.status === 'paid' ? BRAND.colors.success :
                  receipt.status === 'issued' ? BRAND.colors.warning :
                  BRAND.colors.danger
                };">
                  ${receipt.status?.toUpperCase() || 'ISSUED'}
                </span>
              </p>
            </div>
          </div>
          <div style="border: 1px solid #ddd; border-radius: 5px; overflow: hidden; margin-bottom: 20px;">
            <table style="width: 100%; border-collapse: collapse; font-size: 12px;">
              <thead style="background-color: ${BRAND.colors.primary}; color: white;">
                <tr>
                  <th style="padding: 8px 12px; text-align: left; width: 45%;">Description</th>
                  <th style="padding: 8px 12px; text-align: center; width: 10%;">Qty</th>
                  <th style="padding: 8px 12px; text-align: right; width: 20%;">Unit Price</th>
                  <th style="padding: 8px 12px; text-align: right; width: 25%;">Amount</th>
                </tr>
              </thead>
              <tbody>
                ${(receipt.items && receipt.items.length > 0 ? receipt.items : [{
                  description: receipt.serviceDescription || (receipt.planName ? `${receipt.planName} - ${receipt.planSpeed}` : 'Internet Service'),
                  quantity: 1,
                  unitPrice: receipt.planPrice || receipt.total || 0,
                  amount: receipt.total || 0
                }]).map(item => `
                  <tr style="border-bottom: 1px solid #eee;">
                    <td style="padding: 8px 12px;">${item.description || 'Service'}</td>
                    <td style="padding: 8px 12px; text-align: center;">${item.quantity || 1}</td>
                    <td style="padding: 8px 12px; text-align: right;">Ksh ${formatPrice(item.unitPrice || 0)}</td>
                    <td style="padding: 8px 12px; text-align: right;">Ksh ${formatPrice(item.amount || 0)}</td>
                  </tr>
                `).join('')}
              </tbody>
              <tfoot>
                <tr style="background-color: #f8f9fa; font-weight: bold;">
                  <td colspan="3" style="padding: 8px 12px; text-align: right;">Subtotal:</td>
                  <td style="padding: 8px 12px; text-align: right;">Ksh ${formatPrice(receipt.subtotal || receipt.total || 0)}</td>
                </tr>
                <tr style="background-color: #f8f9fa; font-weight: bold;">
                  <td colspan="3" style="padding: 8px 12px; text-align: right;">Tax ( ${receipt.taxRate || 0}% ):</td>
                  <td style="padding: 8px 12px; text-align: right;">Ksh ${formatPrice(receipt.taxAmount || 0)}</td>
                </tr>
                <tr style="background-color: #f8f9fa; font-weight: bold; border-top: 2px solid #333;">
                  <td colspan="3" style="padding: 8px 12px; text-align: right;">TOTAL:</td>
                  <td style="padding: 8px 12px; text-align: right;">Ksh ${formatPrice(receipt.total || 0)}</td>
                </tr>
                <tr style="background-color: #e8f5e8; font-weight: bold; color: ${BRAND.colors.success};">
                  <td colspan="3" style="padding: 8px 12px; text-align: right;">AMOUNT PAID:</td>
                  <td style="padding: 8px 12px; text-align: right;">Ksh ${formatPrice(receipt.amountPaid || 0)}</td>
                </tr>
                ${receipt.balance > 0 ? `
                  <tr style="background-color: #ffe8e8; font-weight: bold; color: ${BRAND.colors.danger};">
                    <td colspan="3" style="padding: 8px 12px; text-align: right;">BALANCE DUE:</td>
                    <td style="padding: 8px 12px; text-align: right;">Ksh ${formatPrice(receipt.balance || 0)}</td>
                  </tr>
                ` : ''}
              </tfoot>
            </table>
          </div>
          <div style="display: flex; justify-content: space-between; font-size: 11px;">
              <div style="flex: 1; padding-right: 20px;">
                  <h3 style="font-size: 13px; font-weight: bold; color: #333; margin: 0 0 5px 0;">Notes:</h3>
                  <p style="margin: 0; white-space: pre-wrap; line-height: 1.4;">${receipt.notes || 'N/A'}</p>
              </div>
              <div style="width: 220px;">
                  <table style="width: 100%; border-collapse: collapse; font-size: 11px;">
                      <tr>
                          <td colspan="2" style="padding: 5px 0; font-size: 12px; font-weight: bold; text-align: center; background-color: #f8f9fa; border-bottom: 2px solid #333;">Payment Instructions</td>
                      </tr>
                      <tr>
                          <td style="padding: 5px 0; font-size: 11px; text-align: left; vertical-align: top;">
                              <p style="margin: 3px 0;"><strong>Bank:</strong> ${BRAND.contact.bank.name}</p>
                              <p style="margin: 3px 0;"><strong>Acc Name:</strong> ${BRAND.contact.bank.accountName}</p>
                              <p style="margin: 3px 0;"><strong>Acc No:</strong> ${BRAND.contact.bank.accountNumber}</p>
                          </td>
                          <td style="padding: 5px 0; font-size: 11px; text-align: left; vertical-align: top;">
                              <p style="margin: 3px 0;"><strong>Paybill:</strong> 123456</p>
                              <p style="margin: 3px 0;"><strong>Account:</strong> ${receipt.customerName?.split(' ')[0] || 'Customer'}</p>
                          </td>
                      </tr>
                  </table>
              </div>
          </div>
          <div style="text-align: center; padding-top: 20px; border-top: 1px solid #ddd; color: #666; font-size: 10px;">
            <p style="margin: 5px 0;"><strong>Thank you for choosing ${BRAND.name}!</strong></p>
            <p style="margin: 5px 0;">For support: <a href="mailto:${BRAND.contact.email}" style="color: ${BRAND.colors.primary};">${BRAND.contact.email}</a> | <a href="tel:${BRAND.contact.phone}" style="color: ${BRAND.colors.primary};">${BRAND.contact.phone}</a></p>
            <p style="margin: 5px 0; font-size: 10px; color: #999;">Receipt generated on ${new Date().toLocaleString()}</p>
          </div>
        </div>
      `;

      document.body.appendChild(element);

      // Configure html2pdf options for PDF generation (without saving)
      const opt = {
        margin: [10, 10, 10, 10],
        filename: `receipt-${receipt.receiptNumber || 'N/A'}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { 
          scale: 2, 
          useCORS: true, 
          allowTaint: true,
          windowWidth: 800,
          width: 800,
        },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
      };

      // Generate the PDF as a blob
      const pdfBlob = await html2pdf().from(element).set(opt).outputPdf('blob');

      // Create a download link for the blob
      const url = URL.createObjectURL(pdfBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `receipt-${receipt.receiptNumber || 'N/A'}.pdf`;
      document.body.appendChild(a);
      a.click();

      // Clean up
      document.body.removeChild(element);
      URL.revokeObjectURL(url);

      showNotification('✅ PDF receipt downloaded. Please attach it to your email.', 'success');
      showNotification('📧 Please open your email client and attach the downloaded PDF to send to: ' + customerEmail, 'info');
    } catch (error) {
      console.error('Error generating PDF for sending:', error);
      showNotification(`🚨 Error: ${error.message}`, 'error');
    } finally {
      setSendingReceipt(null);
    }
  };

  // NEW: Updated function to export all receipts to Excel via backend API
  const exportReceiptsToExcel = async () => {
    try {
      setExportLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication session expired. Please log in again.');
      }

      const response = await fetch(`${API_BASE_URL}/api/receipts/export/excel`, {
        method: 'GET', // Or 'POST' if your backend expects it
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json' // Optional, but good practice
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
        // Try to read the error message from the response body
        let errorMessage = 'Failed to export Excel';
        try {
          const errorData = await response.json();
          if (errorData && errorData.message) {
            errorMessage = errorData.message;
          }
        } catch (e) {
          console.error("Error parsing error response JSON:", e);
          // If parsing fails, use the status text or default message
          errorMessage = response.statusText || errorMessage;
        }
        throw new Error(errorMessage);
      }
    } catch (error) {
      console.error('Error exporting to Excel:', error);
      showNotification(`🚨 Error exporting receipts to Excel: ${error.message}`, 'error');
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
      customerAddress: '',
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
      customerAddress: receipt.customerLocation || receipt.customerAddress || '',
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

  // Filter receipts
  const filteredReceipts = Array.isArray(receipts) 
    ? receipts.filter(receipt => {
        if (!receipt || typeof receipt !== 'object') return false;
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

  // ✅ REAL-TIME CHART DATA
  const prepareChartData = () => {
    if (!receipts || receipts.length === 0) return { statusData: [], revenueData: [], trendData: [] };

    const statusData = [
      { name: 'Paid', value: receipts.filter(r => r.status === 'paid').length, color: BRAND.colors.success },
      { name: 'Issued', value: receipts.filter(r => r.status === 'issued').length, color: BRAND.colors.warning },
      { name: 'Refunded', value: receipts.filter(r => r.status === 'refunded').length, color: BRAND.colors.danger }
    ];

    const now = new Date();
    const monthly = receipts.filter(r => {
      const date = new Date(r.receiptDate || r.createdAt);
      return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
    }).reduce((sum, r) => sum + (r.total || 0), 0);

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
      { name: 'Monthly', value: monthly },
      { name: 'Quarterly', value: quarterly },
      { name: 'Annually', value: annually }
    ];

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
            Generate, manage, and track customer receipts - Total: {receipts.length} receipts
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
              setShowCreateModal(true);
            }}
            className={`${themeClasses.button.primary.base} ${darkMode ? themeClasses.button.primary.dark : themeClasses.button.primary.light} flex items-center`}
          >
            <Plus size={16} className="mr-1.5" /> New Receipt
          </button>
        </div>
      </div>

      {/* ✅ REAL-TIME ANALYTICS CHARTS */}
      {receipts.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div className={`${themeClasses.card} p-4 rounded-xl border backdrop-blur-sm`}>
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <Receipt size={18} className="mr-2" /> Receipt Status
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
              <DollarSign size={18} className="mr-2" /> Revenue Overview
            </h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis tickFormatter={(value) => `Ksh ${formatPrice(value)}`} />
                <Tooltip formatter={(value) => [`Ksh ${formatPrice(value)}`, '']} />
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
                <Tooltip formatter={(value) => [`Ksh ${formatPrice(value)}`, '']} />
                <Legend />
                <Line type="monotone" dataKey="revenue" stroke="#FFCC00" strokeWidth={3} dot={{ fill: '#003366', strokeWidth: 2, r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Search */}
      <div className={`${themeClasses.card} p-4 mb-6 rounded-xl shadow-sm border backdrop-blur-sm`}>
        <div className="relative">
          <Search size={18} className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
          <input
            type="text"
            placeholder="Search by customer name, receipt number, invoice number, email, or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`w-full pl-10 pr-4 py-2 border rounded-lg text-sm ${themeClasses.input}`}
          />
        </div>
      </div>

      {/* Receipts Table */}
      <div className={`${themeClasses.card} rounded-xl shadow-lg border backdrop-blur-sm overflow-hidden`}>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider">Receipt #</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider hidden md:table-cell">Customer</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider hidden lg:table-cell">Invoice #</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider hidden md:table-cell">Status</th>
                <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider">Actions</th>
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
                        Ksh {formatPrice(receipt.total || 0)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap hidden md:table-cell">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        receipt.status === 'paid' 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                          : receipt.status === 'issued'
                          ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
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
                          title="Send to Client (Downloads PDF)"
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

      {/* ALL YOUR MODALS REMAIN EXACTLY AS IN YOUR ORIGINAL FILE — NO CHANGES MADE TO MODAL LOGIC */}
      {/* Create/Edit Modal */}
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
                    <strong>Address:</strong> {selectedReceipt.customerLocation || selectedReceipt.customerAddress || 'N/A'}
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
                      {(selectedReceipt.items || [{ description: 'Internet Service', quantity: 1, unitPrice: selectedReceipt.total || 0, amount: selectedReceipt.total || 0 }]).map((item, index) => (
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
                        <td className="px-4 py-2 text-sm font-bold text-right text-green-600">Ksh {formatPrice(selectedReceipt.amountPaid || 0)}</td>
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
                  {sendingReceipt === selectedReceipt._id ? 'Sending...' : 'Send to Client (PDF)'}
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
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">RECEIPT</h2>
                  <p className="text-gray-600 dark:text-gray-400">Receipt #: {selectedReceipt.receiptNumber}</p>
                </div>
                <div className="grid grid-cols-2 gap-8 mb-6">
                  <div>
                    <h3 className="font-semibold mb-2">Bill To:</h3>
                    <p>{selectedReceipt.customerName}</p>
                    <p>{selectedReceipt.customerEmail}</p>
                    <p>{selectedReceipt.customerPhone}</p>
                    <p>{selectedReceipt.customerLocation || selectedReceipt.customerAddress}</p>
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
                  {sendingReceipt === selectedReceipt._id ? 'Sending...' : 'Send to Client (PDF)'}
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