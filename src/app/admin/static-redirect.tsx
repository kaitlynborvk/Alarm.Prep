'use client';

import { useEffect, useState } from 'react';

export default function AdminRedirect() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return <div>Loading...</div>;
  }

  // In static export mode, redirect to home
  if (typeof window !== 'undefined' && window.location.pathname === '/admin') {
    window.location.href = '/';
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Admin Panel</h1>
        <p className="text-gray-600 mb-6">This feature is only available on the web version.</p>
        <a 
          href="/" 
          className="inline-block bg-alarm-blue text-white px-6 py-3 rounded-lg hover:bg-alarm-blue/90 transition-colors"
        >
          Go to Main App
        </a>
      </div>
    </div>
  );
}
