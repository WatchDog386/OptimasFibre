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
  RefreshCw
} from 'lucide-react';

// ✅ COMPACT BUTTON STYLES — NO ICONS, NATURAL WIDTH
const BUTTON_STYLES = {
  primary: {
    base: 'py-2.5 px-5 rounded-lg font-medium text-sm transition-all duration-200 whitespace-nowrap shadow-sm hover:shadow-md',
    light: 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white border border-transparent',
    dark: 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white border border-transparent',
  },
  secondary: {
    base: 'py-2.5 px-5 rounded-lg font-medium text-sm transition-all duration-200 whitespace-nowrap shadow-sm hover:shadow-md',
    light: 'bg-gray-100 hover:bg-gray-200 text-gray-800 border border-gray-200 hover:border-gray-300',
    dark: 'bg-gray-800 hover:bg-gray-700 text-white border border-gray-700 hover:border-gray-600',
  },
  danger: {
    base: 'py-2.5 px-5 rounded-lg font-medium text-sm transition-all duration-200 whitespace-nowrap shadow-sm hover:shadow-md',
    light: 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white border border-transparent',
    dark: 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white border border-transparent',
  },
  small: {
    base: 'py-1.5 px-3.5 rounded-lg font-medium text-xs transition-all duration-200 whitespace-nowrap shadow-sm hover:shadow',
    light: 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white border border-transparent',
    dark: 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white border border-transparent',
  }
};

