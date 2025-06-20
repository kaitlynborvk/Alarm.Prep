"use client";

import React, { useState, useEffect } from 'react';
import BottomNav from '@/components/BottomNav';

export default function Settings() {
  const [currentExamType, setCurrentExamType] = useState<"GMAT" | "LSAT" | null>(null);

  // Load current exam type from localStorage
  useEffect(() => {
    const storedExamType = localStorage.getItem('examType');
    if (storedExamType) {
      setCurrentExamType(storedExamType as "GMAT" | "LSAT");
    }
  }, []);

  const handleExamSwitch = (newExamType: "GMAT" | "LSAT") => {
    setCurrentExamType(newExamType);
    localStorage.setItem('examType', newExamType);
    // In a real app, this would also update the database
    console.log(`Switched to ${newExamType}`);
  };

  return (
    <div className="min-h-screen pb-16">
      <main className="max-w-md mx-auto p-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-alarm-black mb-2">Settings</h1>
          <p className="text-alarm-black/80">Manage your alarm preferences</p>
        </div>

        {/* Exam Type Section */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8 border border-alarm-black/10">
          <h2 className="text-xl font-semibold mb-4 text-alarm-black">Exam Type</h2>
          <p className="text-gray-600 mb-6">Switch between GMAT and LSAT question types.</p>
          
          <div className="space-y-4">
            <button
              onClick={() => handleExamSwitch("GMAT")}
              className={`w-full text-left p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                currentExamType === "GMAT" 
                  ? 'border-alarm-blue bg-alarm-blue/10' 
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-alarm-black">GMAT</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Quantitative, Verbal, Data Insights
                  </p>
                </div>
                {currentExamType === "GMAT" && (
                  <div className="w-6 h-6 bg-alarm-blue rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </div>
            </button>

            <button
              onClick={() => handleExamSwitch("LSAT")}
              className={`w-full text-left p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                currentExamType === "LSAT" 
                  ? 'border-alarm-blue bg-alarm-blue/10' 
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-alarm-black">LSAT</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Reading Comprehension, Logical Reasoning
                  </p>
                </div>
                {currentExamType === "LSAT" && (
                  <div className="w-6 h-6 bg-alarm-blue rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </div>
            </button>
          </div>

          {currentExamType && (
            <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-green-800 text-sm">
                Currently selected: <span className="font-semibold">{currentExamType}</span>. This affects question types for new alarms.
              </p>
            </div>
          )}
        </div>

        {/* Additional Settings Placeholder */}
        <div className="bg-white rounded-lg shadow-sm p-6 border border-alarm-black/10">
          <h2 className="text-xl font-semibold mb-4 text-alarm-black">Additional Settings</h2>
          <p className="text-gray-600">More settings coming soon...</p>
        </div>
      </main>
      <BottomNav />
    </div>
  );
} 