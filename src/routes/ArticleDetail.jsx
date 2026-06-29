// frontend/src/routes/ArticleDetail.jsx
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

const ArticleDetail = () => {
  const { slug } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const res = await fetch(`/api/blog`);
        if (res.ok) {
          const posts = await res.json();
          const foundPost = posts.find(p => p.slug === slug || p._id === slug);
          setPost(foundPost);
        }
      } catch (error) {
        console.error('Error fetching post:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#182B5C]"></div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold">Post not found</h2>
          <a href="/blog" className="text-[#182B5C] hover:underline mt-4 inline-block">
            ← Back to Blog
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <article className="max-w-4xl mx-auto py-12 px-4 md:px-0">
        {post.imageUrl && (
          <img
            src={post.imageUrl}
            alt={post.title}
            className="w-full h-96 object-cover rounded-xl mb-8"
          />
        )}
        <div className="flex items-center text-sm text-gray-500 mb-4">
          <span>{post.category}</span>
          <span className="mx-2">•</span>
          <span>{new Date(post.publishedAt).toLocaleDateString()}</span>
        </div>
        <h1 className="text-4xl font-bold mb-6">{post.title}</h1>
        <div className="prose lg:prose-xl max-w-none">
          <p className="text-lg leading-relaxed text-gray-700">
            {post.content}
          </p>
        </div>
        <div className="mt-8 pt-8 border-t border-gray-200">
          <a href="/blog" className="text-[#182B5C] hover:underline inline-flex items-center">
            ← Back to Blog
          </a>
        </div>
      </article>
    </div>
  );
};

export default ArticleDetail;