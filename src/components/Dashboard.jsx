// Dashboard.jsx - FULLY UPDATED: CLIENT-SIDE EMAIL + PDF DOWNLOAD ONLY
import React, { useState, useEffect, useRef } from 'react';
import {
  BarChart3, FileText, Image, LogOut, Plus, Edit, Trash2, Upload, Save, X, Menu, User, Settings, Search, Moon, Sun, Link, Download, Eye, Globe,
  AlertCircle, CheckCircle, Info, RefreshCw, Database, Server, Shield, Activity, HardDrive, Clock, Zap, TrendingUp, Users, Mail, MessageCircle,
  DollarSign, Calendar, Filter, CreditCard, Receipt, FileSpreadsheet, Printer, Loader2, Send, ChevronRight
} from 'lucide-react';
import InvoiceManager from './InvoiceManager';
import ReceiptManager from './ReceiptManager';

// Brand Colors - Matching Login Page
const BRAND = {
  PRIMARY: "#00356B",    // Deep Navy Blue
  ACCENT: "#D85C2C",     // Vibrant Orange/Rust
  GREEN: "#86bc25",      // Green accent
  DARK_BLUE: "#002244",  // Darker blue for gradients
};
// ✅ CHART.JS IMPORTS
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
  Title,
  PointElement,
  LineElement
} from 'chart.js';
import { Bar, Pie, Line } from 'react-chartjs-2';
// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  Title
);
// Utility function for consistent price formatting
const formatPrice = (price) => {
  if (price === undefined || price === null) return '0';
  const cleanStr = price.toString().replace(/,/g, '');
  const num = parseInt(cleanStr, 10);
  return isNaN(num) ? price : num.toLocaleString();
};

