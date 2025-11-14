import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  FileText, 
  Image, 
  LogOut, 
  Plus, 
  Edit, 
  Trash2, 
  Upload,
  Save,
  X,
  Menu,
  User,
  Settings,
  Search,
  Moon,
  Sun,
  Link,
  Download,
  Eye,
  Globe,
  AlertCircle,
  CheckCircle,
  Info,
  RefreshCw,
  Database,
  Server,
  Shield,
  Activity,
  HardDrive,
  Clock,
  Zap,
  TrendingUp,
  Users,
  Mail,
  MessageCircle,
  DollarSign,
  Calendar,
  Filter,
  CreditCard,
  Receipt,
  FileSpreadsheet,
  Printer
} from 'lucide-react';
import ReceiptManager from './ReceiptManager';
import InvoiceManager from './InvoiceManager';

// ✅ COMPACT BUTTON STYLES — NO ICONS, NATURAL WIDTH
const BUTTON_STYLES = {
  primary: {
    base: 'py-2.5 px-5 rounded-lg font-medium text-sm transition-all duration-200 whitespace-nowrap shadow-sm hover:shadow-md',
    light: 'bg-gradient-to-r from-[#003366] to-[#002244] hover:from-[#002244] hover:to-[#001122] text-white border border-transparent',
    dark: 'bg-gradient-to-r from-[#003366] to-[#002244] hover:from-[#002244] hover:to-[#001122] text-white border border-transparent',
  },
  secondary: {
    base: 'py-2.5 px-5 rounded-lg font-medium text-sm transition-all duration-200 whitespace-nowrap shadow-sm hover:shadow-md',
    light: 'bg-[#FFCC00] hover:bg-[#E6B800] text-[#003366] font-bold border border-transparent',
    dark: 'bg-[#FFCC00] hover:bg-[#E6B800] text-[#003366] font-bold border border-transparent',
  },
  danger: {
    base: 'py-2.5 px-5 rounded-lg font-medium text-sm transition-all duration-200 whitespace-nowrap shadow-sm hover:shadow-md',
    light: 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white border border-transparent',
    dark: 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white border border-transparent',
  },
  small: {
    base: 'py-1.5 px-3.5 rounded-lg font-medium text-xs transition-all duration-200 whitespace-nowrap shadow-sm hover:shadow',
    light: 'bg-gradient-to-r from-[#003366] to-[#002244] hover:from-[#002244] hover:to-[#001122] text-white border border-transparent',
    dark: 'bg-gradient-to-r from-[#003366] to-[#002244] hover:from-[#002244] hover:to-[#001122] text-white border border-transparent',
  }
};

