// src/components/ReceiptManager.jsx
import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Eye, 
  Send, 
  AlertCircle, 
  CheckCircle,
  Search,
  RefreshCw,
  X
} from 'lucide-react';

const ReceiptManager = ({ darkMode, themeClasses, API_BASE_URL }) => {
  const BASE_URL = API_BASE_URL || import.meta.env.VITE_API_BASE_URL;

  const [receipts, setReceipts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [notification, setNotification] = useState({ show: false, message: '', type: 'info' });
  const [selectedReceipt, setSelectedReceipt] = useState(null);

  const showNotification = (message, type = 'info') => {
    setNotification({ show: true, message, type });
    setTimeout(() => setNotification({ show: false, message: '', type: 'info' }), 5000);
  };

  const fetchReceipts = async () => {
    try {
      setLoading(true);
      setError('');

      const token = localStorage.getItem('token');
      if (!token) throw new Error('Not authenticated');

      const url = new URL(`${BASE_URL}/api/receipts`);
      if (searchTerm) url.searchParams.append('search', searchTerm);

      const res = await fetch(url, {
        method: 'GET',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` // 🔑 JWT token for protected route
        }
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to load receipts');

      setReceipts(data.receipts || []);
    } catch (err) {
      console.error('Error loading receipts:', err);
      setError(err.message);
      showNotification(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReceipts();
  }, [searchTerm, BASE_URL]);

  const resendNotifications = async (id) => {
    try {
      const token = localStorage.getItem('token');

      const res = await fetch(`${BASE_URL}/api/receipts/${id}/resend`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        }
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to resend notifications');

      showNotification('Receipt notifications resent successfully!', 'success');
      fetchReceipts();
    } catch (err) {
      showNotification(`Error: ${err.message}`, 'error');
    }
  };

  const formatDate = (date) => {
    if (!date) return '–';
    return new Date(date).toLocaleDateString('en-KE', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  return (
    <div>
      {/* Header + Search */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-[#003366] to-[#FFCC00] bg-clip-text text-transparent">
          Payment Receipts
        </h2>

        <div className="relative w-full md:w-64">
          <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            placeholder="Search by name, receipt #, or package..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`pl-10 w-full p-2 rounded-lg text-sm border ${themeClasses.input}`}
          />
        </div>
      </div>

      {/* Notification Banner */}
      {notification.show && (
        <div
          className={`p-3 rounded-lg mb-4 flex items-center ${
            notification.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}
        >
          {notification.type === 'success' ? <CheckCircle className="mr-2" /> : <AlertCircle className="mr-2" />}
          {notification.message}
        </div>
      )}

      {/* Loading / Error / No receipts */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#003366]"></div>
        </div>
      ) : error ? (
        <div className={`p-4 rounded-lg ${darkMode ? 'bg-red-900/30 border border-red-700' : 'bg-red-50 border border-red-200'} mb-6`}>
          <div className="flex items-start">
            <AlertCircle className="w-5 h-5 mr-3 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium">Error loading receipts</p>
              <p className="text-sm mt-1">{error}</p>
              <button onClick={fetchReceipts} className="mt-2 flex items-center text-sm underline">
                <RefreshCw size={14} className="mr-1" /> Try again
              </button>
            </div>
          </div>
        </div>
      ) : receipts.length === 0 ? (
        <div className={`${themeClasses.card} rounded-xl p-12 text-center`}>
          <FileText className="mx-auto text-gray-400 mb-4" size={48} />
          <p className="text-gray-500">No receipts found.</p>
          <p className="text-sm text-gray-400 mt-2">Receipts are auto-generated when an invoice is marked as paid.</p>
        </div>
      ) : (
        <div className={`${themeClasses.card} rounded-xl overflow-hidden border`}>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className={darkMode ? 'bg-gray-700' : 'bg-gray-50'}>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Receipt #</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Client</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Package</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider">Actions</th>
                </tr>
              </thead>

              <tbody className={`divide-y ${darkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
                {receipts.map((receipt) => (
                  <tr key={receipt._id} className={darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}>
                    <td className="px-6 py-4 whitespace-nowrap font-mono">{receipt.receiptNumber}</td>
                    <td className="px-6 py-4">
                      <div className="font-medium">{receipt.clientName}</div>
                      <div className="text-sm text-gray-500">{receipt.clientEmail}</div>
                    </td>
                    <td className="px-6 py-4">{receipt.packageName}</td>
                    <td className="px-6 py-4 font-medium">Ksh {receipt.paymentAmount?.toLocaleString() || '0'}</td>
                    <td className="px-6 py-4 text-sm">{formatDate(receipt.createdAt)}</td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button onClick={() => setSelectedReceipt(receipt)} className="p-2 text-gray-500 hover:text-blue-600 rounded hover:bg-gray-100 dark:hover:bg-gray-700" title="View Details">
                        <Eye size={16} />
                      </button>
                      <button onClick={() => resendNotifications(receipt._id)} className="p-2 text-gray-500 hover:text-green-600 rounded hover:bg-gray-100 dark:hover:bg-gray-700" title="Resend Notifications">
                        <Send size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>

            </table>
          </div>
        </div>
      )}

      {/* Receipt Modal */}
      {selectedReceipt && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" onClick={() => setSelectedReceipt(null)}>
          <div className={`${themeClasses.card} rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 relative`} onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setSelectedReceipt(null)} className="absolute top-4 right-4 p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700">
              <X size={20} />
            </button>

            <h3 className="text-xl font-bold mb-4">Receipt Details</h3>

            <div className="space-y-3 text-sm">
              <div><strong>Receipt #:</strong> {selectedReceipt.receiptNumber}</div>
              <div><strong>Client:</strong> {selectedReceipt.clientName}</div>
              <div><strong>Phone:</strong> {selectedReceipt.clientPhone}</div>
              <div><strong>Location:</strong> {selectedReceipt.clientLocation}</div>
              <div><strong>Package:</strong> {selectedReceipt.packageName}</div>
              <div><strong>Speed:</strong> {selectedReceipt.packageSpeed || 'N/A'}</div>
              <div><strong>Amount:</strong> Ksh {selectedReceipt.paymentAmount?.toLocaleString() || '0'}</div>
              <div><strong>Payment Method:</strong> {selectedReceipt.paymentMethod}</div>
              <div><strong>Paid On:</strong> {formatDate(selectedReceipt.paymentDate || selectedReceipt.createdAt)}</div>

              <div>
                <strong>Notifications:</strong>
                <div className="mt-1">
                  <span className={selectedReceipt.sentViaEmail ? 'text-green-600' : 'text-red-500'}>
                    📧 Email: {selectedReceipt.sentViaEmail ? 'Sent' : 'Not sent'}
                  </span>
                  <br />
                  <span className={selectedReceipt.sentViaWhatsApp ? 'text-green-600' : 'text-red-500'}>
                    📱 WhatsApp: {selectedReceipt.sentViaWhatsApp ? 'Sent' : 'Not sent'}
                  </span>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default ReceiptManager;
