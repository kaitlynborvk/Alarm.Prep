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
    verbal: {
      overall: { correct: 38, incorrect: 22, total: 60 },
      categories: {
        readingComprehension: {
          name: "Reading Comprehension",
          overall: { correct: 38, incorrect: 22, total: 60 },
          subcategories: {
            mainIdea: { name: "Main Idea", correct: 6, incorrect: 2, total: 8 },
            primaryPurpose: { name: "Primary Purpose", correct: 5, incorrect: 3, total: 8 },
            inference: { name: "Inference", correct: 7, incorrect: 4, total: 11 },
            detail: { name: "Detail", correct: 8, incorrect: 3, total: 11 },
            function: { name: "Function/Purpose of Sentence or Paragraph", correct: 4, incorrect: 2, total: 6 },
            strengthenWeaken: { name: "Strengthen/Weaken", correct: 3, incorrect: 3, total: 6 },
            tone: { name: "Author's Tone or Attitude", correct: 2, incorrect: 2, total: 4 },
            logicalStructure: { name: "Logical Structure or Flow", correct: 2, incorrect: 2, total: 4 },
            evaluate: { name: "Evaluate or Resolve Discrepancy", correct: 1, incorrect: 1, total: 2 }
          },
          passageTypes: {
            business: { name: "Business/Economy", correct: 12, incorrect: 6, total: 18 },
            science: { name: "Science/Technology", correct: 10, incorrect: 5, total: 15 },
            history: { name: "History/Social Sciences", correct: 8, incorrect: 4, total: 12 },
            law: { name: "Law/Politics", correct: 5, incorrect: 4, total: 9 },
            humanities: { name: "Humanities/Philosophy", correct: 3, incorrect: 3, total: 6 }
          }
        }
      }
    },
    data: {
      overall: { correct: 28, incorrect: 12, total: 40 },
      categories: {
        tableAnalysis: {
          name: "Table Analysis",
          overall: { correct: 6, incorrect: 2, total: 8 },
          subcategories: {
            percentages: { name: "Percentages & Ratios", correct: 2, incorrect: 1, total: 3 },
            averages: { name: "Averages & Weighted Calculations", correct: 2, incorrect: 0, total: 2 },
            logical: { name: "Logical Reasoning", correct: 1, incorrect: 1, total: 2 },
            reading: { name: "Reading Comprehension", correct: 1, incorrect: 0, total: 1 }
          }
        },
        graphicsInterpretation: {
          name: "Graphics Interpretation",
          overall: { correct: 7, incorrect: 3, total: 10 },
          subcategories: {
            trend: { name: "Trend Identification", correct: 3, incorrect: 1, total: 4 },
            percentages: { name: "Percentages & Ratios", correct: 2, incorrect: 1, total: 3 },
            critical: { name: "Critical Thinking", correct: 2, incorrect: 1, total: 3 }
          }
        },
        twoPartAnalysis: {
          name: "Two-Part Analysis",
          overall: { correct: 5, incorrect: 3, total: 8 },
          subcategories: {
            conditional: { name: "Conditional Reasoning", correct: 2, incorrect: 1, total: 3 },
            multiStep: { name: "Multi-Step Arithmetic", correct: 2, incorrect: 1, total: 3 },
            logical: { name: "Logical Reasoning", correct: 1, incorrect: 1, total: 2 }
          }
        },
        multiSourceReasoning: {
          name: "Multi-Source Reasoning",
          overall: { correct: 6, incorrect: 2, total: 8 },
          subcategories: {
            reading: { name: "Reading Comprehension", correct: 2, incorrect: 1, total: 3 },
            verbal: { name: "Verbal Inference from Data", correct: 2, incorrect: 0, total: 2 },
            critical: { name: "Critical Thinking", correct: 1, incorrect: 1, total: 2 },
            logical: { name: "Logical Reasoning", correct: 1, incorrect: 0, total: 1 }
          }
        },
        dataSufficiency: {
          name: "Data Sufficiency (non-quantitative)",
          overall: { correct: 4, incorrect: 2, total: 6 },
          subcategories: {
            logical: { name: "Logical Reasoning", correct: 2, incorrect: 1, total: 3 },
            critical: { name: "Critical Thinking", correct: 1, incorrect: 1, total: 2 },
            conditional: { name: "Conditional Reasoning", correct: 1, incorrect: 0, total: 1 }
          }
        }
      },
      dataSources: {
        table: { name: "Table", correct: 8, incorrect: 3, total: 11 },
        chart: { name: "Chart", correct: 6, incorrect: 2, total: 8 },
        barGraph: { name: "Bar Graph", correct: 5, incorrect: 2, total: 7 },
        lineGraph: { name: "Line Graph", correct: 4, incorrect: 2, total: 6 },
        mixedGraph: { name: "Mixed Graph", correct: 3, incorrect: 2, total: 5 },
        textPassage: { name: "Text Passage", correct: 2, incorrect: 1, total: 3 }
      }
    }
  },
  lsat: {
    reading: {
      overall: { correct: 52, incorrect: 18, total: 70 },
      categories: {
        readingComprehension: {
          name: "Reading Comprehension",
          overall: { correct: 52, incorrect: 18, total: 70 },
          questionTypes: {
            mainPoint: { name: "Main Point", correct: 8, incorrect: 2, total: 10 },
            primaryPurpose: { name: "Primary Purpose", correct: 7, incorrect: 3, total: 10 },
            attitude: { name: "Author's Attitude/Tone", correct: 6, incorrect: 2, total: 8 },
            organization: { name: "Passage Organization", correct: 6, incorrect: 2, total: 8 },
            detail: { name: "Specific Detail", correct: 8, incorrect: 3, total: 11 },
            inference: { name: "Inference", correct: 7, incorrect: 3, total: 10 },
            function: { name: "Function", correct: 4, incorrect: 2, total: 6 },
            analogy: { name: "Analogy", correct: 3, incorrect: 1, total: 4 },
            application: { name: "Application", correct: 2, incorrect: 1, total: 3 },
            strengthenWeaken: { name: "Strengthen/Weaken", correct: 1, incorrect: 0, total: 1 }
          },
          comparativeReading: {
            relationship: { name: "Relationship Between Passages", correct: 3, incorrect: 1, total: 4 },
            comparative: { name: "Comparative Reasoning", correct: 2, incorrect: 1, total: 3 }
          },
          topics: {
            law: { name: "Law", correct: 18, incorrect: 6, total: 24 },
            science: { name: "Science", correct: 15, incorrect: 5, total: 20 },
            humanities: { name: "Humanities", correct: 12, incorrect: 4, total: 16 },
            socialSciences: { name: "Social Sciences", correct: 7, incorrect: 3, total: 10 }
          }
        }
      }
    },
    logical: {
      overall: { correct: 41, incorrect: 19, total: 60 },
      categories: {
        logicalReasoning: {
          name: "Logical Reasoning",
          overall: { correct: 41, incorrect: 19, total: 60 },
          questionTypes: {
            assumptionNecessary: { name: "Assumption (Necessary)", correct: 6, incorrect: 2, total: 8 },
            assumptionSufficient: { name: "Assumption (Sufficient)", correct: 4, incorrect: 2, total: 6 },
            strengthen: { name: "Strengthen", correct: 5, incorrect: 2, total: 7 },
            weaken: { name: "Weaken", correct: 5, incorrect: 3, total: 8 },
            flaw: { name: "Flaw", correct: 4, incorrect: 2, total: 6 },
            inference: { name: "Inference", correct: 6, incorrect: 3, total: 9 },
            mustBeTrue: { name: "Must Be True", correct: 3, incorrect: 1, total: 4 },
            mostStronglySupported: { name: "Most Strongly Supported", correct: 2, incorrect: 1, total: 3 },
            principleApply: { name: "Principle (Apply)", correct: 2, incorrect: 1, total: 3 },
            principleIdentify: { name: "Principle (Identify)", correct: 1, incorrect: 1, total: 2 },
            parallelReasoning: { name: "Parallel Reasoning", correct: 2, incorrect: 1, total: 3 },
            parallelFlaw: { name: "Parallel Flaw", correct: 1, incorrect: 0, total: 1 },
            resolveParadox: { name: "Resolve the Paradox", correct: 2, incorrect: 1, total: 3 },
            mainPoint: { name: "Main Point", correct: 1, incorrect: 0, total: 1 },
            methodOfReasoning: { name: "Method of Reasoning", correct: 1, incorrect: 0, total: 1 },
            roleInArgument: { name: "Role in Argument", correct: 1, incorrect: 0, total: 1 },
            pointAtIssue: { name: "Point at Issue", correct: 1, incorrect: 0, total: 1 },
            argumentEvaluation: { name: "Argument Evaluation", correct: 1, incorrect: 0, total: 1 }
          },
          difficultyLevels: {
            easy: { name: "Easy", correct: 15, incorrect: 3, total: 18 },
            medium: { name: "Medium", correct: 18, incorrect: 8, total: 26 },
            hard: { name: "Hard", correct: 8, incorrect: 8, total: 16 }
          },
          topics: {
            business: { name: "Business/Economics", correct: 12, incorrect: 5, total: 17 },
            science: { name: "Science/Technology", correct: 10, incorrect: 4, total: 14 },
            politics: { name: "Politics/Law", correct: 8, incorrect: 4, total: 12 },
            social: { name: "Social Issues", correct: 7, incorrect: 3, total: 10 },
            philosophy: { name: "Philosophy/Ethics", correct: 4, incorrect: 3, total: 7 }
          }
        }
      }
    }
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
            className="flex items-center text-alarm-blue hover:underline transition-colors"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Overview
          </button>
        </div>

        {/* Overall Quantitative Performance */}
        <div className="bg-white rounded-lg p-4 shadow-sm border border-alarm-black/10">
          <h3 className="text-lg font-semibold mb-3 text-alarm-black">Overall Quantitative</h3>
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
              className="bg-alarm-blue h-2 rounded-full" 
              style={{ width: `${(quantData.overall.correct / quantData.overall.total) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Main Categories */}
        <div className="bg-white rounded-lg p-4 shadow-sm border border-alarm-black/10">
          <h4 className="font-semibold text-alarm-black mb-4">Main Categories</h4>
          <div className="space-y-4">
            {Object.entries(quantData.categories).map(([key, category]) => (
              <div key={key}>
                <div 
                  className="flex items-center justify-between cursor-pointer"
                  onClick={() => setSelectedCategory(selectedCategory === key ? null : key)}
                >
                  <h5 className="font-semibold text-gray-800">{category.name}</h5>
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
                    className="bg-alarm-blue h-2 rounded-full" 
                    style={{ width: `${(category.overall.correct / category.overall.total) * 100}%` }}
                  ></div>
                </div>

                {/* Subcategories */}
                {selectedCategory === key && (
                  <div className="mt-3 pl-4 space-y-3 border-l-2 border-alarm-blue/20">
                    {Object.entries(category.subcategories).map(([subKey, subcategory]) => (
                      <div key={subKey}>
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
                            className="bg-alarm-blue h-1 rounded-full" 
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
      </div>
    );
  };

  const renderVerbalBreakdown = () => {
    const verbalData = sampleStats.gmat.verbal;
    const readingComp = verbalData.categories.readingComprehension;
    
    return (
      <div className="space-y-6">
        {/* Back button */}
        <div className="flex items-center mb-4">
          <button
            onClick={() => setSelectedSection(null)}
            className="flex items-center text-alarm-blue hover:underline transition-colors"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Overview
          </button>
        </div>

        {/* Overall Verbal Performance */}
        <div className="bg-white rounded-lg p-4 shadow-sm border border-alarm-black/10">
          <h3 className="text-lg font-semibold mb-3 text-alarm-black">Overall Verbal</h3>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">
              {verbalData.overall.correct}/{verbalData.overall.total} correct
            </span>
            <span className={`font-semibold ${getPerformanceColor((verbalData.overall.correct / verbalData.overall.total) * 100)}`}>
              {Math.round((verbalData.overall.correct / verbalData.overall.total) * 100)}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-alarm-blue h-2 rounded-full" 
              style={{ width: `${(verbalData.overall.correct / verbalData.overall.total) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Skill-Based Subcategories */}
        <div className="bg-white rounded-lg p-4 shadow-sm border border-alarm-black/10">
          <h4 className="font-semibold text-alarm-black mb-4">Skill-Based Subcategories</h4>
          <div className="space-y-3">
            {Object.entries(readingComp.subcategories).map(([subKey, subcategory]) => (
              <div key={subKey} className="pl-4 border-l-2 border-blue-200">
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
                    className="bg-alarm-blue h-1 rounded-full" 
                    style={{ width: `${(subcategory.correct / subcategory.total) * 100}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Passage Type Performance */}
        <div className="bg-white rounded-lg p-4 shadow-sm border border-alarm-black/10">
          <h4 className="font-semibold text-alarm-black mb-4">Passage Type Performance</h4>
          <div className="space-y-3">
            {Object.entries(readingComp.passageTypes).map(([typeKey, passageType]) => (
              <div key={typeKey} className="pl-4 border-l-2 border-green-200">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">{passageType.name}</span>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-gray-500">
                      {passageType.correct}/{passageType.total}
                    </span>
                    <span className={`text-xs font-semibold ${getPerformanceColor((passageType.correct / passageType.total) * 100)}`}>
                      {Math.round((passageType.correct / passageType.total) * 100)}%
                    </span>
                  </div>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-1 mt-1">
                  <div 
                    className="bg-green-400 h-1 rounded-full" 
                    style={{ width: `${(passageType.correct / passageType.total) * 100}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderDataBreakdown = () => {
    const dataInsights = sampleStats.gmat.data;
    
    return (
      <div className="space-y-6">
        {/* Back button */}
        <div className="flex items-center mb-4">
          <button
            onClick={() => setSelectedSection(null)}
            className="flex items-center text-alarm-blue hover:underline transition-colors"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Overview
          </button>
        </div>

        {/* Overall Data Insights Performance */}
        <div className="bg-white rounded-lg p-4 shadow-sm border border-alarm-black/10">
          <h3 className="text-lg font-semibold mb-3 text-alarm-black">Overall Data Insights</h3>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">
              {dataInsights.overall.correct}/{dataInsights.overall.total} correct
            </span>
            <span className={`font-semibold ${getPerformanceColor((dataInsights.overall.correct / dataInsights.overall.total) * 100)}`}>
              {Math.round((dataInsights.overall.correct / dataInsights.overall.total) * 100)}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-alarm-blue h-2 rounded-full" 
              style={{ width: `${(dataInsights.overall.correct / dataInsights.overall.total) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Question Format Categories */}
        <div className="bg-white rounded-lg p-4 shadow-sm border border-alarm-black/10">
          <h4 className="font-semibold text-alarm-black mb-4">Question Format Categories</h4>
          <div className="space-y-3">
            {Object.entries(dataInsights.categories).map(([key, category]) => (
              <div key={key} className="pl-4 border-l-2 border-blue-200">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">{category.name}</span>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-gray-500">
                      {category.overall.correct}/{category.overall.total}
                    </span>
                    <span className={`text-xs font-semibold ${getPerformanceColor((category.overall.correct / category.overall.total) * 100)}`}>
                      {Math.round((category.overall.correct / category.overall.total) * 100)}%
                    </span>
                  </div>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-1 mt-1">
                  <div 
                    className="bg-alarm-blue h-1 rounded-full" 
                    style={{ width: `${(category.overall.correct / category.overall.total) * 100}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Data Source Performance */}
        <div className="bg-white rounded-lg p-4 shadow-sm border border-alarm-black/10">
          <h4 className="font-semibold text-alarm-black mb-4">Data Source Performance</h4>
          <div className="space-y-3">
            {Object.entries(dataInsights.dataSources).map(([key, dataSource]) => (
              <div key={key} className="pl-4 border-l-2 border-green-200">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">{dataSource.name}</span>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-gray-500">
                      {dataSource.correct}/{dataSource.total}
                    </span>
                    <span className={`text-xs font-semibold ${getPerformanceColor((dataSource.correct / dataSource.total) * 100)}`}>
                      {Math.round((dataSource.correct / dataSource.total) * 100)}%
                    </span>
                  </div>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-1 mt-1">
                  <div 
                    className="bg-green-400 h-1 rounded-full" 
                    style={{ width: `${(dataSource.correct / dataSource.total) * 100}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderSectionStats = (section: string, data: any, isClickable: boolean = false) => {
    const percentage = Math.round((data.correct / data.total) * 100);
    
    return (
      <div 
        className={`bg-white rounded-lg p-4 shadow-sm border border-alarm-black/10 ${isClickable ? 'cursor-pointer hover:bg-gray-50 transition-colors' : ''}`}
        onClick={isClickable ? () => setSelectedSection(section) : undefined}
      >
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold capitalize text-alarm-black">{section}</h3>
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
            className="bg-alarm-blue h-2 rounded-full" 
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
        {renderSectionStats('verbal', stats.verbal.overall, true)}
        {renderSectionStats('data', stats.data.overall, true)}
      </div>
    );
  };

  const renderLSATReadingBreakdown = () => {
    const readingData = sampleStats.lsat.reading;
    const readingComp = readingData.categories.readingComprehension;
    
    return (
      <div className="space-y-6">
        {/* Back button */}
        <div className="flex items-center mb-4">
          <button
            onClick={() => setSelectedSection(null)}
            className="flex items-center text-alarm-blue hover:underline transition-colors"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Overview
          </button>
        </div>

        {/* Overall Reading Performance */}
        <div className="bg-white rounded-lg p-4 shadow-sm border border-alarm-black/10">
          <h3 className="text-lg font-semibold mb-3 text-alarm-black">Overall Reading Comprehension</h3>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">
              {readingData.overall.correct}/{readingData.overall.total} correct
            </span>
            <span className={`font-semibold ${getPerformanceColor((readingData.overall.correct / readingData.overall.total) * 100)}`}>
              {Math.round((readingData.overall.correct / readingData.overall.total) * 100)}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-alarm-blue h-2 rounded-full" 
              style={{ width: `${(readingData.overall.correct / readingData.overall.total) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Question Types */}
        <div className="bg-white rounded-lg p-4 shadow-sm border border-alarm-black/10">
          <h4 className="font-semibold text-alarm-black mb-4">Question Types</h4>
          <div className="space-y-3">
            {Object.entries(readingComp.questionTypes).map(([key, questionType]) => (
              <div key={key} className="pl-4 border-l-2 border-blue-200">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">{questionType.name}</span>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-gray-500">
                      {questionType.correct}/{questionType.total}
                    </span>
                    <span className={`text-xs font-semibold ${getPerformanceColor((questionType.correct / questionType.total) * 100)}`}>
                      {Math.round((questionType.correct / questionType.total) * 100)}%
                    </span>
                  </div>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-1 mt-1">
                  <div 
                    className="bg-alarm-blue h-1 rounded-full" 
                    style={{ width: `${(questionType.correct / questionType.total) * 100}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Comparative Reading */}
        <div className="bg-white rounded-lg p-4 shadow-sm border border-alarm-black/10">
          <h4 className="font-semibold text-alarm-black mb-4">Comparative Reading</h4>
          <div className="space-y-3">
            {Object.entries(readingComp.comparativeReading).map(([key, comparative]) => (
              <div key={key} className="pl-4 border-l-2 border-purple-200">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">{comparative.name}</span>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-gray-500">
                      {comparative.correct}/{comparative.total}
                    </span>
                    <span className={`text-xs font-semibold ${getPerformanceColor((comparative.correct / comparative.total) * 100)}`}>
                      {Math.round((comparative.correct / comparative.total) * 100)}%
                    </span>
                  </div>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-1 mt-1">
                  <div 
                    className="bg-purple-400 h-1 rounded-full" 
                    style={{ width: `${(comparative.correct / comparative.total) * 100}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Topic Performance */}
        <div className="bg-white rounded-lg p-4 shadow-sm border border-alarm-black/10">
          <h4 className="font-semibold text-alarm-black mb-4">Topic Performance</h4>
          <div className="space-y-3">
            {Object.entries(readingComp.topics).map(([key, topic]) => (
              <div key={key} className="pl-4 border-l-2 border-green-200">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">{topic.name}</span>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-gray-500">
                      {topic.correct}/{topic.total}
                    </span>
                    <span className={`text-xs font-semibold ${getPerformanceColor((topic.correct / topic.total) * 100)}`}>
                      {Math.round((topic.correct / topic.total) * 100)}%
                    </span>
                  </div>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-1 mt-1">
                  <div 
                    className="bg-green-400 h-1 rounded-full" 
                    style={{ width: `${(topic.correct / topic.total) * 100}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderLSATLogicalBreakdown = () => {
    const logicalData = sampleStats.lsat.logical;
    const logicalReasoning = logicalData.categories.logicalReasoning;
    
    return (
      <div className="space-y-6">
        {/* Back button */}
        <div className="flex items-center mb-4">
          <button
            onClick={() => setSelectedSection(null)}
            className="flex items-center text-alarm-blue hover:underline transition-colors"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Overview
          </button>
        </div>

        {/* Overall Logical Performance */}
        <div className="bg-white rounded-lg p-4 shadow-sm border border-alarm-black/10">
          <h3 className="text-lg font-semibold mb-3 text-alarm-black">Overall Logical Reasoning</h3>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">
              {logicalData.overall.correct}/{logicalData.overall.total} correct
            </span>
            <span className={`font-semibold ${getPerformanceColor((logicalData.overall.correct / logicalData.overall.total) * 100)}`}>
              {Math.round((logicalData.overall.correct / logicalData.overall.total) * 100)}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-green-600 h-2 rounded-full" 
              style={{ width: `${(logicalData.overall.correct / logicalData.overall.total) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Question Types */}
        <div className="bg-white rounded-lg p-4 shadow-sm border border-alarm-black/10">
          <h4 className="font-semibold text-alarm-black mb-4">Question Types</h4>
          <div className="space-y-3">
            {Object.entries(logicalReasoning.questionTypes).map(([key, questionType]) => (
              <div key={key} className="pl-4 border-l-2 border-alarm-blue/20">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700 flex-1 mr-2 leading-tight">{questionType.name}</span>
                  <div className="flex items-center space-x-2 flex-shrink-0">
                    <span className="text-xs text-gray-500">
                      {questionType.correct}/{questionType.total}
                    </span>
                    <span className={`text-xs font-semibold ${getPerformanceColor((questionType.correct / questionType.total) * 100)}`}>
                      {Math.round((questionType.correct / questionType.total) * 100)}%
                    </span>
                  </div>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-1 mt-1">
                  <div 
                    className="bg-alarm-blue h-1 rounded-full" 
                    style={{ width: `${(questionType.correct / questionType.total) * 100}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Difficulty Levels */}
        <div className="bg-white rounded-lg p-4 shadow-sm border border-alarm-black/10">
          <h4 className="font-semibold text-alarm-black mb-4">Difficulty Levels</h4>
          <div className="space-y-3">
            {Object.entries(logicalReasoning.difficultyLevels).map(([key, difficulty]) => (
              <div key={key} className="pl-4 border-l-2 border-alarm-yellow/50">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">{difficulty.name}</span>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-gray-500">
                      {difficulty.correct}/{difficulty.total}
                    </span>
                    <span className={`text-xs font-semibold ${getPerformanceColor((difficulty.correct / difficulty.total) * 100)}`}>
                      {Math.round((difficulty.correct / difficulty.total) * 100)}%
                    </span>
                  </div>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-1 mt-1">
                  <div 
                    className="bg-alarm-yellow h-1 rounded-full" 
                    style={{ width: `${(difficulty.correct / difficulty.total) * 100}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Topic Performance */}
        <div className="bg-white rounded-lg p-4 shadow-sm border border-alarm-black/10">
          <h4 className="font-semibold text-alarm-black mb-4">Topic Performance</h4>
          <div className="space-y-3">
            {Object.entries(logicalReasoning.topics).map(([key, topic]) => (
              <div key={key} className="pl-4 border-l-2 border-blue-200">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">{topic.name}</span>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-gray-500">
                      {topic.correct}/{topic.total}
                    </span>
                    <span className={`text-xs font-semibold ${getPerformanceColor((topic.correct / topic.total) * 100)}`}>
                      {Math.round((topic.correct / topic.total) * 100)}%
                    </span>
                  </div>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-1 mt-1">
                  <div 
                    className="bg-alarm-blue h-1 rounded-full" 
                    style={{ width: `${(topic.correct / topic.total) * 100}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderLSATStats = () => {
    const stats = sampleStats.lsat;
    
    return (
      <div className="space-y-6">
        {renderSectionStats('reading', stats.reading.overall, true)}
        {renderSectionStats('logical', stats.logical.overall, true)}
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
    <div className="min-h-screen pb-20">
      <div className="max-w-md mx-auto p-4">
        <h1 className="text-2xl font-bold text-alarm-black mb-6">
          {examType.toUpperCase()} Performance Stats
        </h1>
        
        {/* Stats Content */}
        <div className="space-y-4">
          {selectedSection === 'quantitative' ? (
            renderQuantitativeBreakdown()
          ) : selectedSection === 'verbal' ? (
            renderVerbalBreakdown()
          ) : selectedSection === 'data' ? (
            renderDataBreakdown()
          ) : selectedSection === 'reading' ? (
            renderLSATReadingBreakdown()
          ) : selectedSection === 'logical' ? (
            renderLSATLogicalBreakdown()
          ) : (
            examType === 'gmat' ? renderGMATStats() : renderLSATStats()
          )}
        </div>
      </div>
      
      <BottomNav />
    </div>
  );
} 