// ✅ NEW: Enhanced PDF download function
const downloadInvoicePdf = async (invoiceId, API_BASE_URL, token, showNotification) => {
  try {
    console.log(`📄 Attempting to download PDF for invoice: ${invoiceId}`);
    
    const response = await fetch(`${API_BASE_URL}/api/invoices/${invoiceId}/pdf`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (response.ok) {
      const blob = await response.blob();
      
      // Check if we got a PDF
      if (blob.type === 'application/pdf') {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = `invoice-${invoiceId}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        
        console.log('✅ PDF downloaded successfully');
        showNotification('✅ PDF downloaded successfully!', 'success');
        return { success: true, url };
      } else {
        // Try to parse as JSON to get error message
        const text = await response.text();
        try {
          const errorData = JSON.parse(text);
          showNotification(`❌ ${errorData.message || 'Failed to download PDF'}`, 'error');
        } catch {
          showNotification('❌ Server returned non-PDF response', 'error');
        }
        return { success: false };
      }
    } else {
      const errorText = await response.text();
      console.error('PDF download failed with status:', response.status, errorText);
      
      try {
        const errorData = JSON.parse(errorText);
        showNotification(`❌ ${errorData.message || `Failed to download PDF (${response.status})`}`, 'error');
      } catch {
        showNotification(`❌ Failed to download PDF (${response.status})`, 'error');
      }
      return { success: false };
    }
  } catch (err) {
    console.error('Network error downloading PDF:', err);
    showNotification('❌ Network error downloading PDF. Check connection.', 'error');
    return { success: false };
  }
};

// ✅ NEW: Send invoice via email using Resend API backend with PDF attachment
const sendInvoiceViaEmail = async (invoice, API_BASE_URL, token, showNotification) => {
  try {
    console.log(`📧 Sending invoice ${invoice._id} via email with attachment...`);
    
    if (!invoice.customerEmail?.trim()) {
      showNotification('⚠️ Customer email is required to send.', 'warning');
      return { success: false };
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(invoice.customerEmail.trim())) {
      showNotification('⚠️ Invalid email format.', 'warning');
      return { success: false };
    }

    // First, get the PDF
    const pdfResponse = await fetch(`${API_BASE_URL}/api/invoices/${invoice._id}/pdf`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    let pdfBase64 = '';
    if (pdfResponse.ok && pdfResponse.headers.get('content-type') === 'application/pdf') {
      const pdfBlob = await pdfResponse.blob();
      const reader = new FileReader();
      pdfBase64 = await new Promise((resolve) => {
        reader.onloadend = () => resolve(reader.result.split(',')[1]);
        reader.readAsDataURL(pdfBlob);
      });
    }

    // Send email with PDF attachment
    const response = await fetch(`${API_BASE_URL}/api/invoices/${invoice._id}/send-with-pdf`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        customerEmail: invoice.customerEmail,
        customerName: invoice.customerName || 'Valued Customer',
        invoiceNumber: invoice.invoiceNumber,
        pdfData: pdfBase64
      })
    });

    if (!response.ok) {
      // Fallback to simple email if PDF attachment fails
      const fallbackResponse = await fetch(`${API_BASE_URL}/api/invoices/${invoice._id}/send`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!fallbackResponse.ok) {
        const errorData = await fallbackResponse.json();
        throw new Error(errorData.message || `Failed to send email (${fallbackResponse.status})`);
      }
      
      showNotification('✅ Invoice sent via email! (Without attachment)', 'success');
      return { success: true };
    }

    const result = await response.json();
    console.log('✅ Email with attachment sent successfully:', result);
    
    showNotification('✅ Invoice sent via email with PDF attachment!', 'success');
    return { success: true, data: result };
    
  } catch (error) {
    console.error('Error sending invoice via email:', error);
    showNotification(`❌ Failed to send email: ${error.message}`, 'error');
    return { success: false, error: error.message };
  }
};

// ✅ NEW: Send receipt via email using Resend API backend with PDF attachment
const sendReceiptViaEmail = async (receipt, API_BASE_URL, token, showNotification) => {
  try {
    console.log(`📧 Sending receipt ${receipt._id} via email with attachment...`);
    
    if (!receipt.customerEmail?.trim()) {
      showNotification('⚠️ Customer email is required to send.', 'warning');
      return { success: false };
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(receipt.customerEmail.trim())) {
      showNotification('⚠️ Invalid email format.', 'warning');
      return { success: false };
    }

    // First, get the PDF
    const pdfResponse = await fetch(`${API_BASE_URL}/api/receipts/${receipt._id}/pdf`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    let pdfBase64 = '';
    if (pdfResponse.ok && pdfResponse.headers.get('content-type') === 'application/pdf') {
      const pdfBlob = await pdfResponse.blob();
      const reader = new FileReader();
      pdfBase64 = await new Promise((resolve) => {
        reader.onloadend = () => resolve(reader.result.split(',')[1]);
        reader.readAsDataURL(pdfBlob);
      });
    }

    // Send email with PDF attachment
    const response = await fetch(`${API_BASE_URL}/api/receipts/${receipt._id}/send-with-pdf`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        customerEmail: receipt.customerEmail,
        customerName: receipt.customerName || 'Valued Customer',
        receiptNumber: receipt.receiptNumber,
        pdfData: pdfBase64
      })
    });

    if (!response.ok) {
      // Fallback to simple email if PDF attachment fails
      const fallbackResponse = await fetch(`${API_BASE_URL}/api/receipts/${receipt._id}/send`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!fallbackResponse.ok) {
        const errorData = await fallbackResponse.json();
        throw new Error(errorData.message || `Failed to send email (${fallbackResponse.status})`);
      }
      
      showNotification('✅ Receipt sent via email! (Without attachment)', 'success');
      return { success: true };
    }

    const result = await response.json();
    console.log('✅ Email with attachment sent successfully:', result);
    
    showNotification('✅ Receipt sent via email with PDF attachment!', 'success');
    return { success: true, data: result };
    
  } catch (error) {
    console.error('Error sending receipt via email:', error);
    showNotification(`❌ Failed to send email: ${error.message}`, 'error');
    return { success: false, error: error.message };
  }
};

// ✅ BUTTON STYLES - Matching WhoItsForSection Design
const BUTTON_STYLES = {
  primary: {
    base: 'py-3 px-6 rounded-md font-black text-[10px] uppercase tracking-wider transition-all duration-300 whitespace-nowrap shadow-sm hover:shadow-md',
    light: `bg-[${BRAND.PRIMARY}] hover:bg-[#002244] text-white border border-transparent`,
    dark: `bg-[${BRAND.PRIMARY}] hover:bg-[#002244] text-white border border-transparent`,
  },
  secondary: {
    base: 'py-3 px-6 rounded-md font-black text-[10px] uppercase tracking-wider transition-all duration-300 whitespace-nowrap shadow-sm hover:shadow-md',
    light: `bg-white hover:bg-gray-50 text-[${BRAND.PRIMARY}] border border-gray-300`,
    dark: `bg-gray-800 hover:bg-gray-700 text-white border border-gray-700`,
  },
  danger: {
    base: 'py-3 px-6 rounded-md font-black text-[10px] uppercase tracking-wider transition-all duration-300 whitespace-nowrap shadow-sm hover:shadow-md',
    light: `bg-red-600 hover:bg-red-700 text-white border border-transparent`,
    dark: `bg-red-600 hover:bg-red-700 text-white border border-transparent`,
  },
  accent: {
    base: 'py-3 px-6 rounded-md font-black text-[10px] uppercase tracking-wider transition-all duration-300 whitespace-nowrap shadow-sm hover:shadow-md',
    light: `bg-[${BRAND.ACCENT}] hover:bg-[#b84520] text-white border border-transparent`,
    dark: `bg-[${BRAND.ACCENT}] hover:bg-[#b84520] text-white border border-transparent`,
  },
  small: {
    base: 'py-2 px-4 rounded-md font-black text-[9px] uppercase tracking-wider transition-all duration-300 whitespace-nowrap shadow-sm hover:shadow',
    light: `bg-[${BRAND.PRIMARY}] hover:bg-[#002244] text-white border border-transparent`,
    dark: `bg-[${BRAND.PRIMARY}] hover:bg-[#002244] text-white border border-transparent`,
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
    paidInvoices: 0,
    totalRevenue: 0
  });
  // User Profile State
  const [user, setUser] = useState({
    id: '',
    name: 'Admin',
    email: 'admin@optimas.com',
    phone: '',
    role: 'Administrator',
    profileImage: '',
    createdAt: ''
  });
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [profileFormData, setProfileFormData] = useState({...user});
  
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
  // NEW STATE FOR CENTRALIZED NOTIFICATIONS AND LOADING POPUP
  const [notification, setNotification] = useState({ 
    show: false, 
    message: '', 
    type: 'info', 
    title: 'Info' 
  });
  const [loadingPopup, setLoadingPopup] = useState({ 
    show: false, 
    message: 'Loading data...' 
  });
  // Email test status — NOT used, but kept for UI
  const [emailTestStatus, setEmailTestStatus] = useState('✅ Email via Resend API');
  const notificationRef = useRef(null);
  const loadingPopupRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target) && notification.show) {
        setNotification({ ...notification, show: false });
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [notification]);

  const getApiBaseUrl = () => {
    if (import.meta.env.VITE_API_BASE_URL) {
      return import.meta.env.VITE_API_BASE_URL;
    }
    if (import.meta.env.DEV) {
      return 'http://localhost:10000';
    }
    return `${window.location.protocol}//${window.location.hostname}${window.location.port ? ':' + window.location.port : ''}`;
  };

  const API_BASE_URL = getApiBaseUrl();

  const showNotification = (message, type = 'info') => {
    let emoji = 'ℹ️';
    let title = 'Info';
    if (type === 'success') {
      emoji = '✅';
      title = 'Success!';
    } else if (type === 'error') {
      emoji = '🚨';
      title = 'Error!';
    } else if (message.includes('Welcome')) {
      emoji = '👋';
      title = 'Welcome!';
    } else if (message.includes('Publish') || message.includes('created') || message.includes('updated') || message.includes('generated')) {
      emoji = '📤';
      title = 'Action Completed';
    } else if (message.includes('wait') || message.includes('Loading')) {
      emoji = '⏳';
      title = 'Please Wait';
    } else if (message.includes('refreshed')) {
      emoji = '🔄';
      title = 'Data Refreshed';
    }
    setNotification({ 
      show: true, 
      message: `${emoji} ${message}`, 
      type, 
      title 
    });
    setTimeout(() => {
      setNotification({ show: false, message: '', type: 'info', title: 'Info' });
    }, type === 'error' ? 5000 : 5000);
  };

  const showLoadingPopup = (message = 'Loading dashboard data...') => {
    setLoadingPopup({ show: true, message });
  };

  const hideLoadingPopup = () => {
    setLoadingPopup({ show: false, message: '' });
  };

  const toggleDarkMode = () => setDarkMode(!darkMode);

  const themeClasses = {
    background: darkMode ? 'bg-gray-900' : 'bg-gray-50',
    text: darkMode ? 'text-gray-100' : 'text-gray-800',
    card: darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200',
    input: darkMode
      ? `bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-[${BRAND.PRIMARY}] focus:ring-1 focus:ring-[${BRAND.PRIMARY}]`
      : `bg-white border-gray-300 text-gray-800 placeholder-gray-500 focus:border-[${BRAND.PRIMARY}] focus:ring-1 focus:ring-[${BRAND.PRIMARY}]`,
    button: BUTTON_STYLES
  };

  useEffect(() => {
    const fetchData = async () => {
      showLoadingPopup('Loading dashboard data...');
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
        
        // Fetch user profile
        try {
          const userRes = await fetch(`${API_BASE_URL}/api/auth/me`, { headers });
          if (userRes.ok) {
            const response = await userRes.json();
            const userData = response.user || response; // Handle both wrapped and unwrapped responses
            setUser({
              id: userData._id || userData.id || '',
              name: userData.name || 'User',
              email: userData.email || '',
              phone: userData.phone || '',
              role: userData.role || 'user',
              profileImage: userData.profileImage || '',
              createdAt: userData.createdAt || ''
            });
            setProfileFormData({
              id: userData._id || userData.id || '',
              name: userData.name || 'User',
              email: userData.email || '',
              phone: userData.phone || '',
              role: userData.role || 'user',
              profileImage: userData.profileImage || '',
              createdAt: userData.createdAt || ''
            });
          }
        } catch (userError) {
          console.warn('Error fetching user profile:', userError);
        }
        
        const blogRes = await fetch(`${API_BASE_URL}/api/blog`, { headers });
        if (!blogRes.ok) {
          throw new Error(`Failed to fetch blog posts: ${blogRes.status} ${blogRes.statusText}`);
        }
        const blogResponse = await blogRes.json();
        setBlogPosts(blogResponse.data || []);
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
        let fetchedInvoices = [];
        try {
          const invoicesRes = await fetch(`${API_BASE_URL}/api/invoices`, { headers });
          if (invoicesRes.ok) {
            const invoicesResponse = await invoicesRes.json();
            fetchedInvoices = invoicesResponse.invoices || invoicesResponse.data || [];
          } else {
            console.warn('Invoices endpoint not available');
          }
        } catch (invoiceError) {
          console.warn('Error fetching invoices:', invoiceError);
        }
        setInvoices(fetchedInvoices);
        let fetchedReceipts = [];
        try {
          const receiptsRes = await fetch(`${API_BASE_URL}/api/receipts`, { headers });
          if (receiptsRes.ok) {
            const receiptsResponse = await receiptsRes.json();
            fetchedReceipts = receiptsResponse.receipts || receiptsResponse.data || [];
          } else {
            console.warn('Receipts endpoint not available');
          }
        } catch (receiptError) {
          console.warn('Error fetching receipts:', receiptError);
        }
        setReceipts(fetchedReceipts);
        const calculatedStats = {
          totalInvoices: fetchedInvoices.length,
          totalReceipts: fetchedReceipts.length,
          pendingInvoices: fetchedInvoices.filter(inv => inv.status === 'pending' || inv.status === 'draft').length,
          paidInvoices: fetchedInvoices.filter(inv => inv.status === 'paid').length,
          totalRevenue: fetchedInvoices.reduce((sum, inv) => sum + (inv.totalAmount || inv.planPrice || 0), 0)
        };
        setStats(calculatedStats);
        try {
          const settingsRes = await fetch(`${API_BASE_URL}/api/settings`, { headers });
          if (settingsRes.ok) {
            const settings = await settingsRes.json();
            setSettingsData(settings);
          }
        } catch (settingsError) {
          console.warn('Settings endpoint not available');
        }
        showNotification('Dashboard data loaded successfully!', 'success');
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
        hideLoadingPopup();
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

  // Profile Management Handlers
  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileFormData({
      ...profileFormData,
      [name]: value
    });
  };

  const handleProfileImageChange = async (file) => {
    if (!file) return;
    
    try {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileFormData({
          ...profileFormData,
          profileImage: reader.result
        });
      };
      reader.readAsDataURL(file);
    } catch (err) {
      console.error('Error reading file:', err);
      showNotification('❌ Error reading image file', 'error');
    }
  };

  const handleUpdateProfile = async () => {
    try {
      showLoadingPopup('Updating profile...');
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/auth/update-profile`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: profileFormData.name,
          email: profileFormData.email,
          phone: profileFormData.phone,
          profileImage: profileFormData.profileImage
        })
      });

      const data = await response.json();
      if (response.ok) {
        setUser(profileFormData);
        setShowProfileModal(false);
        showNotification('✅ Profile updated successfully!', 'success');
      } else {
        showNotification(`❌ ${data.message || 'Failed to update profile'}`, 'error');
      }
    } catch (err) {
      console.error('Profile update error:', err);
      showNotification('❌ Error updating profile. Please try again.', 'error');
    } finally {
      hideLoadingPopup();
    }
  };;

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
      } else if (activeTab === 'portfolio') {
        endpoint = `${API_BASE_URL}/api/portfolio`;
        if (isEditing && editingItem && editingItem._id) {
          endpoint = `${endpoint}/${editingItem._id}`;
        }
      } else {
        endpoint = `${API_BASE_URL}/api/blog`;
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
      } else if (activeTab === 'portfolio') {
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
    if (item.title && blogPosts.some(post => post._id === item._id)) {
      setActiveTab('blog');
    } else if (item.title && portfolioItems.some(port => port._id === item._id)) {
      setActiveTab('portfolio');
    } else if (item.invoiceNumber) {
      setActiveTab('invoices');
    } else if (item.receiptNumber) {
      setActiveTab('receipts');
    }
  };

  const handleDelete = async (id, type) => {
    let typeString = '';
    let endpoint = '';
    if (type === 'blog') {
      typeString = 'blog post';
      endpoint = `${API_BASE_URL}/api/blog/${id}`;
    } else if (type === 'portfolio') {
      typeString = 'portfolio item';
      endpoint = `${API_BASE_URL}/api/portfolio/${id}`;
    } else if (type === 'invoices') {
      typeString = 'invoice';
      endpoint = `${API_BASE_URL}/api/invoices/${id}`;
    } else if (type === 'receipts') {
      typeString = 'receipt';
      endpoint = `${API_BASE_URL}/api/receipts/${id}`;
    } else {
      showNotification('Invalid item type for deletion.', 'error');
      return;
    }
    if (!window.confirm(`Are you sure you want to delete this ${typeString}? This action cannot be undone.`)) {
      return;
    }
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication session expired. Please log in again.');
      }
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
        } else if (type === 'portfolio') {
          setPortfolioItems(prev => prev.filter(item => item._id !== id));
        } else if (type === 'invoices') {
          setInvoices(prev => prev.filter(inv => inv._id !== id));
        } else if (type === 'receipts') {
          setReceipts(prev => prev.filter(rcpt => rcpt._id !== id));
        }
        showNotification(`${typeString.charAt(0).toUpperCase() + typeString.slice(1)} deleted successfully!`, 'success');
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
      return <div></div>;
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
            user={user}
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
            emailTestStatus={emailTestStatus}
            BRAND={BRAND}
            setShowProfileModal={setShowProfileModal}
            BUTTON_STYLES={BUTTON_STYLES}
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
            receipts={receipts}
            setReceipts={setReceipts}
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
      case 'profile':
        return (
          <ProfilePanel
            user={user}
            setShowProfileModal={setShowProfileModal}
            darkMode={darkMode}
            themeClasses={themeClasses}
            BRAND={BRAND}
            BUTTON_STYLES={BUTTON_STYLES}
          />
        );
      default:
        return (
          <DashboardOverview
            user={user}
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
            emailTestStatus={emailTestStatus}
            BRAND={BRAND}
            setShowProfileModal={setShowProfileModal}
            BUTTON_STYLES={BUTTON_STYLES}
          />
        );
    }
  };

  return (
    <div className={`flex h-screen ${themeClasses.background} ${themeClasses.text} transition-colors duration-300`}>
      {/* Centralized Loading Popup */}
      {loadingPopup.show && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div ref={loadingPopupRef} className={`rounded-xl shadow-2xl p-8 max-w-md w-full mx-4 ${themeClasses.card} backdrop-blur-lg flex flex-col items-center`}>
            <Loader2 className={`animate-spin h-12 w-12 mb-4`} style={{ color: BRAND.PRIMARY }} />
            <h3 className={`text-xl font-bold mb-2 ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>Loading Dashboard</h3>
            <p className={`text-center ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>{loadingPopup.message}</p>
          </div>
        </div>
      )}
      {/* Centralized Notification Popup */}
      {notification.show && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-40">
          <div ref={notificationRef} className={`rounded-xl shadow-2xl p-6 max-w-md w-full mx-4 transform transition-transform duration-300 ${
            notification.type === 'success' ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-100' :
            notification.type === 'error' ? 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-100' :
            notification.type === 'info' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-100' : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100'
          } flex flex-col items-center`}>
            <div className="text-3xl mb-2">{notification.message.split(' ')[0]}</div>
            <h3 className="text-lg font-bold mb-1">{notification.title}</h3>
            <p className="text-center text-sm font-medium">{notification.message.substring(2)}</p>
          </div>
        </div>
      )}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}
      <div className={`${themeClasses.card} w-64 flex-shrink-0 shadow-lg fixed md:relative z-30 h-full transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 transition-transform duration-300 border-r ${darkMode ? 'border-gray-700' : 'border-[#00356B]/10'} backdrop-blur-sm bg-opacity-95`}>
        <div className="p-6 border-b flex justify-between items-center" style={{ borderColor: darkMode ? '#374151' : '#e5e7eb' }}>
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold`} style={{ backgroundColor: BRAND.PRIMARY }}>
              <BarChart3 className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-sm font-bold uppercase tracking-wider" style={{ color: BRAND.PRIMARY }}>Admin</h1>
              <p className="text-[10px] uppercase tracking-wider" style={{ color: BRAND.ACCENT }}>Panel</p>
            </div>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="md:hidden text-gray-500 hover:text-gray-700 p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <X size={18} />
          </button>
        </div>
        <nav className="mt-6 px-3 space-y-2">
          <NavItem
            icon={<BarChart3 size={16} />}
            text="Dashboard"
            active={activeTab === 'dashboard'}
            onClick={() => { setActiveTab('dashboard'); setSidebarOpen(false); }}
            darkMode={darkMode}
          />
          <NavItem
            icon={<FileText size={16} />}
            text="Blog Posts"
            active={activeTab === 'blog'}
            onClick={() => { setActiveTab('blog'); setSidebarOpen(false); }}
            darkMode={darkMode}
          />
          <NavItem
            icon={<Image size={16} />}
            text="Portfolio"
            active={activeTab === 'portfolio'}
            onClick={() => { setActiveTab('portfolio'); setSidebarOpen(false); }}
            darkMode={darkMode}
          />
          <NavItem
            icon={<CreditCard size={16} />}
            text="Invoices"
            active={activeTab === 'invoices'}
            onClick={() => { setActiveTab('invoices'); setSidebarOpen(false); }}
            darkMode={darkMode}
          />
          <NavItem
            icon={<Receipt size={16} />}
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
          <NavItem
            icon={<User size={18} />}
            text="Profile"
            active={activeTab === 'profile'}
            onClick={() => { setActiveTab('profile'); setSidebarOpen(false); }}
            darkMode={darkMode}
          />
        </nav>
        <div className="mt-8 px-3 pb-4">
          <h3 className={`text-xs font-bold uppercase tracking-wider mb-3 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Quick Actions</h3>
          <button
            onClick={() => { setActiveTab('blog'); setIsEditing(false); setEditingItem(null); setSidebarOpen(false); }}
            className={`w-full flex items-center text-left p-3 rounded-full transition-all duration-200 text-sm font-medium ${
              darkMode ? 'hover:bg-gray-700 text-gray-200 hover:shadow' : 'hover:bg-gray-100 text-gray-700 hover:shadow'
            }`}
          >
            <div className="p-1.5 rounded-lg mr-2" style={{ backgroundColor: `${BRAND.PRIMARY}20` }}>
              <Plus size={16} style={{ color: BRAND.PRIMARY }} />
            </div>
            New Blog Post
          </button>
          <button
            onClick={() => { setActiveTab('portfolio'); setIsEditing(false); setEditingItem(null); setSidebarOpen(false); }}
            className={`w-full flex items-center text-left p-3 rounded-full transition-all duration-200 mt-2 text-sm font-medium ${
              darkMode ? 'hover:bg-gray-700 text-gray-200 hover:shadow' : 'hover:bg-gray-100 text-gray-700 hover:shadow'
            }`}
          >
            <div className="p-1.5 rounded-lg mr-2" style={{ backgroundColor: `${BRAND.ACCENT}20` }}>
              <Plus size={16} style={{ color: BRAND.PRIMARY }} />
            </div>
            New Portfolio Item
          </button>
          <button
            onClick={() => { setActiveTab('invoices'); setSidebarOpen(false); }}
            className={`w-full flex items-center text-left p-3 rounded-full transition-all duration-200 mt-2 text-sm font-medium ${
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
        <div className="absolute bottom-0 left-0 right-0 px-3 pb-6 pt-4 border-t" style={{ borderColor: darkMode ? '#374151' : '#e5e7eb' }}>
          <button
            onClick={handleLogout}
            className={`w-full flex items-center justify-center p-3 rounded-lg transition-all duration-200 text-sm font-bold uppercase tracking-wider ${
              darkMode ? 'bg-red-600/80 hover:bg-red-600 text-white shadow hover:shadow-lg' : 'bg-red-600 hover:bg-red-700 text-white shadow hover:shadow-lg'
            }`}
          >
            <LogOut size={16} className="mr-2" />
            Sign Out
          </button>
        </div>
      </div>
      <div className="flex-1 overflow-auto">
        <header className={`${themeClasses.card} shadow-md p-4 md:p-6 flex items-center justify-between border-b ${darkMode ? 'border-gray-700' : 'border-[#00356B]/10'} backdrop-blur-sm bg-opacity-95 sticky top-0 z-10`}>
          <div className="flex items-center">
            <button onClick={() => setSidebarOpen(true)} className="md:hidden mr-4 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
              <Menu size={22} className={themeClasses.text} />
            </button>
            <h2 className="text-lg md:text-2xl font-bold uppercase tracking-wider" style={{ color: BRAND.PRIMARY }}>{activeTab}</h2>
          </div>
          <div className="flex items-center space-x-3">
            <div className="relative hidden md:block">
              <Search size={16} className={`absolute left-4 top-1/2 transform -translate-y-1/2 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
              <input
                type="text"
                placeholder="Search..."
                className={`pl-12 pr-4 py-2.5 text-sm border rounded-lg focus:outline-none focus:ring-2 transition-all duration-200 ${themeClasses.input} w-64`}
                style={{ focusColor: BRAND.PRIMARY, borderColor: darkMode ? '#4b5563' : '#e5e7eb' }}
              />
            </div>
            <button
              onClick={toggleDarkMode}
              className={`p-2.5 rounded-lg transition-all duration-300 ${
                darkMode ? 'bg-gray-700 hover:bg-gray-600 text-yellow-300 hover:shadow-lg' : 'hover:shadow-md'
              }`}
              style={{ backgroundColor: darkMode ? '#374151' : '#eef5ff' }}
              aria-label="Toggle theme"
              title="Toggle dark mode"
            >
              {darkMode ? <Sun size={16} /> : <Moon size={16} />}
            </button>
            <div
              className="flex items-center space-x-3 cursor-pointer"
              onClick={() => setShowProfileModal(true)}
              title="View profile"
              style={{ transition: 'all 300ms ease' }}
              onMouseEnter={(e) => e.currentTarget.style.opacity = '0.9'}
              onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
            >
              <div 
                className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-sm text-white shadow-md hover:shadow-lg transition-all duration-300 hover:scale-110 border-2`} 
                style={{ backgroundColor: BRAND.PRIMARY, borderColor: BRAND.ACCENT, overflow: 'hidden' }}
              >
                {user.profileImage ? (
                  <img src={user.profileImage} alt={user.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="flex items-center justify-center w-full h-full font-bold text-lg" style={{ backgroundColor: BRAND.PRIMARY }}>
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              <div className="hidden md:block">
                <div className="text-[12px] font-bold text-gray-900 dark:text-white">{user.name}</div>
                <div className={`text-[11px] uppercase tracking-wider ${darkMode ? 'text-gray-400' : 'text-[#00356B]'}`}>{user.role}</div>
              </div>
            </div>
          </div>
        </header>
        <main className="p-4 md:p-6">
          {renderContent()}
        </main>
      </div>

      {/* Profile Modal */}
      {showProfileModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className={`rounded-2xl shadow-2xl p-8 max-w-2xl w-full ${themeClasses.card} border-2`} style={{ borderColor: BRAND.PRIMARY }}>
            <div className="flex items-center justify-between mb-8 pb-6 border-b" style={{ borderColor: darkMode ? '#374151' : '#e5e7eb' }}>
              <div>
                <span className="text-[9px] font-bold px-3 py-1 tracking-tighter uppercase rounded" style={{ backgroundColor: BRAND.PRIMARY, color: 'white' }}>Account Settings</span>
                <h2 className="text-3xl md:text-4xl font-light mt-3" style={{ color: BRAND.PRIMARY }}>Edit <span className="font-bold">Profile</span></h2>
              </div>
              <button
                onClick={() => { setShowProfileModal(false); setProfileFormData(user); }}
                className={`p-2 rounded-lg transition-all duration-200 ${darkMode ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-600'}`}
              >
                <X size={24} />
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Left Column - Image Upload */}
              <div className="flex flex-col items-center justify-center p-6 rounded-xl border-2" style={{ backgroundColor: darkMode ? '#1f2937' : '#eef5ff', borderColor: BRAND.PRIMARY }}>
                <div className="relative mb-6">
                  {profileFormData.profileImage ? (
                    <img
                      src={profileFormData.profileImage}
                      alt="Profile"
                      className="w-40 h-40 rounded-2xl object-cover shadow-lg"
                      style={{ borderColor: BRAND.ACCENT, borderWidth: '4px' }}
                    />
                  ) : (
                    <div
                      className="w-40 h-40 rounded-2xl flex items-center justify-center text-white text-7xl font-bold shadow-lg"
                      style={{ backgroundColor: BRAND.PRIMARY, borderColor: BRAND.ACCENT, borderWidth: '4px' }}
                    >
                      {profileFormData.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <label
                    htmlFor="profileImageInput"
                    className="absolute bottom-2 right-2 bg-white rounded-full p-3 shadow-lg cursor-pointer hover:shadow-xl transition-all hover:scale-110 border-2"
                    style={{ borderColor: BRAND.ACCENT, backgroundColor: BRAND.ACCENT }}
                  >
                    <input
                      type="file"
                      id="profileImageInput"
                      accept="image/*"
                      onChange={(e) => handleProfileImageChange(e.target.files?.[0])}
                      className="hidden"
                    />
                    <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" />
                    </svg>
                  </label>
                </div>
                <p className={`text-[11px] font-bold uppercase tracking-wider text-center ${darkMode ? 'text-gray-400' : 'text-[#00356B]'}`}>
                  Click camera icon to change photo
                </p>
              </div>

              {/* Right Column - Form Fields */}
              <div className="space-y-6">
                <div>
                  <label className={`block text-[11px] font-bold uppercase tracking-wider mb-3 ${darkMode ? 'text-gray-400' : 'text-[#00356B]'}`}>Full Name</label>
                  <input
                    type="text"
                    name="name"
                    value={profileFormData.name}
                    onChange={handleProfileChange}
                    className={`w-full p-3 border rounded-lg text-sm transition-all duration-200 focus:ring-2 focus:border-transparent ${themeClasses.input}`}
                    style={{ borderColor: darkMode ? '#4b5563' : '#e5e7eb', focusRingColor: BRAND.PRIMARY }}
                    placeholder="Enter your full name"
                  />
                </div>
                
                <div>
                  <label className={`block text-[11px] font-bold uppercase tracking-wider mb-3 ${darkMode ? 'text-gray-400' : 'text-[#00356B]'}`}>Email Address</label>
                  <input
                    type="email"
                    name="email"
                    value={profileFormData.email}
                    onChange={handleProfileChange}
                    className={`w-full p-3 border rounded-lg text-sm transition-all duration-200 focus:ring-2 focus:border-transparent ${themeClasses.input}`}
                    style={{ borderColor: darkMode ? '#4b5563' : '#e5e7eb' }}
                    placeholder="Enter your email"
                  />
                </div>
                
                <div>
                  <label className={`block text-[11px] font-bold uppercase tracking-wider mb-3 ${darkMode ? 'text-gray-400' : 'text-[#00356B]'}`}>Phone Number</label>
                  <input
                    type="tel"
                    name="phone"
                    value={profileFormData.phone}
                    onChange={handleProfileChange}
                    className={`w-full p-3 border rounded-lg text-sm transition-all duration-200 focus:ring-2 focus:border-transparent ${themeClasses.input}`}
                    style={{ borderColor: darkMode ? '#4b5563' : '#e5e7eb' }}
                    placeholder="Enter your phone number"
                  />
                </div>

                <div className="flex gap-3 mt-8 pt-6 border-t" style={{ borderColor: darkMode ? '#374151' : '#e5e7eb' }}>
                  <button
                    onClick={() => { setShowProfileModal(false); setProfileFormData(user); }}
                    className={`flex-1 py-3 px-5 rounded-lg font-bold text-sm uppercase tracking-wider transition-all duration-200 border-2`}
                    style={{ borderColor: BRAND.PRIMARY, color: BRAND.PRIMARY, backgroundColor: 'transparent' }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleUpdateProfile}
                    className={`flex-1 py-3 px-5 rounded-lg font-bold text-sm uppercase tracking-wider transition-all duration-200 text-white shadow-md hover:shadow-lg`}
                    style={{ backgroundColor: BRAND.ACCENT }}
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Remaining Components (UNCHANGED except DashboardOverview & RecentList)
const NavItem = ({ icon, text, active, onClick, darkMode }) => (
  <button
    onClick={onClick}
    className={`flex items-center w-full p-3 text-sm rounded-lg transition-all duration-200 font-bold ${
      active
        ? `shadow-md border text-white`
        : (darkMode ? 'text-gray-300 hover:bg-gray-700/50 hover:text-white hover:shadow' : 'text-gray-700 hover:bg-[#eef5ff] hover:shadow')
    }`}
    style={active ? { 
      backgroundColor: BRAND.PRIMARY, 
      borderColor: BRAND.ACCENT,
      color: 'white'
    } : {}}
  >
    <span className={`p-2 rounded-lg mr-3`} style={{ backgroundColor: active ? `${BRAND.ACCENT}40` : (darkMode ? 'rgba(75, 85, 99, 0.5)' : '#eef5ff') }}>
      {icon}
    </span>
    {text}
  </button>
);

const CalendarPlaceholder = ({ darkMode, themeClasses }) => {
  const days = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
  const dates = [
    null, null, null, null, null, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10,
    11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25,
    26, 27, 28, 29, 30, null
  ];
  return (
    <div className={`${themeClasses.card} p-4 rounded-xl shadow-sm border backdrop-blur-sm h-full`}>
      <div className="flex justify-between items-center mb-4">
        <h3 className={`text-lg font-bold ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>🗓️ Upcoming Schedule</h3>
        <div className="text-sm font-bold" style={{ color: BRAND.ACCENT }}>November 2025</div>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center text-xs font-semibold uppercase">
        {days.map((day, index) => (
          <div key={index} className={darkMode ? 'text-gray-400' : 'text-gray-500'}>{day}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1 mt-2">
        {dates.map((date, index) => (
          <div
            key={index}
            className={`p-1 rounded-full text-sm flex items-center justify-center h-8 w-8 mx-auto font-bold ${
              !date ? 'text-transparent pointer-events-none' :
              date === 15 ? 'shadow-lg text-white' :
              (darkMode ? 'text-gray-300 hover:bg-gray-700/50' : 'text-gray-800 hover:bg-gray-100/50')
            }`}
            style={date === 15 ? { backgroundColor: BRAND.PRIMARY } : {}}
          >
            {date}
          </div>
        ))}
      </div>
      <div className={`mt-4 pt-4 border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
        <h4 className={`text-sm font-semibold mb-2 ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>Events Summary:</h4>
        <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
          <span className="font-bold mr-1">Nov 18:</span> Project Alpha Deadline
        </p>
        <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
          <span className="font-bold mr-1">Nov 25:</span> Client Meeting (Optimas)
        </p>
      </div>
    </div>
  );
};

const ReceiptStatusPieChart = ({ receipts, darkMode, themeClasses }) => {
  const statusCounts = {
    processed: receipts.filter(r => r.status === 'processed' || r.status === 'paid').length,
    pending: receipts.filter(r => r.status === 'pending' || r.status === 'draft' || r.status === 'unprocessed').length,
    rejected: receipts.filter(r => r.status === 'rejected' || r.status === 'canceled').length,
  };
  const receiptStatusData = {
    labels: ['Processed/Paid', 'Pending/Draft', 'Rejected/Canceled'],
    datasets: [{
      data: [statusCounts.processed, statusCounts.pending, statusCounts.rejected],
      backgroundColor: ['rgba(34, 197, 94, 0.8)', 'rgba(245, 158, 11, 0.8)', 'rgba(239, 68, 68, 0.8)'],
      borderColor: darkMode ? '#1f2937' : '#fff',
      borderWidth: 2,
    }],
  };
  const receiptStatusOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: darkMode ? '#e5e7eb' : '#374151',
          padding: 15,
          font: { size: 10 }
        }
      },
      title: { 
        display: true, 
        text: 'Receipt Status Distribution', 
        color: darkMode ? '#f9fafb' : '#111827', 
        font: { size: 14, weight: 'bold' } 
      },
    },
  };
  return (
    <div className={`${themeClasses.card} p-4 rounded-xl shadow-sm border backdrop-blur-sm h-full flex flex-col`}>
      <div className="flex-grow flex items-center justify-center min-h-[200px]">
        {receipts.length > 0 ? (
          <Pie data={receiptStatusData} options={receiptStatusOptions} />
        ) : (
          <div className="flex flex-col items-center justify-center">
            <Receipt size={40} className="text-gray-400 mb-3" />
            <p className="text-sm text-gray-500 dark:text-gray-400">No receipt data available yet.</p>
          </div>
        )}
      </div>
    </div>
  );
};

const BlogStatusPieChart = ({ blogPosts, darkMode, themeClasses }) => {
  const statusCounts = {
    published: blogPosts.filter(p => p.published === true || p.status === 'published').length,
    draft: blogPosts.filter(p => p.published === false || p.status === 'draft').length,
    other: blogPosts.length - (blogPosts.filter(p => p.published === true || p.status === 'published').length + blogPosts.filter(p => p.published === false || p.status === 'draft').length)
  };
  const blogStatusData = {
    labels: ['Published', 'Draft', 'Other'],
    datasets: [{
      data: [statusCounts.published, statusCounts.draft, statusCounts.other],
      backgroundColor: ['rgba(34, 197, 94, 0.8)', 'rgba(245, 158, 11, 0.8)', 'rgba(156, 163, 175, 0.8)'],
      borderColor: darkMode ? '#1f2937' : '#fff',
      borderWidth: 2,
    }],
  };
  const blogStatusOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: darkMode ? '#e5e7eb' : '#374151',
          padding: 15,
          font: { size: 10 }
        }
      },
      title: { 
        display: true, 
        text: 'Blog Post Status Distribution', 
        color: darkMode ? '#f9fafb' : '#111827', 
        font: { size: 14, weight: 'bold' } 
      },
    },
  };
  return (
    <div className={`${themeClasses.card} p-4 rounded-xl shadow-sm border backdrop-blur-sm h-full flex flex-col`}>
      <div className="flex-grow flex items-center justify-center min-h-[200px]">
        {blogPosts.length > 0 ? (
          <Pie data={blogStatusData} options={blogStatusOptions} />
        ) : (
          <div className="flex flex-col items-center justify-center">
            <FileText size={40} className="text-gray-400 mb-3" />
            <p className="text-sm text-gray-500 dark:text-gray-400">No blog post data available yet.</p>
          </div>
        )}
      </div>
    </div>
  );
};

const PortfolioCategoryBarChart = ({ portfolioItems, darkMode, themeClasses }) => {
  const categoryMap = {};
  portfolioItems.forEach(item => {
    const cat = item.category || 'Uncategorized';
    categoryMap[cat] = (categoryMap[cat] || 0) + 1;
  });
  const categories = Object.keys(categoryMap);
  const counts = Object.values(categoryMap);
  const generateColors = (numCategories) => {
    const colors = [];
    for (let i = 0; i < numCategories; i++) {
      const hue = (i * 360) / numCategories;
      colors.push(`hsla(${hue}, 70%, 50%, 0.7)`);
    }
    return colors;
  };
  const portfolioCategoryData = {
    labels: categories,
    datasets: [{
      label: 'Number of Items',
      data: counts,
      backgroundColor: generateColors(categories.length),
      borderColor: darkMode ? '#1f2937' : '#fff',
      borderWidth: 1,
    }],
  };
  const portfolioCategoryOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      title: { 
        display: true, 
        text: 'Portfolio Item Distribution by Category', 
        color: darkMode ? '#f9fafb' : '#111827', 
        font: { size: 14, weight: 'bold' } 
      },
    },
    scales: {
      x: { 
        ticks: { color: darkMode ? '#d1d5db' : '#4b5563' }, 
        grid: { display: false } 
      },
      y: { 
        beginAtZero: true, 
        ticks: { color: darkMode ? '#d1d5db' : '#4b5563' }, 
        grid: { color: darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' } 
      },
    },
  };
  return (
    <div className={`${themeClasses.card} p-4 rounded-xl shadow-sm border backdrop-blur-sm h-full flex flex-col`}>
      <div className="flex-grow flex items-center justify-center min-h-[200px]">
        {portfolioItems.length > 0 ? (
          <Bar data={portfolioCategoryData} options={portfolioCategoryOptions} />
        ) : (
          <div className="flex flex-col items-center justify-center">
            <Image size={40} className="text-gray-400 mb-3" />
            <p className="text-sm text-gray-500 dark:text-gray-400">No portfolio item data available yet.</p>
          </div>
        )}
      </div>
    </div>
  );
};

// ✅ UPDATED DashboardOverview - removed downloadAndOpenEmail dependency
const DashboardOverview = ({
  user,
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
  showNotification,
  emailTestStatus,
  BRAND,
  setShowProfileModal,
  BUTTON_STYLES
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

  const getLast6Months = () => {
    const months = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push(d.toLocaleString('default', { month: 'short' }) + ' ' + d.getFullYear());
    }
    return months;
  };

  const monthLabels = getLast6Months();
  const monthlyRevenue = Array(6).fill(0);
  invoices.forEach(inv => {
    if (inv.createdAt && inv.status === 'paid') {
      const invDate = new Date(inv.createdAt);
      const invMonth = invDate.toLocaleString('default', { month: 'short' }) + ' ' + invDate.getFullYear();
      const index = monthLabels.indexOf(invMonth);
      if (index !== -1) {
        monthlyRevenue[index] += inv.totalAmount || inv.planPrice || 0;
      }
    }
  });

  const revenueChartData = {
    labels: monthLabels,
    datasets: [{
      label: 'Monthly Revenue (Ksh)',
      data: monthlyRevenue.map(v => v || 0),
      backgroundColor: `${BRAND.PRIMARY}b2`,
      borderColor: BRAND.PRIMARY,
      tension: 0.4,
      borderWidth: 3,
      pointRadius: 5,
      pointBackgroundColor: BRAND.ACCENT,
    }],
  };

  const revenueChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { 
        position: 'top', 
        labels: { 
          color: darkMode ? '#e5e7eb' : '#374151', 
          font: { size: 12 } 
        } 
      },
      title: { 
        display: true, 
        text: 'Revenue Trend Over Last 6 Months', 
        color: darkMode ? '#f9fafb' : '#111827', 
        font: { size: 14, weight: 'bold' } 
      },
      tooltip: { 
        mode: 'index', 
        intersect: false,
        callbacks: {
          label: function(context) {
            return `Revenue: Ksh ${formatPrice(context.raw)}`;
          }
        }
      }
    },
    scales: {
      x: { 
        ticks: { 
          color: darkMode ? '#d1d5db' : '#4b5563' 
        }, 
        grid: { 
          color: darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' 
        } 
      },
      y: { 
        beginAtZero: true, 
        ticks: { 
          color: darkMode ? '#d1d5db' : '#4b5563',
          callback: function(value) {
            return `Ksh ${formatPrice(value)}`;
          }
        }, 
        grid: { 
          color: darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' 
        } 
      },
    },
  };

  const invoiceStatusCounts = {
    paid: invoices.filter(i => i.status === 'paid').length,
    pending: invoices.filter(i => i.status === 'pending' || i.status === 'draft').length,
    other: invoices.filter(i => !['paid', 'pending', 'draft'].includes(i.status)).length,
  };

  const invoiceStatusData = {
    labels: ['Paid', 'Pending/Draft', 'Other'],
    datasets: [{
      data: [invoiceStatusCounts.paid, invoiceStatusCounts.pending, invoiceStatusCounts.other],
      backgroundColor: ['rgba(34, 197, 94, 0.8)', 'rgba(245, 158, 11, 0.8)', 'rgba(156, 163, 175, 0.8)'],
      borderColor: darkMode ? '#1f2937' : '#fff',
      borderWidth: 2,
    }],
  };

  const invoiceStatusOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: darkMode ? '#e5e7eb' : '#374151',
          padding: 15,
          font: { size: 10 }
        }
      },
      title: { 
        display: true, 
        text: 'Invoice Status Distribution', 
        color: darkMode ? '#f9fafb' : '#111827', 
        font: { size: 14, weight: 'bold' } 
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            return `${context.label}: ${context.raw} invoices`;
          }
        }
      }
    },
  };

  const contentData = {
    labels: ['Blog Posts', 'Portfolio', 'Invoices', 'Receipts'],
    datasets: [{
      label: 'Total Count',
      data: [blogPosts.length, portfolioItems.length, invoices.length, receipts.length],
      backgroundColor: ['rgba(59, 130, 246, 0.7)', 'rgba(245, 158, 11, 0.7)', 'rgba(16, 185, 129, 0.7)', 'rgba(139, 92, 246, 0.7)'],
      borderColor: darkMode ? '#1f2937' : '#fff',
      borderWidth: 1,
    }],
  };

  const contentOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      title: { 
        display: true, 
        text: 'Content & Transaction Overview', 
        color: darkMode ? '#f9fafb' : '#111827', 
        font: { size: 14, weight: 'bold' } 
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            return `${context.label}: ${context.raw} items`;
          }
        }
      }
    },
    scales: {
      x: { 
        ticks: { 
          color: darkMode ? '#d1d5db' : '#4b5563' 
        }, 
        grid: { 
          display: false 
        } 
      },
      y: { 
        beginAtZero: true, 
        ticks: { 
          color: darkMode ? '#d1d5db' : '#4b5563' 
        }, 
        grid: { 
          color: darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' 
        } 
      },
    },
  };

  return (
    <div>
      {/* Header Section */}
      <div className="mb-10">
        <div className="flex items-center gap-2 mb-4">
          <span className="bg-[#00356B] text-white text-[9px] font-bold px-3 py-1 tracking-tighter uppercase rounded">
            Real-Time Dashboard
          </span>
          <span className="text-[#00356B] text-[9px] font-bold uppercase tracking-[2px]">
            Admin Overview
          </span>
        </div>
        <h2 className="text-3xl md:text-4xl font-light text-[#00356B] mb-3">Welcome back, <span className="font-bold">{user.name}</span>! 👋</h2>
        <p className={`text-[13px] ${darkMode ? 'text-gray-400' : 'text-gray-600'} font-medium`}>Here's what's happening with your real-time data. Manage content, track revenue, and monitor all activities.</p>
      </div>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-3 mb-8">
        <button
          onClick={() => { setIsEditing(false); setEditingItem(null); setActiveTab('blog'); }}
          className={`${BUTTON_STYLES.accent.base} ${BUTTON_STYLES.accent.light} flex items-center`}
        >
          <Plus size={14} className="mr-2" />
          New Blog Post
        </button>
        <button
          onClick={() => { setIsEditing(false); setEditingItem(null); setActiveTab('portfolio'); }}
          className={`${BUTTON_STYLES.secondary.base} ${BUTTON_STYLES.secondary.light} flex items-center`}
        >
          <Plus size={14} className="mr-2" />
          New Portfolio
        </button>
        <button
          onClick={() => { setActiveTab('invoices'); }}
          className={`${BUTTON_STYLES.primary.base} ${BUTTON_STYLES.primary.light} flex items-center`}
        >
          <Plus size={14} className="mr-2" />
          Manage Invoices
        </button>
        <button
          onClick={exportInvoicesToExcel}
          className={`${BUTTON_STYLES.secondary.base} ${BUTTON_STYLES.secondary.light} flex items-center`}
        >
          <FileSpreadsheet size={14} className="mr-2" />
          Export Invoices
        </button>
        <span className={`px-4 py-2.5 text-[10px] font-bold uppercase tracking-wider rounded-md flex items-center gap-2 ${darkMode ? 'bg-[#86bc25]/20 text-[#86bc25] border border-[#86bc25]/30' : 'bg-[#86bc25]/10 text-[#86bc25] border border-[#86bc25]/20'}`}>
          <div className="w-2 h-2 rounded-full bg-[#86bc25] animate-pulse"></div>
          {emailTestStatus}
        </span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        <StatCard
          title="Blog Posts"
          value={blogPosts.length}
          change={`${blogPosts.length} published`}
          icon={<FileText size={18} />}
          color="blue"
          darkMode={darkMode}
        />
        <StatCard
          title="Portfolio Items"
          value={portfolioItems.length}
          change={`${portfolioItems.length} published`}
          icon={<Image size={18} />}
          color="gold"
          darkMode={darkMode}
        />
        <StatCard
          title="Total Invoices"
          value={stats.totalInvoices || invoices.length}
          change={`${stats.pendingInvoices || invoices.filter(inv => inv.status === 'pending').length} pending`}
          icon={<CreditCard size={18} />}
          color="green"
          darkMode={darkMode}
        />
        <StatCard
          title="Total Revenue"
          value={`Ksh ${formatPrice(stats.totalRevenue || 0)}`}
          change={`${stats.paidInvoices || invoices.filter(inv => inv.status === 'paid').length} paid`}
          icon={<DollarSign size={18} />}
          color="accent"
          darkMode={darkMode}
        />
      </div>

      {/* Charts Section */}
      <div className="mb-8">
        <div className="inline-block mb-4">
          <span className="bg-[#00356B] text-white text-[9px] font-bold px-3 py-1 tracking-tighter uppercase rounded">
            Analytics & Insights
          </span>
        </div>
        <h3 className="text-2xl font-light text-[#00356B] mb-3">Performance <span className="font-bold">Overview</span></h3>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-1 h-80">
          <div className={`${themeClasses.card} p-5 rounded-xl shadow-md border backdrop-blur-sm h-full`}>
            <Bar data={contentData} options={contentOptions} />
          </div>
        </div>
        <div className="lg:col-span-1 h-80">
          <div className={`${themeClasses.card} p-5 rounded-xl shadow-md border backdrop-blur-sm h-full`}>
            <Pie data={invoiceStatusData} options={invoiceStatusOptions} />
          </div>
        </div>
        <div className="lg:col-span-1 h-80">
          <ReceiptStatusPieChart receipts={receipts} darkMode={darkMode} themeClasses={themeClasses} />
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <BlogStatusPieChart blogPosts={blogPosts} darkMode={darkMode} themeClasses={themeClasses} />
        <PortfolioCategoryBarChart portfolioItems={portfolioItems} darkMode={darkMode} themeClasses={themeClasses} />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
        <div className="lg:col-span-2 h-96">
          <div className={`${themeClasses.card} p-5 rounded-xl shadow-md border backdrop-blur-sm h-full`}>
            <Line data={revenueChartData} options={revenueChartOptions} />
          </div>
        </div>
        <div className="lg:col-span-1 h-96">
          <CalendarPlaceholder darkMode={darkMode} themeClasses={themeClasses} />
        </div>
      </div>

      {/* Recent Items Section */}
      <div className="mb-8">
        <div className="inline-block mb-4">
          <span className="bg-[#00356B] text-white text-[9px] font-bold px-3 py-1 tracking-tighter uppercase rounded">
            Recent Activity
          </span>
        </div>
        <h3 className="text-2xl font-light text-[#00356B] mb-3">Latest <span className="font-bold">Updates</span></h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
          API_BASE_URL={API_BASE_URL}
          showNotification={showNotification}
        />
        <RecentList
          title="Recent Receipts"
          items={receipts.slice(0, 5)}
          viewAllLink="/admin/receipts"
          darkMode={darkMode}
          themeClasses={themeClasses}
          onEdit={onEdit}
          onDelete={onDelete}
          type="receipts"
          API_BASE_URL={API_BASE_URL}
          showNotification={showNotification}
        />
      </div>
    </div>
  );
};

const StatCard = ({ title, value, change, icon, color, darkMode }) => {
  const colorClasses = {
    blue: darkMode ? `bg-[#00356B]/10 border-[#00356B]/20` : `bg-[#eef5ff] border-[#00356B]/20`,
    gold: darkMode ? 'bg-[#D85C2C]/10 border-[#D85C2C]/20' : 'bg-[#D85C2C]/5 border-[#D85C2C]/20',
    green: darkMode ? 'bg-[#86bc25]/10 border-[#86bc25]/20' : 'bg-[#86bc25]/5 border-[#86bc25]/20',
    accent: darkMode ? `bg-[#D85C2C]/10 border-[#D85C2C]/20` : `bg-[#D85C2C]/5 border-[#D85C2C]/20`
  };
  const iconColor = {
    blue: BRAND.PRIMARY,
    gold: BRAND.ACCENT,
    green: '#86bc25',
    accent: BRAND.ACCENT
  };
  const textColor = darkMode ? 'text-gray-100' : 'text-[#1a1a1a]';
  const subTextColor = darkMode ? 'text-gray-400' : 'text-gray-600';
  return (
    <div className={`${colorClasses[color]} p-6 rounded-xl border backdrop-blur-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-1`}>
      <div className="flex items-center justify-between">
        <div>
          <p className={`text-[11px] font-bold uppercase tracking-wider ${darkMode ? 'text-gray-400' : 'text-[#00356B]'}`}>{title}</p>
          <p className={`text-3xl font-bold mt-2 ${textColor}`}>{value}</p>
          <p className={`text-[12px] mt-3 ${subTextColor}`}>{change}</p>
        </div>
        <div className={`p-3 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-white'} shadow-md`}>
          <div style={{ color: iconColor[color] }}>
            {icon}
          </div>
        </div>
      </div>
    </div>
  );
};

// ✅ Updated: use enhanced download and send functions
const RecentList = ({ title, items, viewAllLink, darkMode, themeClasses, onEdit, onDelete, type, API_BASE_URL, showNotification }) => {
  const handleDownloadPDF = async (item) => {
    const token = localStorage.getItem('token');
    if (!token) {
      showNotification('⚠️ Session expired. Please log in again.', 'error');
      return;
    }
    await downloadInvoicePdf(item._id, API_BASE_URL, token, showNotification);
  };

  const handleSendEmail = async (item) => {
    if (!item.customerEmail?.trim()) {
      showNotification('⚠️ Customer email is required to send.', 'warning');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(item.customerEmail.trim())) {
      showNotification('⚠️ Invalid email format.', 'warning');
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      showNotification('⚠️ Session expired. Please log in again.', 'error');
      return;
    }

    if (type === 'invoices') {
      await sendInvoiceViaEmail(item, API_BASE_URL, token, showNotification);
    } else if (type === 'receipts') {
      await sendReceiptViaEmail(item, API_BASE_URL, token, showNotification);
    }
  };

  return (
    <div className={`${themeClasses.card} p-6 rounded-xl shadow-md border backdrop-blur-sm transition-all duration-300 hover:shadow-lg`}>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className={`text-lg font-bold uppercase tracking-tight ${darkMode ? 'text-gray-100' : 'text-[#1a1a1a]'}`}>{title}</h3>
        </div>
        <a 
          href={viewAllLink} 
          className={`text-sm font-bold uppercase tracking-wider transition-colors hover:opacity-80 flex items-center gap-1`}
          style={{ color: BRAND.ACCENT }}
          onClick={(e) => {
            e.preventDefault();
            window.location.hash = viewAllLink;
          }}
        >
          View All <ChevronRight size={14} />
        </a>
      </div>
      <ul className={`divide-y ${darkMode ? 'divide-gray-700' : 'divide-[#eee]'}`}>
        {items.map(item => (
          <li key={item._id} className="py-4 flex justify-between items-center first:pt-0 last:pb-0">
            <div className="flex items-center flex-1">
              {item.imageUrl && type === 'blog' && (
                <img
                  src={item.imageUrl}
                  alt={item.title}
                  className="w-12 h-12 object-cover rounded-md mr-4 flex-shrink-0"
                  onError={(e) => {
                    e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDgiIGhlaWdodD0iNDgiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0iI2UzZTdlOSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTIiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGRvbWluYW50LWJhc2VsaW5lPSJtaWRkbGUiIGZpbGw9IiM2NTc1ODI5Ij5OTyBJTUFHRTwvdGV4dD48L3N2Zz4=';
                  }}
                />
              )}
              <div>
                <h4 className={`text-sm font-medium ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                  {type === 'invoices' ? (item.invoiceNumber || `INV-${item._id}`) :
                    type === 'receipts' ? (item.receiptNumber || `RCP-${item._id}`) :
                    item.title}
                </h4>
                <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  {type === 'invoices' || type === 'receipts' ? item.customerName : new Date(item.publishedAt || item.createdAt).toLocaleDateString()}
                </p>
                {(type === 'invoices' || type === 'receipts') && (
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
                {(type === 'invoices' || type === 'receipts') && (item.planPrice || item.amount) && (
                  <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    Ksh {formatPrice(item.planPrice || item.amount)}
                  </p>
                )}
              </div>
            </div>
            <div className="flex space-x-2 flex-shrink-0">
              {(type === 'invoices' || type === 'receipts') && (
                <>
                  <button
                    onClick={() => handleDownloadPDF(item)}
                    className="p-1.5 rounded-lg text-gray-500 hover:text-blue-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    title="Download PDF"
                  >
                    <Download size={16} />
                  </button>
                  <button
                    onClick={() => handleSendEmail(item)}
                    className="p-1.5 rounded-lg text-gray-500 hover:text-green-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    title="Send via Email"
                  >
                    <Send size={16} />
                  </button>
                </>
              )}
              <button
                onClick={() => onEdit(item)}
                className="p-1.5 rounded-full text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                style={{ color: 'inherit' }}
                onMouseEnter={(e) => { e.target.style.color = BRAND.PRIMARY; }}
                onMouseLeave={(e) => { e.target.style.color = 'inherit'; }}
                title="Edit"
              >
                <Edit size={16} />
              </button>
              <button
                onClick={() => onDelete(item._id, type)}
                className="p-1.5 rounded-full text-gray-500 hover:text-red-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                title="Delete"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </li>
        ))}
        {items.length === 0 && (
          <li className="py-3 text-center text-sm text-gray-500 dark:text-gray-400">
            No recent {type === 'receipts' ? 'receipts' : type === 'invoices' ? 'invoices' : 'items'}.
          </li>
        )}
      </ul>
    </div>
  );
};

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
      {/* Header Section */}
      <div className="mb-8">
        <div className="inline-block mb-4">
          <span className="bg-[#00356B] text-white text-[9px] font-bold px-3 py-1 tracking-tighter uppercase rounded">
            Content Management
          </span>
        </div>
        <h2 className="text-3xl md:text-4xl font-light text-[#00356B] mb-3">
          {isEditing ? `Edit ${isPortfolio ? 'Portfolio' : 'Blog'}` : `Create New ${isPortfolio ? 'Portfolio' : 'Blog'}` }
        </h2>
        <div className="h-1 w-24 bg-[#86bc25]"></div>
      </div>

      {isEditing && (
        <div className="mb-6">
          <button
            onClick={onCancel}
            className={`${BUTTON_STYLES.secondary.base} ${darkMode ? BUTTON_STYLES.secondary.dark : BUTTON_STYLES.secondary.light} flex items-center`}
          >
            <X size={14} className="mr-2" />
            Cancel Edit
          </button>
        </div>
      )}

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
            <label className={`text-[11px] font-bold uppercase tracking-wider ${darkMode ? 'text-gray-400' : 'text-[#00356B]'}`}>Image Upload</label>
            <div className={`flex items-center space-x-3 p-2 rounded-lg ${darkMode ? 'bg-gray-700 border border-gray-600' : 'bg-[#eef5ff] border border-[#00356B]/20'}`}>
              <button
                type="button"
                onClick={() => setUploadMethod('url')}
                className={`py-2 px-4 rounded-md text-[10px] font-bold uppercase tracking-wider transition-all ${
                  uploadMethod === 'url'
                    ? 'text-white shadow-md'
                    : (darkMode ? 'text-gray-400 hover:bg-gray-600' : 'text-[#00356B] hover:bg-white')
                }`}
                style={uploadMethod === 'url' ? { backgroundColor: BRAND.PRIMARY } : {}}
              >
                <Link size={14} className="inline-block mr-1.5" /> Use URL
              </button>
              <button
                type="button"
                onClick={() => setUploadMethod('upload')}
                className={`py-2 px-4 rounded-md text-[10px] font-bold uppercase tracking-wider transition-all ${
                  uploadMethod === 'upload'
                    ? 'text-white shadow-md'
                    : (darkMode ? 'text-gray-400 hover:bg-gray-600' : 'text-[#00356B] hover:bg-white')
                }`}
                style={uploadMethod === 'upload' ? { backgroundColor: BRAND.PRIMARY } : {}}
              >
                <Upload size={14} className="inline-block mr-1.5" /> Upload File
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
                  className={`w-full p-3 pl-10 border rounded-lg text-sm transition-all duration-200 focus:ring-2 focus:border-transparent ${themeClasses.input}`}
                  style={{ borderColor: darkMode ? '#4b5563' : '#e5e7eb' }}
                />
                <Link size={18} className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
              </div>
            ) : (
              <div
                className={`flex justify-center items-center w-full border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors duration-200 ${
                  darkMode ? 'border-gray-600 bg-gray-700' : 'border-gray-300 bg-gray-50'
                }`}
                style={{ borderColor: darkMode ? '#4b5563' : '#d1d5db' }}
                onClick={() => document.getElementById('file-upload').click()}
              >
                <input
                  type="file"
                  id='file-upload'
                  className="hidden"
                  accept="image/*"
                  onChange={(e) => onImageChange(e.target.files[0])}
                />
                <div className={`flex flex-col items-center ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  <Upload size={24} className="mb-2" />
                  <p className="text-sm font-bold">Click or drag & drop to upload</p>
                  <p className="text-xs">PNG, JPG, GIF up to 5MB</p>
                </div>
              </div>
            )}
            {formData.imageUrl && (
              <div className="flex items-center space-x-3 mt-4">
                <img src={formData.imageUrl} alt="Preview" className="w-24 h-auto rounded-lg shadow-md" />
                <div>
                  <p className={`text-sm font-bold ${darkMode ? 'text-gray-300' : 'text-gray-800'}`}>Image Preview</p>
                  <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{formData.image ? formData.image.name : 'Image URL'}</p>
                </div>
              </div>
            )}
          </div>
          <div>
            <label className={`block text-[11px] font-bold uppercase tracking-wider mb-3 ${darkMode ? 'text-gray-400' : 'text-[#00356B]'}`}>
              {isPortfolio ? 'Description' : 'Content'}
            </label>
            <textarea
              name="content"
              value={formData.content}
              onChange={onInputChange}
              rows="8"
              placeholder={`Write the content for your ${isPortfolio ? 'portfolio item' : 'blog post'} here...`}
              className={`w-full p-4 border rounded-lg text-sm transition-all duration-200 focus:ring-2 focus:border-transparent resize-y ${themeClasses.input}`}
              style={{ borderColor: darkMode ? '#4b5563' : '#e5e7eb' }}
            ></textarea>
          </div>
          <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-4 pt-4">
            {isEditing && (
              <button
                type="button"
                onClick={onCancel}
                className={`${BUTTON_STYLES.secondary.base} ${darkMode ? BUTTON_STYLES.secondary.dark : BUTTON_STYLES.secondary.light} flex items-center justify-center`}
              >
                <X size={14} className="mr-2" />
                Cancel
              </button>
            )}
            <button
              type="button"
              onClick={onSave}
              className={`${BUTTON_STYLES.accent.base} ${darkMode ? BUTTON_STYLES.accent.dark : BUTTON_STYLES.accent.light} flex items-center justify-center`}
            >
              <Save size={14} className="mr-2" />
              {isEditing ? `Save Changes` : `Publish ${isPortfolio ? 'Item' : 'Post'}`}
            </button>
          </div>
        </div>
      </div>

      {/* Existing Items Section */}
      <div className="mt-12 mb-8">
        <div className="inline-block mb-4">
          <span className="bg-[#00356B] text-white text-[9px] font-bold px-3 py-1 tracking-tighter uppercase rounded">
            Manage Items
          </span>
        </div>
        <h3 className="text-3xl font-light text-[#00356B] mb-3">Existing <span className="font-bold">{isPortfolio ? 'Portfolio Items' : 'Blog Posts'}</span></h3>
        <div className="h-1 w-24 bg-[#86bc25]"></div>
      </div>

      <div className={`${themeClasses.card} p-6 rounded-xl shadow-lg border backdrop-blur-sm overflow-x-auto`}>
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className={`${darkMode ? 'bg-gray-700' : 'bg-[#eef5ff]'}`}>
            <tr>
              <th className={`px-6 py-4 text-left text-[11px] font-bold uppercase tracking-wider ${darkMode ? 'text-gray-400' : 'text-[#00356B]'}`}>
                {isPortfolio ? 'Item' : 'Post'}
              </th>
              <th className={`px-6 py-4 text-left text-[11px] font-bold uppercase tracking-wider hidden md:table-cell ${darkMode ? 'text-gray-400' : 'text-[#00356B]'}`}>
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
                        className={`p-2 rounded-lg transition-all duration-200 ${darkMode ? 'text-gray-400 hover:bg-gray-600 hover:text-gray-200' : 'text-[#00356B] hover:bg-[#eef5ff]'}`}
                        aria-label="Edit"
                        title="Edit"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => onDelete(item._id, contentType)}
                        className={`p-2 rounded-lg transition-all duration-200 ${darkMode ? 'text-red-400 hover:bg-red-900/30 hover:text-red-300' : 'text-red-600 hover:bg-red-50'}`}
                        aria-label="Delete"
                        title="Delete"
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

const SettingsPanel = ({ settingsData, handleSettingsChange, saveSettings, darkMode, themeClasses }) => (
  <div>
    {/* Header Section */}
    <div className="mb-8">
      <div className="inline-block mb-4">
        <span className="bg-[#00356B] text-white text-[9px] font-bold px-3 py-1 tracking-tighter uppercase rounded">
          Configuration
        </span>
      </div>
      <h2 className="text-3xl md:text-4xl font-light text-[#00356B] mb-3">Site & System <span className="font-bold">Settings</span></h2>
      <div className="h-1 w-24 bg-[#86bc25]"></div>
    </div>
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
            <label className={`text-sm font-bold ${darkMode ? 'text-gray-300' : 'text-gray-700'}`} htmlFor="notifications">
              Enable Notifications
              <p className={`text-xs mt-1 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>Receive alerts for new activity.</p>
            </label>
            <input
              type="checkbox"
              id="notifications"
              name="notifications"
              checked={settingsData.notifications}
              onChange={handleSettingsChange}
              className="h-5 w-10 rounded-full appearance-none transition-colors duration-200 ease-in-out bg-gray-300 dark:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 cursor-pointer"
              style={{ accentColor: BRAND.PRIMARY }}
            />
          </div>
          <div className="flex items-center justify-between">
            <label className={`text-sm font-bold ${darkMode ? 'text-gray-300' : 'text-gray-700'}`} htmlFor="autoSave">
              Enable Auto-Save
              <p className={`text-xs mt-1 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>Automatically save your work every few minutes.</p>
            </label>
            <input
              type="checkbox"
              id="autoSave"
              name="autoSave"
              checked={settingsData.autoSave}
              onChange={handleSettingsChange}
              className="h-5 w-10 rounded-full appearance-none transition-colors duration-200 ease-in-out bg-gray-300 dark:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 cursor-pointer"
              style={{ accentColor: BRAND.PRIMARY }}
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

const InputGroup = ({ label, name, value, onChange, placeholder, type = 'text', darkMode, themeClasses, icon }) => (
  <div>
    <label htmlFor={name} className={`block text-[11px] font-bold uppercase tracking-wider mb-3 ${darkMode ? 'text-gray-400' : 'text-[#00356B]'}`}>
      {label}
    </label>
    <div className="relative">
      <div className={`absolute left-4 top-1/2 transform -translate-y-1/2 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
        {icon}
      </div>
      <input
        type={type}
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`w-full p-3 pl-12 border rounded-lg text-sm transition-all duration-200 focus:ring-2 focus:border-transparent ${themeClasses.input}`}
        style={{ focusRingColor: BRAND.PRIMARY }}
      />
    </div>
  </div>
);

const ProfilePanel = ({ user, setShowProfileModal, darkMode, themeClasses, BRAND, BUTTON_STYLES }) => (
  <div className="bg-white dark:bg-gray-900 min-h-screen">
    <div className="max-w-6xl mx-auto px-4 py-8 md:py-12">
      {/* Header Section */}
      <div className="mb-12">
        <div className="inline-block mb-6">
          <span className="bg-[#00356B] text-white text-[9px] font-bold px-3 py-1 tracking-tighter uppercase rounded">
            Account Management
          </span>
        </div>
        <h2 className="text-4xl md:text-5xl font-light text-[#00356B] mb-3">My <span className="font-bold">Profile</span></h2>
        <div className="h-1 w-24 bg-[#86bc25]"></div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Profile Image and Summary */}
        <div className="lg:col-span-1">
          <div className={`rounded-xl shadow-lg overflow-hidden border transition-all duration-300 hover:shadow-xl ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
            {/* Card Header */}
            <div className="h-32 bg-gradient-to-r from-[#00356B] to-[#002244]" />
            
            {/* Profile Image */}
            <div className="px-6 pb-6">
              <div className="flex justify-center -mt-20 mb-4">
                <div className="relative">
                  {user.profileImage ? (
                    <img
                      src={user.profileImage}
                      alt={user.name}
                      className="w-40 h-40 rounded-full border-4 border-white shadow-lg object-cover"
                    />
                  ) : (
                    <div className="w-40 h-40 rounded-full border-4 border-white shadow-lg flex items-center justify-center text-white text-6xl font-bold bg-[#00356B]">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <button
                    onClick={() => setShowProfileModal(true)}
                    className="absolute bottom-2 right-2 bg-[#D85C2C] text-white p-2.5 rounded-full shadow-lg hover:bg-[#b84520] transition-all duration-200 border-2 border-white"
                    title="Edit profile"
                  >
                    <Edit size={16} />
                  </button>
                </div>
              </div>

              {/* Name and Role */}
              <div className="text-center mt-4">
                <h3 className={`text-2xl font-bold ${darkMode ? 'text-gray-100' : 'text-[#1a1a1a]'}`}>{user.name}</h3>
                <p className="text-[#D85C2C] font-bold text-sm mt-1 uppercase tracking-wider">{user.role}</p>
              </div>

              {/* Stats */}
              <div className="mt-8 space-y-3 pt-6 border-t" style={{ borderColor: darkMode ? '#374151' : '#e5e7eb' }}>
                <div className="flex items-center justify-between text-sm">
                  <span className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Member Since</span>
                  <span className={`font-bold ${darkMode ? 'text-gray-200' : 'text-[#1a1a1a]'}`}>
                    {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                  </span>
                </div>
              </div>

              {/* Edit Button */}
              <button
                onClick={() => setShowProfileModal(true)}
                className="w-full mt-6 bg-[#D85C2C] text-white py-3 rounded-lg font-bold text-sm uppercase tracking-wider hover:bg-[#b84520] transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center gap-2"
              >
                <Edit size={16} />
                Edit Profile
              </button>
            </div>
          </div>
        </div>

        {/* Right Column - Account Information */}
        <div className="lg:col-span-2">
          <div className={`rounded-xl shadow-lg border transition-all duration-300 hover:shadow-xl ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
            <div className="p-8">
              <h3 className={`text-2xl font-bold mb-8 ${darkMode ? 'text-gray-100' : 'text-[#1a1a1a]'}`}>Account Information</h3>

              <div className="space-y-8">
                {/* Full Name */}
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wider text-[#00356B] mb-2">Full Name</p>
                  <p className={`text-lg font-medium ${darkMode ? 'text-gray-200' : 'text-[#1a1a1a]'}`}>{user.name}</p>
                </div>

                {/* Email */}
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wider text-[#00356B] mb-2">Email Address</p>
                  <p className={`text-lg font-medium ${darkMode ? 'text-gray-200' : 'text-[#1a1a1a]'}`}>{user.email}</p>
                </div>

                {/* Phone */}
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wider text-[#00356B] mb-2">Phone Number</p>
                  <p className={`text-lg font-medium ${darkMode ? 'text-gray-200' : 'text-[#1a1a1a]'}`}>
                    {user.phone || 'Not provided'}
                  </p>
                </div>

                {/* Role */}
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wider text-[#00356B] mb-2">Account Type</p>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-[#86bc25]"></div>
                    <p className={`text-lg font-medium ${darkMode ? 'text-gray-200' : 'text-[#1a1a1a]'}`}>{user.role}</p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-10 pt-8 border-t flex gap-4" style={{ borderColor: darkMode ? '#374151' : '#e5e7eb' }}>
                <button
                  onClick={() => setShowProfileModal(true)}
                  className="flex-1 bg-[#00356B] text-white py-3 rounded-lg font-bold text-sm uppercase tracking-wider hover:bg-[#002244] transition-all duration-200 shadow-md hover:shadow-lg"
                >
                  Update Information
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

export default Dashboard;