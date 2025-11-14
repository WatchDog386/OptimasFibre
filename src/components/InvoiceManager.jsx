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
  FileDown
} from 'lucide-react';

const InvoiceManager = ({ darkMode, themeClasses, API_BASE_URL, showNotification, invoices, setInvoices }) => {
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showPDFModal, setShowPDFModal] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState(null);
  const [exportLoading, setExportLoading] = useState(false);

  // Form state for creating/editing invoices
  const [invoiceForm, setInvoiceForm] = useState({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    invoiceNumber: '',
    invoiceDate: new Date().toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    items: [{ description: 'Monthly Internet Service', amount: 59.99 }],
    subtotal: 59.99,
    tax: 0,
    total: 59.99,
    status: 'unpaid'
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

      // Ensure invoice numbers are properly formatted
      const formattedInvoices = invoicesData.map((invoice, index) => ({
        ...invoice,
        invoiceNumber: invoice.invoiceNumber || `INV-${String(index + 1).padStart(3, '0')}`
      }));
      
      console.log('Fetched invoices:', formattedInvoices);
      setInvoices(formattedInvoices);
    } catch (error) {
      console.error('Error fetching invoices:', error);
      showNotification(`Error loading invoices: ${error.message}`, 'error');
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
    const latestNumber = invoices.reduce((max, invoice) => {
      const match = invoice.invoiceNumber?.match(/INV-(\d+)/);
      if (match) {
        const num = parseInt(match[1]);
        return num > max ? num : max;
      }
      return max;
    }, 0);
    
    return `INV-${String(latestNumber + 1).padStart(3, '0')}`;
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
    setInvoiceForm(prev => ({
      ...prev,
      [name]: value
    }));

    // Recalculate totals if items or tax changes
    if (name === 'tax') {
      const { subtotal } = calculateTotals(invoiceForm.items);
      setInvoiceForm(prev => ({
        ...prev,
        subtotal,
        total: subtotal + (parseFloat(value) || 0)
      }));
    }
  };

  // Handle item changes
  const handleItemChange = (index, field, value) => {
    const updatedItems = [...invoiceForm.items];
    updatedItems[index] = {
      ...updatedItems[index],
      [field]: field === 'amount' ? parseFloat(value) || 0 : value
    };
    
    const { subtotal, total } = calculateTotals(updatedItems, invoiceForm.tax);
    
    setInvoiceForm(prev => ({
      ...prev,
      items: updatedItems,
      subtotal,
      total
    }));
  };

  // Add new item
  const addItem = () => {
    setInvoiceForm(prev => ({
      ...prev,
      items: [...prev.items, { description: '', amount: 0 }]
    }));
  };

  // Remove item
  const removeItem = (index) => {
    if (invoiceForm.items.length > 1) {
      const updatedItems = invoiceForm.items.filter((_, i) => i !== index);
      const { subtotal, total } = calculateTotals(updatedItems, invoiceForm.tax);
      
      setInvoiceForm(prev => ({
        ...prev,
        items: updatedItems,
        subtotal,
        total
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

      // Update via API
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
          inv._id === invoiceId ? updatedInvoice.invoice : inv
        ));
        showNotification('Invoice marked as paid successfully!', 'success');
      } else {
        throw new Error('Failed to update invoice status');
      }
    } catch (error) {
      console.error('Error marking invoice as paid:', error);
      showNotification(`Error: ${error.message}`, 'error');
    }
  };

  // Create new invoice
  const createInvoice = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication session expired. Please log in again.');
      }

      // Generate invoice number if not provided
      const invoiceData = {
        ...invoiceForm,
        invoiceNumber: invoiceForm.invoiceNumber || generateInvoiceNumber()
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
        setInvoices(prev => [...prev, newInvoice.invoice || newInvoice]);
        setShowCreateModal(false);
        resetForm();
        showNotification('Invoice created successfully!', 'success');
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create invoice');
      }
    } catch (error) {
      console.error('Error creating invoice:', error);
      showNotification(`Error: ${error.message}`, 'error');
    }
  };

  // Update invoice
  const updateInvoice = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication session expired. Please log in again.');
      }

      const response = await fetch(`${API_BASE_URL}/api/invoices/${editingInvoice._id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(invoiceForm)
      });

      if (response.ok) {
        const updatedInvoice = await response.json();
        setInvoices(prev => prev.map(inv => 
          inv._id === editingInvoice._id ? updatedInvoice.invoice : inv
        ));
        setShowCreateModal(false);
        setEditingInvoice(null);
        resetForm();
        showNotification('Invoice updated successfully!', 'success');
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update invoice');
      }
    } catch (error) {
      console.error('Error updating invoice:', error);
      showNotification(`Error: ${error.message}`, 'error');
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
        showNotification('Invoice deleted successfully!', 'success');
      } else {
        throw new Error('Failed to delete invoice');
      }
    } catch (error) {
      console.error('Error deleting invoice:', error);
      showNotification(`Error: ${error.message}`, 'error');
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
        showNotification('Invoice PDF exported successfully!', 'success');
      } else {
        throw new Error('Failed to export PDF');
      }
    } catch (error) {
      console.error('Error exporting PDF:', error);
      showNotification('Error exporting invoice PDF', 'error');
    }
  };

  // Send invoice to client
  const sendInvoiceToClient = async (invoice) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/invoices/${invoice._id}/send`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        showNotification('Invoice sent to client successfully!', 'success');
      } else {
        throw new Error('Failed to send invoice');
      }
    } catch (error) {
      console.error('Error sending invoice:', error);
      showNotification(`Error: ${error.message}`, 'error');
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
        showNotification('Invoices exported to Excel successfully!', 'success');
      } else {
        throw new Error('Failed to export Excel');
      }
    } catch (error) {
      console.error('Error exporting to Excel:', error);
      showNotification('Error exporting invoices to Excel', 'error');
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
      customerName: '',
      customerEmail: '',
      customerPhone: '',
      invoiceNumber: '',
      invoiceDate: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      items: [{ description: 'Monthly Internet Service', amount: 59.99 }],
      subtotal: 59.99,
      tax: 0,
      total: 59.99,
      status: 'unpaid'
    });
  };

  // Edit invoice
  const editInvoice = (invoice) => {
    setInvoiceForm({
      customerName: invoice.customerName || '',
      customerEmail: invoice.customerEmail || '',
      customerPhone: invoice.customerPhone || '',
      invoiceNumber: invoice.invoiceNumber || '',
      invoiceDate: invoice.invoiceDate ? new Date(invoice.invoiceDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      dueDate: invoice.dueDate ? new Date(invoice.dueDate).toISOString().split('T')[0] : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      items: invoice.items || [{ description: 'Monthly Internet Service', amount: 59.99 }],
      subtotal: invoice.subtotal || 59.99,
      tax: invoice.tax || 0,
      total: invoice.total || 59.99,
      status: invoice.status || 'unpaid'
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
                            (filter === 'unpaid' && invoice.status === 'unpaid');
        
        const matchesSearch = 
          (invoice.customerName?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
          (invoice.invoiceNumber?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
          (invoice.customerEmail?.toLowerCase() || '').includes(searchTerm.toLowerCase());
        
        return matchesFilter && matchesSearch;
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
            className={`${themeClasses.button.small.base} ${darkMode ? themeClasses.button.small.dark : themeClasses.button.small.light} flex items-center`}
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

      {/* Filters and Search */}
      <div className={`${themeClasses.card} p-4 mb-6 rounded-xl shadow-sm border backdrop-blur-sm`}>
        <div className="flex flex-col md:flex-row gap-4 items-center">
          <div className="flex-1 w-full">
            <div className="relative">
              <Search size={18} className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
              <input
                type="text"
                placeholder="Search by customer name, invoice number, or email..."
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
              onClick={() => setFilter('unpaid')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center ${
                filter === 'unpaid' 
                  ? (darkMode ? 'bg-red-600 text-white shadow-md' : 'bg-red-600 text-white shadow-md')
                  : (darkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200')
              }`}
            >
              <XCircle size={16} className="mr-1.5" />
              Unpaid
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
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider">
                  Invoice #
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider hidden md:table-cell">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider hidden lg:table-cell">
                  Date
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
                          {invoice.invoiceNumber || `INV-${String(invoices.indexOf(invoice) + 1).padStart(3, '0')}`}
                        </div>
                        <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          {invoice.planName || 'Internet Service'}
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
                    <td className="px-6 py-4 whitespace-nowrap hidden lg:table-cell text-sm text-gray-600 dark:text-gray-400">
                      {invoice.invoiceDate ? new Date(invoice.invoiceDate).toLocaleDateString() : 
                       invoice.createdAt ? new Date(invoice.createdAt).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        ${invoice.total || invoice.planPrice || 0}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        invoice.status === 'paid' 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                          : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                      }`}>
                        {invoice.status === 'paid' ? (
                          <>
                            <CheckCircle size={12} className="mr-1" />
                            Paid
                          </>
                        ) : (
                          <>
                            <XCircle size={12} className="mr-1" />
                            Unpaid
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
                          className={`p-2 rounded-lg ${darkMode ? 'text-green-400 hover:bg-gray-600' : 'text-green-600 hover:bg-gray-100'} transition-colors`}
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
                        
                        {invoice.status === 'unpaid' && (
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

      {/* Create/Edit Invoice Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className={`${themeClasses.card} rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto`}>
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
                      {invoiceForm.items.length > 1 && (
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

              {/* Totals */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Tax Amount
                  </label>
                  <input
                    type="number"
                    name="tax"
                    value={invoiceForm.tax}
                    onChange={handleInputChange}
                    className={`w-full p-3 border rounded-lg text-sm transition-all duration-200 focus:ring-2 focus:ring-[#003366] focus:border-transparent ${themeClasses.input}`}
                    step="0.01"
                    min="0"
                  />
                </div>
                <div>
                  <div className={`p-3 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                    <div className="text-sm font-medium">Subtotal: ${invoiceForm.subtotal.toFixed(2)}</div>
                    <div className="text-sm">Tax: ${invoiceForm.tax.toFixed(2)}</div>
                    <div className="text-lg font-bold mt-1">Total: ${invoiceForm.total.toFixed(2)}</div>
                  </div>
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Status
                  </label>
                  <select
                    name="status"
                    value={invoiceForm.status}
                    onChange={handleInputChange}
                    className={`w-full p-3 border rounded-lg text-sm transition-all duration-200 focus:ring-2 focus:ring-[#003366] focus:border-transparent ${themeClasses.input}`}
                  >
                    <option value="unpaid">Unpaid</option>
                    <option value="paid">Paid</option>
                  </select>
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

      {/* Invoice Details Modal */}
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
                    <strong>Phone:</strong> {selectedInvoice.customerPhone || 'N/A'}
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Invoice Details</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    <strong>Date:</strong> {selectedInvoice.invoiceDate ? new Date(selectedInvoice.invoiceDate).toLocaleDateString() : 
                                         selectedInvoice.createdAt ? new Date(selectedInvoice.createdAt).toLocaleDateString() : 'N/A'}<br/>
                    <strong>Due Date:</strong> {selectedInvoice.dueDate ? new Date(selectedInvoice.dueDate).toLocaleDateString() : 'N/A'}<br/>
                    <strong>Status:</strong> {selectedInvoice.status || 'unpaid'}
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
                      {(selectedInvoice.items || [{ description: selectedInvoice.planName || 'Internet Service', amount: selectedInvoice.total || selectedInvoice.planPrice || 0 }]).map((item, index) => (
                        <tr key={index}>
                          <td className="px-4 py-2 text-sm">{item.description}</td>
                          <td className="px-4 py-2 text-sm text-right">${item.amount}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className={`${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                      <tr>
                        <td className="px-4 py-2 text-sm font-bold">Subtotal</td>
                        <td className="px-4 py-2 text-sm font-bold text-right">${selectedInvoice.subtotal || selectedInvoice.total || 0}</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-2 text-sm font-bold">Tax</td>
                        <td className="px-4 py-2 text-sm font-bold text-right">${selectedInvoice.tax || 0}</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-2 text-sm font-bold">Total</td>
                        <td className="px-4 py-2 text-sm font-bold text-right">${selectedInvoice.total || 0}</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
              
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
                  className={`${themeClasses.button.small.base} ${darkMode ? themeClasses.button.small.dark : themeClasses.button.small.light} flex items-center`}
                >
                  <Send size={16} className="mr-1.5" />
                  Send to Client
                </button>
                {selectedInvoice.status === 'unpaid' && (
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

      {/* PDF Preview Modal */}
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
                  </div>
                  <div className="text-right">
                    <p><strong>Date:</strong> {selectedInvoice.invoiceDate ? new Date(selectedInvoice.invoiceDate).toLocaleDateString() : 
                                            selectedInvoice.createdAt ? new Date(selectedInvoice.createdAt).toLocaleDateString() : 'N/A'}</p>
                    <p><strong>Due Date:</strong> {selectedInvoice.dueDate ? new Date(selectedInvoice.dueDate).toLocaleDateString() : 'N/A'}</p>
                    <p><strong>Status:</strong> {selectedInvoice.status}</p>
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
                    {(selectedInvoice.items || [{ description: selectedInvoice.planName || 'Internet Service', amount: selectedInvoice.total || selectedInvoice.planPrice || 0 }]).map((item, index) => (
                      <tr key={index} className={`border-b ${darkMode ? 'border-gray-600' : 'border-gray-300'}`}>
                        <td className="py-2">{item.description}</td>
                        <td className="text-right py-2">${item.amount}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr>
                      <td className="py-2 font-semibold">Subtotal</td>
                      <td className="text-right py-2">${selectedInvoice.subtotal || selectedInvoice.total || 0}</td>
                    </tr>
                    <tr>
                      <td className="py-2 font-semibold">Tax</td>
                      <td className="text-right py-2">${selectedInvoice.tax || 0}</td>
                    </tr>
                    <tr className={`border-t ${darkMode ? 'border-gray-600' : 'border-gray-300'}`}>
                      <td className="py-2 font-bold">Total</td>
                      <td className="text-right py-2 font-bold">${selectedInvoice.total || 0}</td>
                    </tr>
                  </tfoot>
                </table>
                
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
                  className={`${themeClasses.button.secondary.base} ${darkMode ? themeClasses.button.secondary.dark : themeClasses.button.secondary.light} flex items-center`}
                >
                  <Send size={16} className="mr-1.5" />
                  Send to Client
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