// Main Dashboard Component
const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [blogPosts, setBlogPosts] = useState([]);
  const [portfolioItems, setPortfolioItems] = useState([]);
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

  // ✅ DYNAMIC API URL - Will work in any environment
  const getApiBaseUrl = () => {
    // If VITE_API_BASE_URL is set, use it
    if (import.meta.env.VITE_API_BASE_URL) {
      return import.meta.env.VITE_API_BASE_URL;
    }
    
    // In development, use localhost
    if (import.meta.env.DEV) {
      return 'http://localhost:5000';
    }
    
    // In production, construct URL based on current window location
    // This will work when hosted on any domain
    return `${window.location.protocol}//${window.location.hostname}${window.location.port ? ':' + window.location.port : ''}`;
  };

  const API_BASE_URL = getApiBaseUrl();

  // Show notification
  const showNotification = (message, type = 'info') => {
    setNotification({ show: true, message, type });
    setTimeout(() => {
      setNotification({ show: false, message: '', type: 'info' });
    }, 5000);
  };

  // Toggle dark mode
  const toggleDarkMode = () => setDarkMode(!darkMode);

  // Theme classes for dark mode
  const themeClasses = {
    background: darkMode ? 'bg-gray-900' : 'bg-gray-50',
    text: darkMode ? 'text-gray-100' : 'text-gray-800',
    card: darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200',
    input: darkMode 
      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500' 
      : 'bg-white border-gray-300 text-gray-800 placeholder-gray-500 focus:border-blue-500',
    button: BUTTON_STYLES
  };

  // Load data from backend
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError('');
        // Get the token from localStorage
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('Authentication session expired. Please log in again.');
        }
        // Define headers with Authorization for ALL requests
        const headers = {
          'Authorization': `Bearer ${token}`
        };
        // Fetch blog posts
        const blogRes = await fetch(`${API_BASE_URL}/api/blog`, { headers });
        if (!blogRes.ok) {
          throw new Error(`Failed to fetch blog posts: ${blogRes.status} ${blogRes.statusText}`);
        }
        const blogs = await blogRes.json();
        setBlogPosts(blogs);
        // Fetch portfolio items
        const portfolioRes = await fetch(`${API_BASE_URL}/api/portfolio`, { headers });
        if (!portfolioRes.ok) {
          throw new Error(`Failed to fetch portfolio items: ${portfolioRes.status} ${portfolioRes.statusText}`);
        }
        const portfolio = await portfolioRes.json();
        setPortfolioItems(portfolio);
        // Fetch settings
        const settingsRes = await fetch(`${API_BASE_URL}/api/settings`, { headers });
        if (settingsRes.ok) {
          const settings = await settingsRes.json();
          setSettingsData(settings);
        }
      } catch (err) {
        console.error('Error fetching ', err);
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

  // ✅ FIXED: Save settings properly
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

  const handleImageChange = (file) => {
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        showNotification('Please select an image file.', 'error');
        return;
      }
      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        showNotification('Image size should be less than 5MB.', 'error');
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        setFormData({
          ...formData,
          image: file,
          imageUrl: event.target.result
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageUrlChange = (url) => {
    setFormData({
      ...formData,
      imageUrl: url,
      image: null
    });
  };

  // ✅ FIXED: Handle blog vs portfolio field mapping
  const handleSave = async () => {
    try {
      setError('');
      let endpoint;
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication session expired. Please log in again.');
      }
      // ✅ VALIDATE FIELDS
      if (!formData.title?.trim()) {
        throw new Error('Title is required');
      }
      if (!formData.content?.trim()) {
        throw new Error('Content is required');
      }
      if (!formData.category?.trim()) {
        throw new Error('Category is required');
      }
      // ✅ BUILD PAYLOAD — RENAME 'content' to 'description' for portfolio
      const payload = {
        title: formData.title.trim(),
        category: formData.category.trim(),
        imageUrl: formData.imageUrl?.trim() || ''
      };
      if (activeTab === 'blog') {
        payload.content = formData.content.trim();
      } else {
        payload.description = formData.content.trim(); // ← Portfolio expects 'description'
      }
      // ✅ SET ENDPOINT
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
      // ✅ SEND JSON
      const res = await fetch(endpoint, {
        method: isEditing && editingItem && editingItem._id ? 'PUT' : 'POST',
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
      // ✅ UPDATE STATE
      if (activeTab === 'blog') {
        if (isEditing) {
          setBlogPosts(prev => prev.map(item => 
            item._id === editingItem._id ? responseData : item
          ));
        } else {
          setBlogPosts(prev => [...prev, responseData]);
        }
      } else {
        if (isEditing) {
          setPortfolioItems(prev => prev.map(item => 
            item._id === editingItem._id ? responseData : item
          ));
        } else {
          setPortfolioItems(prev => [...prev, responseData]);
        }
      }
      // ✅ RESET FORM
      setFormData({
        title: '',
        content: '',
        category: '',
        image: null,
        imageUrl: ''
      });
      setEditingItem(null);
      setIsEditing(false);
      setUploadMethod('url');
      showNotification(`${activeTab === 'blog' ? 'Blog post' : 'Portfolio item'} ${isEditing ? 'updated' : 'created'} successfully!`, 'success');
    } catch (err) {
      console.error('Error saving item:', err);
      showNotification(err.message, 'error');
    }
  };

  const handleEdit = (item) => {
    setFormData({
      title: item.title,
      content: item.content || item.description, // ← Handles both blog.content and portfolio.description
      category: item.category || 'General',
      image: null,
      imageUrl: item.imageUrl
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
    setFormData({
      title: '',
      content: '',
      category: '',
      image: null,
      imageUrl: ''
    });
    setEditingItem(null);
    setIsEditing(false);
    setUploadMethod('url');
    setError('');
  };

  // Render content based on active tab
  const renderContent = () => {
    if (loading && activeTab === 'dashboard') {
      return (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-t-2 border-blue-600"></div>
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
            darkMode={darkMode} 
            themeClasses={themeClasses}
            onEdit={handleEdit}
            onDelete={handleDelete}
            setIsEditing={setIsEditing}
            setActiveTab={setActiveTab}
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
            darkMode={darkMode} 
            themeClasses={themeClasses}
            onEdit={handleEdit}
            onDelete={handleDelete}
            setIsEditing={setIsEditing}
            setActiveTab={setActiveTab}
          />
        );
    }
  };

  return (
    <div className={`flex h-screen ${themeClasses.background} ${themeClasses.text} transition-colors duration-300`}>
    {/* Notification System */}
    {notification.show && (
      <div className="fixed top-4 right-4 z-50 max-w-md">
        <div className={`rounded-lg shadow-lg transform transition-all duration-300 ${
          notification.type === 'success' ? 'bg-green-500' : 
          notification.type === 'error' ? 'bg-red-500' : 
          notification.type === 'info' ? 'bg-blue-500' : 'bg-gray-500'
        } text-white p-4 flex items-start animate-fade-in`}>
          <div className="flex-shrink-0">
            {notification.type === 'success' && <CheckCircle className="h-5 w-5" />}
            {notification.type === 'error' && <AlertCircle className="h-5 w-5" />}
            {notification.type === 'info' && <Info className="h-5 w-5" />}
          </div>
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
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${darkMode ? 'bg-blue-600' : 'bg-blue-100'}`}>
            <BarChart3 className={`w-5 h-5 ${darkMode ? 'text-white' : 'text-blue-600'}`} />
          </div>
          <h1 className={`text-lg font-bold ml-2 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>Admin Panel</h1>
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
          <div className={`p-1.5 rounded-md mr-2 ${darkMode ? 'bg-green-900/50' : 'bg-green-100'}`}>
            <Plus size={16} className={`text-green-500`} />
          </div>
          New Blog Post
        </button>
        <button 
          onClick={() => { setActiveTab('portfolio'); setIsEditing(true); setSidebarOpen(false); }}
          className={`w-full flex items-center text-left p-3 rounded-lg transition-all duration-200 mt-2 text-sm font-medium ${
            darkMode ? 'hover:bg-gray-700 text-gray-200 hover:shadow' : 'hover:bg-gray-100 text-gray-700 hover:shadow'
          }`}
        >
          <div className={`p-1.5 rounded-md mr-2 ${darkMode ? 'bg-blue-900/50' : 'bg-blue-100'}`}>
            <Plus size={16} className={`text-blue-500`} />
          </div>
          New Portfolio Item
        </button>
      </div>
      {/* Logout Button in Sidebar */}
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
          <h2 className="text-xl md:text-2xl font-bold capitalize bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">{activeTab}</h2>
        </div>
        <div className="flex items-center space-x-3">
          <div className="relative hidden md:block">
            <Search size={18} className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
            <input 
              type="text" 
              placeholder="Search..." 
              className={`pl-10 pr-4 py-2 text-sm border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${themeClasses.input} w-64`}
            />
          </div>
          {/* Theme Toggle Button */}
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
            <div className={`w-9 h-9 rounded-full flex items-center justify-center font-medium text-sm ${
              darkMode ? 'bg-blue-600 text-white shadow-lg' : 'bg-blue-100 text-blue-800 shadow'
            }`}>
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
        ? (darkMode ? 'bg-blue-900/50 text-white shadow-lg border border-blue-800/30' : 'bg-blue-50 text-blue-800 shadow-md border border-blue-200') 
        : (darkMode ? 'text-gray-300 hover:bg-gray-700/70 hover:text-white hover:shadow' : 'text-gray-700 hover:bg-gray-100 hover:shadow hover:border hover:border-gray-200')
    }`}
  >
    <span className={`p-1.5 rounded-md mr-3 ${active ? (darkMode ? 'bg-blue-800/50' : 'bg-blue-100') : (darkMode ? 'bg-gray-700/50' : 'bg-gray-100')}`}>
      {icon}
    </span>
    {text}
  </button>
);

// Dashboard Overview Component
const DashboardOverview = ({ 
  blogPosts, 
  portfolioItems, 
  darkMode, 
  themeClasses,
  onEdit,
  onDelete,
  setIsEditing,
  setActiveTab
}) => (
  <div>
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
      <div>
        <h2 className="text-2xl font-bold mb-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Dashboard Overview</h2>
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
          className={`py-1.5 px-3.5 rounded-lg font-medium text-xs transition-all duration-200 whitespace-nowrap shadow-md hover:shadow-lg ${
            darkMode ? 'bg-gradient-to-r from-yellow-600 to-yellow-700 hover:from-yellow-700 hover:to-yellow-800 text-white' : 'bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white'
          }`}
        >
          <Plus size={16} className="mr-1.5" />
          <span>New Portfolio</span>
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
        color="green"
        darkMode={darkMode}
      />
      <StatCard 
        title="Draft Content" 
        value="0" 
        change="0 drafts" 
        icon={<Edit size={20} />}
        color="yellow"
        darkMode={darkMode}
      />
      <StatCard 
        title="Total Views" 
        value="0" 
        change="No data yet" 
        icon={<BarChart3 size={20} />}
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
      />
      <RecentList 
        title="Recent Portfolio Items" 
        items={portfolioItems.slice(0, 5)} 
        viewAllLink="/admin/portfolio"
        darkMode={darkMode}
        themeClasses={themeClasses}
        onEdit={onEdit}
        onDelete={onDelete}
      />
    </div>
  </div>
);

// Stat Card Component
const StatCard = ({ title, value, change, icon, color, darkMode }) => {
  const colorClasses = {
    blue: darkMode ? 'bg-blue-900/20 border-blue-800/30' : 'bg-blue-50 border-blue-200',
    green: darkMode ? 'bg-green-900/20 border-green-800/30' : 'bg-green-50 border-green-200',
    yellow: darkMode ? 'bg-yellow-900/20 border-yellow-800/30' : 'bg-yellow-50 border-yellow-200',
    purple: darkMode ? 'bg-purple-900/20 border-purple-800/30' : 'bg-purple-50 border-purple-200'
  };
  const iconColor = {
    blue: 'text-blue-500',
    green: 'text-green-500',
    yellow: 'text-yellow-500',
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
const RecentList = ({ title, items, viewAllLink, darkMode, themeClasses, onEdit, onDelete }) => (
  <div className={`${themeClasses.card} p-5 rounded-xl shadow-sm border backdrop-blur-sm transition-all duration-300 hover:shadow-lg`}>
    <div className="flex justify-between items-center mb-4">
      <h3 className={`text-lg font-semibold ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>{title}</h3>
      <a href={viewAllLink} className={`text-sm font-medium hover:underline transition-colors ${
        darkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-800'
      }`}>
        View All
      </a>
    </div>
    <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
      {items.length === 0 ? (
        <div className={`text-center py-8 rounded-lg ${darkMode ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
          <div className={`inline-flex p-3 rounded-full mb-3 ${darkMode ? 'bg-gray-600' : 'bg-gray-200'}`}>
            <FileText className={`w-6 h-6 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
          </div>
          <p className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>No items yet</p>
          <p className={`text-xs mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Create your first item to get started!</p>
        </div>
      ) : (
        items.map((item) => (
          <div key={item._id} className={`flex items-center p-3 rounded-lg border transition-all duration-200 ${
            darkMode ? 'border-gray-700 hover:bg-gray-700/50 hover:shadow' : 'border-gray-100 hover:bg-gray-50 hover:shadow'
          }`}>
            <div className="flex-shrink-0">
              <img 
                src={item.imageUrl || '/placeholder-image.jpg'} 
                alt={item.title} 
                className="w-12 h-12 object-cover rounded-lg border border-gray-300 shadow-sm" 
                onError={(e) => { e.target.src = '/placeholder-image.jpg'; e.target.onerror = null; }} 
              />
            </div>
            <div className="ml-4 flex-grow min-w-0">
              <h4 className={`font-medium text-sm ${darkMode ? 'text-gray-100' : 'text-gray-900'} truncate`}>{item.title}</h4>
              <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                {item.category || 'General'} • {item.publishedAt ? new Date(item.publishedAt).toLocaleDateString() : item.uploadedAt ? new Date(item.uploadedAt).toLocaleDateString() : 'Date not available'}
              </p>
            </div>
            <div className="flex-shrink-0 ml-3 flex space-x-1">
              <button 
                onClick={() => onEdit(item)}
                className={`p-2 rounded-lg text-blue-600 hover:bg-blue-100 transition-colors ${darkMode ? 'text-blue-400 hover:bg-blue-900/30' : ''}`}
                title="Edit"
              >
                <Edit size={16} />
              </button>
              <button 
                onClick={() => onDelete(item._id, title.toLowerCase().includes('blog') ? 'blog' : 'portfolio')}
                className={`p-2 rounded-lg text-red-600 hover:bg-red-100 transition-colors ${darkMode ? 'text-red-400 hover:bg-red-900/30' : ''}`}
                title="Delete"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  </div>
);

// Content Manager Component (for both Blog and Portfolio)
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
  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold mb-2">{isEditing ? 'Edit' : 'Manage'} {title}</h2>
          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            {isEditing ? `Edit your ${title.slice(0, -1).toLowerCase()}` : `Manage all your ${title.toLowerCase()}`}
          </p>
        </div>
        {!isEditing && (
          <button 
            onClick={() => onEdit({})}
            className={`${BUTTON_STYLES.small.base} ${BUTTON_STYLES.small.light} flex items-center shadow-md hover:shadow-lg mt-4 md:mt-0`}
          >
            <Plus size={16} className="mr-1.5" />
            Add New {title.slice(0, -1)}
          </button>
        )}
      </div>
      {error && (
        <div className={`p-4 mb-6 rounded-xl ${darkMode ? 'bg-red-900/20 border border-red-800/30' : 'bg-red-50 border border-red-200'} backdrop-blur-sm animate-fade-in`}>
          <div className="flex items-start">
            <AlertCircle className={`w-5 h-5 mr-3 flex-shrink-0 ${darkMode ? 'text-red-400' : 'text-red-500'} mt-0.5`} />
            <div>
              <h3 className={`text-sm font-medium ${darkMode ? 'text-red-200' : 'text-red-800'}`}>Error</h3>
              <p className={`mt-1 text-sm ${darkMode ? 'text-red-300' : 'text-red-700'}`}>{error}</p>
            </div>
          </div>
        </div>
      )}
      {isEditing ? (
        <div className={`${themeClasses.card} p-6 rounded-xl shadow-sm mb-6 border backdrop-blur-sm`}>
          <h3 className={`text-xl font-semibold mb-5 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>
            {formData.id ? 'Edit' : 'Create New'} {title.slice(0, -1)}
          </h3>
          <div className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Title *</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title ?? ''}
                  onChange={onInputChange}
                  className={`w-full p-3 text-sm border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${themeClasses.input}`}
                  placeholder="Enter title"
                  required
                />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Category *</label>
                <input
                  type="text"
                  name="category"
                  value={formData.category ?? ''}
                  onChange={onInputChange}
                  className={`w-full p-3 text-sm border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${themeClasses.input}`}
                  placeholder="Enter category"
                  required
                />
              </div>
            </div>
            <div>
              <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                {contentType === 'portfolio' ? 'Description *' : 'Content *'}
              </label>
              <textarea
                name="content"
                value={formData.content ?? ''}
                onChange={onInputChange}
                rows="6"
                className={`w-full p-3 text-sm border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${themeClasses.input}`}
                placeholder={contentType === 'portfolio' ? 'Enter description for your portfolio item' : 'Enter content for your blog post'}
                required
              ></textarea>
            </div>
            <div>
              <label className={`block text-sm font-medium mb-3 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Featured Image</label>
              {/* Upload Method Selector */}
              <div className="flex flex-wrap gap-2 mb-4">
                <button
                  type="button"
                  onClick={() => setUploadMethod('url')}
                  className={`px-4 py-2 text-sm rounded-xl transition-all duration-200 ${
                    uploadMethod === 'url' 
                      ? `${BUTTON_STYLES.primary.light} ${BUTTON_STYLES.primary.base}` 
                      : `${BUTTON_STYLES.secondary.light} ${BUTTON_STYLES.secondary.base}`
                  }`}
                >
                  <Link size={14} className="mr-2" />
                  Image URL
                </button>
                <button
                  type="button"
                  onClick={() => setUploadMethod('upload')}
                  className={`px-4 py-2 text-sm rounded-xl transition-all duration-200 ${
                    uploadMethod === 'upload' 
                      ? `${BUTTON_STYLES.primary.light} ${BUTTON_STYLES.primary.base}` 
                      : `${BUTTON_STYLES.secondary.light} ${BUTTON_STYLES.secondary.base}`
                  }`}
                >
                  <Upload size={14} className="mr-2" />
                  Upload File
                </button>
              </div>
              {/* URL Input */}
              {uploadMethod === 'url' && (
                <div className="space-y-2">
                  <input
                    type="url"
                    value={formData.imageUrl ?? ''}
                    onChange={(e) => onImageUrlChange(e.target.value)}
                    className={`w-full p-3 text-sm border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${themeClasses.input}`}
                    placeholder="https://example.com/image.jpg"
                  />
                  <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Enter a direct image URL (JPEG, PNG, GIF, or WEBP)</p>
                </div>
              )}
              {/* File Upload */}
              {uploadMethod === 'upload' && (
                <div className="space-y-2">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => onImageChange(e.target.files[0])}
                    className={`w-full p-3 text-sm border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${themeClasses.input}`}
                  />
                  <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Max file size: 5MB • Supported formats: JPEG, PNG, GIF, WEBP</p>
                </div>
              )}
              {/* Image Preview */}
              {(formData.imageUrl || formData.image) && (
                <div className={`mt-4 p-4 rounded-xl border ${darkMode ? 'bg-gray-700/50 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
                  <h4 className={`text-sm font-medium mb-3 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Image Preview</h4>
                  <div className="relative group overflow-hidden rounded-lg border border-gray-300">
                    <img 
                      src={formData.imageUrl || URL.createObjectURL(formData.image)} 
                      alt="Preview" 
                      className="w-full h-auto max-h-64 object-cover transition-transform duration-300 group-hover:scale-105"
                      onError={(e) => { e.target.style.display = 'none'; }} 
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center">
                      <Eye className="text-white" size={24} />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
          <div className="flex flex-col md:flex-row justify-end space-y-3 md:space-y-0 md:space-x-3 pt-6 border-t border-gray-200 mt-6">
            <button 
              onClick={onCancel}
              className={`px-5 py-2.5 text-sm rounded-xl transition-all duration-200 ${
                darkMode ? 'border border-gray-600 text-gray-300 hover:bg-gray-700 hover:shadow' : 'border border-gray-300 text-gray-700 hover:bg-gray-100 hover:shadow'
              }`}
            >
              Cancel
            </button>
            <button 
              onClick={onSave}
              disabled={!formData.title || !formData.content || !formData.category}
              className={`px-5 py-2.5 text-sm rounded-xl transition-all duration-200 ${
                !formData.title || !formData.content || !formData.category 
                  ? 'bg-gray-400 cursor-not-allowed opacity-70' 
                  : `${BUTTON_STYLES.primary.light} ${BUTTON_STYLES.primary.base} hover:shadow-lg transform hover:-translate-y-0.5`
              }`}
            >
              <Save size={16} className="mr-1.5 inline" />
              {formData.id ? 'Update' : 'Save'} {title.slice(0, -1)}
            </button>
          </div>
        </div>
      ) : null}
      <div className={`${themeClasses.card} rounded-xl shadow-sm overflow-hidden border backdrop-blur-sm`}>
        {items.length === 0 ? (
          <div className={`p-12 text-center ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            <div className={`inline-flex p-4 rounded-full mb-4 ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
              <FileText className={`w-8 h-8 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
            </div>
            <h3 className={`text-lg font-medium mb-2 ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>No {title.toLowerCase()} yet</h3>
            <p className="mb-6">Get started by creating your first content item.</p>
            <button 
              onClick={() => onEdit({})}
              className={`${BUTTON_STYLES.small.base} ${BUTTON_STYLES.small.light} flex items-center mx-auto`}
            >
              <Plus size={16} className="mr-1.5" />
              Create New {title.slice(0, -1)}
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            {/* Mobile: Card Grid | Desktop: Table */}
            <div className="md:hidden space-y-4 p-4">
              {items.map((item, index) => (
                <div key={item._id} className={`p-4 rounded-xl border transition-all duration-200 ${
                  darkMode ? 'bg-gray-700/50 border-gray-600 hover:bg-gray-600/70 hover:shadow-lg' : 'bg-white border-gray-200 hover:bg-gray-50 hover:shadow-lg'
                }`}>
                  <div className="flex items-start">
                    <img 
                      src={item.imageUrl || '/placeholder-image.jpg'} 
                      alt={item.title} 
                      className="w-16 h-16 object-cover rounded-lg border border-gray-300 shadow-sm"
                      onError={(e) => { e.target.src = '/placeholder-image.jpg'; e.target.onerror = null; }} 
                    />
                    <div className="ml-4 flex-grow">
                      <div className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'} truncate`}>{item.title}</div>
                      <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'} mt-1`}>
                        {item.category || 'General'} • {item.publishedAt ? new Date(item.publishedAt).toLocaleDateString() : 
                         item.uploadedAt ? new Date(item.uploadedAt).toLocaleDateString() : 'Date not available'}
                      </div>
                    </div>
                    <div className="flex space-x-2 ml-3">
                      <button 
                        onClick={() => onEdit(item)}
                        className={`p-2 rounded-lg text-blue-600 hover:bg-blue-100 transition-colors ${darkMode ? 'text-blue-400 hover:bg-blue-900/30' : ''}`}
                        title="Edit"
                      >
                        <Edit size={18} />
                      </button>
                      <button 
                        onClick={() => onDelete(item._id, title.toLowerCase().includes('blog') ? 'blog' : 'portfolio')}
                        className={`p-2 rounded-lg text-red-600 hover:bg-red-100 transition-colors ${darkMode ? 'text-red-400 hover:bg-red-900/30' : ''}`}
                        title="Delete"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {/* Desktop Table */}
            <div className="hidden md:block">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className={darkMode ? 'bg-gray-700/50' : 'bg-gray-50'}>
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Image</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Title</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Category</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Date</th>
                      <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">Actions</th>
                    </tr>
                  </thead>
                  <tbody className={`divide-y ${darkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
                    {items.map((item, index) => (
                      <tr key={item._id} className={`${darkMode ? 'hover:bg-gray-700/50' : 'hover:bg-gray-50'} transition-colors duration-150`}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <img 
                            src={item.imageUrl || '/placeholder-image.jpg'} 
                            alt={item.title} 
                            className="w-14 h-14 object-cover rounded-lg border border-gray-200 shadow-sm"
                            onError={(e) => { e.target.src = '/placeholder-image.jpg'; e.target.onerror = null; }} 
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>{item.title}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>{item.category || 'General'}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                            {item.publishedAt ? new Date(item.publishedAt).toLocaleDateString() : 
                             item.uploadedAt ? new Date(item.uploadedAt).toLocaleDateString() : 'Date not available'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end space-x-2">
                            <button 
                              onClick={() => onEdit(item)}
                              className={`p-2 rounded-lg text-blue-600 hover:bg-blue-100 transition-colors ${darkMode ? 'text-blue-400 hover:bg-blue-900/30' : ''}`}
                              title="Edit"
                            >
                              <Edit size={18} />
                            </button>
                            <button 
                              onClick={() => onDelete(item._id, title.toLowerCase().includes('blog') ? 'blog' : 'portfolio')}
                              className={`p-2 rounded-lg text-red-600 hover:bg-red-100 transition-colors ${darkMode ? 'text-red-400 hover:bg-red-900/30' : ''}`}
                              title="Delete"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Settings Panel Component
const SettingsPanel = ({ settingsData, handleSettingsChange, saveSettings, darkMode, themeClasses }) => {
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold">System Settings</h2>
          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Configure your admin panel preferences and site settings</p>
        </div>
        <button 
          onClick={saveSettings}
          className={`${BUTTON_STYLES.small.base} ${BUTTON_STYLES.small.light} flex items-center shadow-md hover:shadow-lg`}
        >
          <Save size={16} className="mr-1.5" />
          Save Changes
        </button>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Site Settings Card */}
        <div className={`${themeClasses.card} p-6 rounded-xl shadow-sm border backdrop-blur-sm`}>
          <h3 className={`text-lg font-semibold mb-4 flex items-center ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>
            <Globe size={20} className="mr-2" />
            Site Configuration
          </h3>
          <div className="space-y-5">
            <div>
              <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Site Title</label>
              <input
                type="text"
                name="siteTitle"
                value={settingsData.siteTitle}
                onChange={handleSettingsChange}
                className={`w-full p-3 text-sm border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${themeClasses.input}`}
                placeholder="Your Site Title"
              />
            </div>
            <div>
              <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Admin Email</label>
              <input
                type="email"
                name="adminEmail"
                value={settingsData.adminEmail}
                onChange={handleSettingsChange}
                className={`w-full p-3 text-sm border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${themeClasses.input}`}
                placeholder="admin@yoursite.com"
              />
            </div>
            <div>
              <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Default Language</label>
              <select
                name="language"
                value={settingsData.language}
                onChange={handleSettingsChange}
                className={`w-full p-3 text-sm border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${themeClasses.input}`}
              >
                <option value="en">English</option>
                <option value="es">Spanish</option>
                <option value="fr">French</option>
                <option value="de">German</option>
              </select>
            </div>
          </div>
        </div>
        {/* Preferences Card */}
        <div className={`${themeClasses.card} p-6 rounded-xl shadow-sm border backdrop-blur-sm`}>
          <h3 className={`text-lg font-semibold mb-4 flex items-center ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>
            <Settings size={20} className="mr-2" />
            User Preferences
          </h3>
          <div className="space-y-5">
            <div className={`p-4 rounded-xl border ${darkMode ? 'border-gray-700 bg-gray-700/30' : 'border-gray-200 bg-gray-50'}`}>
              <div className="flex items-center justify-between">
                <div>
                  <h4 className={`font-medium text-sm ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>Email Notifications</h4>
                  <p className={`text-xs mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Receive notifications about system updates and important events</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    name="notifications"
                    checked={settingsData.notifications}
                    onChange={handleSettingsChange}
                    className="sr-only peer"
                  />
                  <div className={`w-11 h-6 rounded-full peer ${darkMode ? 'bg-gray-700 peer-checked:bg-blue-600' : 'bg-gray-300 peer-checked:bg-blue-600'} peer-checked:after:translate-x-full peer-after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all`}></div>
                </label>
              </div>
            </div>
            <div className={`p-4 rounded-xl border ${darkMode ? 'border-gray-700 bg-gray-700/30' : 'border-gray-200 bg-gray-50'}`}>
              <div className="flex items-center justify-between">
                <div>
                  <h4 className={`font-medium text-sm ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>Auto Save</h4>
                  <p className={`text-xs mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Automatically save your changes as you work</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    name="autoSave"
                    checked={settingsData.autoSave}
                    onChange={handleSettingsChange}
                    className="sr-only peer"
                  />
                  <div className={`w-11 h-6 rounded-full peer ${darkMode ? 'bg-gray-700 peer-checked:bg-blue-600' : 'bg-gray-300 peer-checked:bg-blue-600'} peer-checked:after:translate-x-full peer-after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all`}></div>
                </label>
              </div>
            </div>
          </div>
        </div>
        {/* Account Settings Card */}
        <div className={`${themeClasses.card} p-6 rounded-xl shadow-sm border backdrop-blur-sm`}>
          <h3 className={`text-lg font-semibold mb-4 flex items-center ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>
            <User size={20} className="mr-2" />
            Account Security
          </h3>
          <div className="space-y-5">
            <div>
              <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Current Password</label>
              <input
                type="password"
                className={`w-full p-3 text-sm border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${themeClasses.input}`}
                placeholder="••••••••"
              />
            </div>
            <div>
              <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>New Password</label>
              <input
                type="password"
                className={`w-full p-3 text-sm border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${themeClasses.input}`}
                placeholder="••••••••"
              />
            </div>
            <div>
              <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Confirm New Password</label>
              <input
                type="password"
                className={`w-full p-3 text-sm border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${themeClasses.input}`}
                placeholder="••••••••"
              />
            </div>
            <button className={`${BUTTON_STYLES.small.base} ${BUTTON_STYLES.small.light} w-full mt-2`}>
              Update Password
            </button>
          </div>
        </div>
        {/* System Info Card */}
        <div className={`${themeClasses.card} p-6 rounded-xl shadow-sm border backdrop-blur-sm`}>
          <h3 className={`text-lg font-semibold mb-4 flex items-center ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>
            <BarChart3 size={20} className="mr-2" />
            System Information
          </h3>
          <div className="space-y-4">
            <div className="space-y-3">
              <div className="flex justify-between items-center py-2 border-b border-gray-200 last:border-0">
                <span className={darkMode ? 'text-gray-400 text-sm' : 'text-gray-600 text-sm'}>Platform Version</span>
                <span className={darkMode ? 'text-gray-200 text-sm font-medium' : 'text-gray-800 text-sm font-medium'}>v2.4.1</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-200 last:border-0">
                <span className={darkMode ? 'text-gray-400 text-sm' : 'text-gray-600 text-sm'}>Last Update</span>
                <span className={darkMode ? 'text-gray-200 text-sm font-medium' : 'text-gray-800 text-sm font-medium'}>October 15, 2023</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-200 last:border-0">
                <span className={darkMode ? 'text-gray-400 text-sm' : 'text-gray-600 text-sm'}>Database</span>
                <span className={darkMode ? 'text-gray-200 text-sm font-medium' : 'text-gray-800 text-sm font-medium'}>MongoDB 6.0</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-200 last:border-0">
                <span className={darkMode ? 'text-gray-400 text-sm' : 'text-gray-600 text-sm'}>Server Status</span>
                <span className="text-green-500 text-sm font-medium flex items-center">
                  <div className="w-2 h-2 rounded-full bg-green-500 mr-2"></div>
                  Online
                </span>
              </div>
            </div>
            <div className="pt-4 mt-4 border-t border-gray-200">
              <button className={`${BUTTON_STYLES.small.base} ${darkMode ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-800'} w-full`}>
                Check for Updates
              </button>
            </div>
            <div className="pt-4 mt-4 border-t border-gray-200">
              <h4 className={`font-medium mb-2 text-sm ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>API Configuration</h4>
              <div className={`p-3 rounded-lg text-xs font-mono ${darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-800'} break-all`}>
                {API_BASE_URL}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;