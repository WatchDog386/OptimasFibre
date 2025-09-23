import React, { useState, useRef } from 'react';

const PortfolioUpload = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState('');
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');
  const fileInputRef = useRef(null);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setMessage('❌ Error: Please select an image file.');
        return;
      }
      
      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        setMessage('❌ Error: Image size should be less than 5MB.');
        return;
      }
      
      setImage(file);
      setPreview(URL.createObjectURL(file));
      setMessage('');
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      if (file.size > 5 * 1024 * 1024) {
        setMessage('❌ Error: Image size should be less than 5MB.');
        return;
      }
      setImage(file);
      setPreview(URL.createObjectURL(file));
      setMessage('');
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUploading(true);
    setMessage('');

    // Validate required fields
    if (!title.trim() || !description.trim() || !category.trim()) {
      setMessage('❌ Error: Title, description, and category are required.');
      setUploading(false);
      return;
    }

    if (!image) {
      setMessage('❌ Error: Please select an image.');
      setUploading(false);
      return;
    }

    // Create FormData and append all fields
    const formData = new FormData();
    formData.append('title', title.trim());
    formData.append('description', description.trim());
    formData.append('category', category.trim());
    formData.append('image', image);

    try {
      const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'https://optimasfibre.onrender.com').trim();
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('No authentication token found. Please log in again.');
      }

      const res = await fetch(`${API_BASE_URL}/api/portfolio`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const responseData = await res.json();

      if (res.ok) {
        setMessage('✅ Portfolio item uploaded successfully!');
        setTitle('');
        setDescription('');
        setCategory('');
        setImage(null);
        setPreview('');
        fileInputRef.current.value = '';
      } else {
        throw new Error(responseData.message || `Server error: ${res.status}`);
      }
    } catch (err) {
      setMessage(`❌ Error: ${err.message}`);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-2xl font-bold text-[#182B5C] mb-6">Upload Portfolio Item</h2>

        {message && (
          <div className={`mb-6 p-4 rounded-lg ${
            message.includes('✅') 
              ? 'bg-green-50 border border-green-200 text-green-800' 
              : 'bg-red-50 border border-red-200 text-red-800'
          }`}>
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title Field */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
              Project Title *
            </label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#182B5C] focus:border-transparent transition-colors"
              placeholder="Enter project title"
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
              placeholder="e.g., Fibre Installation, Network Design"
            />
          </div>

          {/* Description Field */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              Description *
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows="6"
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#182B5C] focus:border-transparent transition-colors resize-none"
              placeholder="Describe your project..."
            ></textarea>
            <div className="flex justify-between mt-1">
              <span className="text-xs text-gray-500">Minimum 50 characters</span>
              <span className="text-xs text-gray-500">{description.length}/500 characters</span>
            </div>
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Project Image *
            </label>
            <div 
              className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-[#182B5C] hover:bg-gray-50 transition-colors cursor-pointer"
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onClick={triggerFileInput}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
                required
              />
              {preview ? (
                <div className="relative">
                  <img
                    src={preview}
                    alt="Preview"
                    className="mx-auto max-h-64 rounded-lg shadow-sm"
                  />
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setImage(null);
                      setPreview('');
                      fileInputRef.current.value = '';
                    }}
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                  >
                    ×
                  </button>
                </div>
              ) : (
                <div>
                  <div className="mx-auto w-12 h-12 bg-[#182B5C] bg-opacity-10 rounded-full flex items-center justify-center mb-3">
                    <svg className="w-6 h-6 text-[#182B5C]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <p className="text-gray-600 font-medium">Drag & drop your image here</p>
                  <p className="text-sm text-gray-500 mt-1">or click to browse</p>
                  <p className="text-xs text-gray-400 mt-2">PNG, JPG, GIF up to 5MB</p>
                </div>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-4 border-t border-gray-200">
            <button
              type="submit"
              disabled={uploading || !image || !title.trim() || !description.trim() || !category.trim()}
              className="w-full md:w-auto px-6 py-3 bg-gradient-to-r from-[#182B5C] to-[#243C70] hover:from-[#15254a] hover:to-[#1d325d] disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed text-white font-medium rounded-lg shadow-sm hover:shadow transition-all duration-200 flex items-center justify-center"
            >
              {uploading ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Uploading...
                </span>
              ) : (
                'Upload Portfolio Item'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PortfolioUpload;