// InvoiceManager.jsx - FINAL UPDATED VERSION WITH FIXED LAYOUT, LOGO, CORRECT API URL, WHATSAPP PASTE, PLAN VALIDATION, AND REPOSITIONED NOTIFICATIONS
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
  Share2,
  ClipboardPaste, // Added for the new feature
  AlertTriangle // Added for warning icon
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
  if (price === undefined || price === null) return '0.00';
  // Ensure the price is treated as a number for proper formatting
  const num = parseFloat(price);
  return isNaN(num) ? price : num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};
// WiFi Plans data from your wifiplans.jsx
const WIFI_PLANS = [
  { 
    id: 1, 
    name: "Jumbo", 
    price: "1499", 
    speed: "8Mbps", 
    features: ["Great for browsing", "24/7 Support", "Free Installation"], 
    type: "home", 
    popular: false 
  },
  { 
    id: 2, 
    name: "Buffalo", 
    price: "1999", 
    speed: "15Mbps", 
    features: ["Streaming & Social Media", "24/7 Support", "Free Installation"], 
    type: "home", 
    popular: false 
  },
  { 
    id: 3, 
    name: "Ndovu", 
    price: "2499", 
    speed: "25Mbps", 
    features: ["Work from Home", "Streaming", "24/7 Support", "Free Installation"], 
    type: "home", 
    popular: false 
  },
  { 
    id: 4, 
    name: "Gazzelle", 
    price: "2999", 
    speed: "30Mbps", 
    features: ["Multiple Devices", "Low Latency", "24/7 Support", "Free Installation"], 
    type: "home", 
    popular: true 
  },
  { 
    id: 5, 
    name: "Tiger", 
    price: "3999", 
    speed: "40Mbps", 
    features: ["Heavy Streaming", "Gaming Ready", "24/7 Support", "Free Installation"], 
    type: "home", 
    popular: false 
  },
  { 
    id: 6, 
    name: "Chui", 
    price: "4999", 
    speed: "60Mbps", 
    features: ["High-Speed Everything", "Gaming & 4K", "24/7 Support", "Free Installation"], 
    type: "home", 
    popular: false 
  },
];
// Mock company info to match wifiplans.jsx
const COMPANY_INFO = {
  name: "OPTIMAS FIBER",
  tagline: "High-Speed Internet Solutions",
  logoUrl: "/oppo.jpg", // Corrected path to logo in public folder
  bankName: "Equity Bank",
  accountName: "Optimas Fiber Ltd",
  accountNumber: "1234567890",
  branch: "Nairobi Main",
  supportEmail: "support@optimasfiber.co.ke",
  supportPhone: "+254 741 874 200",
  paybill: "123456" // Added paybill for payment instructions
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
  // NEW: State for WhatsApp paste functionality
  const [whatsappText, setWhatsappText] = useState('');
  const [showPasteModal, setShowPasteModal] = useState(false);
  // Reset form
  const resetForm = () => {
    setInvoiceForm(initialFormState);
    // NEW: Reset the paste state as well
    setWhatsappText('');
  };
  // Calculate totals based on your model structure (Ensures consistency)
  const calculateTotals = (items, taxRate = 0, discount = 0, discountType = 'none') => {
    // 1. Calculate Subtotal from items
    const subtotal = items.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0);
    const numericSubtotal = parseFloat(subtotal) || 0;
    // 2. Calculate Tax
    const numericTaxRate = parseFloat(taxRate) || 0;
    const taxAmount = (numericSubtotal * numericTaxRate) / 100;
    // 3. Calculate Discount
    let discountAmount = 0;
    const numericDiscount = parseFloat(discount) || 0;
    if (discountType === 'percentage') {
      discountAmount = (numericSubtotal * numericDiscount) / 100;
    } else if (discountType === 'fixed') {
      discountAmount = numericDiscount;
    }
    // 4. Calculate Total
    const totalAmount = numericSubtotal + taxAmount - discountAmount;
    return { 
      subtotal: numericSubtotal, 
      taxAmount: taxAmount, 
      discountAmount: discountAmount,
      totalAmount: Math.max(0, totalAmount) 
    };
  };
  // Effect to recalculate totals when form changes (simulating mongoose pre-save hook)
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
          // Auto-update status based on payment
          if (amountPaid > 0) {
              if (amountPaid >= totalAmount) {
                  newStatus = 'paid';
              } else if (amountPaid < totalAmount) {
                  newStatus = 'partially_paid';
              }
          } else if (prev.status !== 'draft') {
              newStatus = 'pending';
          }
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
  // Fetch invoices from backend
  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication session expired. Please log in again.');
      }
      const response = await fetch(`${API_BASE_URL}/api/invoices`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) {
        throw new Error(`Failed to fetch invoices: ${response.status}`);
      }
      const data = await response.json();
      let invoicesData = data.invoices || data.data || [];
      console.log('📄 Fetched invoices:', invoicesData);
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
  // Generate sequential invoice number (Client-side estimate)
  const generateInvoiceNumber = () => {
    if (!invoices || invoices.length === 0) return 'INV-0001';
    const latestNumber = invoices.reduce((max, invoice) => {
      const match = invoice.invoiceNumber?.match(/INV-(\d+)/);
      if (match) {
        const num = parseInt(match[1]);
        return num > max ? num : max;
      }
      return max;
    }, 0);
    return `INV-${String(latestNumber + 1).padStart(4, '0')}`;
  };
  // NEW: Parse WhatsApp text and populate form
  const parseAndPopulateFromWhatsApp = () => {
    const text = whatsappText;
    if (!text) {
      showNotification('⚠️ Please paste the WhatsApp message first.', 'warning');
      return;
    }
    // Regex patterns to extract information
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
    // Find the selected plan from the list to get features
    let selectedPlan = null;
    if (planName) {
        // Check for exact match first
        selectedPlan = WIFI_PLANS.find(p => p.name.toLowerCase() === planName.toLowerCase());
        // If not found, try to find by name part (e.g., "Jumbo (Ndovu)" -> "Ndovu")
        if (!selectedPlan) {
            const planNameParts = planName.split(' \\(');
            if (planNameParts.length > 1) {
                const actualPlanName = planNameParts[1].replace('\\)', '');
                selectedPlan = WIFI_PLANS.find(p => p.name.toLowerCase() === actualPlanName.toLowerCase());
            }
        }
    }
    // If plan details are found, use them; otherwise, use parsed values
    const finalPlanName = selectedPlan ? selectedPlan.name : planName;
    const finalPlanSpeed = selectedPlan ? selectedPlan.speed : planSpeed;
    const finalPlanPrice = selectedPlan ? parseFloat(selectedPlan.price) : planPrice;
    const finalFeatures = selectedPlan ? selectedPlan.features : [];
    // Create an item for the invoice
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
    // Update the form state
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
    setWhatsappText(''); // Clear the paste text after use
  };
  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setInvoiceForm(prev => ({
      ...prev,
      [name]: value
    }));
  };
  // Select WiFi plan
  const selectPlan = (plan) => {
    const planPrice = parseFloat(plan.price) || 0;
    const items = [{
      description: `${plan.name} Internet Plan - ${plan.speed}`,
      quantity: 1,
      unitPrice: planPrice,
      amount: planPrice
    }];
    // Calculate totals for the new plan items
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
  // Handle item changes
  const handleItemChange = (index, field, value) => {
    const updatedItems = [...invoiceForm.items];
    const item = updatedItems[index];
    if (field === 'quantity' || field === 'unitPrice') {
      const quantity = field === 'quantity' ? parseFloat(value) || 0 : parseFloat(item.quantity) || 0;
      const unitPrice = field === 'unitPrice' ? parseFloat(value) || 0 : parseFloat(item.unitPrice) || 0;
      updatedItems[index] = {
        ...item,
        [field]: parseFloat(value) || 0,
        amount: quantity * unitPrice // Calculate amount locally
      };
    } else {
      updatedItems[index] = {
        ...item,
        [field]: value
      };
    }
    // The useEffect hook will automatically recalculate totals based on the new items state
    setInvoiceForm(prev => ({
      ...prev,
      items: updatedItems
    }));
  };
  // Add new item
  const addItem = () => {
    setInvoiceForm(prev => ({
      ...prev,
      items: [...prev.items, { description: '', quantity: 1, unitPrice: 0, amount: 0 }]
    }));
  };
  // Remove item
  const removeItem = (index) => {
    if (invoiceForm.items.length > 0) {
      const updatedItems = invoiceForm.items.filter((_, i) => i !== index);
      // The useEffect hook will automatically recalculate totals based on the new items state
      setInvoiceForm(prev => ({
        ...prev,
        items: updatedItems,
      }));
    }
  };
  // Mark invoice as paid
  const markAsPaid = async (invoiceId) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication session expired. Please log in again.');
      }
      // Fetch the latest invoice data to get the totalAmount for payment
      const invoiceToPay = invoices.find(inv => inv._id === invoiceId);
      if (!invoiceToPay) {
          throw new Error('Invoice not found in local state.');
      }
      const response = await fetch(`${API_BASE_URL}/api/invoices/${invoiceId}/paid`, {
        method: 'PATCH', // Using the dedicated 'markInvoiceAsPaid' route from controller
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        // Send the full amount due for marking as paid
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
  // Create new invoice
  const createInvoice = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication session expired. Please log in again.');
      }
      // NEW: Client-side validation for required fields including Plan Name
      if (!invoiceForm.customerName?.trim() || !invoiceForm.customerEmail?.trim() || !invoiceForm.planName?.trim()) {
        let missingFields = [];
        if (!invoiceForm.customerName?.trim()) missingFields.push('Customer Name');
        if (!invoiceForm.customerEmail?.trim()) missingFields.push('Customer Email');
        if (!invoiceForm.planName?.trim()) missingFields.push('Plan Name'); // NEW: Check for Plan Name
        const errorMessage = `⚠️ Missing required fields: ${missingFields.join(', ')}. Please fill them before creating the invoice.`;
        showNotification(errorMessage, 'warning');
        return; // Stop execution if validation fails
      }
      // Final data preparation, ensuring date objects for backend
      const invoiceData = {
        ...invoiceForm,
        invoiceNumber: invoiceForm.invoiceNumber || undefined, // Let backend generate if empty
        invoiceDate: new Date(invoiceForm.invoiceDate),
        dueDate: new Date(invoiceForm.dueDate),
        // Ensure all financial fields are numbers (already done by useEffect, but double-checking)
        planPrice: parseFloat(invoiceForm.planPrice) || 0,
        subtotal: parseFloat(invoiceForm.subtotal) || 0,
        taxRate: parseFloat(invoiceForm.taxRate) || 0,
        taxAmount: parseFloat(invoiceForm.taxAmount) || 0,
        discount: parseFloat(invoiceForm.discount) || 0,
        totalAmount: parseFloat(invoiceForm.totalAmount) || 0,
        amountPaid: parseFloat(invoiceForm.amountPaid) || 0,
        balanceDue: parseFloat(invoiceForm.balanceDue) || 0,
      };
      console.log('📤 Creating invoice:', invoiceData);
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
        setInvoices(prev => [...prev, newInvoice.invoice || newInvoice.data || newInvoice]);
        setShowCreateModal(false);
        resetForm();
        showNotification('✅ Invoice created successfully!', 'success');
      } else {
        const errorData = await response.json();
        const errorMessage = errorData.message || (errorData.errors && errorData.errors.join(', ')) || 'Failed to create invoice';
        throw new Error(errorMessage);
      }
    } catch (error) {
      console.error('Error creating invoice:', error);
      showNotification(`🚨 Error: ${error.message}`, 'error');
    }
  };
  // Update invoice
  const updateInvoice = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication session expired. Please log in again.');
      }
      // NEW: Client-side validation for required fields including Plan Name for updates too
      if (!invoiceForm.customerName?.trim() || !invoiceForm.customerEmail?.trim() || !invoiceForm.planName?.trim()) {
        let missingFields = [];
        if (!invoiceForm.customerName?.trim()) missingFields.push('Customer Name');
        if (!invoiceForm.customerEmail?.trim()) missingFields.push('Customer Email');
        if (!invoiceForm.planName?.trim()) missingFields.push('Plan Name'); // NEW: Check for Plan Name
        const errorMessage = `⚠️ Missing required fields: ${missingFields.join(', ')}. Please fill them before updating the invoice.`;
        showNotification(errorMessage, 'warning');
        return; // Stop execution if validation fails
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
        const errorMessage = errorData.message || (errorData.errors && errorData.errors.join(', ')) || 'Failed to update invoice';
        throw new Error(errorMessage);
      }
    } catch (error) {
      console.error('Error updating invoice:', error);
      showNotification(`🚨 Error: ${error.message}`, 'error');
    }
  };
  // Delete invoice
  const deleteInvoice = async (invoiceId) => {
    if (!window.confirm('Are you sure you want to delete this invoice? This action cannot be undone.')) {
      return;
    }
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication session expired. Please log in again.');
      }
      const response = await fetch(`${API_BASE_URL}/api/invoices/${invoiceId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
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
  // Client-side PDF generation using html2pdf.js - **FIXED LAYOUT AND STYLED**
  const generateClientSidePDF = (invoice) => {
    return new Promise((resolve, reject) => {
        showNotification('📄 Preparing PDF for sending...', 'info');
        // --- Dynamic Content Generation for PDF ---
        // Get the primary item or list all items
        const primaryItem = invoice.items?.[0] || {
            description: invoice.planName ? `${invoice.planName} - ${invoice.planSpeed}` : 'Internet Service', 
            quantity: 1, 
            unitPrice: invoice.planPrice || invoice.totalAmount || 0, 
            amount: invoice.planPrice || invoice.totalAmount || 0
        };
        const itemsToDisplay = invoice.items && invoice.items.length > 0 ? invoice.items : [primaryItem];
        const itemsHtml = itemsToDisplay.map(item => `
          <tr style="border-bottom: 1px solid #f0f0f0;">
            <td style="padding: 8px 12px; text-align: left; font-size: 13px; width: 45%; word-wrap: break-word;">${item.description || 'N/A'}</td>
            <td style="padding: 8px 12px; text-align: right; font-size: 13px; width: 10%;">${item.quantity || 1}</td>
            <td style="padding: 8px 12px; text-align: right; font-size: 13px; width: 20%;">Ksh ${formatPrice(item.unitPrice)}</td>
            <td style="padding: 8px 12px; text-align: right; font-size: 13px; width: 25%; font-weight: bold;">Ksh ${formatPrice(item.amount)}</td>
          </tr>
        `).join('');
        const featureHtml = (invoice.features || WIFI_PLANS.find(p => p.name === invoice.planName)?.features || []).map(feature => `
            <div style="display: inline-flex; align-items: center; gap: 5px; min-width: 200px; margin-bottom: 5px; font-size: 12px;">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#28a745" stroke-width="2" style="flex-shrink: 0;">
                <path d="M20 6L9 17l-5-5"></path>
              </svg>
              <span style="color: #333;">${feature}</span>
            </div>
        `).join('');
        const statusColor = invoice.status === 'paid' ? '#28a745' : invoice.status === 'pending' ? '#ffc107' : '#dc3545';
        const totalColor = invoice.balanceDue > 0 ? '#dc3545' : '#28a745';
        // Create a temporary hidden container for HTML to be rendered to PDF
        const pdfContainer = document.createElement('div');
        pdfContainer.id = 'pdf-container';
        pdfContainer.style.width = '210mm'; // A4 width
        pdfContainer.style.padding = '15px';
        pdfContainer.style.boxSizing = 'border-box';
        pdfContainer.style.backgroundColor = '#ffffff';
        pdfContainer.style.fontFamily = 'Helvetica, Arial, sans-serif';
        pdfContainer.style.fontSize = '12px';
        document.body.appendChild(pdfContainer);
        // Populate the container with the enhanced HTML template
        pdfContainer.innerHTML = `
          <div id="pdf-invoice-content" style="margin: 0 auto; padding: 15px; max-width: 100%;">
            <div style="display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 3px solid #003366; padding-bottom: 10px; margin-bottom: 15px;">
              <div style="flex-grow: 1;">
                <h1 style="font-size: 24px; font-weight: 900; color: #003366; margin: 0;">${COMPANY_INFO.name}</h1>
                <p style="font-size: 12px; color: #666; margin: 5px 0 0 0;">${COMPANY_INFO.tagline}</p>
                <div style="font-size: 11px; color: #666; margin-top: 8px;">
                    <p style="margin: 0;">Email: ${COMPANY_INFO.supportEmail}</p>
                    <p style="margin: 0;">Phone: ${COMPANY_INFO.supportPhone}</p>
                </div>
              </div>
              <div style="text-align: right; min-width: 130px;">
                <img src="${COMPANY_INFO.logoUrl}" alt="Company Logo" style="max-height: 50px; max-width: 90px; object-fit: contain; margin-bottom: 5px;" />
                <h2 style="font-size: 28px; font-weight: 700; color: #FFCC00; margin: 0;">INVOICE</h2>
                <p style="font-size: 14px; font-weight: bold; color: #003366; margin: 5px 0 0 0;"># ${invoice.invoiceNumber || 'DRAFT'}</p>
              </div>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 20px; border: 1px solid #eee; padding: 12px; border-radius: 5px;">
              <div style="flex: 1;">
                <h3 style="font-size: 13px; font-weight: bold; color: #003366; margin: 0 0 5px 0;">Bill To:</h3>
                <p style="margin: 2px 0; font-size: 12px; font-weight: bold;">${invoice.customerName || 'N/A'}</p>
                <p style="margin: 2px 0; font-size: 12px;">${invoice.customerEmail || 'N/A'}</p>
                <p style="margin: 2px 0; font-size: 12px;">${invoice.customerPhone || 'N/A'}</p>
                <p style="margin: 2px 0; font-size: 12px;">${invoice.customerLocation || 'N/A'}</p>
              </div>
              <div style="flex: 1; text-align: right;">
                <p style="margin: 2px 0; font-size: 12px;"><strong>Invoice Date:</strong> ${invoice.invoiceDate ? new Date(invoice.invoiceDate).toLocaleDateString() : 'N/A'}</p>
                <p style="margin: 2px 0; font-size: 12px;"><strong>Due Date:</strong> ${invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString() : 'N/A'}</p>
                <p style="margin: 2px 0; font-size: 12px;">
                    <strong>Status:</strong> 
                    <span style="font-weight: bold; color: ${statusColor}; text-transform: uppercase;">${invoice.status || 'DRAFT'}</span>
                </p>
              </div>
            </div>
            <div style="margin-bottom: 20px; border: 1px solid #ddd; border-radius: 5px; overflow: hidden;">
              <table style="width: 100%; border-collapse: collapse; font-size: 12px;">
                <thead style="background-color: #f5f5f5; color: #003366;">
                  <tr>
                    <th style="padding: 8px 12px; text-align: left; font-size: 12px; font-weight: bold; width: 45%;">Description</th>
                    <th style="padding: 8px 12px; text-align: right; font-size: 12px; font-weight: bold; width: 10%;">Qty</th>
                    <th style="padding: 8px 12px; text-align: right; font-size: 12px; font-weight: bold; width: 20%;">Unit Price</th>
                    <th style="padding: 8px 12px; text-align: right; font-size: 12px; font-weight: bold; width: 25%;">Amount (Ksh)</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemsHtml}
                </tbody>
              </table>
            </div>
            <div style="display: flex; justify-content: space-between; font-size: 12px;">
                <div style="flex: 1; padding-right: 20px;">
                    <h3 style="font-size: 13px; font-weight: bold; color: #003366; margin: 0 0 5px 0;">Notes:</h3>
                    <p style="margin: 0; white-space: pre-wrap; line-height: 1.4;">${invoice.notes || 'N/A'}</p>
                    <h3 style="font-size: 13px; font-weight: bold; color: #003366; margin: 10px 0 5px 0;">Features:</h3>
                    <div style="display: flex; flex-wrap: wrap; gap: 8px;">
                        ${featureHtml}
                    </div>
                </div>
                <div style="width: 220px;">
                    <table style="width: 100%; border-collapse: collapse; font-size: 12px;">
                        <tr style="border-bottom: 1px solid #eee;">
                            <td style="padding: 5px 0; font-size: 12px; text-align: right;">Subtotal:</td>
                            <td style="padding: 5px 0; font-size: 12px; text-align: right; font-weight: bold;">Ksh ${formatPrice(invoice.subtotal)}</td>
                        </tr>
                        <tr style="border-bottom: 1px solid #eee;">
                            <td style="padding: 5px 0; font-size: 12px; text-align: right;">Tax (${invoice.taxRate || 0}%):</td>
                            <td style="padding: 5px 0; font-size: 12px; text-align: right; font-weight: bold;">Ksh ${formatPrice(invoice.taxAmount)}</td>
                        </tr>
                        <tr style="border-bottom: 1px solid #eee;">
                            <td style="padding: 5px 0; font-size: 12px; text-align: right;">Discount:</td>
                            <td style="padding: 5px 0; font-size: 12px; text-align: right; font-weight: bold;">- Ksh ${formatPrice(invoice.subtotal - (invoice.subtotal + invoice.taxAmount - invoice.totalAmount) + invoice.taxAmount)}</td>
                        </tr>
                        <tr style="border-bottom: 2px solid #003366; margin-top: 8px;">
                            <td style="padding: 8px 0; font-size: 14px; font-weight: bold; text-align: right;">TOTAL DUE:</td>
                            <td style="padding: 8px 0; font-size: 14px; font-weight: bold; text-align: right; color: #003366;">Ksh ${formatPrice(invoice.totalAmount)}</td>
                        </tr>
                        <tr>
                            <td style="padding: 5px 0; font-size: 12px; text-align: right; color: #28a745;">Amount Paid:</td>
                            <td style="padding: 5px 0; font-size: 12px; text-align: right; font-weight: bold; color: #28a745;">Ksh ${formatPrice(invoice.amountPaid)}</td>
                        </tr>
                        <tr style="border-top: 2px solid ${totalColor};">
                            <td style="padding: 8px 0; font-size: 14px; font-weight: bold; text-align: right; color: ${totalColor};">BALANCE:</td>
                            <td style="padding: 8px 0; font-size: 14px; font-weight: bold; text-align: right; color: ${totalColor};">Ksh ${formatPrice(invoice.balanceDue)}</td>
                        </tr>
                    </table>
                </div>
            </div>
            <div style="margin-top: 30px; border-top: 1px dashed #ddd; padding-top: 15px;">
                <h3 style="font-size: 13px; font-weight: bold; color: #003366; margin: 0 0 8px 0;">Payment Options:</h3>
                <div style="display: flex; gap: 20px; font-size: 11px;">
                    <div style="flex: 1; border-right: 1px solid #eee; padding-right: 10px;">
                        <p style="font-weight: bold; margin: 0 0 3px 0;">Bank Transfer:</p>
                        <p style="margin: 0;">Bank: ${COMPANY_INFO.bankName}</p>
                        <p style="margin: 0;">Account Name: ${COMPANY_INFO.accountName}</p>
                        <p style="margin: 0;">Account No: ${COMPANY_INFO.accountNumber}</p>
                    </div>
                    <div style="flex: 1;">
                        <p style="font-weight: bold; margin: 0 0 3px 0;">Mobile Money (M-Pesa):</p>
                        <p style="margin: 0;">Paybill: ${COMPANY_INFO.paybill}</p>
                        <p style="margin: 0;">Account No: **${invoice.customerPhone || 'N/A'}**</p>
                    </div>
                </div>
                <p style="text-align: center; margin-top: 20px; font-size: 10px; color: #999;">${invoice.terms}</p>
                <p style="text-align: center; margin-top: 8px; font-size: 11px; font-weight: bold; color: #003366;">THANK YOU FOR YOUR BUSINESS!</p>
            </div>
          </div>
        `;
        // --- PDF Generation using html2pdf.js ---
        const opt = {
          margin: [10, 10, 10, 10], // Slightly reduced margins
          filename: `${invoice.invoiceNumber || 'DRAFT'}-invoice.pdf`,
          image: { type: 'jpeg', quality: 0.98 },
          html2canvas: { 
            scale: 2, // Reduced scale for better fit
            logging: false, 
            dpi: 192, 
            letterRendering: true, 
            useCORS: true, // Crucial for loading external images like the logo
            windowWidth: 800, // Set a specific width to avoid dynamic viewport issues
            width: 800, // Explicitly set width for canvas
          },
          jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
          enableLinks: false // Disable internal links in PDF for cleaner output
        };
        // Use the container element
        html2pdf().from(pdfContainer).set(opt).outputPdf('blob').then((blob) => {
          showNotification('✅ PDF generated successfully!', 'success');
          // Clean up the temporary container
          document.body.removeChild(pdfContainer);
          resolve(blob); // Resolve the promise with the PDF blob
        }).catch(err => {
          console.error('PDF generation error:', err);
          showNotification('🚨 Failed to generate PDF', 'error');
          // Ensure cleanup even on error
          if (document.body.contains(pdfContainer)) {
              document.body.removeChild(pdfContainer);
          }
          reject(err); // Reject the promise on error
        });
    });
  };
  // Export invoice as PDF - Using client-side generation
  const exportInvoicePDF = async (invoice) => {
    try {
        const pdfBlob = await generateClientSidePDF(invoice);
        // Create a URL for the blob
        const url = URL.createObjectURL(pdfBlob);
        // Create a link element
        const a = document.createElement('a');
        a.href = url;
        a.download = `${invoice.invoiceNumber || 'DRAFT'}-invoice.pdf`;
        // Append to the body, click, and remove
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        // Clean up the object URL
        URL.revokeObjectURL(url);
    } catch (error) {
        console.error('Error exporting PDF:', error);
        showNotification('🚨 Failed to download PDF', 'error');
    }
  };
  // Preview PDF - Same as export, but typically for display only (we'll use the same function for simplicity)
  const previewPDF = (invoice) => {
    // For a true preview, you'd render the HTML to an iframe/div, not download.
    // For simplicity, we'll re-use the detail modal for a detailed view, 
    // and rely on the Export/Download buttons to trigger the PDF generation.
    setSelectedInvoice(invoice);
    setShowPDFModal(true);
  };
  // Helper function to generate email body text (as a fallback or summary)
  const generateEmailBody = (invoice) => {
    const customerName = invoice.customerName || 'Customer';
    const invoiceNumber = invoice.invoiceNumber || 'N/A';
    const amount = formatPrice(invoice.totalAmount);
    const dueDate = invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString() : 'N/A';
    const totalDue = formatPrice(invoice.balanceDue);
    return `Hello ${customerName},
