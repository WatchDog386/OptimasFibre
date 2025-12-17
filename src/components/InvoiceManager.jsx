// InvoiceManager.jsx - FULLY UPDATED: sendInvoiceToClient now uses backend API for automatic PDF emailing from support@optimaswifi.co.ke
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
  Loader2
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, LabelList,
  LineChart, Line, ReferenceLine
} from 'recharts';

// Utility function for consistent price formatting in KSH
const formatPrice = (price) => {
  if (price === undefined || price === null) return '0.00';
  const num = parseFloat(price);
  return isNaN(num) ? price : num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

// WiFi Plans data
const WIFI_PLANS = [
  { id: 1, name: "Jumbo", price: "1499", speed: "8Mbps", features: ["Great for browsing", "24/7 Support", "Free Installation"], type: "home", popular: false },
  { id: 2, name: "Buffalo", price: "1999", speed: "15Mbps", features: ["Streaming & Social Media", "24/7 Support", "Free Installation"], type: "home", popular: false },
  { id: 3, name: "Ndovu", price: "2499", speed: "25Mbps", features: ["Work from Home", "Streaming", "24/7 Support", "Free Installation"], type: "home", popular: false },
  { id: 4, name: "Gazzelle", price: "2999", speed: "30Mbps", features: ["Multiple Devices", "Low Latency", "24/7 Support", "Free Installation"], type: "home", popular: true },
  { id: 5, name: "Tiger", price: "3999", speed: "40Mbps", features: ["Heavy Streaming", "Gaming Ready", "24/7 Support", "Free Installation"], type: "home", popular: false },
  { id: 6, name: "Chui", price: "4999", speed: "60Mbps", features: ["High-Speed Everything", "Gaming & 4K", "24/7 Support", "Free Installation"], type: "home", popular: false },
];

// Brand info — ✅ FIXED EMAIL DOMAIN
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
  paybill: "123456"
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
  taxRate: 0,
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
  terms: 'Payment due within 30 days. Late payments subject to fees.',
  billingCycle: 'monthly'
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
  const [sendingEmail, setSendingEmail] = useState(false);
  const [emailTestStatus, setEmailTestStatus] = useState(null);

  const resetForm = () => {
    setInvoiceForm(initialFormState);
    setWhatsappText('');
  };

  const calculateTotals = (items, taxRate = 0, discount = 0, discountType = 'none') => {
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

  // Test email configuration on component mount
  const testEmailConfiguration = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      const response = await fetch(`${API_BASE_URL}/api/invoices/test-email`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const result = await response.json();
      setEmailTestStatus(result.success ? '✅ Email system ready' : '❌ Email system not configured');
      if (!result.success) {
        console.warn('Email test failed:', result);
      }
    } catch (error) {
      console.log('Email test not available or skipped');
      setEmailTestStatus('⚠️ Email test not available');
    }
  };

  useEffect(() => {
    if (!invoices || invoices.length === 0) {
      fetchInvoices();
    } else {
      setLoading(false);
    }
    // Test email configuration on load
    testEmailConfiguration();
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

    const { subtotal, taxAmount, totalAmount } = calculateTotals(
      items, 
      invoiceForm.taxRate, 
      invoiceForm.discount, 
      invoiceForm.discountType
    );

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
    const { subtotal, taxAmount, totalAmount } = calculateTotals(
      items, 
      invoiceForm.taxRate, 
      invoiceForm.discount, 
      invoiceForm.discountType
    );
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
      if (!invoiceToPay) throw new Error('Invoice not found in local state.');
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
      if (!token) throw new Error('Authentication session expired. Please log in again.');
      if (!invoiceForm.customerName?.trim() || !invoiceForm.customerEmail?.trim() || !invoiceForm.planName?.trim()) {
        let missingFields = [];
        if (!invoiceForm.customerName?.trim()) missingFields.push('Customer Name');
        if (!invoiceForm.customerEmail?.trim()) missingFields.push('Customer Email');
        if (!invoiceForm.planName?.trim()) missingFields.push('Plan Name');
        const errorMessage = `⚠️ Missing required fields: ${missingFields.join(', ')}. Please fill them before creating the invoice.`;
        showNotification(errorMessage, 'warning');
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
        const savedInvoice = newInvoice.invoice || newInvoice.data || newInvoice;
        if (!savedInvoice.invoiceNumber) {
          savedInvoice.invoiceNumber = generateInvoiceNumber();
        }
        setInvoices(prev => [...prev, savedInvoice]);
        setShowCreateModal(false);
        resetForm();
        showNotification('✅ Invoice created successfully!', 'success');
      } else {
        const errorData = await response.json();
        const errorMessage = errorData.message || 
          (errorData.errors && errorData.errors.join(', ')) || 
          'Failed to create invoice';
        throw new Error(errorMessage);
      }
    } catch (error) {
      console.error('Error creating invoice:', error);
      showNotification(`🚨 Error: ${error.message}`, 'error');
    }
  };

  const updateInvoice = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Authentication session expired. Please log in again.');
      if (!invoiceForm.customerName?.trim() || !invoiceForm.customerEmail?.trim() || !invoiceForm.planName?.trim()) {
        let missingFields = [];
        if (!invoiceForm.customerName?.trim()) missingFields.push('Customer Name');
        if (!invoiceForm.customerEmail?.trim()) missingFields.push('Customer Email');
        if (!invoiceForm.planName?.trim()) missingFields.push('Plan Name');
        const errorMessage = `⚠️ Missing required fields: ${missingFields.join(', ')}. Please fill them before updating the invoice.`;
        showNotification(errorMessage, 'warning');
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
        showNotification('✅ Invoice updated successfully!', 'success');
      } else {
        const errorData = await response.json();
        const errorMessage = errorData.message || 
          (errorData.errors && errorData.errors.join(', ')) || 
          'Failed to update invoice';
        throw new Error(errorMessage);
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
      if (!token) throw new Error('Authentication session expired. Please log in again.');
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

  // ✅ IMPROVED: Send invoice via backend API with better error handling
  const sendInvoiceToClient = async (invoice) => {
    // Validate presence of customer email
    if (!invoice.customerEmail?.trim()) {
      showNotification('⚠️ Cannot send: Customer email is required.', 'warning');
      return;
    }
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(invoice.customerEmail.trim())) {
      showNotification('⚠️ Cannot send: Invalid email format.', 'warning');
      return;
    }
    // Validate invoice has been saved (has _id)
    if (!invoice._id) {
      showNotification('⚠️ Cannot send: Save the invoice first.', 'warning');
      return;
    }
    // Show confirmation dialog
    if (!window.confirm(`Send invoice ${invoice.invoiceNumber || invoice._id.substring(0, 8)} to ${invoice.customerEmail}?`)) {
      return;
    }
    try {
      setSendingInvoice(invoice._id);
      setSendingEmail(true);
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication session expired. Please log in again.');
      }
      console.log(`📧 Sending invoice ${invoice.invoiceNumber || invoice._id} to ${invoice.customerEmail}`);
      const response = await fetch(`${API_BASE_URL}/api/invoices/${invoice._id}/send`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      const result = await response.json();
      if (response.ok && result.success) {
        console.log('✅ Email sent successfully:', result);
        // Update local state to reflect sent status
        setInvoices(prev => prev.map(inv => 
          inv._id === invoice._id 
            ? { 
                ...inv, 
                sentToCustomer: true,
                lastSentAt: new Date().toISOString(),
                sendCount: (inv.sendCount || 0) + 1
              } 
            : inv
        ));
        showNotification(`✅ Invoice sent to ${invoice.customerEmail}! Check your inbox.`, 'success');
        // Show success details
        if (result.emailInfo?.messageId) {
          console.log('📨 Message ID:', result.emailInfo.messageId);
        }
      } else {
        console.error('❌ Email sending failed:', result);
        // Enhanced error messages
        let errorMessage = 'Failed to send invoice email';
        let errorDetails = '';
        if (response.status === 404) {
          errorMessage = 'Email service endpoint not found';
          errorDetails = 'The server may not have email functionality configured';
        } else if (response.status === 500) {
          errorMessage = 'Server error when sending email';
          errorDetails = 'Email server configuration may be incorrect';
        } else if (result.error?.includes('EAUTH')) {
          errorMessage = 'Email authentication failed';
          errorDetails = 'Check email username and password in server settings';
        } else if (result.error?.includes('ECONNECTION') || result.error?.includes('ESOCKET')) {
          errorMessage = 'Cannot connect to email server';
          errorDetails = 'Check SMTP host/port and internet connection';
        } else if (result.error?.includes('ETIMEDOUT')) {
          errorMessage = 'Email server timeout';
          errorDetails = 'Server is not responding. Try again later';
        } else if (result.message) {
          errorMessage = result.message;
          errorDetails = result.suggestion || 'Please check server configuration';
        }
        showNotification(`🚨 ${errorMessage}`, 'error');
        // Log detailed error for debugging
        if (errorDetails) {
          console.log('Error details:', errorDetails);
        }
      }
    } catch (error) {
      console.error('❌ Network error sending invoice:', error);
      let errorMessage = 'Network error when sending email';
      if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
        errorMessage = 'Cannot reach server. Check your internet connection.';
      } else if (error.message.includes('auth') || error.message.includes('token')) {
        errorMessage = 'Authentication failed. Please log in again.';
      }
      showNotification(`🚨 ${errorMessage}`, 'error');
    } finally {
      setSendingInvoice(null);
      setSendingEmail(false);
    }
  };

  const exportInvoicesToExcel = async () => {
    try {
      setExportLoading(true);
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Authentication session expired. Please log in again.');
      const response = await fetch(`${API_BASE_URL}/api/invoices/export/excel`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to export Excel: ${response.status} ${response.statusText}`);
      }
      const blob = await response.blob();
      const disposition = response.headers.get('Content-Disposition');
      let filename = `invoices-${new Date().toISOString().split('T')[0]}.xlsx`;
      if (disposition && disposition.includes('filename=')) {
        const filenameMatch = disposition.match(/filename[^;=\s]*=((['"])((?:(?!\2|\\|\s)).)*?\2|([^;\s]*))/);
        if (filenameMatch && filenameMatch[3]) filename = filenameMatch[3];
        else if (filenameMatch && filenameMatch[5]) filename = filenameMatch[5];
      }
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      showNotification('✅ Invoices exported to Excel successfully!', 'success');
    } catch (error) {
      console.error('Error exporting to Excel:', error);
      showNotification(`🚨 Error exporting invoices to Excel: ${error.message}`, 'error');
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
      taxRate: invoice.taxRate || 0,
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
      terms: invoice.terms || 'Payment due within 30 days. Late payments subject to fees.',
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
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold mb-2 bg-gradient-to-r from-[#003366] to-[#FFCC00] bg-clip-text text-transparent">
            Invoice Management
          </h2>
          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Create, manage, and track customer invoices - Total: {invoices.length} invoices
            {emailTestStatus && (
              <span className={`ml-2 text-xs px-2 py-1 rounded ${emailTestStatus.includes('✅') ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'}`}>
                {emailTestStatus}
              </span>
            )}
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
      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className={`${themeClasses.card} p-4 rounded-xl border backdrop-blur-sm`}>
          <h3 className="text-lg font-semibold mb-4">Invoice Status</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={statusData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={5}
                dataKey="value"
                nameKey="name"
                labelLine={false}
                label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
              >
                {statusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => `Count: ${value}`} />
              <Legend layout="horizontal" verticalAlign="bottom" align="center" iconType="circle" />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className={`${themeClasses.card} p-4 rounded-xl border backdrop-blur-sm`}>
          <h3 className="text-lg font-semibold mb-4">Revenue by Billing Cycle</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={revenueData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" stroke={darkMode ? '#9ca3af' : '#374151'} tickLine={false} />
              <YAxis 
                stroke={darkMode ? '#9ca3af' : '#374151'} 
                tickFormatter={(value) => `Ksh ${formatPrice(value).split('.')[0]}`} 
                tickLine={false}
                axisLine={false}
              />
              <Tooltip 
                formatter={(value) => [`Ksh ${formatPrice(value)}`, 'Revenue']} 
                labelFormatter={(name) => name}
                contentStyle={{ 
                  backgroundColor: darkMode ? '#1f2937' : '#fff', 
                  border: '1px solid #4b5563', 
                  borderRadius: '5px' 
                }}
              />
              <Bar dataKey="value" fill="#003366" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className={`${themeClasses.card} p-4 rounded-xl border backdrop-blur-sm`}>
          <h3 className="text-lg font-semibold mb-4">Revenue Trend (Last {timeSeriesData.length} periods)</h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={timeSeriesData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="date" stroke={darkMode ? '#9ca3af' : '#374151'} tickLine={false} />
              <YAxis 
                stroke={darkMode ? '#9ca3af' : '#374151'} 
                tickFormatter={(value) => `Ksh ${formatPrice(value).split('.')[0]}`} 
                tickLine={false}
                axisLine={false}
              />
              <Tooltip 
                formatter={(value) => [`Ksh ${formatPrice(value)}`, 'Revenue']}
                labelFormatter={(date) => `Period: ${date}`}
                contentStyle={{ 
                  backgroundColor: darkMode ? '#1f2937' : '#fff', 
                  border: '1px solid #4b5563', 
                  borderRadius: '5px' 
                }}
              />
              <Line 
                type="monotone" 
                dataKey="amount" 
                stroke="#FFCC00" 
                strokeWidth={3} 
                dot={{ stroke: '#003366', strokeWidth: 2, r: 4 }} 
                activeDot={{ r: 8 }} 
              />
              <ReferenceLine 
                y={stats.totalRevenue / timeSeriesData.length} 
                stroke="#003366" 
                strokeDasharray="3 3" 
                label={{ 
                  position: 'right', 
                  value: 'Avg', 
                  fill: '#003366', 
                  fontSize: 12 
                }} 
              />
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
                placeholder="Search by customer name, invoice number, email, or phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full pl-10 pr-4 py-2 border rounded-lg text-sm transition-all duration-200 focus:ring-2 focus:ring-[#003366] focus:border-transparent ${themeClasses.input}`}
              />
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                filter === 'all' 
                  ? (darkMode ? 'bg-[#003366] text-white shadow-md' : 'bg-[#003366] text-white shadow-md')
                  : (darkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200')
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter('paid')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center ${
                filter === 'paid' 
                  ? (darkMode ? 'bg-green-600 text-white shadow-md' : 'bg-green-600 text-white shadow-md')
                  : (darkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200')
              }`}
            >
              <CheckCircle size={16} className="mr-1.5" />
              Paid
            </button>
            <button
              onClick={() => setFilter('pending')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center ${
                filter === 'pending' 
                  ? (darkMode ? 'bg-yellow-600 text-white shadow-md' : 'bg-yellow-600 text-white shadow-md')
                  : (darkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200')
              }`}
            >
              <Clock size={16} className="mr-1.5" />
              Pending
            </button>
            <button
              onClick={() => setFilter('overdue')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center ${
                filter === 'overdue' 
                  ? (darkMode ? 'bg-red-600 text-white shadow-md' : 'bg-red-600 text-white shadow-md')
                  : (darkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200')
              }`}
            >
              <AlertCircle size={16} className="mr-1.5" />
              Overdue
            </button>
          </div>
        </div>
      </div>
      {/* Invoices Table */}
      <div className={`${themeClasses.card} rounded-xl shadow-lg border backdrop-blur-sm overflow-hidden`}>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider">Invoice #</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider hidden md:table-cell">Customer</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider hidden lg:table-cell">Plan/Details</th>
                <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider">Total Amount</th>
                <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider hidden sm:table-cell">Balance</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${darkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
              {filteredInvoices.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-8 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <FileText size={48} className={`mb-4 ${darkMode ? 'text-gray-600' : 'text-gray-400'}`} />
                      <p className={`text-lg font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        {Array.isArray(invoices) && invoices.length === 0 ? 'No invoices available' : 'No invoices match your search'}
                      </p>
                      <p className={`text-sm ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                        {searchTerm || filter !== 'all' ? 'Try adjusting your search or filter' : 'Create your first invoice to get started'}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredInvoices.map((invoice) => (
                  <tr key={invoice._id} className={`${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}`}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          {invoice.invoiceNumber || `INV-${invoice._id?.substring(0,4) || 'N/A'}`}
                        </div>
                        <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          Due: {invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString() : 'N/A'}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap hidden md:table-cell">
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          {invoice.customerName || 'N/A'}
                        </div>
                        <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          {invoice.customerEmail || 'N/A'}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap hidden lg:table-cell">
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          {invoice.planName || 'N/A'}
                        </div>
                        <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          {invoice.planSpeed || 'N/A'}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        Ksh {formatPrice(invoice.totalAmount || invoice.planPrice || 0)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right hidden sm:table-cell">
                      <div className={`text-sm font-semibold ${invoice.balanceDue > 0 ? 'text-red-500' : 'text-green-500'}`}>
                        Ksh {formatPrice(invoice.balanceDue || 0)}
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
                          : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                      }`}>
                        {invoice.status === 'paid' ? (
                          <>
                            <CheckCircle size={12} className="mr-1" />
                            Paid
                          </>
                        ) : invoice.status === 'pending' ? (
                          <>
                            <Clock size={12} className="mr-1" />
                            Pending
                          </>
                        ) : invoice.status === 'overdue' ? (
                          <>
                            <AlertCircle size={12} className="mr-1" />
                            Overdue
                          </>
                        ) : (
                          <>
                            <XCircle size={12} className="mr-1" />
                            {invoice.status || 'Pending'}
                          </>
                        )}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-1">
                        <button
                          onClick={() => viewInvoice(invoice)}
                          className={`p-2 rounded-lg ${darkMode ? 'text-gray-400 hover:bg-gray-600' : 'text-gray-600 hover:bg-gray-100'} transition-colors`}
                          title="View Details"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          onClick={() => editInvoice(invoice)}
                          className={`p-2 rounded-lg ${darkMode ? 'text-yellow-400 hover:bg-gray-600' : 'text-yellow-600 hover:bg-gray-100'} transition-colors`}
                          title="Edit Invoice"
                        >
                          <Edit size={16} />
                        </button>
                        {/* ✅ Send Invoice Button with Enhanced Loading State */}
                        <button
                          onClick={() => sendInvoiceToClient(invoice)}
                          disabled={sendingInvoice === invoice._id}
                          className={`p-2 rounded-lg flex items-center justify-center w-8 h-8 ${darkMode ? 'text-green-400 hover:bg-gray-600' : 'text-green-600 hover:bg-gray-100'} transition-colors ${
                            sendingInvoice === invoice._id ? 'opacity-50 cursor-not-allowed' : ''
                          }`}
                          title="Send to Client (Email with PDF)"
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
                            className={`p-2 rounded-lg ${darkMode ? 'text-blue-400 hover:bg-gray-600' : 'text-blue-600 hover:bg-gray-100'} transition-colors`}
                            title="Mark as Paid"
                          >
                            <CreditCard size={16} />
                          </button>
                        )}
                        <button
                          onClick={() => deleteInvoice(invoice._id)}
                          className={`p-2 rounded-lg ${darkMode ? 'text-red-400 hover:bg-gray-600' : 'text-red-600 hover:bg-gray-100'} transition-colors`}
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
      {/* Paste WhatsApp Modal */}
      {showPasteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className={`${themeClasses.card} rounded-xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto`}>
            <div className="flex justify-between items-center border-b p-4">
              <h3 className="text-xl font-semibold">Paste WhatsApp Message</h3>
              <button
                onClick={() => setShowPasteModal(false)}
                className={`p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700`}
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-4">
              <p className="mb-4 text-sm">
                Paste the WhatsApp message below to automatically populate the invoice form:
              </p>
              <textarea
                value={whatsappText}
                onChange={(e) => setWhatsappText(e.target.value)}
                placeholder={`Example:\nName: John Doe\nPhone: +254712345678\nLocation: Nairobi\nEmail: john@example.com\nPlan: Gazzelle\nSpeed: 30Mbps\nPrice: Ksh 2999`}
                className={`w-full h-48 p-3 border rounded-lg resize-none ${themeClasses.input}`}
              />
              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => setShowPasteModal(false)}
                  className={`px-4 py-2 rounded-lg ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'} transition-colors`}
                >
                  Cancel
                </button>
                <button
                  onClick={parseAndPopulateFromWhatsApp}
                  className={`px-4 py-2 rounded-lg ${darkMode ? 'bg-[#003366] hover:bg-[#002244] text-white' : 'bg-[#003366] hover:bg-[#002244] text-white'} transition-colors`}
                  disabled={!whatsappText.trim()}
                >
                  Populate Form
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Create/Edit Invoice Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className={`${themeClasses.card} rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto`}>
            <div className="flex justify-between items-center border-b p-4">
              <h3 className="text-xl font-semibold">
                {editingInvoice ? 'Edit Invoice' : 'Create New Invoice'}
              </h3>
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setEditingInvoice(null);
                  resetForm();
                }}
                className={`p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700`}
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium mb-1">Invoice Number</label>
                  <input
                    type="text"
                    name="invoiceNumber"
                    value={invoiceForm.invoiceNumber}
                    onChange={handleInputChange}
                    className={`w-full p-2 border rounded ${themeClasses.input}`}
                    placeholder="Auto-generated"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Invoice Date</label>
                  <input
                    type="date"
                    name="invoiceDate"
                    value={invoiceForm.invoiceDate}
                    onChange={handleInputChange}
                    className={`w-full p-2 border rounded ${themeClasses.input}`}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Customer Name *</label>
                  <input
                    type="text"
                    name="customerName"
                    value={invoiceForm.customerName}
                    onChange={handleInputChange}
                    className={`w-full p-2 border rounded ${themeClasses.input}`}
                    placeholder="Full name"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Customer Email *</label>
                  <input
                    type="email"
                    name="customerEmail"
                    value={invoiceForm.customerEmail}
                    onChange={handleInputChange}
                    className={`w-full p-2 border rounded ${themeClasses.input}`}
                    placeholder="email@example.com"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Customer Phone</label>
                  <input
                    type="text"
                    name="customerPhone"
                    value={invoiceForm.customerPhone}
                    onChange={handleInputChange}
                    className={`w-full p-2 border rounded ${themeClasses.input}`}
                    placeholder="+254712345678"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Customer Location</label>
                  <input
                    type="text"
                    name="customerLocation"
                    value={invoiceForm.customerLocation}
                    onChange={handleInputChange}
                    className={`w-full p-2 border rounded ${themeClasses.input}`}
                    placeholder="Nairobi, Kenya"
                  />
                </div>
                <div className="md:col-span-2">
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-sm font-medium">Select Plan *</label>
                    <button
                      type="button"
                      onClick={() => setShowPlanSelection(true)}
                      className={`text-sm ${darkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-800'} flex items-center`}
                    >
                      <Wifi size={14} className="mr-1" />
                      Browse Plans
                    </button>
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      name="planName"
                      value={invoiceForm.planName}
                      onChange={handleInputChange}
                      className={`flex-1 p-2 border rounded ${themeClasses.input}`}
                      placeholder="Plan name"
                      required
                    />
                    <input
                      type="text"
                      name="planSpeed"
                      value={invoiceForm.planSpeed}
                      onChange={handleInputChange}
                      className={`w-32 p-2 border rounded ${themeClasses.input}`}
                      placeholder="Speed"
                    />
                    <input
                      type="number"
                      name="planPrice"
                      value={invoiceForm.planPrice}
                      onChange={handleInputChange}
                      className={`w-32 p-2 border rounded ${themeClasses.input}`}
                      placeholder="Price"
                      step="0.01"
                    />
                  </div>
                </div>
              </div>
              {/* Items Table */}
              <div className="mb-6">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="text-lg font-medium">Items</h4>
                  <button
                    type="button"
                    onClick={addItem}
                    className={`px-3 py-1 text-sm rounded ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'}`}
                  >
                    + Add Item
                  </button>
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
                          <td className="px-4 py-2">
                            <input
                              type="text"
                              value={item.description}
                              onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                              className={`w-full p-1 border rounded ${themeClasses.input}`}
                              placeholder="Item description"
                            />
                          </td>
                          <td className="px-4 py-2">
                            <input
                              type="number"
                              value={item.quantity}
                              onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                              className={`w-full p-1 border rounded ${themeClasses.input}`}
                              min="1"
                              step="1"
                            />
                          </td>
                          <td className="px-4 py-2">
                            <input
                              type="number"
                              value={item.unitPrice}
                              onChange={(e) => handleItemChange(index, 'unitPrice', e.target.value)}
                              className={`w-full p-1 border rounded ${themeClasses.input}`}
                              step="0.01"
                              placeholder="0.00"
                            />
                          </td>
                          <td className="px-4 py-2">
                            <div className="p-1">
                              Ksh {formatPrice(item.amount)}
                            </div>
                          </td>
                          <td className="px-4 py-2">
                            {invoiceForm.items.length > 1 && (
                              <button
                                type="button"
                                onClick={() => removeItem(index)}
                                className={`p-1 rounded ${darkMode ? 'text-red-400 hover:bg-gray-700' : 'text-red-600 hover:bg-gray-100'}`}
                              >
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
              {/* Summary Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-1">Notes</label>
                    <textarea
                      name="notes"
                      value={invoiceForm.notes}
                      onChange={handleInputChange}
                      className={`w-full p-2 border rounded h-24 resize-none ${themeClasses.input}`}
                      placeholder="Additional notes for the customer..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Terms & Conditions</label>
                    <textarea
                      name="terms"
                      value={invoiceForm.terms}
                      onChange={handleInputChange}
                      className={`w-full p-2 border rounded h-24 resize-none ${themeClasses.input}`}
                    />
                  </div>
                </div>
                <div>
                  <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
                    <h4 className="text-lg font-medium mb-3">Summary</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Subtotal:</span>
                        <span className="font-medium">Ksh {formatPrice(invoiceForm.subtotal)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Tax ({invoiceForm.taxRate}%):</span>
                        <span className="font-medium">Ksh {formatPrice(invoiceForm.taxAmount)}</span>
                      </div>
                      <div className="flex justify-between border-t pt-2">
                        <span className="font-semibold">Total Amount:</span>
                        <span className="font-bold text-lg">Ksh {formatPrice(invoiceForm.totalAmount)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Amount Paid:</span>
                        <input
                          type="number"
                          name="amountPaid"
                          value={invoiceForm.amountPaid}
                          onChange={handleInputChange}
                          className={`w-32 p-1 border rounded text-right ${themeClasses.input}`}
                          step="0.01"
                          placeholder="0.00"
                        />
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
              {/* Form Actions */}
              <div className="flex justify-end gap-3 mt-8 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    setEditingInvoice(null);
                    resetForm();
                  }}
                  className={`px-4 py-2 rounded-lg ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'} transition-colors`}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={editingInvoice ? updateInvoice : createInvoice}
                  className={`px-6 py-2 rounded-lg ${darkMode ? 'bg-[#003366] hover:bg-[#002244] text-white' : 'bg-[#003366] hover:bg-[#002244] text-white'} transition-colors`}
                >
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
              <button
                onClick={() => setShowPlanSelection(false)}
                className={`p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700`}
              >
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
                    } ${
                      darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                    }`}
                    onClick={() => selectPlan(plan)}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="text-lg font-bold">{plan.name}</h4>
                        <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          {plan.speed}
                        </p>
                      </div>
                      {plan.popular && (
                        <span className="px-2 py-1 text-xs font-bold bg-[#FFCC00] text-black rounded-full">
                          POPULAR
                        </span>
                      )}
                    </div>
                    <div className="mb-4">
                      <div className="text-2xl font-bold text-[#003366]">
                        Ksh {plan.price}
                        <span className="text-sm font-normal text-gray-500">/month</span>
                      </div>
                    </div>
                    <ul className="space-y-2 mb-4">
                      {plan.features.map((feature, idx) => (
                        <li key={idx} className="flex items-center text-sm">
                          <CheckCircle size={14} className="mr-2 text-green-500" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                    <button
                      className={`w-full py-2 rounded-lg font-medium ${
                        darkMode 
                          ? 'bg-[#003366] hover:bg-[#002244] text-white' 
                          : 'bg-[#003366] hover:bg-[#002244] text-white'
                      }`}
                    >
                      Select Plan
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InvoiceManager;