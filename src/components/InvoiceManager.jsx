// InvoiceManager.jsx - UPDATED VERSION
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
  Zap
} from 'lucide-react';

// Utility function for consistent price formatting in KSH
const formatPrice = (price) => {
  if (price === undefined || price === null) return '0';
  const cleanStr = price.toString().replace(/,/g, '');
  const num = parseInt(cleanStr, 10);
  return isNaN(num) ? price : num.toLocaleString();
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

  // Form state for creating/editing invoices - UPDATED TO MATCH YOUR MODEL
  const [invoiceForm, setInvoiceForm] = useState({
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
  });

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
      
      // Ensure we always have an array
      let invoicesData = [];
      
      if (Array.isArray(data)) {
        invoicesData = data;
      } else if (data && Array.isArray(data.data)) {
        invoicesData = data.data;
      } else if (data && Array.isArray(data.invoices)) {
        invoicesData = data.invoices;
      } else {
        invoicesData = [];
      }

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

  // Generate sequential invoice number
  const generateInvoiceNumber = () => {
    if (invoices.length === 0) return 'INV-0001';
    
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
    
    const totalAmount = subtotal + taxAmount - discountAmount;
    
    return { subtotal, taxAmount, totalAmount };
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setInvoiceForm(prev => {
      const updatedForm = {
        ...prev,
        [name]: value
      };

      // Recalculate totals if financial fields change
      if (['taxRate', 'discount', 'discountType'].includes(name)) {
        const { subtotal, taxAmount, totalAmount } = calculateTotals(
          updatedForm.items, 
          updatedForm.taxRate, 
          updatedForm.discount, 
          updatedForm.discountType
        );
        
        return {
          ...updatedForm,
          subtotal,
          taxAmount,
          totalAmount,
          balanceDue: Math.max(0, totalAmount - (updatedForm.amountPaid || 0))
        };
      }

      // Update balance when amountPaid changes
      if (name === 'amountPaid') {
        const amountPaid = parseFloat(value) || 0;
        return {
          ...updatedForm,
          amountPaid,
          balanceDue: Math.max(0, updatedForm.totalAmount - amountPaid)
        };
      }

      return updatedForm;
    });
  };

  // Select WiFi plan
  const selectPlan = (plan) => {
    const items = [{
      description: `${plan.name} Internet Plan - ${plan.speed}`,
      quantity: 1,
      unitPrice: parseFloat(plan.price),
      amount: parseFloat(plan.price)
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
      planPrice: parseFloat(plan.price),
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
    
    const { subtotal, taxAmount, totalAmount } = calculateTotals(
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
      balanceDue: Math.max(0, totalAmount - (prev.amountPaid || 0))
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
    if (invoiceForm.items.length > 1) {
      const updatedItems = invoiceForm.items.filter((_, i) => i !== index);
      const { subtotal, taxAmount, totalAmount } = calculateTotals(
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
        balanceDue: Math.max(0, totalAmount - (prev.amountPaid || 0))
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

      const response = await fetch(`${API_BASE_URL}/api/invoices/${invoiceId}/status`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: 'paid' })
      });

      if (response.ok) {
        const updatedInvoice = await response.json();
        setInvoices(prev => prev.map(inv => 
          inv._id === invoiceId ? (updatedInvoice.invoice || updatedInvoice.data || updatedInvoice) : inv
        ));
        showNotification('✅ Invoice marked as paid successfully!', 'success');
      } else {
        throw new Error('Failed to update invoice status');
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

      // Validate required fields
      if (!invoiceForm.customerName?.trim()) {
        throw new Error('Customer name is required');
      }
      if (!invoiceForm.customerEmail?.trim()) {
        throw new Error('Customer email is required');
      }
      if (!invoiceForm.planName?.trim()) {
        throw new Error('Please select a plan');
      }

      // Prepare invoice data matching your model
      const invoiceData = {
        ...invoiceForm,
        invoiceNumber: invoiceForm.invoiceNumber || generateInvoiceNumber(),
        invoiceDate: new Date(invoiceForm.invoiceDate),
        dueDate: new Date(invoiceForm.dueDate),
        // Ensure all financial fields are numbers
        planPrice: parseFloat(invoiceForm.planPrice) || 0,
        subtotal: parseFloat(invoiceForm.subtotal) || 0,
        taxRate: parseFloat(invoiceForm.taxRate) || 0,
        taxAmount: parseFloat(invoiceForm.taxAmount) || 0,
        discount: parseFloat(invoiceForm.discount) || 0,
        totalAmount: parseFloat(invoiceForm.totalAmount) || 0,
        amountPaid: parseFloat(invoiceForm.amountPaid) || 0,
        balanceDue: parseFloat(invoiceForm.balanceDue) || 0,
        // Update status based on payment
        status: invoiceForm.amountPaid >= invoiceForm.totalAmount ? 'paid' : 'pending'
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
        throw new Error(errorData.message || 'Failed to create invoice');
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
        status: invoiceForm.amountPaid >= invoiceForm.totalAmount ? 'paid' : 'pending'
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
        throw new Error(errorData.message || 'Failed to update invoice');
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
        throw new Error('Failed to delete invoice');
      }
    } catch (error) {
      console.error('Error deleting invoice:', error);
      showNotification(`🚨 Error: ${error.message}`, 'error');
    }
  };

  // Export invoice as PDF
  const exportInvoicePDF = async (invoice) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/invoices/${invoice._id}/export/pdf`, {
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
        a.download = `${invoice.invoiceNumber || 'invoice'}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        showNotification('✅ Invoice PDF exported successfully!', 'success');
      } else {
        // Fallback to client-side PDF generation
        generateClientSidePDF(invoice);
      }
    } catch (error) {
      console.error('Error exporting PDF:', error);
      generateClientSidePDF(invoice);
    }
  };

  // Client-side PDF generation fallback
  const generateClientSidePDF = (invoice) => {
    showNotification('📄 Generating PDF preview...', 'info');
    setSelectedInvoice(invoice);
    setShowPDFModal(true);
  };

  // Send invoice to client
  const sendInvoiceToClient = async (invoice) => {
    try {
      setSendingInvoice(invoice._id);
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/invoices/${invoice._id}/send`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        showNotification('✅ Invoice sent to client successfully!', 'success');
      } else {
        throw new Error('Failed to send invoice');
      }
    } catch (error) {
      console.error('Error sending invoice:', error);
      showNotification(`🚨 Error: ${error.message}`, 'error');
    } finally {
      setSendingInvoice(null);
    }
  };

  // Export all invoices to Excel
  const exportInvoicesToExcel = async () => {
    try {
      setExportLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/invoices/export/excel`, {
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
        a.download = `invoices-${new Date().toISOString().split('T')[0]}.xlsx`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        showNotification('✅ Invoices exported to Excel successfully!', 'success');
      } else {
        throw new Error('Failed to export Excel');
      }
    } catch (error) {
      console.error('Error exporting to Excel:', error);
      showNotification('🚨 Error exporting invoices to Excel', 'error');
    } finally {
      setExportLoading(false);
    }
  };

  // Preview PDF
  const previewPDF = (invoice) => {
    setSelectedInvoice(invoice);
    setShowPDFModal(true);
  };

  // Reset form
  const resetForm = () => {
    setInvoiceForm({
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
    });
  };

  // Edit invoice
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
      items: invoice.items || [],
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
                            (filter === 'overdue' && invoice.status === 'overdue');
        
        const matchesSearch = 
          (invoice.customerName?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
          (invoice.invoiceNumber?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
          (invoice.customerEmail?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
          (invoice.customerPhone?.toLowerCase() || '').includes(searchTerm.toLowerCase());
        
        return matchesFilter && matchesSearch;
      })
    : [];

  // Calculate stats
  const stats = {
    totalInvoices: invoices.length,
    pendingInvoices: invoices.filter(inv => inv.status === 'pending').length,
    paidInvoices: invoices.filter(inv => inv.status === 'paid').length,
    totalRevenue: invoices.reduce((sum, inv) => sum + (inv.totalAmount || inv.planPrice || 0), 0)
  };

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

      {/* Stats Summary - UPDATED WITH KSH PRICING */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className={`${themeClasses.card} p-4 rounded-xl border backdrop-blur-sm`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Total Invoices</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.totalInvoices}</p>
            </div>
            <div className={`p-2 rounded-lg ${darkMode ? 'bg-blue-900/20' : 'bg-blue-100'}`}>
              <FileText size={20} className="text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>
        <div className={`${themeClasses.card} p-4 rounded-xl border backdrop-blur-sm`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Pending</p>
              <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                {stats.pendingInvoices}
              </p>
            </div>
            <div className={`p-2 rounded-lg ${darkMode ? 'bg-yellow-900/20' : 'bg-yellow-100'}`}>
              <Clock size={20} className="text-yellow-600 dark:text-yellow-400" />
            </div>
          </div>
        </div>
        <div className={`${themeClasses.card} p-4 rounded-xl border backdrop-blur-sm`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Paid</p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                {stats.paidInvoices}
              </p>
            </div>
            <div className={`p-2 rounded-lg ${darkMode ? 'bg-green-900/20' : 'bg-green-100'}`}>
              <CheckCircle size={20} className="text-green-600 dark:text-green-400" />
            </div>
          </div>
        </div>
        <div className={`${themeClasses.card} p-4 rounded-xl border backdrop-blur-sm`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Total Revenue</p>
              <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                Ksh {formatPrice(stats.totalRevenue)}
              </p>
            </div>
            <div className={`p-2 rounded-lg ${darkMode ? 'bg-purple-900/20' : 'bg-purple-100'}`}>
              <DollarSign size={20} className="text-purple-600 dark:text-purple-400" />
            </div>
          </div>
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
          </div>
        </div>
      </div>

      {/* Invoices Table - UPDATED WITH KSH PRICING */}
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
                  Plan
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider">
                  Amount
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
                  <td colSpan="6" className="px-6 py-8 text-center">
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
                          {invoice.invoiceDate ? new Date(invoice.invoiceDate).toLocaleDateString() : 
                           invoice.createdAt ? new Date(invoice.createdAt).toLocaleDateString() : 'N/A'}
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
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        Ksh {formatPrice(invoice.totalAmount || invoice.planPrice || 0)}
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
                          onClick={() => previewPDF(invoice)}
                          className={`p-2 rounded-lg ${darkMode ? 'text-blue-400 hover:bg-gray-600' : 'text-blue-600 hover:bg-gray-100'} transition-colors`}
                          title="Preview PDF"
                        >
                          <FileDown size={16} />
                        </button>

                        <button
                          onClick={() => exportInvoicePDF(invoice)}
                          className={`p-2 rounded-lg ${darkMode ? 'text-purple-400 hover:bg-gray-600' : 'text-purple-600 hover:bg-gray-100'} transition-colors`}
                          title="Export PDF"
                        >
                          <Download size={16} />
                        </button>

                        <button
                          onClick={() => sendInvoiceToClient(invoice)}
                          disabled={sendingInvoice === invoice._id}
                          className={`p-2 rounded-lg ${darkMode ? 'text-green-400 hover:bg-gray-600' : 'text-green-600 hover:bg-gray-100'} transition-colors ${
                            sendingInvoice === invoice._id ? 'opacity-50 cursor-not-allowed' : ''
                          }`}
                          title="Send to Client"
                        >
                          <Send size={16} />
                        </button>
                        
                        <button
                          onClick={() => editInvoice(invoice)}
                          className={`p-2 rounded-lg ${darkMode ? 'text-yellow-400 hover:bg-gray-600' : 'text-yellow-600 hover:bg-gray-100'} transition-colors`}
                          title="Edit Invoice"
                        >
                          <Edit size={16} />
                        </button>
                        
                        {invoice.status === 'pending' && (
                          <button
                            onClick={() => markAsPaid(invoice._id)}
                            className={`p-2 rounded-lg ${darkMode ? 'text-green-400 hover:bg-gray-600' : 'text-green-600 hover:bg-gray-100'} transition-colors`}
                            title="Mark as Paid"
                          >
                            <CheckCircle size={16} />
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
              {/* Customer Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                    Customer Phone
                  </label>
                  <input
                    type="tel"
                    name="customerPhone"
                    value={invoiceForm.customerPhone}
                    onChange={handleInputChange}
                    className={`w-full p-3 border rounded-lg text-sm transition-all duration-200 focus:ring-2 focus:ring-[#003366] focus:border-transparent ${themeClasses.input}`}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Customer Location
                  </label>
                  <input
                    type="text"
                    name="customerLocation"
                    value={invoiceForm.customerLocation}
                    onChange={handleInputChange}
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
                    value={invoiceForm.invoiceNumber}
                    onChange={handleInputChange}
                    placeholder="Auto-generated if empty"
                    className={`w-full p-3 border rounded-lg text-sm transition-all duration-200 focus:ring-2 focus:ring-[#003366] focus:border-transparent ${themeClasses.input}`}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Invoice Date *
                  </label>
                  <input
                    type="date"
                    name="invoiceDate"
                    value={invoiceForm.invoiceDate}
                    onChange={handleInputChange}
                    className={`w-full p-3 border rounded-lg text-sm transition-all duration-200 focus:ring-2 focus:ring-[#003366] focus:border-transparent ${themeClasses.input}`}
                    required
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Due Date *
                  </label>
                  <input
                    type="date"
                    name="dueDate"
                    value={invoiceForm.dueDate}
                    onChange={handleInputChange}
                    className={`w-full p-3 border rounded-lg text-sm transition-all duration-200 focus:ring-2 focus:ring-[#003366] focus:border-transparent ${themeClasses.input}`}
                    required
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
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h4 className={`font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Internet Plan</h4>
                  <button
                    type="button"
                    onClick={() => setShowPlanSelection(true)}
                    className={`${themeClasses.button.small.base} ${darkMode ? themeClasses.button.small.dark : themeClasses.button.small.light} flex items-center`}
                  >
                    <Wifi size={14} className="mr-1" />
                    Select Plan
                  </button>
                </div>
                
                {invoiceForm.planName ? (
                  <div className={`p-4 rounded-lg border ${darkMode ? 'border-gray-600 bg-gray-700' : 'border-gray-200 bg-gray-50'}`}>
                    <div className="flex justify-between items-start">
                      <div>
                        <h5 className="font-semibold text-gray-900 dark:text-gray-100">
                          {invoiceForm.planName} - {invoiceForm.planSpeed}
                        </h5>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Ksh {formatPrice(invoiceForm.planPrice)} / month
                        </p>
                        {invoiceForm.features.length > 0 && (
                          <ul className="mt-2 space-y-1">
                            {invoiceForm.features.map((feature, index) => (
                              <li key={index} className="text-xs text-gray-600 dark:text-gray-400 flex items-center">
                                <CheckCircle size={12} className="mr-1 text-green-500" />
                                {feature}
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                      <button
                        onClick={() => {
                          setInvoiceForm(prev => ({
                            ...prev,
                            planName: '',
                            planPrice: 0,
                            planSpeed: '',
                            features: []
                          }));
                        }}
                        className={`p-1 rounded ${darkMode ? 'text-red-400 hover:bg-gray-600' : 'text-red-600 hover:bg-gray-200'}`}
                      >
                        <X size={16} />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className={`p-4 rounded-lg border-2 border-dashed text-center ${darkMode ? 'border-gray-600' : 'border-gray-300'}`}>
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      No plan selected. Click "Select Plan" to choose an internet package.
                    </p>
                  </div>
                )}
              </div>

              {/* Invoice Items */}
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h4 className={`font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Invoice Items</h4>
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
                  {invoiceForm.items.map((item, index) => (
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
                      {invoiceForm.items.length > 1 && (
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
                    Discount
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
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Discount Type
                  </label>
                  <select
                    name="discountType"
                    value={invoiceForm.discountType}
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
                    Amount Paid (Ksh)
                  </label>
                  <input
                    type="number"
                    name="amountPaid"
                    value={invoiceForm.amountPaid}
                    onChange={handleInputChange}
                    className={`w-full p-3 border rounded-lg text-sm transition-all duration-200 focus:ring-2 focus:ring-[#003366] focus:border-transparent ${themeClasses.input}`}
                    step="1"
                    min="0"
                  />
                </div>
              </div>

              {/* Totals Display */}
              <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <div className="font-medium">Subtotal:</div>
                    <div className="font-bold">Ksh {formatPrice(invoiceForm.subtotal)}</div>
                  </div>
                  <div>
                    <div className="font-medium">Tax:</div>
                    <div className="font-bold">Ksh {formatPrice(invoiceForm.taxAmount)}</div>
                  </div>
                  <div>
                    <div className="font-medium">Total:</div>
                    <div className="font-bold text-lg">Ksh {formatPrice(invoiceForm.totalAmount)}</div>
                  </div>
                  <div>
                    <div className="font-medium">Balance Due:</div>
                    <div className={`font-bold ${invoiceForm.balanceDue > 0 ? 'text-red-600' : 'text-green-600'}`}>
                      Ksh {formatPrice(invoiceForm.balanceDue)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                <div>
                  <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Payment Terms
                  </label>
                  <select
                    name="paymentTerms"
                    value={invoiceForm.paymentTerms}
                    onChange={handleInputChange}
                    className={`w-full p-3 border rounded-lg text-sm transition-all duration-200 focus:ring-2 focus:ring-[#003366] focus:border-transparent ${themeClasses.input}`}
                  >
                    <option value="Due upon receipt">Due upon receipt</option>
                    <option value="Net 15">Net 15</option>
                    <option value="Net 30">Net 30</option>
                    <option value="Net 60">Net 60</option>
                    <option value="Custom">Custom</option>
                  </select>
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

      {/* Invoice Details Modal - UPDATED WITH KSH PRICING */}
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
                  <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Customer Information</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    <strong>Name:</strong> {selectedInvoice.customerName || 'N/A'}<br/>
                    <strong>Email:</strong> {selectedInvoice.customerEmail || 'N/A'}<br/>
                    <strong>Phone:</strong> {selectedInvoice.customerPhone || 'N/A'}<br/>
                    <strong>Location:</strong> {selectedInvoice.customerLocation || 'N/A'}
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Invoice Details</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    <strong>Date:</strong> {selectedInvoice.invoiceDate ? new Date(selectedInvoice.invoiceDate).toLocaleDateString() : 
                                         selectedInvoice.createdAt ? new Date(selectedInvoice.createdAt).toLocaleDateString() : 'N/A'}<br/>
                    <strong>Due Date:</strong> {selectedInvoice.dueDate ? new Date(selectedInvoice.dueDate).toLocaleDateString() : 'N/A'}<br/>
                    <strong>Plan:</strong> {selectedInvoice.planName || 'N/A'} • {selectedInvoice.planSpeed || 'N/A'}<br/>
                    <strong>Status:</strong> <span className={`font-semibold ${
                      selectedInvoice.status === 'paid' ? 'text-green-600' : 
                      selectedInvoice.status === 'pending' ? 'text-yellow-600' : 
                      'text-red-600'
                    }`}>{selectedInvoice.status?.toUpperCase() || 'PENDING'}</span>
                  </p>
                </div>
              </div>
              
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
                      {(selectedInvoice.items || [{ 
                        description: selectedInvoice.planName ? `${selectedInvoice.planName} - ${selectedInvoice.planSpeed}` : 'Internet Service', 
                        quantity: 1, 
                        unitPrice: selectedInvoice.planPrice || selectedInvoice.totalAmount || 0, 
                        amount: selectedInvoice.planPrice || selectedInvoice.totalAmount || 0 
                      }]).map((item, index) => (
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
                        <td className="px-4 py-2 text-sm font-bold text-right">Ksh {formatPrice(selectedInvoice.subtotal || selectedInvoice.totalAmount || 0)}</td>
                      </tr>
                      <tr>
                        <td colSpan="3" className="px-4 py-2 text-sm font-bold text-right">Tax</td>
                        <td className="px-4 py-2 text-sm font-bold text-right">Ksh {formatPrice(selectedInvoice.taxAmount || 0)}</td>
                      </tr>
                      <tr>
                        <td colSpan="3" className="px-4 py-2 text-sm font-bold text-right">Total</td>
                        <td className="px-4 py-2 text-sm font-bold text-right">Ksh {formatPrice(selectedInvoice.totalAmount || 0)}</td>
                      </tr>
                      <tr className="border-t">
                        <td colSpan="3" className="px-4 py-2 text-sm font-bold text-green-600 text-right">Amount Paid</td>
                        <td className="px-4 py-2 text-sm font-bold text-right text-green-600">Ksh {formatPrice(selectedInvoice.amountPaid || 0)}</td>
                      </tr>
                      {selectedInvoice.balanceDue > 0 && (
                        <tr>
                          <td colSpan="3" className="px-4 py-2 text-sm font-bold text-red-600 text-right">Balance Due</td>
                          <td className="px-4 py-2 text-sm font-bold text-right text-red-600">Ksh {formatPrice(selectedInvoice.balanceDue || 0)}</td>
                        </tr>
                      )}
                    </tfoot>
                  </table>
                </div>
              </div>

              {selectedInvoice.notes && (
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Notes</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                    {selectedInvoice.notes}
                  </p>
                </div>
              )}
              
              <div className="flex flex-wrap gap-3 pt-4">
                <button
                  onClick={() => exportInvoicePDF(selectedInvoice)}
                  className={`${themeClasses.button.small.base} ${darkMode ? themeClasses.button.small.dark : themeClasses.button.small.light} flex items-center`}
                >
                  <Download size={16} className="mr-1.5" />
                  Export PDF
                </button>
                <button
                  onClick={() => sendInvoiceToClient(selectedInvoice)}
                  disabled={sendingInvoice === selectedInvoice._id}
                  className={`${themeClasses.button.small.base} ${darkMode ? themeClasses.button.small.dark : themeClasses.button.small.light} flex items-center ${
                    sendingInvoice === selectedInvoice._id ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  <Send size={16} className="mr-1.5" />
                  {sendingInvoice === selectedInvoice._id ? 'Sending...' : 'Send to Client'}
                </button>
                {selectedInvoice.status === 'pending' && (
                  <button
                    onClick={() => {
                      markAsPaid(selectedInvoice._id);
                      setShowInvoiceModal(false);
                    }}
                    className={`${themeClasses.button.primary.base} ${darkMode ? themeClasses.button.primary.dark : themeClasses.button.primary.light} flex items-center`}
                  >
                    <CheckCircle size={16} className="mr-1.5" />
                    Mark as Paid
                  </button>
                )}
                <button
                  onClick={() => {
                    setShowInvoiceModal(false);
                    editInvoice(selectedInvoice);
                  }}
                  className={`${themeClasses.button.secondary.base} ${darkMode ? themeClasses.button.secondary.dark : themeClasses.button.secondary.light} flex items-center`}
                >
                  <Edit size={16} className="mr-1.5" />
                  Edit Invoice
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PDF Preview Modal - UPDATED WITH KSH PRICING */}
      {showPDFModal && selectedInvoice && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className={`${themeClasses.card} rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto`}>
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                  PDF Preview - {selectedInvoice.invoiceNumber}
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
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">INVOICE</h2>
                  <p className="text-gray-600 dark:text-gray-400">Invoice #: {selectedInvoice.invoiceNumber}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-8 mb-6">
                  <div>
                    <h3 className="font-semibold mb-2">Bill To:</h3>
                    <p>{selectedInvoice.customerName}</p>
                    <p>{selectedInvoice.customerEmail}</p>
                    <p>{selectedInvoice.customerPhone}</p>
                    <p>{selectedInvoice.customerLocation}</p>
                  </div>
                  <div className="text-right">
                    <p><strong>Date:</strong> {selectedInvoice.invoiceDate ? new Date(selectedInvoice.invoiceDate).toLocaleDateString() : 
                                            selectedInvoice.createdAt ? new Date(selectedInvoice.createdAt).toLocaleDateString() : 'N/A'}</p>
                    <p><strong>Due Date:</strong> {selectedInvoice.dueDate ? new Date(selectedInvoice.dueDate).toLocaleDateString() : 'N/A'}</p>
                    <p><strong>Status:</strong> {selectedInvoice.status}</p>
                    {selectedInvoice.planName && (
                      <p><strong>Plan:</strong> {selectedInvoice.planName} • {selectedInvoice.planSpeed}</p>
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
                    {(selectedInvoice.items || [{ 
                      description: selectedInvoice.planName ? `${selectedInvoice.planName} - ${selectedInvoice.planSpeed}` : 'Internet Service', 
                      quantity: 1, 
                      unitPrice: selectedInvoice.planPrice || selectedInvoice.totalAmount || 0, 
                      amount: selectedInvoice.planPrice || selectedInvoice.totalAmount || 0 
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
                      <td className="text-right py-2">Ksh {formatPrice(selectedInvoice.subtotal || selectedInvoice.totalAmount || 0)}</td>
                    </tr>
                    <tr>
                      <td colSpan="3" className="py-2 font-semibold text-right">Tax</td>
                      <td className="text-right py-2">Ksh {formatPrice(selectedInvoice.taxAmount || 0)}</td>
                    </tr>
                    <tr className={`border-t ${darkMode ? 'border-gray-600' : 'border-gray-300'}`}>
                      <td colSpan="3" className="py-2 font-bold">Total</td>
                      <td className="text-right py-2 font-bold">Ksh {formatPrice(selectedInvoice.totalAmount || 0)}</td>
                    </tr>
                    <tr className={`border-t ${darkMode ? 'border-gray-600' : 'border-gray-300'}`}>
                      <td colSpan="3" className="py-2 font-bold text-green-600">Amount Paid</td>
                      <td className="text-right py-2 font-bold text-green-600">Ksh {formatPrice(selectedInvoice.amountPaid || 0)}</td>
                    </tr>
                    {selectedInvoice.balanceDue > 0 && (
                      <tr>
                        <td colSpan="3" className="py-2 font-bold text-red-600">Balance Due</td>
                        <td className="text-right py-2 font-bold text-red-600">Ksh {formatPrice(selectedInvoice.balanceDue || 0)}</td>
                      </tr>
                    )}
                  </tfoot>
                </table>
                
                {selectedInvoice.notes && (
                  <div className={`mt-4 p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                    <p className="text-sm font-semibold mb-1">Notes:</p>
                    <p className="text-sm">{selectedInvoice.notes}</p>
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
                  onClick={() => exportInvoicePDF(selectedInvoice)}
                  className={`${themeClasses.button.primary.base} ${darkMode ? themeClasses.button.primary.dark : themeClasses.button.primary.light} flex items-center`}
                >
                  <Download size={16} className="mr-1.5" />
                  Download PDF
                </button>
                <button
                  onClick={() => sendInvoiceToClient(selectedInvoice)}
                  disabled={sendingInvoice === selectedInvoice._id}
                  className={`${themeClasses.button.secondary.base} ${darkMode ? themeClasses.button.secondary.dark : themeClasses.button.secondary.light} flex items-center ${
                    sendingInvoice === selectedInvoice._id ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  <Send size={16} className="mr-1.5" />
                  {sendingInvoice === selectedInvoice._id ? 'Sending...' : 'Send to Client'}
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