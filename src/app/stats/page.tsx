"use client";

import { useState, useEffect } from 'react';
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

export default function StatsPage() {
  const [examType, setExamType] = useState<'gmat' | 'lsat' | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedSection, setSelectedSection] = useState<string | null>(null);

  useEffect(() => {
    const savedExamType = localStorage.getItem('examType');
    
    if (savedExamType) {
      // Handle both uppercase and lowercase formats
      const normalizedExamType = savedExamType.toLowerCase() as 'gmat' | 'lsat';
      setExamType(normalizedExamType);
    } else {
      // Default to GMAT if nothing is set
      setExamType('gmat');
    }
  }, []);

  const getStats = () => {
    if (!examType) return null;
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
        {/* Back button */}
        <div className="flex items-center mb-4">
          <button
            onClick={() => setSelectedSection(null)}
            className="flex items-center text-blue-600 hover:text-blue-800 transition-colors"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Overview
          </button>
        </div>

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

  const renderSectionStats = (section: string, data: any, isClickable: boolean = false) => {
    const percentage = Math.round((data.correct / data.total) * 100);
    
    return (
      <div 
        className={`bg-white rounded-lg p-4 shadow-sm ${isClickable ? 'cursor-pointer hover:bg-gray-50 transition-colors' : ''}`}
        onClick={isClickable ? () => setSelectedSection(section) : undefined}
      >
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold capitalize">{section}</h3>
          {isClickable && (
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          )}
        </div>
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

  const renderGMATStats = () => {
    const stats = sampleStats.gmat;
    
    return (
      <div className="space-y-6">
        {renderSectionStats('quantitative', stats.quantitative.overall, true)}
        {renderSectionStats('verbal', stats.verbal)}
        {renderSectionStats('data', stats.data)}
      </div>
    );
  };

  const renderLSATStats = () => {
    const stats = sampleStats.lsat;
    
    return (
      <div className="space-y-6">
        {renderSectionStats('reading', stats.reading)}
        {renderSectionStats('logical', stats.logical)}
      </div>
    );
  };

  if (!examType) {
    return (
      <div className="min-h-screen bg-gray-50 pb-20">
        <div className="max-w-md mx-auto p-4">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Performance Stats</h1>
          <div className="bg-white rounded-lg p-8 text-center shadow-sm">
            <p className="text-gray-600 mb-4">No exam type selected</p>
            <p className="text-sm text-gray-500">
              Go to Settings to select GMAT or LSAT to view your statistics
            </p>
          </div>
        </div>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="max-w-md mx-auto p-4">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">
          {examType.toUpperCase()} Performance Stats
        </h1>
        
        {/* Stats Content */}
        <div className="space-y-4">
          {selectedSection === 'quantitative' ? (
            renderQuantitativeBreakdown()
          ) : (
            examType === 'gmat' ? renderGMATStats() : renderLSATStats()
          )}
        </div>
      </div>
      
      <BottomNav />
    </div>
  );
} 