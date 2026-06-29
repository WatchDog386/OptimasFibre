import React, { useState, useRef, useEffect } from 'react';

const PortfolioUpload = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [image, setImage] = useState(null);
  const [imageUrl, setImageUrl] = useState('');
  const [uploadMethod, setUploadMethod] = useState('file'); // 'file' or 'url'
  const [preview, setPreview] = useState('');
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');
  const fileInputRef = useRef(null);

  // live preview
  useEffect(() => {
    if (uploadMethod === 'file' && image) {
      setPreview(URL.createObjectURL(image));
    } else if (uploadMethod === 'url' && imageUrl) {
      setPreview(imageUrl);
    } else {
      setPreview('');
    }
  }, [image, imageUrl, uploadMethod]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setMessage('❌ Please select an image file.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setMessage('❌ Image must be less than 5MB.');
      return;
    }

    setImage(file);
    setImageUrl('');
    setMessage('');
  };

  const handleImageUrlChange = (e) => {
    setImageUrl(e.target.value);
    setImage(null);
    setMessage('');
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      if (file.size > 5 * 1024 * 1024) {
        setMessage('❌ Image must be less than 5MB.');
        return;
      }
      setImage(file);
      setImageUrl('');
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

    if (!title.trim() || !description.trim() || !category.trim()) {
      setMessage('❌ Title, description and category are required.');
      setUploading(false);
      return;
    }
    if (uploadMethod === 'file' && !image) {
      setMessage('❌ Please select an image.');
      setUploading(false);
      return;
    }
    if (uploadMethod === 'url' && !imageUrl.trim()) {
      setMessage('❌ Please enter a valid image URL.');
      setUploading(false);
      return;
    }

    try {
      const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'https://optimasfibre.onrender.com').trim();
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Authentication expired. Please log in again.');

      let body;
      let headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      if (uploadMethod === 'file') {
        body = new FormData();
        body.append('title', title.trim());
        body.append('description', description.trim());
        body.append('category', category.trim());
        body.append('image', image);
        delete headers['Content-Type']; // FormData sets its own content-type
      } else {
        body = JSON.stringify({
          title: title.trim(),
          description: description.trim(),
          category: category.trim(),
          imageUrl: imageUrl.trim()
        });
      }

      const res = await fetch(`${API_BASE_URL}/api/portfolio`, {
        method: 'POST',
        headers,
        body
      });

      const data = await res.json();
      if (res.ok) {
        setMessage('✅ Portfolio item uploaded successfully!');
        setTitle('');
        setDescription('');
        setCategory('');
        setImage(null);
        setImageUrl('');
        setPreview('');
        if (fileInputRef.current) fileInputRef.current.value = '';
        // optional redirect:
        // window.location.href = '/admin/portfolio';
      } else {
        throw new Error(data.message || 'Upload failed.');
      }
    } catch (err) {
      setMessage(`❌ ${err.message}`);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
        <h2 className="text-2xl font-bold text-[#182B5C] mb-6">Upload Portfolio Item</h2>

        {message && (
          <div
            className={`mb-6 p-4 rounded-lg border ${
              message.includes('✅')
                ? 'bg-green-50 border-green-200 text-green-800'
                : 'bg-red-50 border-red-200 text-red-800'
            }`}
          >
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Project Title *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#182B5C] focus:border-transparent transition-colors"
              placeholder="Enter project title"
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category *
            </label>
            <input
              type="text"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#182B5C] focus:border-transparent transition-colors"
              placeholder="e.g., Fibre Installation, Network Design"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description *
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows="6"
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#182B5C] focus:border-transparent transition-colors resize-none"
              placeholder="Describe your project..."
            />
          </div>

          {/* Upload method */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Image Upload Method
            </label>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setUploadMethod('file')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  uploadMethod === 'file'
                    ? 'bg-[#182B5C] text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Upload File
              </button>
              <button
                type="button"
                onClick={() => setUploadMethod('url')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  uploadMethod === 'url'
                    ? 'bg-[#182B5C] text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Image URL
              </button>
            </div>
          </div>

          {/* File upload */}
          {uploadMethod === 'file' && (
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
                />
                {preview ? (
                  <img
                    src={preview}
                    alt="Preview"
                    className="mx-auto max-h-64 rounded-lg shadow-sm"
                  />
                ) : (
                  <p className="text-gray-500">Drag & drop or click to select</p>
                )}
              </div>
            </div>
          )}

          {/* URL upload */}
          {uploadMethod === 'url' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Image URL *
              </label>
              <input
                type="url"
                value={imageUrl}
                onChange={handleImageUrlChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#182B5C] focus:border-transparent transition-colors"
                placeholder="https://example.com/image.jpg"
              />
              {preview && (
                <img
                  src={preview}
                  alt="Preview"
                  className="mt-4 max-h-64 rounded-lg shadow-sm border border-gray-200"
                />
              )}
            </div>
          )}

          <div className="pt-4 border-t border-gray-200">
            <button
              type="submit"
              disabled={
                uploading ||
                !title.trim() ||
                !description.trim() ||
                !category.trim() ||
                (uploadMethod === 'file' && !image) ||
                (uploadMethod === 'url' && !imageUrl.trim())
              }
              className="w-full md:w-auto px-6 py-3 bg-gradient-to-r from-[#182B5C] to-[#243C70] hover:from-[#15254a] hover:to-[#1d325d] disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed text-white font-medium rounded-lg shadow-sm hover:shadow transition-all duration-200 flex items-center justify-center"
            >
              {uploading ? 'Uploading…' : 'Upload Portfolio Item'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PortfolioUpload;