Your Optimas Fiber invoice is ready. Please find the details below:
*Invoice #: ${invoiceNumber}*
*Total Amount: Ksh ${amount}*
*Balance Due: Ksh ${totalDue}*
*Due Date: ${dueDate}*
The full invoice details are attached as a PDF.
Payment via Mobile Money:
- *Paybill:* ${COMPANY_INFO.paybill}
- *Account No:* ${invoice.customerPhone || customerName.split(' ')[0]}
Thank you for choosing Optimas Fiber!`;
  };
  // Send invoice to client via Email with PDF attachment
  const sendInvoiceToClient = async (invoice) => {
    try {
      setSendingInvoice(invoice._id);
      const customerEmail = invoice.customerEmail;
      if (!customerEmail || !customerEmail.includes('@')) {
        showNotification('⚠️ Customer email address is invalid or missing', 'warning');
        return;
      }
      const subject = `Invoice ${invoice.invoiceNumber || 'N/A'} from ${COMPANY_INFO.name}`;
      const body = encodeURIComponent(generateEmailBody(invoice));
      // Generate the PDF blob
      const pdfBlob = await generateClientSidePDF(invoice);
      const pdfUrl = URL.createObjectURL(pdfBlob);
      // Construct the mailto link with the PDF as an attachment
      // Note: mailto: links have limitations and may not work perfectly with attachments across all email clients.
      // The most reliable way is to let the user download the PDF and attach it manually.
      // However, we can try to open the mail client with the body pre-filled.
      // For attachment, the user will likely need to download and attach manually.
      const mailtoLink = `mailto:${customerEmail}?subject=${encodeURIComponent(subject)}&body=${body}`;
      // Inform the user that the PDF is ready and they need to attach it
      showNotification('📄 PDF ready. Please attach the downloaded invoice to your email.', 'info');
      // Download the PDF first so the user can attach it
      const a = document.createElement('a');
      a.href = pdfUrl;
      a.download = `${invoice.invoiceNumber || 'DRAFT'}-invoice.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      // Then open the email client with the body filled
      window.open(mailtoLink, '_blank');
    } catch (error) {
      console.error('Error preparing email with PDF:', error);
      showNotification(`🚨 Error: ${error.message}`, 'error');
    } finally {
      setSendingInvoice(null);
    }
  };
  // Export all invoices to Excel (Updated implementation with fixed regex)
  const exportInvoicesToExcel = async () => {
    try {
      setExportLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
          throw new Error('Authentication session expired. Please log in again.');
      }
      // Assuming your backend /api/invoices/export/excel is implemented to return an Excel file
      const response = await fetch(`${API_BASE_URL}/api/invoices/export/excel`, {
        method: 'GET', // Typically an export endpoint is a GET request
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json' // Backend might expect this, though not always necessary for file downloads
        }
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to export Excel: ${response.status} ${response.statusText}`);
      }
      // Handle the Excel file download
      const blob = await response.blob(); // Get the response as a binary blob
      const disposition = response.headers.get('Content-Disposition'); // Try to get filename from header
      let filename = `invoices-${new Date().toISOString().split('T')[0]}.xlsx`; // Default filename
      if (disposition && disposition.includes('filename=')) {
        // Fixed Regex: Properly escaped parentheses and quotes
        const filenameMatch = disposition.match(/filename[^;=\s]*=(([\'\"])((?:.(?!\2|\\|\s))*.)?\2|([^;\s]*))/);
        if (filenameMatch && filenameMatch[3]) {
          filename = filenameMatch[3];
        } else if (filenameMatch && filenameMatch[5]) {
          filename = filenameMatch[5];
        }
      }
      // Create a temporary URL for the blob
      const url = window.URL.createObjectURL(blob);
      // Create a temporary link element
      const link = document.createElement('a');
      link.href = url;
      link.download = filename; // Set the desired filename
      // Append the link to the body, click it to trigger download, then remove it
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      // Clean up the temporary URL
      window.URL.revokeObjectURL(url);
      showNotification('✅ Invoices exported to Excel successfully!', 'success');
    } catch (error) {
      console.error('Error exporting to Excel:', error);
      showNotification(`🚨 Error exporting invoices to Excel: ${error.message}`, 'error');
    } finally {
      setExportLoading(false);
    }
  };
  // Edit invoice
  const editInvoice = (invoice) => {
    // Populate form with existing invoice data, ensuring dates are in correct format
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
      })) : [{ description: `${invoice.planName} - ${invoice.planSpeed}`, quantity: 1, unitPrice: invoice.planPrice, amount: invoice.planPrice }], // Use plan info as default item if none
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
  // View invoice details
  const viewInvoice = (invoice) => {
    setSelectedInvoice(invoice);
    setShowInvoiceModal(true);
  };
  // Filter and search invoices
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
  // Calculate stats for charts
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
  // Data for charts
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
  // Prepare time series data (e.g., monthly trend)
  const timeSeriesMap = invoices
    .filter(inv => inv.invoiceDate)
    .reduce((acc, inv) => {
      const dateKey = new Date(inv.invoiceDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      const amount = parseFloat(inv.totalAmount) || parseFloat(inv.planPrice) || 0;
      acc[dateKey] = (acc[dateKey] || 0) + amount;
      return acc;
    }, {});
  const timeSeriesData = Object.keys(timeSeriesMap).map(date => ({
    date,
    amount: timeSeriesMap[date]
  })).sort((a, b) => new Date(a.date) - new Date(b.date));
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-t-2 border-[#003366]"></div>
      </div>
    );
  }
  return (
    <div>
      {/* NEW: Notifications Container - Positioned above the main content */}
      <div className="mb-6">
        {/* You can render notifications here if the showNotification prop provides them */}
        {/* For now, we rely on the parent component's notification system, which is typically positioned globally */}
        {/* The modals below will appear on top of this, so notifications must be handled by a global system or passed down */}
        {/* If you want to render them directly here, you'd need a local state for notifications */}
      </div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold mb-2 bg-gradient-to-r from-[#003366] to-[#FFCC00] bg-clip-text text-transparent">
            Invoice Management
          </h2>
          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Create, manage, and track customer invoices - Total: {invoices.length} invoices
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
              setShowCreateModal(true);
            }}
            className={`${themeClasses.button.primary.base} ${darkMode ? themeClasses.button.primary.dark : themeClasses.button.primary.light} flex items-center`}
          >
            <Plus size={16} className="mr-1.5" />
            New Invoice
          </button>
        </div>
      </div>
      {/* Charts Section - **Enhanced Graphics** */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Status Pie Chart */}
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
        {/* Revenue by Billing Cycle Bar Chart */}
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
                contentStyle={{ backgroundColor: darkMode ? '#1f2937' : '#fff', border: '1px solid #4b5563', borderRadius: '5px' }}
              />
              <Bar dataKey="value" fill="#003366" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        {/* Revenue Trend Line Chart */}
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
                contentStyle={{ backgroundColor: darkMode ? '#1f2937' : '#fff', border: '1px solid #4b5563', borderRadius: '5px' }}
              />
              <Line type="monotone" dataKey="amount" stroke="#FFCC00" strokeWidth={3} dot={{ stroke: '#003366', strokeWidth: 2, r: 4 }} activeDot={{ r: 8 }} />
              {/* Optional: Add a reference line for average revenue */}
              <ReferenceLine y={stats.totalRevenue / timeSeriesData.length} stroke="#003366" strokeDasharray="3 3" label={{ position: 'right', value: 'Avg', fill: '#003366', fontSize: 12 }} />
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
      {/* Invoices Table - UPDATED WITH KSH PRICING AND MORE DATA */}
      <div className={`${themeClasses.card} rounded-xl shadow-lg border backdrop-blur-sm overflow-hidden`}>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider">
                  Invoice #
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider hidden md:table-cell">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider hidden lg:table-cell">
                  Plan/Details
                </th>
                <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider">
                  Total Amount
                </th>
                <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider hidden sm:table-cell">
                  Balance
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider">
                  Actions
                </th>
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
                          {invoice.invoiceNumber || 'N/A'}
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
                          onClick={() => exportInvoicePDF(invoice)}
                          className={`p-2 rounded-lg ${darkMode ? 'text-purple-400 hover:bg-gray-600' : 'text-purple-600 hover:bg-gray-100'} transition-colors`}
                          title="Download PDF"
                        >
                          <Download size={16} />
                        </button>
                        <button
                          onClick={() => sendInvoiceToClient(invoice)}
                          disabled={sendingInvoice === invoice._id}
                          className={`p-2 rounded-lg ${darkMode ? 'text-green-400 hover:bg-gray-600' : 'text-green-600 hover:bg-gray-100'} transition-colors ${
                            sendingInvoice === invoice._id ? 'opacity-50 cursor-not-allowed' : ''
                          }`}
                          title="Send to Client (Email)"
                        >
                          <Send size={16} /> {/* Changed icon to Send */}
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
                          onClick={() => editInvoice(invoice)}
                          className={`p-2 rounded-lg ${darkMode ? 'text-yellow-400 hover:bg-gray-600' : 'text-yellow-600 hover:bg-gray-100'} transition-colors`}
                          title="Edit Invoice"
                        >
                          <Edit size={16} />
                        </button>
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
      {/* Create/Edit Invoice Modal - UPDATED WITH ALL MODEL FIELDS */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className={`${themeClasses.card} rounded-xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto`}>
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                  {editingInvoice ? 'Edit Invoice' : 'Create New Invoice'}
                </h3>
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    setEditingInvoice(null);
                    resetForm();
                  }}
                  className={`p-2 rounded-lg ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} transition-colors`}
                >
                  <X size={20} />
                </button>
              </div>
            </div>
            <div className="p-6 space-y-6">
              {/* NEW: WhatsApp Paste Button */}
              <div className="flex justify-end">
                <button
                  onClick={() => setShowPasteModal(true)}
                  className={`${themeClasses.button.small.base} ${darkMode ? themeClasses.button.secondary.dark : themeClasses.button.secondary.light} flex items-center`}
                >
                  <ClipboardPaste size={16} className="mr-1.5" />
                  Paste from WhatsApp
                </button>
              </div>
              {/* Customer Information */}
              <h4 className={`font-bold border-b pb-1 ${darkMode ? 'text-gray-300 border-gray-700' : 'text-gray-700 border-gray-200'}`}>Customer & Invoice Details</h4>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Customer Name *
                  </label>
                  <input
                    type="text"
                    name="customerName"
                    value={invoiceForm.customerName}
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
                    value={invoiceForm.customerEmail}
                    onChange={handleInputChange}
                    className={`w-full p-3 border rounded-lg text-sm transition-all duration-200 focus:ring-2 focus:ring-[#003366] focus:border-transparent ${themeClasses.input}`}
                    required
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Customer Phone *
                  </label>
                  <input
                    type="tel"
                    name="customerPhone"
                    value={invoiceForm.customerPhone}
                    onChange={handleInputChange}
                    className={`w-full p-3 border rounded-lg text-sm transition-all duration-200 focus:ring-2 focus:ring-[#003366] focus:border-transparent ${themeClasses.input}`}
                    required // Added required based on model
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Customer Location *
                  </label>
                  <input
                    type="text"
                    name="customerLocation"
                    value={invoiceForm.customerLocation}
                    onChange={handleInputChange}
                    className={`w-full p-3 border rounded-lg text-sm transition-all duration-200 focus:ring-2 focus:ring-[#003366] focus:border-transparent ${themeClasses.input}`}
                    required // Added required based on model
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Invoice Number
                  </label>
                  <input
                    type="text"
                    name="invoiceNumber"
                    value={invoiceForm.invoiceNumber}
                    onChange={handleInputChange}
                    placeholder="Auto-generated if empty"
                    className={`w-full p-3 border rounded-lg text-sm transition-all duration-200 focus:ring-2 focus:ring-[#003366] focus:border-transparent ${themeClasses.input}`}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Invoice Date
                  </label>
                  <input
                    type="date"
                    name="invoiceDate"
                    value={invoiceForm.invoiceDate}
                    onChange={handleInputChange}
                    className={`w-full p-3 border rounded-lg text-sm transition-all duration-200 focus:ring-2 focus:ring-[#003366] focus:border-transparent ${themeClasses.input}`}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Due Date
                  </label>
                  <input
                    type="date"
                    name="dueDate"
                    value={invoiceForm.dueDate}
                    onChange={handleInputChange}
                    className={`w-full p-3 border rounded-lg text-sm transition-all duration-200 focus:ring-2 focus:ring-[#003366] focus:border-transparent ${themeClasses.input}`}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Billing Cycle
                  </label>
                  <select
                    name="billingCycle"
                    value={invoiceForm.billingCycle}
                    onChange={handleInputChange}
                    className={`w-full p-3 border rounded-lg text-sm transition-all duration-200 focus:ring-2 focus:ring-[#003366] focus:border-transparent ${themeClasses.input}`}
                  >
                    <option value="monthly">Monthly</option>
                    <option value="quarterly">Quarterly</option>
                    <option value="annually">Annually</option>
                    <option value="one_time">One Time</option>
                  </select>
                </div>
              </div>
              {/* Plan Selection */}
              <h4 className={`font-bold border-b pb-1 pt-4 ${darkMode ? 'text-gray-300 border-gray-700' : 'text-gray-700 border-gray-200'}`}>Internet Plan Selection</h4>
              <div>
                <div className="flex justify-between items-center mb-4">
                  <span className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      **Selected Plan:** {invoiceForm.planName || 'None'} ({invoiceForm.planSpeed || 'N/A'})
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowPlanSelection(true)}
                    className={`${themeClasses.button.small.base} ${darkMode ? themeClasses.button.small.dark : themeClasses.button.small.light} flex items-center`}
                  >
                    <Wifi size={14} className="mr-1" />
                    Select Plan
                  </button>
                </div>
                {/* Note: Plan details are now primarily driven by items below, but we keep this for easy selection */}
              </div>
              {/* Invoice Items */}
              <h4 className={`font-bold border-b pb-1 pt-4 ${darkMode ? 'text-gray-300 border-gray-700' : 'text-gray-700 border-gray-200'}`}>Itemized Billing</h4>
              <div>
                <div className="flex justify-end items-center mb-4">
                  <button
                    type="button"
                    onClick={addItem}
                    className={`${themeClasses.button.small.base} ${darkMode ? themeClasses.button.small.dark : themeClasses.button.small.light} flex items-center`}
                  >
                    <Plus size={14} className="mr-1" />
                    Add Custom Item
                  </button>
                </div>
                <div className="space-y-3">
                    {/* Header Row for Items */}
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center font-semibold text-xs uppercase text-gray-500 dark:text-gray-400">
                        <div className="md:col-span-5">Description</div>
                        <div className="md:col-span-2 text-center">Qty</div>
                        <div className="md:col-span-2 text-right">Unit Price (Ksh)</div>
                        <div className="md:col-span-2 text-right">Amount (Ksh)</div>
                        <div className="md:col-span-1"></div>
                    </div>
                  {invoiceForm.items.map((item, index) => (
                    <div key={index} className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
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
                          className={`w-full p-2 border rounded-lg text-sm transition-all duration-200 focus:ring-2 focus:ring-[#003366] focus:border-transparent ${themeClasses.input} text-center`}
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
                          className={`w-full p-2 border rounded-lg text-sm transition-all duration-200 focus:ring-2 focus:ring-[#003366] focus:border-transparent ${themeClasses.input} text-right`}
                          step="0.01"
                          min="0"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <input
                          type="text" // Change to text to use formatPrice
                          placeholder="Amount"
                          value={formatPrice(item.amount)}
                          readOnly
                          className={`w-full p-2 border rounded-lg text-sm bg-gray-50 dark:bg-gray-700 ${darkMode ? 'text-gray-300' : 'text-gray-600'} text-right`}
                        />
                      </div>
                      <div className="md:col-span-1">
                        <button
                          type="button"
                          onClick={() => removeItem(index)}
                          className={`p-2 rounded-lg ${darkMode ? 'text-red-400 hover:bg-gray-700' : 'text-red-600 hover:bg-gray-100'} transition-colors`}
                          title="Remove Item"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              {/* Financial Summary & Payment */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="space-y-4">
                    <h4 className={`font-bold border-b pb-1 ${darkMode ? 'text-gray-300 border-gray-700' : 'text-gray-700 border-gray-200'}`}>Calculations</h4>
                    <div>
                      <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Tax Rate (%)
                      </label>
                      <input
                        type="number"
                        name="taxRate"
                        value={invoiceForm.taxRate}
                        onChange={handleInputChange}
                        className={`w-full p-3 border rounded-lg text-sm transition-all duration-200 focus:ring-2 focus:ring-[#003366] focus:border-transparent ${themeClasses.input}`}
                        step="0.01"
                        min="0"
                        max="100"
                      />
                    </div>
                    <div>
                      <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Discount ({invoiceForm.discountType === 'percentage' ? '%' : 'Ksh'})
                      </label>
                      <input
                        type="number"
                        name="discount"
                        value={invoiceForm.discount}
                        onChange={handleInputChange}
                        className={`w-full p-3 border rounded-lg text-sm transition-all duration-200 focus:ring-2 focus:ring-[#003366] focus:border-transparent ${themeClasses.input}`}
                        step="1"
                        min="0"
                      />
                      <select
                        name="discountType"
                        value={invoiceForm.discountType}
                        onChange={handleInputChange}
                        className={`w-full p-3 border rounded-lg text-sm transition-all duration-200 focus:ring-2 focus:ring-[#003366] focus:border-transparent ${themeClasses.input} mt-2`}
                      >
                        <option value="none">None</option>
                        <option value="percentage">Percentage</option>
                        <option value="fixed">Fixed Amount</option>
                      </select>
                    </div>
                </div>
                <div className={`${darkMode ? 'bg-gray-800' : 'bg-gray-100'} p-4 rounded-xl col-span-1 space-y-2`}>
                    <h4 className={`font-bold border-b pb-1 ${darkMode ? 'text-gray-300 border-gray-700' : 'text-gray-700 border-gray-200'}`}>Invoice Totals (Ksh)</h4>
                    <div className="flex justify-between text-sm">
                        <div className="font-medium">Subtotal:</div>
                        <div className="font-bold">{formatPrice(invoiceForm.subtotal)}</div>
                    </div>
                    <div className="flex justify-between text-sm">
                        <div className="font-medium">Tax ({invoiceForm.taxRate}%):</div>
                        <div className="font-bold">{formatPrice(invoiceForm.taxAmount)}</div>
                    </div>
                    <div className="flex justify-between text-sm">
                        <div className="font-medium">Discount:</div>
                        <div className="font-bold text-red-500">- {formatPrice(invoiceForm.subtotal - (invoiceForm.subtotal + invoiceForm.taxAmount - invoiceForm.totalAmount) + invoiceForm.taxAmount)}</div>
                    </div>
                    <div className="flex justify-between text-lg font-extrabold border-t pt-2 mt-2">
                        <div>TOTAL AMOUNT:</div>
                        <div className="text-[#003366] dark:text-[#FFCC00]">{formatPrice(invoiceForm.totalAmount)}</div>
                    </div>
                </div>
                <div className="space-y-4">
                    <h4 className={`font-bold border-b pb-1 ${darkMode ? 'text-gray-300 border-gray-700' : 'text-gray-700 border-gray-200'}`}>Payment</h4>
                    <div>
                      <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Amount Paid (Ksh)
                      </label>
                      <input
                        type="number"
                        name="amountPaid"
                        value={invoiceForm.amountPaid}
                        onChange={handleInputChange}
                        className={`w-full p-3 border rounded-lg text-sm transition-all duration-200 focus:ring-2 focus:ring-[#003366] focus:border-transparent ${themeClasses.input}`}
                        step="0.01"
                        min="0"
                      />
                    </div>
                    <div class="flex justify-between text-lg font-extrabold p-2 rounded-lg" style={{backgroundColor: invoiceForm.balanceDue > 0 ? '#fddede' : '#d4edda'}}>
                        <div class={`font-bold ${invoiceForm.balanceDue > 0 ? 'text-red-700' : 'text-green-700'}`}>BALANCE DUE:</div>
                        <div class={`font-bold ${invoiceForm.balanceDue > 0 ? 'text-red-700' : 'text-green-700'}`}>{formatPrice(invoiceForm.balanceDue)}</div>
                    </div>
                    <div>
                      <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Payment Method
                      </label>
                      <select
                        name="paymentMethod"
                        value={invoiceForm.paymentMethod}
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
                </div>
              </div>
              {/* Notes and Terms */}
              <h4 className={`font-bold border-b pb-1 pt-4 ${darkMode ? 'text-gray-300 border-gray-700' : 'text-gray-700 border-gray-200'}`}>Notes & Terms</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Notes
                  </label>
                  <textarea
                    name="notes"
                    value={invoiceForm.notes}
                    onChange={handleInputChange}
                    rows="3"
                    placeholder="Additional notes or instructions..."
                    className={`w-full p-3 border rounded-lg text-sm transition-all duration-200 focus:ring-2 focus:ring-[#003366] focus:border-transparent ${themeClasses.input}`}
                  ></textarea>
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Terms
                  </label>
                  <textarea
                    name="terms"
                    value={invoiceForm.terms}
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
                    setEditingInvoice(null);
                    resetForm();
                  }}
                  className={`${themeClasses.button.secondary.base} ${darkMode ? themeClasses.button.secondary.dark : themeClasses.button.secondary.light}`}
                >
                  Cancel
                </button>
                <button
                  onClick={editingInvoice ? updateInvoice : createInvoice}
                  className={`${themeClasses.button.primary.base} ${darkMode ? themeClasses.button.primary.dark : themeClasses.button.primary.light}`}
                >
                  {editingInvoice ? 'Update Invoice' : 'Create Invoice'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* NEW: WhatsApp Paste Modal */}
      {showPasteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className={`${themeClasses.card} rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto`}>
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                  Paste WhatsApp Message
                </h3>
                <button
                  onClick={() => {
                    setShowPasteModal(false);
                    setWhatsappText('');
                  }}
                  className={`p-2 rounded-lg ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} transition-colors`}
                >
                  <X size={20} />
                </button>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Paste the full WhatsApp message here:
                </label>
                <textarea
                  value={whatsappText}
                  onChange={(e) => setWhatsappText(e.target.value)}
                  rows="8"
                  placeholder="Paste the customer's request message here..."
                  className={`w-full p-3 border rounded-lg text-sm transition-all duration-200 focus:ring-2 focus:ring-[#003366] focus:border-transparent ${themeClasses.input}`}
                />
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                <p>Expected format:</p>
                <p>OPTIMAS FIBER - INTERNET CONNECTION REQUEST</p>
                <p>CUSTOMER DETAILS:</p>
                <p>Name: [Customer Name]</p>
                <p>Phone: [Phone Number]</p>
                <p>Location: [Location]</p>
                <p>Email: [Email]</p>
                <p>SELECTED PLAN:</p>
                <p>Plan: [Plan Name]</p>
                <p>Speed: [Speed]</p>
                <p>Price: Ksh [Amount]/month</p>
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowPasteModal(false);
                    setWhatsappText('');
                  }}
                  className={`${themeClasses.button.secondary.base} ${darkMode ? themeClasses.button.secondary.dark : themeClasses.button.secondary.light}`}
                >
                  Cancel
                </button>
                <button
                  onClick={parseAndPopulateFromWhatsApp}
                  className={`${themeClasses.button.primary.base} ${darkMode ? themeClasses.button.primary.dark : themeClasses.button.primary.light} flex items-center`}
                >
                  <ClipboardPaste size={16} className="mr-1.5" />
                  Parse & Populate
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Plan Selection Modal */}
      {showPlanSelection && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className={`${themeClasses.card} rounded-xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto`}>
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                  Select Internet Plan
                </h3>
                <button
                  onClick={() => setShowPlanSelection(false)}
                  className={`p-2 rounded-lg ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} transition-colors`}
                >
                  <X size={20} />
                </button>
              </div>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {WIFI_PLANS.map((plan) => (
                  <div
                    key={plan.id}
                    className={`border rounded-xl p-4 cursor-pointer transition-all hover:shadow-lg ${
                      darkMode ? 'border-gray-600 hover:border-gray-500' : 'border-gray-200 hover:border-gray-300'
                    } ${invoiceForm.planName === plan.name ? 'ring-2 ring-[#003366]' : ''}`}
                    onClick={() => selectPlan(plan)}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <h4 className="font-bold text-gray-900 dark:text-gray-100">{plan.name}</h4>
                      {plan.popular && (
                        <span className="bg-yellow-500 text-yellow-900 text-xs px-2 py-1 rounded-full font-bold">
                          Popular
                        </span>
                      )}
                    </div>
                    <div className="mb-3">
                      <div className="text-2xl font-bold text-[#003366] dark:text-[#FFCC00]">
                        Ksh {formatPrice(plan.price)}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">per month</div>
                    </div>
                    <div className="mb-3">
                      <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                        <Zap size={14} className="mr-1" />
                        {plan.speed}
                      </div>
                    </div>
                    <ul className="space-y-2">
                      {plan.features.map((feature, index) => (
                        <li key={index} className="text-xs text-gray-600 dark:text-gray-400 flex items-center">
                          <CheckCircle size={12} className="mr-1 text-green-500" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Invoice Details Modal - UPDATED WITH REAL-TIME DATA & KSH PRICING */}
      {showInvoiceModal && selectedInvoice && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className={`${themeClasses.card} rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto`}>
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                  Invoice Details - {selectedInvoice.invoiceNumber || 'N/A'}
                </h3>
                <button
                  onClick={() => setShowInvoiceModal(false)}
                  className={`p-2 rounded-lg ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} transition-colors`}
                >
                  <X size={20} />
                </button>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2 flex items-center"><User size={16} className="mr-2"/>Customer Information</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    <strong>Name:</strong> {selectedInvoice.customerName || 'N/A'}<br/>
                    <strong>Email:</strong> {selectedInvoice.customerEmail || 'N/A'}<br/>
                    <strong>Phone:</strong> {selectedInvoice.customerPhone || 'N/A'}<br/>
                    <strong>Location:</strong> {selectedInvoice.customerLocation || 'N/A'}
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2 flex items-center"><FileText size={16} className="mr-2"/>Invoice Details</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    <strong>Date:</strong> {selectedInvoice.invoiceDate ? new Date(selectedInvoice.invoiceDate).toLocaleDateString() : 
                                            selectedInvoice.createdAt ? new Date(selectedInvoice.createdAt).toLocaleDateString() : 'N/A'}<br/>
                    <strong>Due Date:</strong> {selectedInvoice.dueDate ? new Date(selectedInvoice.dueDate).toLocaleDateString() : 'N/A'}<br/>
                    <strong>Plan:</strong> {selectedInvoice.planName || 'N/A'} • {selectedInvoice.planSpeed || 'N/A'}<br/>
                    <strong>Status:</strong> <span className={`font-semibold ${
                      selectedInvoice.status === 'paid' ? 'text-green-600' : 
                      selectedInvoice.status === 'pending' || selectedInvoice.status === 'partially_paid' ? 'text-yellow-600' : 
                      'text-red-600'
                    }`}>{selectedInvoice.status?.toUpperCase() || 'PENDING'}</span>
                  </p>
                </div>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2 flex items-center"><DollarSign size={16} className="mr-2"/>Financial Summary</h4>
                <div className={`border rounded-lg ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className={`${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                      <tr>
                        <th className="px-4 py-2 text-left text-sm font-medium">Description</th>
                        <th className="px-4 py-2 text-center text-sm font-medium">Qty</th>
                        <th className="px-4 py-2 text-right text-sm font-medium">Amount</th>
                      </tr>
                    </thead>
                    <tbody className={`divide-y ${darkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
                      {(selectedInvoice.items || [{ 
                        description: selectedInvoice.planName ? `${selectedInvoice.planName} - ${selectedInvoice.planSpeed}` : 'Internet Service', 
                        quantity: 1, 
                        unitPrice: selectedInvoice.planPrice || selectedInvoice.totalAmount || 0, 
                        amount: selectedInvoice.planPrice || selectedInvoice.totalAmount || 0 
                      }]).map((item, index) => (
                        <tr key={index}>
                          <td className="px-4 py-2 text-sm">{item.description}</td>
                          <td className="px-4 py-2 text-sm text-center">{item.quantity || 1}</td>
                          <td className="px-4 py-2 text-sm text-right">Ksh {formatPrice(item.amount)}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className={`${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                      <tr>
                        <td colSpan="2" className="px-4 py-2 text-sm font-bold text-right">Subtotal</td>
                        <td className="px-4 py-2 text-sm font-bold text-right">Ksh {formatPrice(selectedInvoice.subtotal || selectedInvoice.totalAmount || 0)}</td>
                      </tr>
                      <tr>
                        <td colSpan="2" className="px-4 py-2 text-sm font-bold text-right">Tax ({selectedInvoice.taxRate || 0}%):</td>
                        <td className="px-4 py-2 text-sm font-bold text-right">Ksh {formatPrice(selectedInvoice.taxAmount || 0)}</td>
                      </tr>
                      <tr className="border-t border-b">
                        <td colSpan="2" className="px-4 py-2 text-lg font-extrabold text-right">TOTAL</td>
                        <td className="px-4 py-2 text-lg font-extrabold text-right text-[#003366] dark:text-[#FFCC00]">Ksh {formatPrice(selectedInvoice.totalAmount || 0)}</td>
                      </tr>
                      <tr className="border-t">
                        <td colSpan="2" className="px-4 py-2 text-sm font-bold text-green-600 text-right">Amount Paid</td>
                        <td className="px-4 py-2 text-sm font-bold text-right text-green-600">Ksh {formatPrice(selectedInvoice.amountPaid || 0)}</td>
                      </tr>
                      {selectedInvoice.balanceDue > 0 && (
                        <tr>
                          <td colSpan="2" className="px-4 py-2 text-lg font-bold text-red-600 text-right">Balance Due</td>
                          <td className="px-4 py-2 text-lg font-bold text-right text-red-600">Ksh {formatPrice(selectedInvoice.balanceDue || 0)}</td>
                        </tr>
                      )}
                    </tfoot>
                  </table>
                </div>
              </div>
              {selectedInvoice.notes && (
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Notes</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-700 p-3 rounded-lg whitespace-pre-wrap">
                    {selectedInvoice.notes}
                  </p>
                </div>
              )}
              <div className="flex flex-wrap gap-3 pt-4">
                <button
                  onClick={() => exportInvoicePDF(selectedInvoice)}
                  className={`${themeClasses.button.small.base} ${darkMode ? themeClasses.button.primary.dark : themeClasses.button.primary.light} flex items-center`}
                >
                  <Download size={16} className="mr-1.5" />
                  Download PDF
                </button>
                <button
                  onClick={() => sendInvoiceToClient(selectedInvoice)}
                  disabled={sendingInvoice === selectedInvoice._id}
                  className={`${themeClasses.button.small.base} ${darkMode ? themeClasses.button.secondary.dark : themeClasses.button.secondary.light} flex items-center ${
                    sendingInvoice === selectedInvoice._id ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  <Send size={16} className="mr-1.5" /> {/* Changed icon to Send */}
                  {sendingInvoice === selectedInvoice._id ? 'Sending...' : 'Send to Client'}
                </button>
                {selectedInvoice.status !== 'paid' && (
                  <button
                    onClick={() => {
                      markAsPaid(selectedInvoice._id);
                      setShowInvoiceModal(false);
                    }}
                    className={`${themeClasses.button.small.base} bg-blue-500 hover:bg-blue-600 text-white flex items-center`}
                  >
                    <CheckCircle size={16} className="mr-1.5" />
                    Mark as Paid
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
      {/* PDF Preview Modal - Uses the same logic as the new PDF generation for display consistency */}
      {showPDFModal && selectedInvoice && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className={`${themeClasses.card} rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto`}>
            <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                  PDF Preview - {selectedInvoice.invoiceNumber || 'N/A'}
                </h3>
                <div>
                    <button
                      onClick={() => exportInvoicePDF(selectedInvoice)}
                      className={`${themeClasses.button.small.base} ${darkMode ? themeClasses.button.primary.dark : themeClasses.button.primary.light} mr-2 flex items-center`}
                    >
                      <Download size={16} className="mr-1.5" />
                      Download
                    </button>
                    <button
                      onClick={() => setShowPDFModal(false)}
                      className={`p-2 rounded-lg ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} transition-colors`}
                    >
                      <X size={20} />
                    </button>
                </div>
            </div>
            {/* The actual HTML structure from generateClientSidePDF is rendered here for visual consistency */}
            <div className="p-6">
                <div className={`border-2 border-dashed rounded-lg p-8 ${darkMode ? 'border-gray-600 bg-gray-900' : 'border-gray-300 bg-white'}`}>
                    {/* Render the core PDF content using the improved structure for preview */}
                    {/* This is a simplified preview block, the true rendering happens in html2pdf on download */}
                    <div style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif', color: darkMode ? '#f3f4f6' : '#333' }}>
                        <div className="flex justify-between items-start border-b border-gray-300 dark:border-gray-700 pb-3 mb-4">
                            <div>
                                <h1 className="text-2xl font-black text-[#003366] dark:text-[#FFCC00]">{COMPANY_INFO.name}</h1>
                                <p className="text-xs text-gray-500">{COMPANY_INFO.tagline}</p>
                            </div>
                            <div className="text-right">
                                <img src="${COMPANY_INFO.logoUrl}" alt="Company Logo" style="max-height: 50px; max-width: 90px; object-fit: contain; margin-bottom: 5px;" />
                                <h2 className="text-4xl font-extrabold text-[#FFCC00] dark:text-gray-100">INVOICE</h2>
                                <p className="text-lg font-bold text-[#003366] dark:text-gray-300"># {selectedInvoice.invoiceNumber || 'DRAFT'}</p>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 text-sm mb-4">
                            <div>
                                <h3 className="font-bold mb-1 text-gray-700 dark:text-gray-300">Bill To:</h3>
                                <p>{selectedInvoice.customerName}</p>
                                <p>{selectedInvoice.customerEmail}</p>
                                <p>{selectedInvoice.customerLocation}</p>
                            </div>
                            <div className="text-right">
                                <p><strong>Date:</strong> {selectedInvoice.invoiceDate ? new Date(selectedInvoice.invoiceDate).toLocaleDateString() : 'N/A'}</p>
                                <p><strong>Due:</strong> {selectedInvoice.dueDate ? new Date(selectedInvoice.dueDate).toLocaleDateString() : 'N/A'}</p>
                                <p><strong>Status:</strong> <span className={`font-bold ${selectedInvoice.status === 'paid' ? 'text-green-500' : selectedInvoice.status === 'overdue' ? 'text-red-500' : 'text-yellow-500'}`}>{selectedInvoice.status?.toUpperCase()}</span></p>
                            </div>
                        </div>
                        <table className="w-full mb-4 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                            <thead className="bg-gray-100 dark:bg-gray-700">
                                <tr>
                                    <th className="text-left py-2 px-3 text-xs uppercase">Description</th>
                                    <th className="text-right py-2 px-3 text-xs uppercase">Amount (Ksh)</th>
                                </tr>
                            </thead>
                            <tbody>
                                {selectedInvoice.items?.map((item, index) => (
                                    <tr key={index} className="border-t border-gray-200 dark:border-gray-700">
                                        <td className="py-2 px-3 text-sm">{item.description} (Qty: {item.quantity})</td>
                                        <td className="text-right py-2 px-3 text-sm">{formatPrice(item.amount)}</td>
                                    </tr>
                                )) || (
                                    <tr className="border-t border-gray-200 dark:border-gray-700">
                                        <td className="py-2 px-3 text-sm">{selectedInvoice.planName} - {selectedInvoice.planSpeed}</td>
                                        <td className="text-right py-2 px-3 text-sm">{formatPrice(selectedInvoice.totalAmount)}</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                        <div className="text-right space-y-1 text-sm">
                            <p>Subtotal: <strong>Ksh {formatPrice(selectedInvoice.subtotal)}</strong></p>
                            <p>Tax: <strong>Ksh {formatPrice(selectedInvoice.taxAmount)}</strong></p>
                            <p className="text-lg font-bold border-t pt-2">Total Due: <span className="text-[#003366] dark:text-[#FFCC00]">Ksh {formatPrice(selectedInvoice.totalAmount)}</span></p>
                            <p className={`text-lg font-bold ${selectedInvoice.balanceDue > 0 ? 'text-red-500' : 'text-green-500'}`}>Balance: Ksh {formatPrice(selectedInvoice.balanceDue)}</p>
                        </div>
                    </div>
                </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default InvoiceManager;
