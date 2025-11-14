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

  // Form state for creating/editing receipts
  const [receiptForm, setReceiptForm] = useState({
    receiptNumber: '',
    invoiceNumber: '',
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    receiptDate: new Date().toISOString().split('T')[0],
    paymentDate: new Date().toISOString().split('T')[0],
    items: [{ description: 'Monthly Internet Service', amount: 59.99 }],
    subtotal: 59.99,
    tax: 0,
    total: 59.99,
    amountPaid: 59.99,
    paymentMethod: 'cash',
    status: 'paid',
    notes: ''
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

      // Ensure receipt numbers are properly formatted
      const formattedReceipts = receiptsData.map((receipt, index) => ({
        ...receipt,
        receiptNumber: receipt.receiptNumber || `RCP-${String(receiptsData.length - index).padStart(3, '0')}`
      }));
      
      console.log('Fetched receipts:', formattedReceipts);
      setReceipts(formattedReceipts);
    } catch (error) {
      console.error('Error fetching receipts:', error);
      showNotification(`Error loading receipts: ${error.message}`, 'error');
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
  const calculateTotals = (items, tax = 0) => {
    const subtotal = items.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0);
    const total = subtotal + (parseFloat(tax) || 0);
    return { subtotal, total };
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setReceiptForm(prev => ({
      ...prev,
      [name]: value
    }));

    // Recalculate totals if items or tax changes
    if (name === 'tax') {
      const { subtotal } = calculateTotals(receiptForm.items);
      setReceiptForm(prev => ({
        ...prev,
        subtotal,
        total: subtotal + (parseFloat(value) || 0)
      }));
    }
  };

  // Handle item changes
  const handleItemChange = (index, field, value) => {
    const updatedItems = [...receiptForm.items];
    updatedItems[index] = {
      ...updatedItems[index],
      [field]: field === 'amount' ? parseFloat(value) || 0 : value
    };
    
    const { subtotal, total } = calculateTotals(updatedItems, receiptForm.tax);
    
    setReceiptForm(prev => ({
      ...prev,
      items: updatedItems,
      subtotal,
      total,
      amountPaid: total // Auto-set amount paid to total
    }));
  };

  // Add new item
  const addItem = () => {
    setReceiptForm(prev => ({
      ...prev,
      items: [...prev.items, { description: '', amount: 0 }]
    }));
  };

  // Remove item
  const removeItem = (index) => {
    if (receiptForm.items.length > 1) {
      const updatedItems = receiptForm.items.filter((_, i) => i !== index);
      const { subtotal, total } = calculateTotals(updatedItems, receiptForm.tax);
      
      setReceiptForm(prev => ({
        ...prev,
        items: updatedItems,
        subtotal,
        total,
        amountPaid: total
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

      // Generate receipt number if not provided
      const receiptData = {
        ...receiptForm,
        receiptNumber: receiptForm.receiptNumber || generateReceiptNumber()
      };

      const response = await fetch(`${API_BASE_URL}/api/receipts`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(receiptData)
      });

      if (response.ok) {
        const newReceipt = await response.json();
        setReceipts(prev => [...prev, newReceipt.receipt || newReceipt]);
        setShowCreateModal(false);
        resetForm();
        showNotification('Receipt created successfully!', 'success');
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create receipt');
      }
    } catch (error) {
      console.error('Error creating receipt:', error);
      showNotification(`Error: ${error.message}`, 'error');
    }
  };

  // Update receipt
  const updateReceipt = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication session expired. Please log in again.');
      }

      const response = await fetch(`${API_BASE_URL}/api/receipts/${editingReceipt._id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(receiptForm)
      });

      if (response.ok) {
        const updatedReceipt = await response.json();
        setReceipts(prev => prev.map(rec => 
          rec._id === editingReceipt._id ? updatedReceipt.receipt : rec
        ));
        setShowCreateModal(false);
        setEditingReceipt(null);
        resetForm();
        showNotification('Receipt updated successfully!', 'success');
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update receipt');
      }
    } catch (error) {
      console.error('Error updating receipt:', error);
      showNotification(`Error: ${error.message}`, 'error');
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
        showNotification('Receipt deleted successfully!', 'success');
      } else {
        throw new Error('Failed to delete receipt');
      }
    } catch (error) {
      console.error('Error deleting receipt:', error);
      showNotification(`Error: ${error.message}`, 'error');
    }
  };

  // Export receipt as PDF
  const exportReceiptPDF = async (receipt) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/receipts/${receipt._id}/export/pdf`, {
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
        a.download = `${receipt.receiptNumber || 'receipt'}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        showNotification('Receipt PDF exported successfully!', 'success');
      } else {
        // Fallback to client-side PDF generation
        generateClientSidePDF(receipt);
      }
    } catch (error) {
      console.error('Error exporting PDF:', error);
      generateClientSidePDF(receipt);
    }
  };

  // Client-side PDF generation fallback
  const generateClientSidePDF = (receipt) => {
    showNotification('Generating PDF preview...', 'info');
    setSelectedReceipt(receipt);
    setShowPDFModal(true);
  };

  // Send receipt to client
  const sendReceiptToClient = async (receipt) => {
    try {
      setSendingReceipt(receipt._id);
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/receipts/${receipt._id}/send`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        showNotification('Receipt sent to client successfully!', 'success');
      } else {
        throw new Error('Failed to send receipt');
      }
    } catch (error) {
      console.error('Error sending receipt:', error);
      showNotification(`Error: ${error.message}`, 'error');
    } finally {
      setSendingReceipt(null);
    }
  };

  // Export all receipts to PDF
  const exportReceiptsToPDF = async () => {
    try {
      setExportLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/receipts/export/pdf`, {
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
        a.download = `receipts-export-${new Date().toISOString().split('T')[0]}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        showNotification('Receipts exported to PDF successfully!', 'success');
      } else {
        throw new Error('Failed to export PDF');
      }
    } catch (error) {
      console.error('Error exporting to PDF:', error);
      showNotification('Error exporting receipts to PDF', 'error');
    } finally {
      setExportLoading(false);
    }
  };

  // Generate receipt from invoice
  const generateReceiptFromInvoice = (invoice) => {
    setReceiptForm({
      receiptNumber: generateReceiptNumber(),
      invoiceNumber: invoice.invoiceNumber || '',
      customerName: invoice.customerName || '',
      customerEmail: invoice.customerEmail || '',
      customerPhone: invoice.customerPhone || '',
      receiptDate: new Date().toISOString().split('T')[0],
      paymentDate: new Date().toISOString().split('T')[0],
      items: invoice.items || [{ description: 'Monthly Internet Service', amount: 59.99 }],
      subtotal: invoice.subtotal || 59.99,
      tax: invoice.tax || 0,
      total: invoice.total || 59.99,
      amountPaid: invoice.total || 59.99,
      paymentMethod: 'cash',
      status: 'paid',
      notes: `Payment received for invoice ${invoice.invoiceNumber || ''}`
    });
    setShowInvoiceSearch(false);
    setShowCreateModal(true);
  };

  // Preview PDF
  const previewPDF = (receipt) => {
    setSelectedReceipt(receipt);
    setShowPDFModal(true);
  };

  // Print receipt
  const printReceipt = (receipt) => {
    setSelectedReceipt(receipt);
    setTimeout(() => {
      window.print();
    }, 500);
  };

  // Reset form
  const resetForm = () => {
    setReceiptForm({
      receiptNumber: '',
      invoiceNumber: '',
      customerName: '',
      customerEmail: '',
      customerPhone: '',
      receiptDate: new Date().toISOString().split('T')[0],
      paymentDate: new Date().toISOString().split('T')[0],
      items: [{ description: 'Monthly Internet Service', amount: 59.99 }],
      subtotal: 59.99,
      tax: 0,
      total: 59.99,
      amountPaid: 59.99,
      paymentMethod: 'cash',
      status: 'paid',
      notes: ''
    });
  };

  // Edit receipt
  const editReceipt = (receipt) => {
    setReceiptForm({
      receiptNumber: receipt.receiptNumber || '',
      invoiceNumber: receipt.invoiceNumber || '',
      customerName: receipt.customerName || '',
      customerEmail: receipt.customerEmail || '',
      customerPhone: receipt.customerPhone || '',
      receiptDate: receipt.receiptDate ? new Date(receipt.receiptDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      paymentDate: receipt.paymentDate ? new Date(receipt.paymentDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      items: receipt.items || [{ description: 'Monthly Internet Service', amount: 59.99 }],
      subtotal: receipt.subtotal || 59.99,
      tax: receipt.tax || 0,
      total: receipt.total || 59.99,
      amountPaid: receipt.amountPaid || 59.99,
      paymentMethod: receipt.paymentMethod || 'cash',
      status: receipt.status || 'paid',
      notes: receipt.notes || ''
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
        
        const matchesFilter = filter === 'all';
        
        const matchesSearch = 
          (receipt.customerName?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
          (receipt.receiptNumber?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
          (receipt.invoiceNumber?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
          (receipt.customerEmail?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
          (receipt.customerPhone?.toLowerCase() || '').includes(searchTerm.toLowerCase());
        
        return matchesFilter && matchesSearch;
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
            onClick={exportReceiptsToPDF}
            disabled={exportLoading || receipts.length === 0}
            className={`${themeClasses.button.small.base} ${darkMode ? themeClasses.button.small.dark : themeClasses.button.small.light} flex items-center ${
              (exportLoading || receipts.length === 0) ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            <FileSpreadsheet size={16} className="mr-1.5" />
            {exportLoading ? 'Exporting...' : 'Export All PDF'}
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

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className={`${themeClasses.card} p-4 rounded-xl border backdrop-blur-sm`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Total Receipts</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{receipts.length}</p>
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
                {receipts.filter(rec => {
                  const receiptDate = new Date(rec.receiptDate || rec.createdAt);
                  const now = new Date();
                  return receiptDate.getMonth() === now.getMonth() && receiptDate.getFullYear() === now.getFullYear();
                }).length}
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
                ${receipts.reduce((sum, rec) => sum + (rec.amountPaid || rec.total || 0), 0).toFixed(2)}
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

      {/* Receipts Table */}
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
                  Payment Method
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
                          {receipt.receiptNumber || `RCP-${String(receipts.indexOf(receipt) + 1).padStart(3, '0')}`}
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
                        ${(receipt.amountPaid || receipt.total || 0).toFixed(2)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap hidden md:table-cell">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        receipt.paymentMethod === 'cash' 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                          : receipt.paymentMethod === 'card'
                          ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                          : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                      }`}>
                        {receipt.paymentMethod?.toUpperCase() || 'CASH'}
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
                          <Send size={16} />
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
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Amount Paid *
                  </label>
                  <input
                    type="number"
                    name="amountPaid"
                    value={receiptForm.amountPaid}
                    onChange={handleInputChange}
                    className={`w-full p-3 border rounded-lg text-sm transition-all duration-200 focus:ring-2 focus:ring-[#003366] focus:border-transparent ${themeClasses.input}`}
                    step="0.01"
                    min="0"
                    required
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
                    <div key={index} className="flex gap-3 items-start">
                      <div className="flex-1">
                        <input
                          type="text"
                          placeholder="Item description"
                          value={item.description}
                          onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                          className={`w-full p-2 border rounded-lg text-sm transition-all duration-200 focus:ring-2 focus:ring-[#003366] focus:border-transparent ${themeClasses.input}`}
                        />
                      </div>
                      <div className="w-32">
                        <input
                          type="number"
                          placeholder="Amount"
                          value={item.amount}
                          onChange={(e) => handleItemChange(index, 'amount', e.target.value)}
                          className={`w-full p-2 border rounded-lg text-sm transition-all duration-200 focus:ring-2 focus:ring-[#003366] focus:border-transparent ${themeClasses.input}`}
                          step="0.01"
                          min="0"
                        />
                      </div>
                      {receiptForm.items.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeItem(index)}
                          className={`p-2 rounded-lg ${darkMode ? 'text-red-400 hover:bg-gray-700' : 'text-red-600 hover:bg-gray-100'} transition-colors`}
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Notes */}
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

              {/* Totals */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Tax Amount
                  </label>
                  <input
                    type="number"
                    name="tax"
                    value={receiptForm.tax}
                    onChange={handleInputChange}
                    className={`w-full p-3 border rounded-lg text-sm transition-all duration-200 focus:ring-2 focus:ring-[#003366] focus:border-transparent ${themeClasses.input}`}
                    step="0.01"
                    min="0"
                  />
                </div>
                <div>
                  <div className={`p-3 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                    <div className="text-sm font-medium">Subtotal: ${receiptForm.subtotal.toFixed(2)}</div>
                    <div className="text-sm">Tax: ${receiptForm.tax.toFixed(2)}</div>
                    <div className="text-lg font-bold mt-1">Total: ${receiptForm.total.toFixed(2)}</div>
                    <div className="text-sm font-semibold mt-2">Amount Paid: ${receiptForm.amountPaid.toFixed(2)}</div>
                  </div>
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
                            ${invoice.total || 0}
                          </p>
                        </div>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          invoice.status === 'paid' 
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                            : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                        }`}>
                          {invoice.status || 'unpaid'}
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
                    <strong>Phone:</strong> {selectedReceipt.customerPhone || 'N/A'}
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Receipt Details</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    <strong>Receipt Date:</strong> {selectedReceipt.receiptDate ? new Date(selectedReceipt.receiptDate).toLocaleDateString() : 
                                                  selectedReceipt.createdAt ? new Date(selectedReceipt.createdAt).toLocaleDateString() : 'N/A'}<br/>
                    <strong>Payment Date:</strong> {selectedReceipt.paymentDate ? new Date(selectedReceipt.paymentDate).toLocaleDateString() : 'N/A'}<br/>
                    <strong>Invoice #:</strong> {selectedReceipt.invoiceNumber || 'N/A'}<br/>
                    <strong>Payment Method:</strong> {selectedReceipt.paymentMethod?.toUpperCase() || 'CASH'}
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
                        <th className="px-4 py-2 text-right text-sm font-medium">Amount</th>
                      </tr>
                    </thead>
                    <tbody className={`divide-y ${darkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
                      {(selectedReceipt.items || [{ description: 'Internet Service', amount: selectedReceipt.total || selectedReceipt.amountPaid || 0 }]).map((item, index) => (
                        <tr key={index}>
                          <td className="px-4 py-2 text-sm">{item.description}</td>
                          <td className="px-4 py-2 text-sm text-right">${item.amount}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className={`${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                      <tr>
                        <td className="px-4 py-2 text-sm font-bold">Subtotal</td>
                        <td className="px-4 py-2 text-sm font-bold text-right">${selectedReceipt.subtotal || selectedReceipt.total || 0}</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-2 text-sm font-bold">Tax</td>
                        <td className="px-4 py-2 text-sm font-bold text-right">${selectedReceipt.tax || 0}</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-2 text-sm font-bold">Total</td>
                        <td className="px-4 py-2 text-sm font-bold text-right">${selectedReceipt.total || 0}</td>
                      </tr>
                      <tr className="border-t">
                        <td className="px-4 py-2 text-sm font-bold text-green-600">Amount Paid</td>
                        <td className="px-4 py-2 text-sm font-bold text-right text-green-600">${selectedReceipt.amountPaid || selectedReceipt.total || 0}</td>
                      </tr>
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
                  <Send size={16} className="mr-1.5" />
                  {sendingReceipt === selectedReceipt._id ? 'Sending...' : 'Send to Client'}
                </button>
                <button
                  onClick={() => printReceipt(selectedReceipt)}
                  className={`${themeClasses.button.small.base} ${darkMode ? themeClasses.button.small.dark : themeClasses.button.small.light} flex items-center`}
                >
                  <Printer size={16} className="mr-1.5" />
                  Print
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
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">PAYMENT RECEIPT</h2>
                  <p className="text-gray-600 dark:text-gray-400">Receipt #: {selectedReceipt.receiptNumber}</p>
                  {selectedReceipt.invoiceNumber && (
                    <p className="text-gray-600 dark:text-gray-400">Invoice #: {selectedReceipt.invoiceNumber}</p>
                  )}
                </div>
                
                <div className="grid grid-cols-2 gap-8 mb-6">
                  <div>
                    <h3 className="font-semibold mb-2">Received From:</h3>
                    <p>{selectedReceipt.customerName}</p>
                    <p>{selectedReceipt.customerEmail}</p>
                    <p>{selectedReceipt.customerPhone}</p>
                  </div>
                  <div className="text-right">
                    <p><strong>Receipt Date:</strong> {selectedReceipt.receiptDate ? new Date(selectedReceipt.receiptDate).toLocaleDateString() : 
                                                     selectedReceipt.createdAt ? new Date(selectedReceipt.createdAt).toLocaleDateString() : 'N/A'}</p>
                    <p><strong>Payment Date:</strong> {selectedReceipt.paymentDate ? new Date(selectedReceipt.paymentDate).toLocaleDateString() : 'N/A'}</p>
                    <p><strong>Payment Method:</strong> {selectedReceipt.paymentMethod?.toUpperCase() || 'CASH'}</p>
                  </div>
                </div>
                
                <table className="w-full mb-6">
                  <thead>
                    <tr className={`border-b ${darkMode ? 'border-gray-600' : 'border-gray-300'}`}>
                      <th className="text-left py-2">Description</th>
                      <th className="text-right py-2">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(selectedReceipt.items || [{ description: 'Internet Service', amount: selectedReceipt.total || selectedReceipt.amountPaid || 0 }]).map((item, index) => (
                      <tr key={index} className={`border-b ${darkMode ? 'border-gray-600' : 'border-gray-300'}`}>
                        <td className="py-2">{item.description}</td>
                        <td className="text-right py-2">${item.amount}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr>
                      <td className="py-2 font-semibold">Subtotal</td>
                      <td className="text-right py-2">${selectedReceipt.subtotal || selectedReceipt.total || 0}</td>
                    </tr>
                    <tr>
                      <td className="py-2 font-semibold">Tax</td>
                      <td className="text-right py-2">${selectedReceipt.tax || 0}</td>
                    </tr>
                    <tr className={`border-t ${darkMode ? 'border-gray-600' : 'border-gray-300'}`}>
                      <td className="py-2 font-bold">Total</td>
                      <td className="text-right py-2 font-bold">${selectedReceipt.total || 0}</td>
                    </tr>
                    <tr className={`border-t-2 ${darkMode ? 'border-gray-600' : 'border-gray-300'}`}>
                      <td className="py-2 font-bold text-green-600">Amount Paid</td>
                      <td className="text-right py-2 font-bold text-green-600">${selectedReceipt.amountPaid || selectedReceipt.total || 0}</td>
                    </tr>
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
                    Thank you for your payment!
                  </p>
                </div>
              </div>
              
              <div className="flex justify-center space-x-4 mt-6">
                <button
                  onClick={() => window.print()}
                  className={`${themeClasses.button.secondary.base} ${darkMode ? themeClasses.button.secondary.dark : themeClasses.button.secondary.light} flex items-center`}
                >
                  <Printer size={16} className="mr-1.5" />
                  Print
                </button>
                <button
                  onClick={() => sendReceiptToClient(selectedReceipt)}
                  disabled={sendingReceipt === selectedReceipt._id}
                  className={`${themeClasses.button.primary.base} ${darkMode ? themeClasses.button.primary.dark : themeClasses.button.primary.light} flex items-center ${
                    sendingReceipt === selectedReceipt._id ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  <Send size={16} className="mr-1.5" />
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