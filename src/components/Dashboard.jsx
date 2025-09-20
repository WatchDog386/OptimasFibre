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
  Globe
} from 'lucide-react';

// ✅ COMPACT BUTTON STYLES — NO ICONS, NATURAL WIDTH
const BUTTON_STYLES = {
  primary: {
    base: 'py-2 px-4 rounded-lg font-medium text-sm transition-colors whitespace-nowrap',
    light: 'bg-blue-600 hover:bg-blue-700 text-white',
    dark: 'bg-blue-600 hover:bg-blue-700 text-white',
  },
  secondary: {
    base: 'py-2 px-4 rounded-lg font-medium text-sm transition-colors whitespace-nowrap',
    light: 'bg-gray-200 hover:bg-gray-300 text-gray-800',
    dark: 'bg-gray-700 hover:bg-gray-600 text-white',
  },
  danger: {
    base: 'py-2 px-4 rounded-lg font-medium text-sm transition-colors whitespace-nowrap',
    light: 'bg-red-600 hover:bg-red-700 text-white',
    dark: 'bg-red-600 hover:bg-red-700 text-white',
  },
  small: {
    base: 'py-1.5 px-3 rounded-lg font-medium text-xs transition-colors whitespace-nowrap',
    light: 'bg-blue-600 hover:bg-blue-700 text-white',
    dark: 'bg-blue-600 hover:bg-blue-700 text-white',
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

  // Use localhost:5000 for API calls
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

  // Toggle dark mode
  const toggleDarkMode = () => setDarkMode(!darkMode);

  // Theme classes for dark mode
  const themeClasses = {
    background: darkMode ? 'bg-gray-900' : 'bg-gray-50',
    text: darkMode ? 'text-white' : 'text-gray-800',
    card: darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200',
    input: darkMode 
      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
      : 'bg-white border-gray-300 text-gray-800 placeholder-gray-500',
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
          throw new Error('No authentication token found. Please log in again.');
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
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err.message);
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
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/admin/login';
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
        throw new Error('No authentication token found.');
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
        alert('Settings saved successfully!');
      } else {
        throw new Error(responseData.message || 'Failed to save settings');
      }
    } catch (err) {
      console.error('Error saving settings:', err);
      alert(`Error: ${err.message}`);
    }
  };

  const handleImageChange = (file) => {
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('Please select an image file.');
        return;
      }
      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        setError('Image size should be less than 5MB.');
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        setFormData({
          ...formData,
          image: file,
          imageUrl: event.target.result
        });
        setError('');
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

  const handleSave = async () => {
    try {
      setError('');
      let endpoint;
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found. Please log in again.');
      }
      // Create FormData for file uploads
      const formDataToSend = new FormData();
      formDataToSend.append('title', formData.title.trim());
      formDataToSend.append('content', formData.content.trim());
      formDataToSend.append('category', formData.category.trim());
      if (formData.image) {
        formDataToSend.append('image', formData.image);
      } else if (formData.imageUrl) {
        formDataToSend.append('imageUrl', formData.imageUrl.trim());
      }

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

      const res = await fetch(endpoint, {
        method: isEditing && editingItem && editingItem._id ? 'PUT' : 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formDataToSend
      });

      const responseData = await res.json();
      if (res.ok) {
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
        // Reset form
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
      } else {
        throw new Error(responseData.message || `Server error: ${res.status}`);
      }
    } catch (err) {
      console.error('Error saving item:', err);
      setError(err.message);
    }
  };

  const handleEdit = (item) => {
    setFormData({
      title: item.title,
      content: item.content || item.description,
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
    if (!window.confirm('Are you sure you want to delete this item?')) {
      return;
    }
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found.');
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
      } else {
        throw new Error(responseData.message || 'Failed to delete');
      }
    } catch (err) {
      console.error('Error deleting item:', err);
      setError(err.message);
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
      return <div className="flex justify-center items-center h-64">
        <div className={`animate-spin rounded-full h-12 w-12 border-b-2 ${darkMode ? 'border-blue-400' : 'border-blue-600'}`}></div>
      </div>;
    }

    if (error && activeTab === 'dashboard') {
      return (
        <div className={`p-4 mb-4 rounded-lg ${darkMode ? 'bg-red-900/30 border-red-700' : 'bg-red-50 border-red-200'} border`}>
          <p className={darkMode ? 'text-red-200' : 'text-red-800'}>{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className={`mt-2 ${BUTTON_STYLES.small.base} ${BUTTON_STYLES.small.light}`}
          >
            Try Again
          </button>
        </div>
      );
    }

    switch (activeTab) {
      case 'dashboard':
        return <DashboardOverview blogPosts={blogPosts} portfolioItems={portfolioItems} darkMode={darkMode} themeClasses={themeClasses} />;
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
        return <DashboardOverview blogPosts={blogPosts} portfolioItems={portfolioItems} darkMode={darkMode} themeClasses={themeClasses} />;
    }
  };

  return (
    <div className={`flex h-screen ${themeClasses.background} ${themeClasses.text}`}>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      {/* Sidebar */}
      <div className={`${themeClasses.card} w-64 flex-shrink-0 shadow-lg fixed md:relative z-30 h-full transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 transition-transform duration-300 border-r ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
        <div className="p-4 border-b border-gray-200 flex justify-between items-center">
          <h1 className={`text-lg font-bold ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>Admin Panel</h1>
          <button 
            onClick={() => setSidebarOpen(false)}
            className="md:hidden"
          >
            <X size={20} className={themeClasses.text} />
          </button>
        </div>
        <nav className="mt-4 px-3 space-y-1">
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
            icon={<Settings size={16} />} 
            text="Settings" 
            active={activeTab === 'settings'} 
            onClick={() => { setActiveTab('settings'); setSidebarOpen(false); }} 
            darkMode={darkMode}
          />
        </nav>
        <div className="mt-6 px-3 pb-4">
          <h3 className={`text-xs font-semibold uppercase tracking-wider mb-2 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Quick Actions</h3>
          <button 
            onClick={() => { setActiveTab('blog'); setIsEditing(true); setSidebarOpen(false); }}
            className={`w-full flex items-center text-left p-2 rounded-lg transition-colors text-xs ${darkMode ? 'hover:bg-gray-700 text-gray-200' : 'hover:bg-gray-100 text-gray-700'}`}
          >
            <Plus size={14} className="mr-2 text-green-500" />
            New Blog
          </button>
          <button 
            onClick={() => { setActiveTab('portfolio'); setIsEditing(true); setSidebarOpen(false); }}
            className={`w-full flex items-center text-left p-2 rounded-lg transition-colors mt-1 text-xs ${darkMode ? 'hover:bg-gray-700 text-gray-200' : 'hover:bg-gray-100 text-gray-700'}`}
          >
            <Plus size={14} className="mr-2 text-blue-500" />
            New Portfolio
          </button>
        </div>
        {/* Logout Button in Sidebar */}
        <div className="mt-auto px-3 pb-4">
          <button
            onClick={handleLogout}
            className={`w-full flex items-center justify-center p-2 rounded-lg transition-colors text-sm ${darkMode ? 'bg-red-700 hover:bg-red-600 text-white' : 'bg-red-600 hover:bg-red-700 text-white'}`}
          >
            <LogOut size={16} className="mr-2" />
            Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <header className={`${themeClasses.card} shadow-sm p-3 md:p-4 flex items-center justify-between border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <div className="flex items-center">
            <button onClick={() => setSidebarOpen(true)} className="md:hidden mr-3">
              <Menu size={20} className={themeClasses.text} />
            </button>
            <h2 className="text-lg md:text-xl font-semibold capitalize">{activeTab}</h2>
          </div>
          <div className="flex items-center space-y-2 md:space-y-0 md:space-x-2">
            <div className="relative hidden md:block">
              <Search size={16} className={`absolute left-2.5 top-2 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
              <input 
                type="text" 
                placeholder="Search..." 
                className={`pl-8 pr-3 py-1.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${themeClasses.input}`}
              />
            </div>
            {/* Theme Toggle Button */}
            <button
              onClick={toggleDarkMode}
              className={`p-1.5 rounded-full ${darkMode ? 'bg-gray-700 hover:bg-gray-600 text-yellow-300' : 'bg-gray-200 hover:bg-gray-300 text-gray-700'}`}
              aria-label="Toggle theme"
            >
              {darkMode ? <Sun size={16} /> : <Moon size={16} />}
            </button>
            <div className="flex items-center space-x-2">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center font-medium text-xs ${darkMode ? 'bg-blue-600 text-white' : 'bg-blue-100 text-blue-800'}`}>
                <User size={12} />
              </div>
              <span className="text-xs font-medium hidden md:block">Admin</span>
            </div>
          </div>
        </header>
        <main className="p-3 md:p-4">
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
    className={`flex items-center w-full p-2 text-xs rounded-lg transition-colors ${
      active 
        ? (darkMode ? 'bg-blue-900 text-white' : 'bg-blue-100 text-blue-800') 
        : (darkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100')
    }`}
  >
    <span className="mr-2">{icon}</span>
    {text}
  </button>
);

// Dashboard Overview Component
const DashboardOverview = ({ blogPosts, portfolioItems, darkMode, themeClasses }) => (
  <div>
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
      <h2 className="text-xl font-bold mb-3">Dashboard Overview</h2>
      <div className="flex space-x-2">
        <button 
          onClick={() => { setIsEditing(true); setActiveTab('blog'); }}
          className={`${BUTTON_STYLES.small.base} ${BUTTON_STYLES.small.light} flex items-center`}
        >
          <Plus size={14} className="mr-1" />
          <span className="hidden md:inline">Blog</span>
          <span className="md:hidden">New</span>
        </button>
        <button 
          onClick={() => { setIsEditing(true); setActiveTab('portfolio'); }}
          className={`py-1.5 px-3 rounded-lg font-medium text-xs transition-colors whitespace-nowrap ${
            darkMode ? 'bg-yellow-600 hover:bg-yellow-700 text-white' : 'bg-yellow-500 hover:bg-yellow-600 text-white'
          }`}
        >
          <Plus size={14} className="mr-1" />
          <span className="hidden md:inline">Portfolio</span>
          <span className="md:hidden">New</span>
        </button>
      </div>
    </div>
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
      <StatCard 
        title="Blog Posts" 
        value={blogPosts.length} 
        change={`${blogPosts.length} published`} 
        icon={<FileText size={16} />}
        color="blue"
        darkMode={darkMode}
      />
      <StatCard 
        title="Portfolio Items" 
        value={portfolioItems.length} 
        change={`${portfolioItems.length} published`} 
        icon={<Image size={16} />}
        color="green"
        darkMode={darkMode}
      />
      <StatCard 
        title="Draft Content" 
        value="0" 
        change="0 drafts" 
        icon={<Edit size={16} />}
        color="yellow"
        darkMode={darkMode}
      />
      <StatCard 
        title="Total Views" 
        value="0" 
        change="No data yet" 
        icon={<BarChart3 size={16} />}
        color="purple"
        darkMode={darkMode}
      />
    </div>
    <div className="grid grid-cols-1 gap-3">
      <RecentList 
        title="Recent Blog Posts" 
        items={blogPosts.slice(0, 3)} 
        viewAllLink="/admin/blog"
        darkMode={darkMode}
        themeClasses={themeClasses}
      />
      <RecentList 
        title="Recent Portfolio" 
        items={portfolioItems.slice(0, 3)} 
        viewAllLink="/admin/portfolio"
        darkMode={darkMode}
        themeClasses={themeClasses}
      />
    </div>
  </div>
);

// Stat Card Component
const StatCard = ({ title, value, change, icon, color, darkMode }) => {
  const colorClasses = {
    blue: darkMode ? 'bg-blue-900/30 border-blue-700' : 'bg-blue-50 border-blue-200',
    green: darkMode ? 'bg-green-900/30 border-green-700' : 'bg-green-50 border-green-200',
    yellow: darkMode ? 'bg-yellow-900/30 border-yellow-700' : 'bg-yellow-50 border-yellow-200',
    purple: darkMode ? 'bg-purple-900/30 border-purple-700' : 'bg-purple-50 border-purple-200'
  };
  const iconColor = {
    blue: 'text-blue-500',
    green: 'text-green-500',
    yellow: 'text-yellow-500',
    purple: 'text-purple-500'
  };
  const textColor = darkMode ? 'text-gray-200' : 'text-gray-900';
  const subTextColor = darkMode ? 'text-gray-400' : 'text-gray-600';

  return (
    <div className={`${colorClasses[color]} p-3 rounded-lg border-l-4 ${darkMode ? `border-${color}-500` : `border-${color}-400`}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className={`text-xs font-medium ${subTextColor}`}>{title}</p>
          <p className={`text-xl font-bold mt-1 ${textColor}`}>{value}</p>
          <p className={`text-xs mt-1 ${subTextColor}`}>{change}</p>
        </div>
        <div className={`p-2 rounded-lg ${iconColor[color]}`}>
          {icon}
        </div>
      </div>
    </div>
  );
};

// Recent List Component
const RecentList = ({ title, items, viewAllLink, darkMode, themeClasses }) => (
  <div className={`${themeClasses.card} p-3 rounded-lg shadow-sm border`}>
    <div className="flex justify-between items-center mb-3">
      <h3 className={`text-base font-semibold ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>{title}</h3>
      <a href={viewAllLink} className={`text-xs font-medium hover:underline ${darkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-800'}`}>
        View all
      </a>
    </div>
    <div className="space-y-2">
      {items.length === 0 ? (
        <p className={`text-center py-3 text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>No items yet</p>
      ) : (
        items.map((item) => (
          <div key={item._id} className={`flex items-start p-2 border-b ${darkMode ? 'border-gray-700 hover:bg-gray-700' : 'border-gray-100 hover:bg-gray-50'} transition-colors last:border-0`}>
            <img 
              src={item.imageUrl || '/placeholder-image.jpg'} 
              alt={item.title} 
              className="w-10 h-10 object-cover rounded border border-gray-300" 
              onError={(e) => { e.target.src = '/placeholder-image.jpg'; e.target.onerror = null; }} 
            />
            <div className="ml-3">
              <h4 className={`font-medium text-sm ${darkMode ? 'text-gray-200' : 'text-gray-900'}`}>{item.title}</h4>
              <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                {item.category || 'General'} • {item.publishedAt ? new Date(item.publishedAt).toLocaleDateString() : item.uploadedAt ? new Date(item.uploadedAt).toLocaleDateString() : 'Date not available'}
              </p>
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
  error
}) => {
  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
        <h2 className="text-xl font-bold mb-3">Manage {title}</h2>
        {!isEditing && (
          <button 
            onClick={() => onEdit({ id: null })}
            className={`${BUTTON_STYLES.small.base} ${BUTTON_STYLES.small.light} flex items-center`}
          >
            <Plus size={16} className="mr-1" />
            Add New
          </button>
        )}
      </div>

      {error && (
        <div className={`p-3 mb-4 rounded-lg ${darkMode ? 'bg-red-900/30 border-red-700' : 'bg-red-50 border-red-200'} border`}>
          <p className={darkMode ? 'text-red-200 text-xs' : 'text-red-800 text-xs'}>{error}</p>
        </div>
      )}

      {isEditing ? (
        <div className={`${themeClasses.card} p-3 md:p-4 rounded-lg shadow-sm mb-4 border`}>
          <h3 className={`text-base font-semibold mb-3 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>{formData.id ? 'Edit' : 'Add New'} {title.slice(0, -1)}</h3>
          <div className="grid grid-cols-1 gap-3 mb-4">
            <div>
              <label className={`block text-xs font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Title *</label>
              <input
                type="text"
                name="title"
                value={formData.title ?? ''}
                onChange={onInputChange}
                className={`w-full p-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${themeClasses.input}`}
                placeholder="Enter title"
                required
              />
            </div>
            <div>
              <label className={`block text-xs font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Category *</label>
              <input
                type="text"
                name="category"
                value={formData.category ?? ''}
                onChange={onInputChange}
                className={`w-full p-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${themeClasses.input}`}
                placeholder="Enter category"
                required
              />
            </div>
          </div>
          <div className="mb-4">
            <label className={`block text-xs font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Content *</label>
            <textarea
              name="content"
              value={formData.content ?? ''}
              onChange={onInputChange}
              rows="4"
              className={`w-full p-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${themeClasses.input}`}
              placeholder="Enter content"
              required
            ></textarea>
          </div>
          <div className="mb-4">
            <label className={`block text-xs font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Image</label>
            {/* Upload Method Selector */}
            <div className="flex flex-wrap gap-1 mb-2">
              <button
                type="button"
                onClick={() => setUploadMethod('url')}
                className={`px-2 py-1 text-xs rounded ${uploadMethod === 'url' ? themeClasses.button.primary.base + ' ' + themeClasses.button.primary.light : themeClasses.button.secondary.base + ' ' + themeClasses.button.secondary.light}`}
              >
                <Link size={12} className="mr-1" />
                URL
              </button>
              <button
                type="button"
                onClick={() => setUploadMethod('upload')}
                className={`px-2 py-1 text-xs rounded ${uploadMethod === 'upload' ? themeClasses.button.primary.base + ' ' + themeClasses.button.primary.light : themeClasses.button.secondary.base + ' ' + themeClasses.button.secondary.light}`}
              >
                <Upload size={12} className="mr-1" />
                Upload
              </button>
            </div>
            {/* URL Input */}
            {uploadMethod === 'url' && (
              <div>
                <input
                  type="url"
                  value={formData.imageUrl ?? ''}
                  onChange={(e) => onImageUrlChange(e.target.value)}
                  className={`w-full p-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${themeClasses.input}`}
                  placeholder="https://example.com/image.jpg"
                />
                <p className={`text-xs mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Enter a direct image URL</p>
              </div>
            )}
            {/* File Upload */}
            {uploadMethod === 'upload' && (
              <div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => onImageChange(e.target.files[0])}
                  className={`w-full p-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${themeClasses.input}`}
                />
                <p className={`text-xs mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Max file size: 5MB</p>
              </div>
            )}
            {/* Image Preview */}
            {(formData.imageUrl || formData.image) && (
              <div className={`mt-2 p-2 rounded border ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
                <h4 className={`text-xs font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Image Preview</h4>
                <div className="relative group">
                  <img 
                    src={formData.imageUrl || URL.createObjectURL(formData.image)} 
                    alt="Preview" 
                    className="max-w-full h-auto rounded border border-gray-300 max-h-48 object-contain"
                    onError={(e) => { e.target.style.display = 'none'; }} 
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded">
                    <Eye className="text-white" size={18} />
                  </div>
                </div>
              </div>
            )}
          </div>
          <div className="flex flex-col md:flex-row justify-end space-y-2 md:space-y-0 md:space-x-2 pt-3 border-t border-gray-200">
            <button 
              onClick={onCancel}
              className={`px-3 py-1.5 text-xs rounded transition-colors ${darkMode ? 'border border-gray-600 text-gray-300 hover:bg-gray-700' : 'border border-gray-300 text-gray-700 hover:bg-gray-100'}`}
            >
              Cancel
            </button>
            <button 
              onClick={onSave}
              disabled={!formData.title || !formData.content || !formData.category}
              className={`px-3 py-1.5 text-xs rounded transition-colors ${!formData.title || !formData.content || !formData.category ? 'bg-gray-400 cursor-not-allowed' : themeClasses.button.primary.light}`}
            >
              {formData.id ? 'Update' : 'Save'}
            </button>
          </div>
        </div>
      ) : null}

      <div className={`${themeClasses.card} rounded-lg shadow-sm overflow-hidden border`}>
        {items.length === 0 ? (
          <div className={`p-6 text-center ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            <p className="text-base">No {title.toLowerCase()} yet.</p>
            <p className="mt-1 text-sm">Click "Add New" to create your first item!</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            {/* Mobile: Card Grid | Desktop: Table */}
            <div className="md:hidden space-y-3 p-3">
              {items.map((item, index) => (
                <div key={item._id} className={`p-3 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'} ${darkMode ? 'hover:bg-gray-600' : 'hover:bg-gray-50'}`}>
                  <div className="flex items-start">
                    <img 
                      src={item.imageUrl || '/placeholder-image.jpg'} 
                      alt={item.title} 
                      className="w-12 h-12 object-cover rounded border border-gray-300"
                      onError={(e) => { e.target.src = '/placeholder-image.jpg'; e.target.onerror = null; }} 
                    />
                    <div className="ml-3 flex-grow">
                      <div className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>{item.title}</div>
                      <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        {item.category || 'General'} • {item.publishedAt ? new Date(item.publishedAt).toLocaleDateString() : 
                         item.uploadedAt ? new Date(item.uploadedAt).toLocaleDateString() : 'Date not available'}
                      </div>
                    </div>
                    <div className="flex space-x-2 ml-2">
                      <button 
                        onClick={() => onEdit(item)}
                        className={`text-blue-600 hover:text-blue-900 transition-colors ${darkMode ? 'text-blue-400 hover:text-blue-300' : ''}`}
                      >
                        <Edit size={16} />
                      </button>
                      <button 
                        onClick={() => onDelete(item._id, title.toLowerCase().includes('blog') ? 'blog' : 'portfolio')}
                        className={`text-red-600 hover:text-red-900 transition-colors ${darkMode ? 'text-red-400 hover:text-red-300' : ''}`}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Desktop Table */}
            <table className="min-w-full divide-y divide-gray-200 hidden md:table">
              <thead className={darkMode ? 'bg-gray-700' : 'bg-gray-50'}>
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-medium uppercase tracking-wider">Image</th>
                  <th className="px-3 py-2 text-left text-xs font-medium uppercase tracking-wider">Title</th>
                  <th className="px-3 py-2 text-left text-xs font-medium uppercase tracking-wider hidden md:table-cell">Category</th>
                  <th className="px-3 py-2 text-left text-xs font-medium uppercase tracking-wider hidden md:table-cell">Date</th>
                  <th className="px-3 py-2 text-right text-xs font-medium uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${darkMode ? 'divide-gray-600 bg-gray-800' : 'divide-gray-200 bg-white'}`}>
                {items.map((item, index) => (
                  <tr key={item._id} className={darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}>
                    <td className="px-3 py-3 whitespace-nowrap">
                      <img 
                        src={item.imageUrl || '/placeholder-image.jpg'} 
                        alt={item.title} 
                        className="w-10 h-10 object-cover rounded border border-gray-200"
                        onError={(e) => { e.target.src = '/placeholder-image.jpg'; e.target.onerror = null; }} 
                      />
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap">
                      <div className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>{item.title}</div>
                      <div className={`text-xs md:hidden ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        {item.category || 'General'} • {item.publishedAt ? new Date(item.publishedAt).toLocaleDateString() : 
                         item.uploadedAt ? new Date(item.uploadedAt).toLocaleDateString() : 'Date not available'}
                      </div>
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap hidden md:table-cell">
                      <div className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>{item.category || 'General'}</div>
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap hidden md:table-cell">
                      <div className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                        {item.publishedAt ? new Date(item.publishedAt).toLocaleDateString() : 
                         item.uploadedAt ? new Date(item.uploadedAt).toLocaleDateString() : 'Date not available'}
                      </div>
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap text-right text-sm font-medium">
                      <button 
                        onClick={() => onEdit(item)}
                        className={`text-blue-600 hover:text-blue-900 mr-2 transition-colors ${darkMode ? 'text-blue-400 hover:text-blue-300' : ''}`}
                      >
                        <Edit size={16} />
                      </button>
                      <button 
                        onClick={() => onDelete(item._id, title.toLowerCase().includes('blog') ? 'blog' : 'portfolio')}
                        className={`text-red-600 hover:text-red-900 transition-colors ${darkMode ? 'text-red-400 hover:text-red-300' : ''}`}
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
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
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Settings</h2>
        <button 
          onClick={saveSettings}
          className={`${BUTTON_STYLES.small.base} ${BUTTON_STYLES.small.light} flex items-center`}
        >
          <Save size={16} className="mr-1" />
          Save
        </button>
      </div>
      <div className="grid grid-cols-1 gap-4">
        {/* Site Settings Card */}
        <div className={`${themeClasses.card} p-4 rounded-lg shadow-sm border`}>
          <h3 className={`text-base font-semibold mb-3 flex items-center ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>
            <Globe size={16} className="mr-2" />
            Site Settings
          </h3>
          <div className="space-y-3">
            <div>
              <label className={`block text-xs font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Site Title</label>
              <input
                type="text"
                name="siteTitle"
                value={settingsData.siteTitle}
                onChange={handleSettingsChange}
                className={`w-full p-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${themeClasses.input}`}
                placeholder="Site Title"
              />
            </div>
            <div>
              <label className={`block text-xs font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Admin Email</label>
              <input
                type="email"
                name="adminEmail"
                value={settingsData.adminEmail}
                onChange={handleSettingsChange}
                className={`w-full p-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${themeClasses.input}`}
                placeholder="admin@example.com"
              />
            </div>
            <div>
              <label className={`block text-xs font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Language</label>
              <select
                name="language"
                value={settingsData.language}
                onChange={handleSettingsChange}
                className={`w-full p-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${themeClasses.input}`}
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
        <div className={`${themeClasses.card} p-4 rounded-lg shadow-sm border`}>
          <h3 className={`text-base font-semibold mb-3 flex items-center ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>
            <Settings size={16} className="mr-2" />
            Preferences
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className={`font-medium text-sm ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>Notifications</h4>
                <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Receive email notifications</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  name="notifications"
                  checked={settingsData.notifications}
                  onChange={handleSettingsChange}
                  className="sr-only peer"
                />
                <div className={`w-9 h-5 rounded-full peer ${darkMode ? 'bg-gray-700 peer-checked:bg-blue-600' : 'bg-gray-300 peer-checked:bg-blue-600'} peer-checked:after:translate-x-full peer-after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all`}></div>
              </label>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <h4 className={`font-medium text-sm ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>Auto Save</h4>
                <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Automatically save changes</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  name="autoSave"
                  checked={settingsData.autoSave}
                  onChange={handleSettingsChange}
                  className="sr-only peer"
                />
                <div className={`w-9 h-5 rounded-full peer ${darkMode ? 'bg-gray-700 peer-checked:bg-blue-600' : 'bg-gray-300 peer-checked:bg-blue-600'} peer-checked:after:translate-x-full peer-after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all`}></div>
              </label>
            </div>
          </div>
        </div>

        {/* Account Settings Card */}
        <div className={`${themeClasses.card} p-4 rounded-lg shadow-sm border`}>
          <h3 className={`text-base font-semibold mb-3 flex items-center ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>
            <User size={16} className="mr-2" />
            Account Settings
          </h3>
          <div className="space-y-3">
            <div>
              <label className={`block text-xs font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Current Password</label>
              <input
                type="password"
                className={`w-full p-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${themeClasses.input}`}
                placeholder="Enter current password"
              />
            </div>
            <div>
              <label className={`block text-xs font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>New Password</label>
              <input
                type="password"
                className={`w-full p-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${themeClasses.input}`}
                placeholder="Enter new password"
              />
            </div>
            <div>
              <label className={`block text-xs font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Confirm New Password</label>
              <input
                type="password"
                className={`w-full p-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${themeClasses.input}`}
                placeholder="Confirm new password"
              />
            </div>
            <button className={`${BUTTON_STYLES.small.base} ${BUTTON_STYLES.small.light} w-full`}>
              Update Password
            </button>
          </div>
        </div>

        {/* System Info Card */}
        <div className={`${themeClasses.card} p-4 rounded-lg shadow-sm border`}>
          <h3 className={`text-base font-semibold mb-3 flex items-center ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>
            <BarChart3 size={16} className="mr-2" />
            System Information
          </h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className={darkMode ? 'text-gray-400 text-xs' : 'text-gray-600 text-xs'}>Platform Version</span>
              <span className={darkMode ? 'text-gray-200 text-xs' : 'text-gray-800 text-xs'}>v2.4.1</span>
            </div>
            <div className="flex justify-between">
              <span className={darkMode ? 'text-gray-400 text-xs' : 'text-gray-600 text-xs'}>Last Update</span>
              <span className={darkMode ? 'text-gray-200 text-xs' : 'text-gray-800 text-xs'}>2023-10-15</span>
            </div>
            <div className="flex justify-between">
              <span className={darkMode ? 'text-gray-400 text-xs' : 'text-gray-600 text-xs'}>Database</span>
              <span className={darkMode ? 'text-gray-200 text-xs' : 'text-gray-800 text-xs'}>MongoDB 6.0</span>
            </div>
            <div className="flex justify-between">
              <span className={darkMode ? 'text-gray-400 text-xs' : 'text-gray-600 text-xs'}>Server Status</span>
              <span className="text-green-500 text-xs">Online</span>
            </div>
            <div className="pt-3 mt-3 border-t border-gray-200">
              <button className={`${BUTTON_STYLES.small.base} ${darkMode ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-800'} w-full`}>
                Check for Updates
              </button>
            </div>
            <div className="pt-3 mt-3 border-t border-gray-200">
              <h4 className={`font-medium mb-1 text-sm ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>API Base URL</h4>
              <code className={`text-xs p-2 rounded block ${darkMode ? 'bg-gray-700 text-gray-200' : 'bg-gray-100 text-gray-800'}`}>
                {import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}
              </code>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;