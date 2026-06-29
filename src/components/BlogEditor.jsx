// BlogEditor.jsx - FULLY UPDATED WITH BEAUTIFUL DESIGN & ENHANCED UX
import React, { useState } from 'react';

const BlogEditor = () => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [publishing, setPublishing] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setPublishing(true);
    setMessage('');

    // Client-side validation
    if (!title.trim()) {
      setMessage('❌ Title is required to publish your blog post.');
      setPublishing(false);
      return;
    }
    
    if (!category.trim()) {
      setMessage('❌ Please specify a category for your blog post.');
      setPublishing(false);
      return;
    }
    
    if (!content.trim() || content.length < 100) {
      setMessage('❌ Content must be at least 100 characters to ensure quality.');
      setPublishing(false);
      return;
    }

    try {
      // ✅ FIXED: Removed extra spaces from URL
      const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'https://optimasfibre.onrender.com').trim();
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('Authentication session expired. Please log in again.');
      }

      const res = await fetch(`${API_BASE_URL}/api/blog`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          title: title.trim(), 
          content: content.trim(),
          category: category.trim(),
          imageUrl: imageUrl.trim() || undefined
        })
      });

      const responseData = await res.json();

      if (res.ok) {
        setMessage('✅ Blog post published successfully! Redirecting to blog list...');
        setTitle('');
        setContent('');
        setCategory('');
        setImageUrl('');
        
        // Redirect after success
        setTimeout(() => {
          window.location.href = '/admin/blog';
        }, 2000);
      } else {
        throw new Error(responseData.message || 'Failed to publish blog post. Please try again.');
      }
    } catch (err) {
      setMessage(`❌ ${err.message}`);
      console.error('Blog publishing error:', err);
    } finally {
      setPublishing(false);
    }
  };

  const handleImagePreviewError = (e) => {
    e.target.style.display = 'none';
    setMessage('❌ Invalid image URL. Please check the link and try again.');
  };

  const handleImageChange = (e) => {
    setImageUrl(e.target.value);
    if (message.includes('Invalid image URL')) {
      setMessage('');
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
        <h2 className="text-2xl font-bold text-[#182B5C] mb-6">Create Blog Post</h2>

        {message && (
          <div className={`mb-6 p-4 rounded-lg border ${
            message.includes('✅') 
              ? 'bg-green-50 border-green-200 text-green-800' 
              : 'bg-red-50 border-red-200 text-red-800'
          } flex items-start`}>
            <span className="mr-2 mt-0.5">{message.includes('✅') ? '✅' : '❌'}</span>
            <span>{message}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title Field */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
              Title *
            </label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003366] focus:border-transparent transition-colors"
              placeholder="Enter blog post title"
            />
          </div>

          {/* Category Field */}
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
              Category *
            </label>
            <input
              id="category"
              type="text"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003366] focus:border-transparent transition-colors"
              placeholder="e.g., Technology, Networking, Fibre Optics"
            />
          </div>

          {/* Content Field */}
          <div>
            <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
              Content * (Minimum 100 characters)
            </label>
            <textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows="12"
              required
              minLength="100"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003366] focus:border-transparent transition-colors resize-none"
              placeholder="Write your blog content here..."
            ></textarea>
            <div className="flex justify-between mt-1">
              <span className="text-xs text-gray-500">Minimum 100 characters</span>
              <span className={`text-xs font-medium ${
                content.length < 100 ? 'text-red-500' : content.length >= 1800 ? 'text-amber-600' : 'text-green-600'
              }`}>
                {content.length}/2000 characters
              </span>
            </div>
          </div>

          {/* Image URL Field */}
          <div>
            <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-700 mb-2">
              Featured Image URL (optional)
            </label>
            <input
              id="imageUrl"
              type="url"
              value={imageUrl}
              onChange={handleImageChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003366] focus:border-transparent transition-colors"
              placeholder="https://example.com/image.jpg"
            />
            <p className="text-xs text-gray-500 mt-1">
              Supports: JPG, PNG, GIF, WEBP • Max 5MB
            </p>
          </div>

          {/* Image Preview */}
          {imageUrl && (
            <div className="mt-4 p-4 bg-gray-50 rounded-xl border border-gray-200/60">
              <h4 className="text-sm font-semibold text-gray-800 mb-3 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5 text-[#003366]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Image Preview
              </h4>
              <div className="flex justify-center">
                <div className="relative group max-w-md">
                  <img
                    src={imageUrl}
                    alt="Featured blog image"
                    className="w-full h-auto max-h-64 object-contain rounded-lg border border-gray-300/50 shadow-sm"
                    onError={handleImagePreviewError}
                  />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-lg flex items-center justify-center">
                    <div className="text-white text-center p-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mx-auto mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      <span className="text-sm font-medium">Image Preview</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <div className="pt-6 border-t border-gray-200/50">
            <button
              type="submit"
              disabled={publishing || !title.trim() || !content.trim() || !category.trim() || content.length < 100}
              className={`w-full md:w-auto px-6 py-3 font-medium rounded-lg shadow-sm transition-all duration-300 flex items-center justify-center ${
                publishing 
                  ? 'bg-gray-400 text-gray-200 cursor-not-allowed' 
                  : 'bg-gradient-to-r from-[#003366] to-[#01254a] hover:from-[#002a52] hover:to-[#001d3d] text-white hover:shadow-lg transform hover:-translate-y-0.5'
              }`}
            >
              {publishing ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Publishing Post...
                </span>
              ) : (
                'Publish Blog Post'
              )}
            </button>
            <p className="text-xs text-gray-600 mt-3 text-center">
              Your blog post will be published immediately and visible on your website.
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BlogEditor;