// Main Dashboard Component
const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [blogPosts, setBlogPosts] = useState([]);
  const [portfolioItems, setPortfolioItems] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [receipts, setReceipts] = useState([]);
  const [stats, setStats] = useState({
    totalInvoices: 0,
    totalReceipts: 0,
    pendingInvoices: 0,
    paidInvoices: 0
  });
  const [editingItem, setEditingItem] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: '',
    image: null,
    imageUrl: ''
  });
  const [settingsData, setSettingsData] = useState({
    siteTitle: 'Optimas Home Fiber',
    adminEmail: 'admin@optimas.com',
    notifications: true,
    autoSave: false,
    language: 'en'
  });
  const [loading, setLoading] = useState(true);
  const [uploadMethod, setUploadMethod] = useState('url');
  const [darkMode, setDarkMode] = useState(false);
  const [error, setError] = useState('');
  const [notification, setNotification] = useState({ show: false, message: '', type: 'info' });

  // ✅ DYNAMIC API URL — Will work in any environment
  const getApiBaseUrl = () => {
    if (import.meta.env.VITE_API_BASE_URL) {
      return import.meta.env.VITE_API_BASE_URL;
    }
    if (import.meta.env.DEV) {
      return 'http://localhost:5000';
    }
    return `${window.location.protocol}//${window.location.hostname}${window.location.port ? ':' + window.location.port : ''}`;
  };

  const API_BASE_URL = getApiBaseUrl();

  // Show notification with emojis
  const showNotification = (message, type = 'info') => {
    let emoji = 'ℹ️';
    if (type === 'success') emoji = '✅';
    else if (type === 'error') emoji = '🚨';
    else if (message.includes('Welcome')) emoji = '👋';
    else if (message.includes('Publish') || message.includes('created') || message.includes('updated')) emoji = '📤';
    else if (message.includes('wait') || message.includes('Loading')) emoji = '⏳';
    setNotification({ show: true, message: `${emoji} ${message}`, type });
    setTimeout(() => {
      setNotification({ show: false, message: '', type: 'info' });
    }, 5000);
  };

  const toggleDarkMode = () => setDarkMode(!darkMode);

  const themeClasses = {
    background: darkMode ? 'bg-gray-900' : 'bg-gray-50',
    text: darkMode ? 'text-gray-100' : 'text-gray-800',
    card: darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200',
    input: darkMode 
      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-[#003366]' 
      : 'bg-white border-gray-300 text-gray-800 placeholder-gray-500 focus:border-[#003366]',
    button: BUTTON_STYLES
  };

  // Load data from backend
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError('');
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('Authentication session expired. Please log in again.');
        }
        const headers = {
          'Authorization': `Bearer ${token}`
        };

        // Fetch blog posts
        const blogRes = await fetch(`${API_BASE_URL}/api/blog`, { headers });
        if (!blogRes.ok) {
          throw new Error(`Failed to fetch blog posts: ${blogRes.status} ${blogRes.statusText}`);
        }
        const blogResponse = await blogRes.json();
        setBlogPosts(blogResponse.data || []);

        // Fetch portfolio items
        const portfolioRes = await fetch(`${API_BASE_URL}/api/portfolio`, { headers });
        if (!portfolioRes.ok) {
          console.warn('Portfolio endpoint not available, initializing empty portfolio');
          setPortfolioItems([]);
        } else {
          const portfolioResponse = await portfolioRes.json();
          const portfolioData = Array.isArray(portfolioResponse) 
            ? portfolioResponse 
            : (portfolioResponse.data || portfolioResponse.items || []);
          setPortfolioItems(portfolioData);
        }

        // Fetch invoices
        const invoicesRes = await fetch(`${API_BASE_URL}/api/invoices`, { headers });
        if (invoicesRes.ok) {
          const invoicesResponse = await invoicesRes.json();
          setInvoices(invoicesResponse.invoices || invoicesResponse.data || []);
        }

        // Fetch receipts
        const receiptsRes = await fetch(`${API_BASE_URL}/api/receipts`, { headers });
        if (receiptsRes.ok) {
          const receiptsResponse = await receiptsRes.json();
          setReceipts(receiptsResponse.receipts || receiptsResponse.data || []);
        }

        // Fetch stats
        const statsRes = await fetch(`${API_BASE_URL}/api/invoices/stats/summary`, { headers });
        if (statsRes.ok) {
          const statsResponse = await statsRes.json();
          setStats(statsResponse.stats || {
            totalInvoices: invoices.length,
            totalReceipts: receipts.length,
            pendingInvoices: invoices.filter(inv => inv.status === 'pending').length,
            paidInvoices: invoices.filter(inv => inv.status === 'paid').length
          });
        }

        // Fetch settings
        const settingsRes = await fetch(`${API_BASE_URL}/api/settings`, { headers });
        if (settingsRes.ok) {
          const settings = await settingsRes.json();
          setSettingsData(settings);
        }
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err.message);
        showNotification(err.message, 'error');
        if (err.message.includes('401') || err.message.includes('token')) {
          setTimeout(() => {
            handleLogout();
          }, 2000);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [API_BASE_URL]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    showNotification('You have been logged out successfully.', 'success');
    setTimeout(() => {
      window.location.href = '/admin/login';
    }, 1500);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSettingsChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettingsData({
      ...settingsData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const saveSettings = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication session expired. Please log in again.');
      }
      const res = await fetch(`${API_BASE_URL}/api/settings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(settingsData)
      });
      const responseData = await res.json();
      if (res.ok) {
        setSettingsData(responseData);
        showNotification('Settings saved successfully!', 'success');
      } else {
        throw new Error(responseData.message || 'Failed to save settings');
      }
    } catch (err) {
      console.error('Error saving settings:', err);
      showNotification(`Error: ${err.message}`, 'error');
    }
  };

  const handleImageChange = async (file) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      showNotification('Please select an image file.', 'error');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      showNotification('Image size should be less than 5MB.', 'error');
      return;
    }
    try {
      showNotification('Uploading image...', 'info');
      const formDataCloud = new FormData();
      formDataCloud.append('file', file);
      formDataCloud.append('upload_preset', 'admin_dashboard_upload');
      const res = await fetch(
        'https://api.cloudinary.com/v1_1/dsfwavo7x/image/upload',
        {
          method: 'POST',
          body: formDataCloud,
        }
      );
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error?.message || 'Upload failed');
      }
      setFormData((prev) => ({
        ...prev,
        image: file,
        imageUrl: data.secure_url,
      }));
      showNotification('Image uploaded successfully!', 'success');
    } catch (err) {
      console.error('Cloudinary upload error:', err);
      showNotification(`Upload failed: ${err.message}`, 'error');
      setFormData((prev) => ({
        ...prev,
        image: null,
        imageUrl: '',
      }));
    }
  };

  const handleImageUrlChange = (url) => {
    setFormData({
      ...formData,
      imageUrl: url || '',
      image: null
    });
  };

  const handleSave = async () => {
    try {
      setError('');
      let endpoint;
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication session expired. Please log in again.');
      }
      if (!formData.title?.trim()) {
        throw new Error('Title is required');
      }
      if (!formData.content?.trim()) {
        throw new Error('Content/Description is required');
      }
      if (!formData.category?.trim()) {
        throw new Error('Category is required');
      }
      const payload = {
        title: formData.title.trim(),
        category: formData.category.trim(),
        imageUrl: formData.imageUrl?.trim() || '',
        content: formData.content.trim(),
        description: formData.content.trim()
      };
      Object.keys(payload).forEach(key => {
        if (payload[key] === '' || payload[key] == null) {
          delete payload[key];
        }
      });
      if (activeTab === 'blog') {
        endpoint = `${API_BASE_URL}/api/blog`;
        if (isEditing && editingItem && editingItem._id) {
          endpoint = `${endpoint}/${editingItem._id}`;
        }
      } else {
        endpoint = `${API_BASE_URL}/api/portfolio`;
        if (isEditing && editingItem && editingItem._id) {
          endpoint = `${endpoint}/${editingItem._id}`;
        }
      }
      const method = isEditing && editingItem && editingItem._id ? 'PUT' : 'POST';
      const res = await fetch(endpoint, {
        method: method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });
      const responseData = await res.json();
      if (!res.ok) {
        throw new Error(responseData.message || `Server error: ${res.status}`);
      }
      if (activeTab === 'blog') {
        if (isEditing) {
          setBlogPosts(prev => prev.map(item => 
            item._id === editingItem._id ? responseData.data : item
          ));
        } else {
          setBlogPosts(prev => [...prev, responseData.data || responseData]);
        }
      } else {
        if (isEditing) {
          setPortfolioItems(prev => prev.map(item => 
            item._id === editingItem._id ? responseData.data : item
          ));
        } else {
          const newItem = responseData.data || responseData;
          setPortfolioItems(prev => [...prev, newItem]);
        }
      }
      setFormData({ title: '', content: '', category: '', image: null, imageUrl: '' });
      setEditingItem(null);
      setIsEditing(false);
      setUploadMethod('url');
      showNotification(
        `${activeTab === 'blog' ? 'Blog post' : 'Portfolio item'} ${isEditing ? 'updated' : 'created'} successfully!`, 
        'success'
      );
    } catch (err) {
      console.error('Error saving item:', err);
      showNotification(err.message, 'error');
    }
  };

  const handleEdit = (item) => {
    setFormData({
      title: item.title || '',
      content: item.content || item.description || '',
      category: item.category || 'General',
      image: null,
      imageUrl: item.imageUrl || ''
    });
    setEditingItem(item);
    setIsEditing(true);
    setUploadMethod('url');
    setError('');
  };

  const handleDelete = async (id, type) => {
    if (!window.confirm(`Are you sure you want to delete this ${type === 'blog' ? 'blog post' : 'portfolio item'}? This action cannot be undone.`)) {
      return;
    }
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication session expired. Please log in again.');
      }
      const endpoint = type === 'blog' 
        ? `${API_BASE_URL}/api/blog/${id}` 
        : `${API_BASE_URL}/api/portfolio/${id}`;
      const res = await fetch(endpoint, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const responseData = await res.json();
      if (res.ok) {
        if (type === 'blog') {
          setBlogPosts(prev => prev.filter(post => post._id !== id));
        } else {
          setPortfolioItems(prev => prev.filter(item => item._id !== id));
        }
        showNotification(`${type === 'blog' ? 'Blog post' : 'Portfolio item'} deleted successfully!`, 'success');
      } else {
        throw new Error(responseData.message || 'Failed to delete');
      }
    } catch (err) {
      console.error('Error deleting item:', err);
      showNotification(err.message, 'error');
    }
  };

  const cancelEdit = () => {
    setFormData({ title: '', content: '', category: '', image: null, imageUrl: '' });
    setEditingItem(null);
    setIsEditing(false);
    setUploadMethod('url');
    setError('');
  };

  const renderContent = () => {
    if (loading && activeTab === 'dashboard') {
      return (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-t-2 border-[#003366]"></div>
        </div>
      );
    }
    if (error && activeTab === 'dashboard') {
      return (
        <div className={`p-6 mb-6 rounded-xl ${darkMode ? 'bg-red-900/20 border border-red-800/30' : 'bg-red-50 border border-red-200'} backdrop-blur-sm`}>
          <div className="flex items-start">
            <AlertCircle className={`w-5 h-5 mr-3 flex-shrink-0 ${darkMode ? 'text-red-400' : 'text-red-500'} mt-0.5`} />
            <div>
              <h3 className={`text-sm font-medium ${darkMode ? 'text-red-200' : 'text-red-800'}`}>Error Loading Data</h3>
              <p className={`mt-1 text-sm ${darkMode ? 'text-red-300' : 'text-red-700'}`}>{error}</p>
              <button 
                onClick={() => window.location.reload()} 
                className={`mt-3 ${BUTTON_STYLES.small.base} ${BUTTON_STYLES.small.light} flex items-center`}
              >
                <RefreshCw size={14} className="mr-1" />
                <span>Try Again</span>
              </button>
            </div>
          </div>
        </div>
      );
    }
    switch (activeTab) {
      case 'dashboard':
        return (
          <DashboardOverview 
            blogPosts={blogPosts} 
            portfolioItems={portfolioItems} 
            invoices={invoices}
            receipts={receipts}
            stats={stats}
            darkMode={darkMode} 
            themeClasses={themeClasses}
            onEdit={handleEdit}
            onDelete={handleDelete}
            setIsEditing={setIsEditing}
            setActiveTab={setActiveTab}
            API_BASE_URL={API_BASE_URL}
            showNotification={showNotification}
          />
        );
      case 'blog':
        return (
          <ContentManager
            title="Blog Posts"
            items={blogPosts}
            onEdit={handleEdit}
            onDelete={(id) => handleDelete(id, 'blog')}
            formData={formData}
            onInputChange={handleInputChange}
            onImageChange={handleImageChange}
            onImageUrlChange={handleImageUrlChange}
            onSave={handleSave}
            onCancel={cancelEdit}
            isEditing={isEditing}
            uploadMethod={uploadMethod}
            setUploadMethod={setUploadMethod}
            darkMode={darkMode}
            themeClasses={themeClasses}
            error={error}
            contentType="blog"
          />
        );
      case 'portfolio':
        return (
          <ContentManager
            title="Portfolio Items"
            items={portfolioItems}
            onEdit={handleEdit}
            onDelete={(id) => handleDelete(id, 'portfolio')}
            formData={formData}
            onInputChange={handleInputChange}
            onImageChange={handleImageChange}
            onImageUrlChange={handleImageUrlChange}
            onSave={handleSave}
            onCancel={cancelEdit}
            isEditing={isEditing}
            uploadMethod={uploadMethod}
            setUploadMethod={setUploadMethod}
            darkMode={darkMode}
            themeClasses={themeClasses}
            error={error}
            contentType="portfolio"
          />
        );
      case 'invoices':
        return (
          <InvoiceManager 
            darkMode={darkMode} 
            themeClasses={themeClasses}
            API_BASE_URL={API_BASE_URL}
            showNotification={showNotification}
            invoices={invoices}
            setInvoices={setInvoices}
          />
        );
      case 'receipts':
        return (
          <ReceiptManager 
            darkMode={darkMode} 
            themeClasses={themeClasses}
            API_BASE_URL={API_BASE_URL}
            showNotification={showNotification}
            receipts={receipts}
            setReceipts={setReceipts}
            invoices={invoices}
          />
        );
      case 'settings':
        return (
          <SettingsPanel 
            settingsData={settingsData} 
            handleSettingsChange={handleSettingsChange} 
            saveSettings={saveSettings}
            darkMode={darkMode}
            themeClasses={themeClasses}
          />
        );
      default:
        return (
          <DashboardOverview 
            blogPosts={blogPosts} 
            portfolioItems={portfolioItems} 
            invoices={invoices}
            receipts={receipts}
            stats={stats}
            darkMode={darkMode} 
            themeClasses={themeClasses}
            onEdit={handleEdit}
            onDelete={handleDelete}
            setIsEditing={setIsEditing}
            setActiveTab={setActiveTab}
            API_BASE_URL={API_BASE_URL}
            showNotification={showNotification}
          />
        );
    }
  };

  return (
    <div className={`flex h-screen ${themeClasses.background} ${themeClasses.text} transition-colors duration-300`}>
      {/* Notification System with Emojis */}
      {notification.show && (
        <div className="fixed top-4 right-4 z-50 max-w-md">
          <div className={`rounded-lg shadow-lg transform transition-all duration-300 ${
            notification.type === 'success' ? 'bg-green-600' : 
            notification.type === 'error' ? 'bg-red-600' : 
            notification.type === 'info' ? 'bg-blue-600' : 'bg-gray-600'
          } text-white p-4 flex items-start animate-fade-in`}>
            <div className="ml-3">
              <p className="text-sm font-medium">{notification.message}</p>
            </div>
            <button 
              onClick={() => setNotification({ ...notification, show: false })}
              className="ml-auto flex-shrink-0 text-white hover:text-gray-200 focus:outline-none"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}
      {/* Sidebar */}
      <div className={`${themeClasses.card} w-64 flex-shrink-0 shadow-xl fixed md:relative z-30 h-full transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 transition-transform duration-300 border-r ${darkMode ? 'border-gray-700' : 'border-gray-200'} backdrop-blur-sm bg-opacity-95`}>
        <div className="p-5 border-b border-gray-200 flex justify-between items-center">
          <div className="flex items-center">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center bg-[#003366]`}>
              <BarChart3 className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-lg font-bold ml-2 text-[#003366]">Admin Panel</h1>
          </div>
          <button 
            onClick={() => setSidebarOpen(false)}
            className="md:hidden text-gray-500 hover:text-gray-700"
          >
            <X size={20} />
          </button>
        </div>
        <nav className="mt-6 px-3 space-y-1">
          <NavItem 
            icon={<BarChart3 size={18} />} 
            text="Dashboard" 
            active={activeTab === 'dashboard'} 
            onClick={() => { setActiveTab('dashboard'); setSidebarOpen(false); }} 
            darkMode={darkMode}
          />
          <NavItem 
            icon={<FileText size={18} />} 
            text="Blog Posts" 
            active={activeTab === 'blog'} 
            onClick={() => { setActiveTab('blog'); setSidebarOpen(false); }} 
            darkMode={darkMode}
          />
          <NavItem 
            icon={<Image size={18} />} 
            text="Portfolio" 
            active={activeTab === 'portfolio'} 
            onClick={() => { setActiveTab('portfolio'); setSidebarOpen(false); }} 
            darkMode={darkMode}
          />
          <NavItem 
            icon={<CreditCard size={18} />} 
            text="Invoices" 
            active={activeTab === 'invoices'} 
            onClick={() => { setActiveTab('invoices'); setSidebarOpen(false); }} 
            darkMode={darkMode}
          />
          <NavItem 
            icon={<Receipt size={18} />} 
            text="Receipts" 
            active={activeTab === 'receipts'} 
            onClick={() => { setActiveTab('receipts'); setSidebarOpen(false); }} 
            darkMode={darkMode}
          />
          <NavItem 
            icon={<Settings size={18} />} 
            text="Settings" 
            active={activeTab === 'settings'} 
            onClick={() => { setActiveTab('settings'); setSidebarOpen(false); }} 
            darkMode={darkMode}
          />
        </nav>
        <div className="mt-8 px-3 pb-4">
          <h3 className={`text-xs font-semibold uppercase tracking-wider mb-3 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Quick Actions</h3>
          <button 
            onClick={() => { setActiveTab('blog'); setIsEditing(true); setSidebarOpen(false); }}
            className={`w-full flex items-center text-left p-3 rounded-lg transition-all duration-200 text-sm font-medium ${
              darkMode ? 'hover:bg-gray-700 text-gray-200 hover:shadow' : 'hover:bg-gray-100 text-gray-700 hover:shadow'
            }`}
          >
            <div className={`p-1.5 rounded-md mr-2 bg-[#003366]/10`}>
              <Plus size={16} className="text-[#003366]" />
            </div>
            New Blog Post
          </button>
          <button 
            onClick={() => { setActiveTab('portfolio'); setIsEditing(true); setSidebarOpen(false); }}
            className={`w-full flex items-center text-left p-3 rounded-lg transition-all duration-200 mt-2 text-sm font-medium ${
              darkMode ? 'hover:bg-gray-700 text-gray-200 hover:shadow' : 'hover:bg-gray-100 text-gray-700 hover:shadow'
            }`}
          >
            <div className={`p-1.5 rounded-md mr-2 bg-[#FFCC00]/20`}>
              <Plus size={16} className="text-[#003366]" />
            </div>
            New Portfolio Item
          </button>
          <button 
            onClick={() => { setActiveTab('invoices'); setSidebarOpen(false); }}
            className={`w-full flex items-center text-left p-3 rounded-lg transition-all duration-200 mt-2 text-sm font-medium ${
              darkMode ? 'hover:bg-gray-700 text-gray-200 hover:shadow' : 'hover:bg-gray-100 text-gray-700 hover:shadow'
            }`}
          >
            <div className={`p-1.5 rounded-md mr-2 bg-green-500/20`}>
              <Plus size={16} className="text-green-600" />
            </div>
            New Invoice
          </button>
          <button 
            onClick={() => { setActiveTab('receipts'); setSidebarOpen(false); }}
            className={`w-full flex items-center text-left p-3 rounded-lg transition-all duration-200 mt-2 text-sm font-medium ${
              darkMode ? 'hover:bg-gray-700 text-gray-200 hover:shadow' : 'hover:bg-gray-100 text-gray-700 hover:shadow'
            }`}
          >
            <div className={`p-1.5 rounded-md mr-2 bg-blue-500/20`}>
              <Plus size={16} className="text-blue-600" />
            </div>
            New Receipt
          </button>
        </div>
        <div className="absolute bottom-0 left-0 right-0 px-3 pb-6 pt-4 border-t border-gray-200">
          <button
            onClick={handleLogout}
            className={`w-full flex items-center justify-center p-3 rounded-lg transition-all duration-200 text-sm font-medium ${
              darkMode ? 'bg-red-700 hover:bg-red-600 text-white shadow hover:shadow-lg' : 'bg-red-600 hover:bg-red-700 text-white shadow hover:shadow-lg'
            }`}
          >
            <LogOut size={18} className="mr-2" />
            Sign Out
          </button>
        </div>
      </div>
      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <header className={`${themeClasses.card} shadow-sm p-4 md:p-5 flex items-center justify-between border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'} backdrop-blur-sm bg-opacity-95 sticky top-0 z-10`}>
          <div className="flex items-center">
            <button onClick={() => setSidebarOpen(true)} className="md:hidden mr-4 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
              <Menu size={22} className={themeClasses.text} />
            </button>
            <h2 className="text-xl md:text-2xl font-bold capitalize bg-gradient-to-r from-[#003366] to-[#FFCC00] bg-clip-text text-transparent">{activeTab}</h2>
          </div>
          <div className="flex items-center space-x-3">
            <div className="relative hidden md:block">
              <Search size={18} className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
              <input 
                type="text" 
                placeholder="Search..." 
                className={`pl-10 pr-4 py-2 text-sm border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#003366] focus:border-transparent transition-all duration-200 ${themeClasses.input} w-64`}
              />
            </div>
            <button
              onClick={toggleDarkMode}
              className={`p-2.5 rounded-xl transition-all duration-300 ${
                darkMode ? 'bg-gray-700 hover:bg-gray-600 text-yellow-300 hover:shadow-lg' : 'bg-gray-100 hover:bg-gray-200 text-gray-700 hover:shadow-md'
              }`}
              aria-label="Toggle theme"
            >
              {darkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <div className="flex items-center space-x-3">
              <div className={`w-9 h-9 rounded-full flex items-center justify-center font-medium text-sm bg-[#003366] text-white shadow`}>
                <User size={18} />
              </div>
              <div className="hidden md:block">
                <div className="text-sm font-medium">Admin</div>
                <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Administrator</div>
              </div>
            </div>
          </div>
        </header>
        <main className="p-4 md:p-6">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

// Navigation Item Component
const NavItem = ({ icon, text, active, onClick, darkMode }) => (
  <button
    onClick={onClick}
    className={`flex items-center w-full p-3 text-sm rounded-xl transition-all duration-200 font-medium ${
      active 
        ? (darkMode ? 'bg-[#003366]/20 text-white shadow-lg border border-[#003366]/30' : 'bg-[#003366]/10 text-[#003366] shadow-md border border-[#003366]/20') 
        : (darkMode ? 'text-gray-300 hover:bg-gray-700/70 hover:text-white hover:shadow' : 'text-gray-700 hover:bg-gray-100 hover:shadow hover:border hover:border-gray-200')
    }`}
  >
    <span className={`p-1.5 rounded-md mr-3 ${active ? (darkMode ? 'bg-[#003366]/30' : 'bg-[#003366]/20') : (darkMode ? 'bg-gray-700/50' : 'bg-gray-100')}`}>
      {icon}
    </span>
    {text}
  </button>
);

// Dashboard Overview Component
const DashboardOverview = ({ 
  blogPosts, 
  portfolioItems, 
  invoices,
  receipts,
  stats,
  darkMode, 
  themeClasses,
  onEdit,
  onDelete,
  setIsEditing,
  setActiveTab,
  API_BASE_URL,
  showNotification
}) => {

  const exportInvoicesToExcel = async () => {
    try {
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
        throw new Error('Failed to export invoices');
      }
    } catch (error) {
      console.error('Error exporting invoices:', error);
      showNotification('Error exporting invoices to Excel', 'error');
    }
  };

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold mb-2 bg-gradient-to-r from-[#003366] to-[#FFCC00] bg-clip-text text-transparent">Dashboard Overview</h2>
          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Welcome back! Here's what's happening with your content.</p>
        </div>
        <div className="flex flex-wrap gap-3 mt-4 md:mt-0">
          <button 
            onClick={() => { setIsEditing(true); setActiveTab('blog'); }}
            className={`${BUTTON_STYLES.small.base} ${BUTTON_STYLES.small.light} flex items-center shadow-md hover:shadow-lg`}
          >
            <Plus size={16} className="mr-1.5" />
            <span>New Blog Post</span>
          </button>
          <button 
            onClick={() => { setIsEditing(true); setActiveTab('portfolio'); }}
            className={`${BUTTON_STYLES.small.base} ${BUTTON_STYLES.secondary.light} flex items-center shadow-md hover:shadow-lg`}
          >
            <Plus size={16} className="mr-1.5" />
            <span>New Portfolio</span>
          </button>
          <button 
            onClick={() => { setActiveTab('invoices'); }}
            className={`${BUTTON_STYLES.small.base} ${BUTTON_STYLES.small.light} flex items-center shadow-md hover:shadow-lg`}
          >
            <Plus size={16} className="mr-1.5" />
            <span>Manage Invoices</span>
          </button>
          <button 
            onClick={exportInvoicesToExcel}
            className={`${BUTTON_STYLES.small.base} ${BUTTON_STYLES.secondary.light} flex items-center shadow-md hover:shadow-lg`}
          >
            <FileSpreadsheet size={16} className="mr-1.5" />
            <span>Export Invoices</span>
          </button>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard 
          title="Blog Posts" 
          value={blogPosts.length} 
          change={`${blogPosts.length} published`} 
          icon={<FileText size={20} />}
          color="blue"
          darkMode={darkMode}
        />
        <StatCard 
          title="Portfolio Items" 
          value={portfolioItems.length} 
          change={`${portfolioItems.length} published`} 
          icon={<Image size={20} />}
          color="gold"
          darkMode={darkMode}
        />
        <StatCard 
          title="Total Invoices" 
          value={stats.totalInvoices || invoices.length} 
          change={`${stats.pendingInvoices || invoices.filter(inv => inv.status === 'pending').length} pending`} 
          icon={<CreditCard size={20} />}
          color="green"
          darkMode={darkMode}
        />
        <StatCard 
          title="Total Receipts" 
          value={stats.totalReceipts || receipts.length} 
          change={`${stats.paidInvoices || invoices.filter(inv => inv.status === 'paid').length} paid`} 
          icon={<Receipt size={20} />}
          color="purple"
          darkMode={darkMode}
        />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentList 
          title="Recent Blog Posts" 
          items={blogPosts.slice(0, 5)}
          viewAllLink="/admin/blog"
          darkMode={darkMode}
          themeClasses={themeClasses}
          onEdit={onEdit}
          onDelete={onDelete}
          type="blog"
        />
        <RecentList 
          title="Recent Invoices" 
          items={invoices.slice(0, 5)}
          viewAllLink="/admin/invoices"
          darkMode={darkMode}
          themeClasses={themeClasses}
          onEdit={onEdit}
          onDelete={onDelete}
          type="invoices"
        />
      </div>
    </div>
  );
};

// Stat Card Component
const StatCard = ({ title, value, change, icon, color, darkMode }) => {
  const colorClasses = {
    blue: darkMode ? 'bg-blue-900/20 border-blue-800/30' : 'bg-blue-50 border-blue-200',
    gold: darkMode ? 'bg-yellow-900/20 border-yellow-800/30' : 'bg-yellow-50 border-yellow-200',
    green: darkMode ? 'bg-green-900/20 border-green-800/30' : 'bg-green-50 border-green-200',
    purple: darkMode ? 'bg-purple-900/20 border-purple-800/30' : 'bg-purple-50 border-purple-200'
  };
  const iconColor = {
    blue: 'text-blue-500',
    gold: 'text-[#FFCC00]',
    green: 'text-green-500',
    purple: 'text-purple-500'
  };
  const textColor = darkMode ? 'text-gray-100' : 'text-gray-900';
  const subTextColor = darkMode ? 'text-gray-400' : 'text-gray-600';
  return (
    <div className={`${colorClasses[color]} p-5 rounded-xl border backdrop-blur-sm transition-all duration-300 hover:shadow-lg hover:scale-105`}>
      <div className="flex items-center justify-between">
        <div>
          <p className={`text-sm font-medium ${subTextColor}`}>{title}</p>
          <p className={`text-2xl font-bold mt-1 ${textColor}`}>{value}</p>
          <p className={`text-xs mt-2 ${subTextColor}`}>{change}</p>
        </div>
        <div className={`p-3 rounded-xl ${iconColor[color]} bg-opacity-10 backdrop-blur-sm`}>
          {icon}
        </div>
      </div>
    </div>
  );
};

// Recent List Component
const RecentList = ({ title, items, viewAllLink, darkMode, themeClasses, onEdit, onDelete, type }) => (
  <div className={`${themeClasses.card} p-5 rounded-xl shadow-sm border backdrop-blur-sm transition-all duration-300 hover:shadow-lg`}>
    <div className="flex justify-between items-center mb-4">
      <h3 className={`text-lg font-bold ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>{title}</h3>
      <a href={viewAllLink} className={`text-sm font-medium transition-colors ${darkMode ? 'text-[#FFCC00] hover:text-yellow-300' : 'text-[#003366] hover:text-blue-800'}`}>
        View All
      </a>
    </div>
    <ul className="divide-y divide-gray-200 dark:divide-gray-700">
      {items.map(item => (
        <li key={item._id} className="py-3 flex justify-between items-center">
          <div className="flex items-center">
            {item.imageUrl && (
              <img 
                src={item.imageUrl} 
                alt={item.title} 
                className="w-12 h-12 object-cover rounded-md mr-3 flex-shrink-0" 
                onError={(e) => {
                  e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDgiIGhlaWdodD0iNDgiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0iI2UzZTdlOSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTIiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGRvbWluYW50LWJhc2VsaW5lPSJtaWRkbGUiIGZpbGw9IiM2NTc1ODI5Ij5OTyBJTUFHRTwvdGV4dD48L3N2Zz4=';
                }}
              />
            )}
            <div>
              <h4 className={`text-sm font-medium ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                {type === 'invoices' ? (item.invoiceNumber || `INV-${item._id}`) : item.title}
              </h4>
              <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                {type === 'invoices' ? item.customerName : new Date(item.publishedAt || item.createdAt).toLocaleDateString()}
              </p>
              {type === 'invoices' && (
                <span className={`inline-block px-2 py-1 text-xs rounded-full mt-1 ${
                  item.status === 'paid' 
                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                    : item.status === 'pending'
                    ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                    : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                }`}>
                  {item.status || 'pending'}
                </span>
              )}
            </div>
          </div>
          <div className="flex space-x-2 flex-shrink-0">
            <button 
              onClick={() => onEdit(item)}
              className="p-1.5 rounded-lg text-gray-500 hover:text-[#003366] hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <Edit size={16} />
            </button>
            <button
              onClick={() => onDelete(item._id, type)}
              className="p-1.5 rounded-lg text-gray-500 hover:text-red-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </li>
      ))}
      {items.length === 0 && (
        <li className="py-3 text-center text-sm text-gray-500 dark:text-gray-400">
          No recent items.
        </li>
      )}
    </ul>
  </div>
);

// Content Manager Component
const ContentManager = ({
  title,
  items,
  onEdit,
  onDelete,
  formData,
  onInputChange,
  onImageChange,
  onImageUrlChange,
  onSave,
  onCancel,
  isEditing,
  uploadMethod,
  setUploadMethod,
  darkMode,
  themeClasses,
  error,
  contentType
}) => {
  const isPortfolio = contentType === 'portfolio';
  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <h2 className="text-2xl font-bold capitalize bg-gradient-to-r from-[#003366] to-[#FFCC00] bg-clip-text text-transparent">{isEditing ? `Edit ${isPortfolio ? 'Portfolio Item' : 'Blog Post'}` : `Create New ${isPortfolio ? 'Portfolio Item' : 'Blog Post'}`}</h2>
        {isEditing && (
          <button 
            onClick={onCancel}
            className={`${BUTTON_STYLES.secondary.base} ${darkMode ? BUTTON_STYLES.secondary.dark : BUTTON_STYLES.secondary.light} mt-4 md:mt-0`}
          >
            <X size={16} className="inline-block mr-1.5" />
            Cancel Edit
          </button>
        )}
      </div>
      <div className={`${themeClasses.card} p-6 md:p-8 rounded-xl shadow-lg border mb-8 backdrop-blur-sm`}>
        <div className="space-y-6">
          <InputGroup 
            label="Title"
            name="title"
            value={formData.title}
            onChange={onInputChange}
            placeholder={`Enter ${isPortfolio ? 'portfolio item' : 'blog post'} title`}
            darkMode={darkMode}
            themeClasses={themeClasses}
            icon={<FileText size={18} />}
          />
          <InputGroup
            label="Category"
            name="category"
            value={formData.category}
            onChange={onInputChange}
            placeholder="e.g., Technology, Design, Lifestyle"
            darkMode={darkMode}
            themeClasses={themeClasses}
            icon={<Globe size={18} />}
          />
          <div className="flex flex-col space-y-4">
            <label className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Image</label>
            <div className={`flex items-center space-x-4 p-2 rounded-lg ${darkMode ? 'bg-gray-700 border border-gray-600' : 'bg-gray-100 border border-gray-200'}`}>
              <button
                onClick={() => setUploadMethod('url')}
                className={`py-2 px-4 rounded-lg text-sm font-medium transition-all ${
                  uploadMethod === 'url' 
                    ? (darkMode ? 'bg-[#003366] text-white shadow-md' : 'bg-[#003366] text-white shadow-md') 
                    : (darkMode ? 'text-gray-400 hover:bg-gray-600' : 'text-gray-600 hover:bg-gray-200')
                }`}
              >
                <Link size={16} className="inline-block mr-1.5" /> Use URL
              </button>
              <button
                onClick={() => setUploadMethod('upload')}
                className={`py-2 px-4 rounded-lg text-sm font-medium transition-all ${
                  uploadMethod === 'upload' 
                    ? (darkMode ? 'bg-[#003366] text-white shadow-md' : 'bg-[#003366] text-white shadow-md') 
                    : (darkMode ? 'text-gray-400 hover:bg-gray-600' : 'text-gray-600 hover:bg-gray-200')
                }`}
              >
                <Upload size={16} className="inline-block mr-1.5" /> Upload File
              </button>
            </div>
            {uploadMethod === 'url' ? (
              <div className="relative">
                <input
                  type="url"
                  name="imageUrl"
                  value={formData.imageUrl || ''}
                  onChange={(e) => onImageUrlChange(e.target.value)}
                  placeholder="Paste image URL here..."
                  className={`w-full p-3 pl-10 border rounded-lg text-sm transition-all duration-200 focus:ring-2 focus:ring-[#003366] focus:border-transparent ${themeClasses.input}`}
                />
                <Link size={18} className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
              </div>
            ) : (
              <div 
                className={`flex justify-center items-center w-full border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors duration-200 ${
                  darkMode ? 'border-gray-600 hover:border-[#003366] bg-gray-700' : 'border-gray-300 hover:border-[#003366] bg-gray-50'
                }`}
                onClick={() => document.getElementById('file-upload').click()}
              >
                <input 
                  type="file" 
                  id="file-upload" 
                  className="hidden" 
                  accept="image/*"
                  onChange={(e) => onImageChange(e.target.files[0])}
                />
                <div className={`flex flex-col items-center ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  <Upload size={24} className="mb-2" />
                  <p className="text-sm font-medium">Click or drag & drop to upload</p>
                  <p className="text-xs">PNG, JPG, GIF up to 5MB</p>
                </div>
              </div>
            )}
            {formData.imageUrl && (
              <div className="flex items-center space-x-3 mt-4">
                <img src={formData.imageUrl} alt="Preview" className="w-24 h-auto rounded-lg shadow-md" />
                <div>
                  <p className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-800'}`}>Image Preview</p>
                  <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{formData.image ? formData.image.name : 'Image URL'}</p>
                </div>
              </div>
            )}
          </div>
          <div>
            <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{isPortfolio ? 'Description' : 'Content'}</label>
            <textarea
              name="content"
              value={formData.content}
              onChange={onInputChange}
              rows="8"
              placeholder={`Write the content for your ${isPortfolio ? 'portfolio item' : 'blog post'} here...`}
              className={`w-full p-4 border rounded-lg text-sm transition-all duration-200 focus:ring-2 focus:ring-[#003366] focus:border-transparent resize-y ${themeClasses.input}`}
            ></textarea>
          </div>
          <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-4">
            {isEditing && (
              <button
                onClick={onCancel}
                className={`${BUTTON_STYLES.secondary.base} ${darkMode ? BUTTON_STYLES.secondary.dark : BUTTON_STYLES.secondary.light}`}
              >
                <X size={16} className="inline-block mr-1.5" />
                Cancel
              </button>
            )}
            <button
              onClick={onSave}
              className={`${BUTTON_STYLES.primary.base} ${darkMode ? BUTTON_STYLES.primary.dark : BUTTON_STYLES.primary.light} flex items-center justify-center`}
            >
              <Save size={16} className="inline-block mr-1.5" />
              {isEditing ? `Save Changes` : `Publish ${isPortfolio ? 'Item' : 'Post'}`}
            </button>
          </div>
        </div>
      </div>
      <h3 className={`text-lg font-bold mb-4 ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>
        Existing {isPortfolio ? 'Portfolio Items' : 'Blog Posts'}
      </h3>
      <div className={`${themeClasses.card} p-5 rounded-xl shadow-lg border backdrop-blur-sm overflow-x-auto`}>
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className={`px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                {isPortfolio ? 'Item' : 'Post'}
              </th>
              <th className={`px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider hidden md:table-cell ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                Category
              </th>
              <th className={`px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider hidden lg:table-cell ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                Published
              </th>
              <th className={`px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                Actions
              </th>
            </tr>
          </thead>
          <tbody className={`divide-y ${darkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
            {items.length === 0 ? (
              <tr>
                <td colSpan="4" className={`px-6 py-4 text-center text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  No {isPortfolio ? 'portfolio items' : 'blog posts'} found.
                </td>
              </tr>
            ) : (
              items.map(item => (
                <tr key={item._id} className={`${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}`}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <img
                        className="h-10 w-10 rounded-md object-cover mr-4 flex-shrink-0"
                        src={item.imageUrl || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0iI2YwZjRmNiIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTYiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGRvbWluYW50LWJhc2VsaW5lPSJtaWRkbGUiIGZpbGw9IiNhYmJjZDAiPk88L3RleHQ+PC9zdmc+'}
                        alt={item.title}
                        onError={(e) => {
                          e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwLy93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjBmNGY2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZG9taW5hbnQtYmFzZWxpbmU9Im1pZGRsZSIgZmlsbD0iI2FiYmNkMCI+TzwvdGV4dD48L3N2Zz4=';
                          e.target.onerror = null;
                        }}
                      />
                      <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{item.title}</div>
                    </div>
                  </td>
                  <td className={`px-6 py-4 whitespace-nowrap hidden md:table-cell text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    {item.category || 'N/A'}
                  </td>
                  <td className={`px-6 py-4 whitespace-nowrap hidden lg:table-cell text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    {new Date(item.publishedAt || item.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end space-x-2">
                      <button
                        onClick={() => onEdit(item)}
                        className={`p-2 rounded-lg ${darkMode ? 'text-gray-400 hover:bg-gray-600' : 'text-gray-600 hover:bg-gray-100'} transition-colors`}
                        aria-label="Edit"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => onDelete(item._id, contentType)}
                        className={`p-2 rounded-lg ${darkMode ? 'text-gray-400 hover:bg-gray-600' : 'text-gray-600 hover:bg-gray-100'} transition-colors`}
                        aria-label="Delete"
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
  );
};

// Settings Panel Component
const SettingsPanel = ({ settingsData, handleSettingsChange, saveSettings, darkMode, themeClasses }) => (
  <div>
    <h2 className="text-2xl font-bold mb-6 bg-gradient-to-r from-[#003366] to-[#FFCC00] bg-clip-text text-transparent">Site & System Settings</h2>
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className={`${themeClasses.card} p-6 md:p-8 rounded-xl shadow-lg border backdrop-blur-sm`}>
        <h3 className="text-lg font-bold mb-4 text-gray-800 dark:text-white">Site Configuration</h3>
        <div className="space-y-6">
          <InputGroup
            label="Site Title"
            name="siteTitle"
            value={settingsData.siteTitle}
            onChange={handleSettingsChange}
            placeholder="e.g., My Awesome Site"
            darkMode={darkMode}
            themeClasses={themeClasses}
            icon={<Globe size={18} />}
          />
          <InputGroup
            label="Admin Email"
            name="adminEmail"
            value={settingsData.adminEmail}
            onChange={handleSettingsChange}
            placeholder="contact@example.com"
            type="email"
            darkMode={darkMode}
            themeClasses={themeClasses}
            icon={<User size={18} />}
          />
          <div className="flex items-center justify-between">
            <label className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`} htmlFor="notifications">
              Enable Notifications
              <p className={`text-xs mt-1 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>Receive alerts for new activity.</p>
            </label>
            <input
              type="checkbox"
              id="notifications"
              name="notifications"
              checked={settingsData.notifications}
              onChange={handleSettingsChange}
              className="h-5 w-10 rounded-full appearance-none transition-colors duration-200 ease-in-out bg-gray-300 dark:bg-gray-600 checked:bg-[#003366] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#003366] cursor-pointer"
            />
          </div>
          <div className="flex items-center justify-between">
            <label className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`} htmlFor="autoSave">
              Enable Auto-Save
              <p className={`text-xs mt-1 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>Automatically save your work every few minutes.</p>
            </label>
            <input
              type="checkbox"
              id="autoSave"
              name="autoSave"
              checked={settingsData.autoSave}
              onChange={handleSettingsChange}
              className="h-5 w-10 rounded-full appearance-none transition-colors duration-200 ease-in-out bg-gray-300 dark:bg-gray-600 checked:bg-[#003366] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#003366] cursor-pointer"
            />
          </div>
          <div className="pt-4 flex justify-end">
            <button
              onClick={saveSettings}
              className={`${BUTTON_STYLES.primary.base} ${darkMode ? BUTTON_STYLES.primary.dark : BUTTON_STYLES.primary.light} flex items-center`}
            >
              <Save size={16} className="mr-1.5" />
              Save Settings
            </button>
          </div>
        </div>
      </div>
      <div className={`${themeClasses.card} p-6 md:p-8 rounded-xl shadow-lg border backdrop-blur-sm`}>
        <h3 className="text-lg font-bold mb-4 text-gray-800 dark:text-white">System Health Monitoring</h3>
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Database size={20} className="text-green-500" />
            <span className="font-medium">Database: <span className="text-green-500">Connected</span></span>
          </div>
          <div className="flex items-center space-x-2">
            <HardDrive size={20} className="text-yellow-500" />
            <span className="font-medium">Disk Usage: <span>85% (Warning)</span></span>
          </div>
          <div className="flex items-center space-x-2">
            <RefreshCw size={20} className="text-blue-500" />
            <span className="font-medium">Last Backup: <span>3 hours ago</span></span>
          </div>
          <div className="flex items-center space-x-2 mt-4">
            <Server size={20} className="text-green-500" />
            <span className="font-medium">Server: <span className="text-green-500">Active</span></span>
          </div>
          <div className="flex items-center space-x-2">
            <Activity size={20} className="text-blue-500" />
            <span className="font-medium">API Latency: <span className="text-blue-500">25ms</span></span>
          </div>
          <div className="flex items-center space-x-2 mt-4">
            <Shield size={20} className="text-green-500" />
            <span className="font-medium">Security: <span className="text-green-500">Up to date</span></span>
          </div>
        </div>
      </div>
    </div>
  </div>
);

// Input Group Component
const InputGroup = ({ label, name, value, onChange, placeholder, type = 'text', darkMode, themeClasses, icon }) => (
  <div>
    <label htmlFor={name} className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
      {label}
    </label>
    <div className="relative">
      <div className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
        {icon}
      </div>
      <input
        type={type}
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`w-full p-3 pl-10 border rounded-lg text-sm transition-all duration-200 focus:ring-2 focus:ring-[#003366] focus:border-transparent ${themeClasses.input}`}
      />
    </div>
  </div>
);

export default Dashboard;