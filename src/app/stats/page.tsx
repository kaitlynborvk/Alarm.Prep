"use client";

import React, { useState, useEffect } from 'react';
import BottomNav from '@/components/BottomNav';

// Sample data - in a real app, this would come from a database
const sampleStats = {
  gmat: {
    quantitative: {
      overall: { correct: 45, incorrect: 15, total: 60 },
      categories: {
        algebra: {
          name: "Algebra & Equations",
          overall: { correct: 12, incorrect: 3, total: 15 },
          subcategories: {
            linear: { name: "Linear Equations", correct: 3, incorrect: 1, total: 4 },
            quadratics: { name: "Quadratics", correct: 2, incorrect: 1, total: 3 },
            inequalities: { name: "Inequalities", correct: 2, incorrect: 0, total: 2 },
            absolute: { name: "Absolute Value", correct: 1, incorrect: 1, total: 2 },
            exponents: { name: "Exponents & Roots", correct: 2, incorrect: 0, total: 2 },
            functions: { name: "Functions", correct: 1, incorrect: 0, total: 1 },
            expressions: { name: "Algebraic Expressions", correct: 1, incorrect: 0, total: 1 }
          }
        },
        arithmetic: {
          name: "Arithmetic & Number Properties",
          overall: { correct: 11, incorrect: 4, total: 15 },
          subcategories: {
            properties: { name: "Number Properties", correct: 3, incorrect: 1, total: 4 },
            divisibility: { name: "Divisibility", correct: 2, incorrect: 1, total: 3 },
            lcm: { name: "LCM & GCF", correct: 2, incorrect: 0, total: 2 },
            remainders: { name: "Remainders & Modulo", correct: 1, incorrect: 1, total: 2 },
            constraints: { name: "Integer Constraints", correct: 2, incorrect: 0, total: 2 },
            evenOdd: { name: "Even/Odd/Positive/Negative", correct: 1, incorrect: 1, total: 2 }
          }
        },
        wordProblems: {
          name: "Word Problems & Math Logic",
          overall: { correct: 13, incorrect: 5, total: 18 },
          subcategories: {
            fractions: { name: "Fractions & Decimals", correct: 3, incorrect: 1, total: 4 },
            percents: { name: "Percents", correct: 2, incorrect: 1, total: 3 },
            ratios: { name: "Ratios & Proportions", correct: 2, incorrect: 1, total: 3 },
            averages: { name: "Averages & Weighted Averages", correct: 2, incorrect: 0, total: 2 },
            rate: { name: "Rate, Time, & Work", correct: 2, incorrect: 1, total: 3 },
            mixtures: { name: "Mixtures & Blends", correct: 2, incorrect: 1, total: 3 }
          }
        },
        logic: {
          name: "Logic, Sets, and Counting",
          overall: { correct: 9, incorrect: 3, total: 12 },
          subcategories: {
            sets: { name: "Overlapping Sets", correct: 2, incorrect: 1, total: 3 },
            sequences: { name: "Sequences & Patterns", correct: 2, incorrect: 0, total: 2 },
            combinatorics: { name: "Combinatorics", correct: 2, incorrect: 1, total: 3 },
            probability: { name: "Probability", correct: 2, incorrect: 0, total: 2 },
            logicConstraints: { name: "Logic-Based Constraints", correct: 1, incorrect: 1, total: 2 }
          }
        }
      }
    },
    verbal: { correct: 38, incorrect: 22, total: 60 },
    data: { correct: 28, incorrect: 12, total: 40 }
  },
  lsat: {
    reading: { correct: 52, incorrect: 18, total: 70 },
    logical: { correct: 41, incorrect: 19, total: 60 }
  }
};

