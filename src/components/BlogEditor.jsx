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
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://optimasfibre.onrender.com';
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
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#182B5C] focus:border-transparent transition-colors"
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
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#182B5C] focus:border-transparent transition-colors"
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
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#182B5C] focus:border-transparent transition-colors resize-none"
              placeholder="Write your blog content here..."
            ></textarea>
            <div className="flex justify-between mt-1">
              <span className="text-xs text-gray-500">Minimum 100 characters</span>
              <span className={`text-xs ${
                content.length < 100 ? 'text-red-500 font-medium' : 'text-gray-500'
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
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#182B5C] focus:border-transparent transition-colors"
              placeholder="https://example.com/image.jpg"
            />
            <p className="text-xs text-gray-500 mt-1">Supports: JPG, PNG, GIF, WEBP (Max 5MB)</p>
          </div>

          {/* Image Preview */}
          {imageUrl && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Image Preview</h4>
              <div className="relative group">
                <img
                  src={imageUrl}
                  alt="Featured"
                  className="max-w-full h-auto rounded-lg shadow-sm max-h-64 object-contain border border-gray-300"
                  onError={handleImagePreviewError}
                />
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-lg">
                  <span className="text-white text-sm">Hover to preview</span>
                </div>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <div className="pt-4 border-t border-gray-200">
            <button
              type="submit"
              disabled={publishing || !title.trim() || !content.trim() || !category.trim() || content.length < 100}
              className="w-full md:w-auto px-6 py-3 bg-gradient-to-r from-[#182B5C] to-[#243C70] hover:from-[#15254a] hover:to-[#1d325d] disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed text-white font-medium rounded-lg shadow-sm hover:shadow transition-all duration-200 flex items-center justify-center"
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
            <p className="text-xs text-gray-500 mt-2 text-center">
              Your blog post will be published immediately and visible on your website.
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BlogEditor;