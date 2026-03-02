// src/components/ErrorFallback.jsx
import React from "react";

const ErrorFallback = ({ message = "Something went wrong." }) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-red-100 text-red-800 p-8">
      <div className="bg-white rounded-lg shadow-md p-6 max-w-md text-center">
        <h2 className="text-2xl font-semibold mb-4">Error</h2>
        <p className="mb-4">{message}</p>
        <button
          onClick={() => window.location.reload()}
          className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded transition"
        >
          Reload Page
        </button>
      </div>
    </div>
  );
};

export default ErrorFallback;