export default function Stats() {
  const [examType, setExamType] = useState<'gmat' | 'lsat'>('gmat');
  const [selectedSection, setSelectedSection] = useState<string>('overview');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  useEffect(() => {
    const savedExamType = localStorage.getItem('examType') as 'gmat' | 'lsat';
    if (savedExamType) {
      setExamType(savedExamType);
    }
  }, []);

  const getStats = () => {
    return examType === 'gmat' ? sampleStats.gmat : sampleStats.lsat;
  };

  const getPerformanceColor = (percentage: number) => {
    if (percentage >= 80) return 'text-green-600';
    if (percentage >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getPerformanceText = (percentage: number) => {
    if (percentage >= 80) return 'Excellent';
    if (percentage >= 60) return 'Good';
    return 'Needs Improvement';
  };

  const renderQuantitativeBreakdown = () => {
    const quantData = sampleStats.gmat.quantitative;
    
    return (
      <div className="space-y-6">
        {/* Overall Quant Performance */}
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <h3 className="text-lg font-semibold mb-3">Overall Quantitative</h3>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">
              {quantData.overall.correct}/{quantData.overall.total} correct
            </span>
            <span className={`font-semibold ${getPerformanceColor((quantData.overall.correct / quantData.overall.total) * 100)}`}>
              {Math.round((quantData.overall.correct / quantData.overall.total) * 100)}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full" 
              style={{ width: `${(quantData.overall.correct / quantData.overall.total) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Categories */}
        <div className="space-y-4">
          {Object.entries(quantData.categories).map(([key, category]) => (
            <div key={key} className="bg-white rounded-lg p-4 shadow-sm">
              <div 
                className="flex items-center justify-between cursor-pointer"
                onClick={() => setSelectedCategory(selectedCategory === key ? null : key)}
              >
                <h4 className="font-semibold text-gray-800">{category.name}</h4>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">
                    {category.overall.correct}/{category.overall.total}
                  </span>
                  <span className={`text-sm font-semibold ${getPerformanceColor((category.overall.correct / category.overall.total) * 100)}`}>
                    {Math.round((category.overall.correct / category.overall.total) * 100)}%
                  </span>
                  <svg 
                    className={`w-4 h-4 transition-transform ${selectedCategory === key ? 'rotate-180' : ''}`}
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
              
              {/* Category Progress Bar */}
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full" 
                  style={{ width: `${(category.overall.correct / category.overall.total) * 100}%` }}
                ></div>
              </div>

              {/* Subcategories */}
              {selectedCategory === key && (
                <div className="mt-4 space-y-3">
                  {Object.entries(category.subcategories).map(([subKey, subcategory]) => (
                    <div key={subKey} className="pl-4 border-l-2 border-gray-200">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-700">{subcategory.name}</span>
                        <div className="flex items-center space-x-2">
                          <span className="text-xs text-gray-500">
                            {subcategory.correct}/{subcategory.total}
                          </span>
                          <span className={`text-xs font-semibold ${getPerformanceColor((subcategory.correct / subcategory.total) * 100)}`}>
                            {Math.round((subcategory.correct / subcategory.total) * 100)}%
                          </span>
                        </div>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-1 mt-1">
                        <div 
                          className="bg-blue-400 h-1 rounded-full" 
                          style={{ width: `${(subcategory.correct / subcategory.total) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderSectionStats = (section: string, data: any) => {
    const percentage = Math.round((data.correct / data.total) * 100);
    
    return (
      <div className="bg-white rounded-lg p-4 shadow-sm">
        <h3 className="text-lg font-semibold mb-3 capitalize">{section}</h3>
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-600">
            {data.correct}/{data.total} correct
          </span>
          <span className={`font-semibold ${getPerformanceColor(percentage)}`}>
            {percentage}%
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-600 h-2 rounded-full" 
            style={{ width: `${percentage}%` }}
          ></div>
        </div>
        <p className={`text-sm mt-2 ${getPerformanceColor(percentage)}`}>
          {getPerformanceText(percentage)}
        </p>
      </div>
    );
  };

  const renderOverview = () => {
    const stats = getStats();
    
    return (
      <div className="space-y-6">
        {examType === 'gmat' ? (
          <>
            {renderSectionStats('quantitative', (stats as any).quantitative.overall)}
            {renderSectionStats('verbal', (stats as any).verbal)}
            {renderSectionStats('data', (stats as any).data)}
          </>
        ) : (
          <>
            {renderSectionStats('reading', (stats as any).reading)}
            {renderSectionStats('logical', (stats as any).logical)}
          </>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="max-w-md mx-auto p-4">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Performance Stats</h1>
        
        {/* Exam Type Toggle */}
        <div className="bg-white rounded-lg p-4 shadow-sm mb-6">
          <div className="flex space-x-2">
            <button
              onClick={() => {
                setExamType('gmat');
                localStorage.setItem('examType', 'gmat');
                setSelectedSection('overview');
                setSelectedCategory(null);
              }}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                examType === 'gmat'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              GMAT
            </button>
            <button
              onClick={() => {
                setExamType('lsat');
                localStorage.setItem('examType', 'lsat');
                setSelectedSection('overview');
                setSelectedCategory(null);
              }}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                examType === 'lsat'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              LSAT
            </button>
          </div>
        </div>

        {/* Section Tabs */}
        <div className="bg-white rounded-lg p-1 shadow-sm mb-6">
          <div className="flex space-x-1">
            <button
              onClick={() => setSelectedSection('overview')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                selectedSection === 'overview'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              Overview
            </button>
            {examType === 'gmat' && (
              <button
                onClick={() => setSelectedSection('quantitative')}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                  selectedSection === 'quantitative'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                Quant Breakdown
              </button>
            )}
          </div>
        </div>

        {/* Stats Content */}
        <div className="space-y-4">
          {selectedSection === 'overview' && renderOverview()}
          {selectedSection === 'quantitative' && examType === 'gmat' && renderQuantitativeBreakdown()}
        </div>
      </div>
      
      <BottomNav />
    </div>
  );
} 