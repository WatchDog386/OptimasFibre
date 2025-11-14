// ReceiptManager.jsx - UPDATED VERSION WITH FIXED VALIDATION
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
  CreditCard
} from 'lucide-react';

// Utility function for consistent price formatting in KSH
const formatPrice = (price) => {
  if (price === undefined || price === null) return '0';
  const cleanStr = price.toString().replace(/,/g, '');
  const num = parseInt(cleanStr, 10);
  return isNaN(num) ? price : num.toLocaleString();
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
      showNotification(`Error loading receipts: ${error.message}`, 'error');
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

  // Filter invoices for search
  const filteredInvoices = Array.isArray(invoices) 
    ? invoices.filter(invoice => {
        if (!invoice || typeof invoice !== 'object') return false;
        
        return (invoice.customerName?.toLowerCase() || '').includes(searchInvoiceTerm.toLowerCase()) ||
               (invoice.invoiceNumber?.toLowerCase() || '').includes(searchInvoiceTerm.toLowerCase()) ||
               (invoice.customerEmail?.toLowerCase() || '').includes(searchInvoiceTerm.toLowerCase());
      })
    : [];

  // Calculate stats
  const stats = {
    totalReceipts: receipts.length,
    thisMonth: receipts.filter(rec => {
      const receiptDate = new Date(rec.receiptDate || rec.createdAt);
      const now = new Date();
      return receiptDate.getMonth() === now.getMonth() && receiptDate.getFullYear() === now.getFullYear();
    }).length,
    totalReceived: receipts.reduce((sum, rec) => sum + (rec.amountPaid || rec.total || 0), 0)
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

      {/* Stats Summary - UPDATED WITH KSH PRICING */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className={`${themeClasses.card} p-4 rounded-xl border backdrop-blur-sm`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Total Receipts</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.totalReceipts}</p>
            </div>
            <div className={`p-2 rounded-lg ${darkMode ? 'bg-blue-900/20' : 'bg-blue-100'}`}>
              <Receipt size={20} className="text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>
        <div className={`${themeClasses.card} p-4 rounded-xl border backdrop-blur-sm`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>This Month</p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                {stats.thisMonth}
              </p>
            </div>
            <div className={`p-2 rounded-lg ${darkMode ? 'bg-green-900/20' : 'bg-green-100'}`}>
              <Calendar size={20} className="text-green-600 dark:text-green-400" />
            </div>
          </div>
        </div>
        <div className={`${themeClasses.card} p-4 rounded-xl border backdrop-blur-sm`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Total Received</p>
              <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                Ksh {formatPrice(stats.totalReceived)}
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
    </div>
  );
};

export default ReceiptManager;