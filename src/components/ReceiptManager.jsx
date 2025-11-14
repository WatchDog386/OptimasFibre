// ReceiptManager.jsx
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
  AlertCircle
} from 'lucide-react';

const ReceiptManager = ({ darkMode, themeClasses, API_BASE_URL, showNotification }) => {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // 'all', 'paid', 'unpaid'
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [sendingReceipt, setSendingReceipt] = useState(false);

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
      
      // ✅ FIX: Ensure we always have an array
      let invoicesData = [];
      
      if (Array.isArray(data)) {
        invoicesData = data;
      } else if (data && Array.isArray(data.data)) {
        invoicesData = data.data;
      } else if (data && Array.isArray(data.invoices)) {
        invoicesData = data.invoices;
      } else if (data && typeof data === 'object') {
        // If it's a single invoice object, wrap it in an array
        invoicesData = [data];
      }
      
      console.log('Fetched invoices:', invoicesData); // Debug log
      setInvoices(invoicesData);
    } catch (error) {
      console.error('Error fetching invoices:', error);
      showNotification(`Error loading invoices: ${error.message}`, 'error');
      // ✅ FIX: Set empty array on error
      setInvoices([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  // Mark invoice as paid
  const markAsPaid = async (invoiceId) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication session expired. Please log in again.');
      }

      const response = await fetch(`${API_BASE_URL}/api/invoices/${invoiceId}/mark-paid`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to mark invoice as paid');
      }

      // Update local state
      setInvoices(prev => prev.map(inv => 
        inv._id === invoiceId ? { ...inv, status: 'paid', paidAt: new Date().toISOString() } : inv
      ));

      showNotification('Invoice marked as paid successfully!', 'success');
    } catch (error) {
      console.error('Error marking invoice as paid:', error);
      showNotification(`Error: ${error.message}`, 'error');
    }
  };

  // Generate receipt
  const generateReceipt = (invoice) => {
    const receipt = {
      receiptNumber: `RCP-${invoice.invoiceNumber?.replace('INV-', '') || '0001'}`,
      invoiceNumber: invoice.invoiceNumber || 'INV-0001',
      date: new Date().toLocaleDateString(),
      customerName: invoice.customerName || 'Customer',
      customerEmail: invoice.customerEmail || 'customer@example.com',
      customerPhone: invoice.customerPhone || 'N/A',
      items: invoice.items || [{ description: 'Internet Service', amount: invoice.total || 0 }],
      subtotal: invoice.subtotal || invoice.total || 0,
      tax: invoice.tax || 0,
      total: invoice.total || 0,
      amountPaid: invoice.total || 0,
      paymentMethod: 'Cash/Card',
      status: 'Paid'
    };
    return receipt;
  };

  // Send receipt via email
  const sendReceiptEmail = async (invoice) => {
    try {
      setSendingReceipt(true);
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication session expired. Please log in again.');
      }

      const receipt = generateReceipt(invoice);
      
      const response = await fetch(`${API_BASE_URL}/api/receipts/send-email`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          invoiceId: invoice._id,
          customerEmail: invoice.customerEmail,
          receiptData: receipt
        })
      });

      if (!response.ok) {
        throw new Error('Failed to send email receipt');
      }

      showNotification('Receipt sent via email successfully!', 'success');
    } catch (error) {
      console.error('Error sending email receipt:', error);
      showNotification(`Error: ${error.message}`, 'error');
    } finally {
      setSendingReceipt(false);
    }
  };

  // Send receipt via WhatsApp
  const sendReceiptWhatsApp = (invoice) => {
    const receipt = generateReceipt(invoice);
    const message = `Thank you for your payment! Here's your receipt:\n\n` +
                   `Receipt: ${receipt.receiptNumber}\n` +
                   `Invoice: ${receipt.invoiceNumber}\n` +
                   `Date: ${receipt.date}\n` +
                   `Amount: $${receipt.total}\n` +
                   `Status: ${receipt.status}\n\n` +
                   `Thank you for choosing Optimas Home Fiber!`;
    
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${invoice.customerPhone || '1234567890'}?text=${encodedMessage}`;
    
    window.open(whatsappUrl, '_blank');
    showNotification('WhatsApp receipt ready to send!', 'success');
  };

  // Download receipt as PDF
  const downloadReceipt = (invoice) => {
    const receipt = generateReceipt(invoice);
    
    // Simple PDF generation (in a real app, you'd use a proper PDF library)
    const receiptContent = `
      OPTIMAS HOME FIBER
      Receipt
      
      Receipt Number: ${receipt.receiptNumber}
      Invoice Number: ${receipt.invoiceNumber}
      Date: ${receipt.date}
      
      Customer: ${receipt.customerName}
      Email: ${receipt.customerEmail}
      Phone: ${receipt.customerPhone}
      
      Items:
      ${receipt.items.map(item => `  ${item.description} - $${item.amount}`).join('\n')}
      
      Subtotal: $${receipt.subtotal}
      Tax: $${receipt.tax}
      Total: $${receipt.total}
      
      Amount Paid: $${receipt.amountPaid}
      Payment Method: ${receipt.paymentMethod}
      Status: ${receipt.status}
      
      Thank you for your business!
    `;
    
    const blob = new Blob([receiptContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `receipt-${receipt.receiptNumber}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    showNotification('Receipt downloaded!', 'success');
  };

  // ✅ FIX: Filter and search invoices with array safety
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

  // View receipt details
  const viewReceipt = (invoice) => {
    setSelectedInvoice(invoice);
    setShowReceiptModal(true);
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
            Manage invoices, generate receipts, and send to customers
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
                  Invoice
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
                  <tr key={invoice._id || invoice.id} className={`${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}`}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          {invoice.invoiceNumber || 'N/A'}
                        </div>
                        <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          {invoice.description || 'Internet Service'}
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
                      {invoice.invoiceDate ? new Date(invoice.invoiceDate).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        ${invoice.total || 0}
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
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => viewReceipt(invoice)}
                          className={`p-2 rounded-lg ${darkMode ? 'text-gray-400 hover:bg-gray-600' : 'text-gray-600 hover:bg-gray-100'} transition-colors`}
                          title="View Details"
                        >
                          <Eye size={16} />
                        </button>
                        
                        {invoice.status === 'unpaid' && (
                          <button
                            onClick={() => markAsPaid(invoice._id || invoice.id)}
                            className={`p-2 rounded-lg ${darkMode ? 'text-green-400 hover:bg-gray-600' : 'text-green-600 hover:bg-gray-100'} transition-colors`}
                            title="Mark as Paid"
                          >
                            <CheckCircle size={16} />
                          </button>
                        )}
                        
                        {invoice.status === 'paid' && (
                          <>
                            <button
                              onClick={() => sendReceiptEmail(invoice)}
                              disabled={sendingReceipt}
                              className={`p-2 rounded-lg ${sendingReceipt ? 'opacity-50 cursor-not-allowed' : ''} ${
                                darkMode ? 'text-blue-400 hover:bg-gray-600' : 'text-blue-600 hover:bg-gray-100'
                              } transition-colors`}
                              title="Send Email"
                            >
                              <Mail size={16} />
                            </button>
                            
                            <button
                              onClick={() => sendReceiptWhatsApp(invoice)}
                              className={`p-2 rounded-lg ${darkMode ? 'text-green-400 hover:bg-gray-600' : 'text-green-600 hover:bg-gray-100'} transition-colors`}
                              title="Send WhatsApp"
                            >
                              <MessageCircle size={16} />
                            </button>
                            
                            <button
                              onClick={() => downloadReceipt(invoice)}
                              className={`p-2 rounded-lg ${darkMode ? 'text-purple-400 hover:bg-gray-600' : 'text-purple-600 hover:bg-gray-100'} transition-colors`}
                              title="Download Receipt"
                            >
                              <Download size={16} />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Receipt Modal */}
      {showReceiptModal && selectedInvoice && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className={`${themeClasses.card} rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto`}>
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                  Invoice Details - {selectedInvoice.invoiceNumber || 'N/A'}
                </h3>
                <button
                  onClick={() => setShowReceiptModal(false)}
                  className={`p-2 rounded-lg ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} transition-colors`}
                >
                  <XCircle size={20} />
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
                    <strong>Date:</strong> {selectedInvoice.invoiceDate ? new Date(selectedInvoice.invoiceDate).toLocaleDateString() : 'N/A'}<br/>
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
                      {(selectedInvoice.items || [{ description: 'Internet Service', amount: selectedInvoice.total || 0 }]).map((item, index) => (
                        <tr key={index}>
                          <td className="px-4 py-2 text-sm">{item.description}</td>
                          <td className="px-4 py-2 text-sm text-right">${item.amount}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className={`${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                      <tr>
                        <td className="px-4 py-2 text-sm font-bold">Total</td>
                        <td className="px-4 py-2 text-sm font-bold text-right">${selectedInvoice.total || 0}</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
              
              {selectedInvoice.status === 'paid' && (
                <div className="flex flex-wrap gap-3 pt-4">
                  <button
                    onClick={() => sendReceiptEmail(selectedInvoice)}
                    disabled={sendingReceipt}
                    className={`${themeClasses.button.primary.base} ${darkMode ? themeClasses.button.primary.dark : themeClasses.button.primary.light} flex items-center`}
                  >
                    <Mail size={16} className="mr-1.5" />
                    {sendingReceipt ? 'Sending...' : 'Send Email Receipt'}
                  </button>
                  
                  <button
                    onClick={() => sendReceiptWhatsApp(selectedInvoice)}
                    className={`${themeClasses.button.secondary.base} ${darkMode ? themeClasses.button.secondary.dark : themeClasses.button.secondary.light} flex items-center`}
                  >
                    <MessageCircle size={16} className="mr-1.5" />
                    Send WhatsApp
                  </button>
                  
                  <button
                    onClick={() => downloadReceipt(selectedInvoice)}
                    className={`${themeClasses.button.small.base} ${darkMode ? themeClasses.button.small.dark : themeClasses.button.small.light} flex items-center`}
                  >
                    <Download size={16} className="mr-1.5" />
                    Download Receipt
                  </button>
                </div>
              )}
              
              {selectedInvoice.status !== 'paid' && (
                <div className="pt-4">
                  <button
                    onClick={() => {
                      markAsPaid(selectedInvoice._id || selectedInvoice.id);
                      setShowReceiptModal(false);
                    }}
                    className={`${themeClasses.button.primary.base} ${darkMode ? themeClasses.button.primary.dark : themeClasses.button.primary.light} flex items-center`}
                  >
                    <CheckCircle size={16} className="mr-1.5" />
                    Mark as Paid
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReceiptManager;