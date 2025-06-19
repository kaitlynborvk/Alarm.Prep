"use client";

import React, { useState } from 'react';
import BottomNav from '@/components/BottomNav';

const testTypes = [
  {
    id: 'lsat',
    name: 'LSAT',
    description: 'Logical Reasoning, Analytical Reasoning, and Reading Comprehension questions',
    categories: ['Logical Reasoning', 'Analytical Reasoning', 'Reading Comprehension']
  },
  {
    id: 'gmat',
    name: 'GMAT',
    description: 'Quantitative, Verbal, and Integrated Reasoning questions',
    categories: ['Quantitative', 'Verbal', 'Integrated Reasoning']
  },
  {
    id: 'gre',
    name: 'GRE',
    description: 'Verbal Reasoning, Quantitative Reasoning, and Analytical Writing questions',
    categories: ['Verbal Reasoning', 'Quantitative Reasoning', 'Analytical Writing']
  }
];

export default function Settings() {
  const [selectedTest, setSelectedTest] = useState<string>('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  // Temporary user data - will be replaced with actual user data later
  const userData = {
    name: "John Doe",
    subscription: "Free Trial"
  };

  const handleTestChange = (testId: string) => {
    setSelectedTest(testId);
    // Reset categories when test changes
    setSelectedCategories([]);
  };

  const handleCategoryToggle = (category: string) => {
    setSelectedCategories(prev => {
      if (prev.includes(category)) {
        return prev.filter(c => c !== category);
      } else {
        return [...prev, category];
      }
    });
  };

  const handleSave = () => {
    // In a real app, this would save to a database
    console.log('Selected Test:', selectedTest);
    console.log('Selected Categories:', selectedCategories);
    // Show success message or redirect
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-16">
      <main className="container mx-auto px-4 py-8">
        {/* User Profile Section */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h1 className="text-3xl font-bold text-gray-900">{userData.name}</h1>
          <p className="text-sm text-gray-600 mt-1">{userData.subscription}</p>
        </div>

        {/* Test Type Selection */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Select Question Type</h2>
          <div className="mb-6">
            <select
              value={selectedTest}
              onChange={(e) => handleTestChange(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Select a test type</option>
              {testTypes.map((test) => (
                <option key={test.id} value={test.id}>
                  {test.name}
                </option>
              ))}
            </select>
          </div>
          
          {/* Categories */}
          {selectedTest && (
            <div className="mt-6">
              <h3 className="text-lg font-medium mb-3">Select Categories</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {testTypes.find(t => t.id === selectedTest)?.categories.map((category) => (
                  <label key={category} className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedCategories.includes(category)}
                      onChange={() => handleCategoryToggle(category)}
                      className="h-4 w-4 text-blue-600"
                    />
                    <span className="text-gray-700">{category}</span>
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            onClick={handleSave}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Save Settings
          </button>
        </div>
      </main>
      <BottomNav />
    </div>
  );
} 