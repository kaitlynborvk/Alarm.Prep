"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import BottomNav from '@/components/BottomNav';

// Sample questions - in a real app, this would come from a database
const sampleQuestions = [
  {
    id: 1,
    question: "What is the capital of France?",
    answer: "Paris"
  },
  {
    id: 2,
    question: "What is 2 + 2?",
    answer: "4"
  },
  {
    id: 3,
    question: "What is the largest planet in our solar system?",
    answer: "Jupiter"
  }
];

export default function Home() {
  const [showAlarmModal, setShowAlarmModal] = useState(false);
  const [showOnboardingModal, setShowOnboardingModal] = useState(true); // Show onboarding on first visit
  const [selectedTime, setSelectedTime] = useState("06:00");
  const [selectedQuestion, setSelectedQuestion] = useState(sampleQuestions[0]);
  const [selectedDays, setSelectedDays] = useState([true, true, true, true, true, true, true]); // All days selected by default
  const [selectedQuestionType, setSelectedQuestionType] = useState("");
  const [selectedSubCategory, setSelectedSubCategory] = useState("random");
  const [selectedRingtone, setSelectedRingtone] = useState("default");
  const [examType, setExamType] = useState<"GMAT" | "LSAT" | null>(null); // Track user's exam choice
  const [selectedDifficulty, setSelectedDifficulty] = useState("easy"); // Track difficulty selection
  const [userAlarms, setUserAlarms] = useState<any[]>([]); // Store user's created alarms
  const [showDeleteModal, setShowDeleteModal] = useState(false); // Show delete confirmation modal
  const [alarmToDelete, setAlarmToDelete] = useState<number | null>(null); // Track which alarm to delete

  const daysOfWeek = ["S", "M", "T", "W", "T", "F", "S"];
  
  const gmatQuestionTypes = [
    { id: "quantitative", name: "Quantitative Reasoning" },
    { id: "verbal", name: "Verbal Reasoning" },
    { id: "data", name: "Data Insights" }
  ];

  const lsatQuestionTypes = [
    { id: "reading", name: "Reading Comprehension" },
    { id: "logical", name: "Logical Reasoning" }
  ];

  const questionTypes = examType === "GMAT" ? gmatQuestionTypes : lsatQuestionTypes;

  const questionSubCategories = {
    quantitative: ["Random", "Algebra & Equations", "Arithmetic & Number Properties", "Word Problems & Math Logic", "Logic, Sets, and Counting"],
    verbal: ["Random", "Main Idea", "Primary Purpose", "Inference", "Detail", "Function/Purpose of Sentence or Paragraph", "Strengthen/Weaken", "Author's Tone or Attitude", "Logical Structure or Flow", "Evaluate or Resolve Discrepancy"],
    data: ["Random", "Table Analysis", "Graphics Interpretation", "Two-Part Analysis", "Multi-Source Reasoning", "Data Sufficiency (non-quantitative)"],
    reading: ["Random", "Main Point", "Primary Purpose", "Author's Attitude/Tone", "Passage Organization", "Specific Detail", "Inference", "Function", "Analogy", "Application", "Strengthen/Weaken", "Comparative Reading"],
    logical: ["Random", "Assumption (Necessary)", "Assumption (Sufficient)", "Strengthen", "Weaken", "Flaw", "Inference", "Must Be True", "Most Strongly Supported", "Principle (Apply)", "Principle (Identify)", "Parallel Reasoning", "Parallel Flaw", "Resolve the Paradox", "Main Point", "Method of Reasoning", "Role in Argument", "Point at Issue", "Argument Evaluation"],
  };

  const ringtones = [
    { id: "default", name: "Default" },
    { id: "gentle", name: "Gentle Wake" },
    { id: "energetic", name: "Energetic" },
    { id: "nature", name: "Nature Sounds" },
    { id: "classical", name: "Classical" }
  ];

  const difficulties = [
    { id: "easy", name: "Easy" },
    { id: "intermediate", name: "Intermediate" },
    { id: "hard", name: "Hard" }
  ];

  const handleExamSelection = (exam: "GMAT" | "LSAT") => {
    console.log('Exam selected:', exam); // DEBUG LOG
    setExamType(exam);
    setSelectedQuestionType(exam === "GMAT" ? "quantitative" : "reading");
    setShowOnboardingModal(false);
    // In a real app, this would be saved to localStorage or a database
    localStorage.setItem('examType', exam);
  };

  const handleDayToggle = (index: number) => {
    const newDays = [...selectedDays];
    newDays[index] = !newDays[index];
    setSelectedDays(newDays);
  };

  const handleAlarmToggle = (alarmId: number) => {
    setUserAlarms(prevAlarms => 
      prevAlarms.map(alarm => 
        alarm.id === alarmId 
          ? { ...alarm, isActive: !alarm.isActive }
          : alarm
      )
    );
  };

  const handleDeleteClick = (alarmId: number) => {
    setAlarmToDelete(alarmId);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = () => {
    if (alarmToDelete) {
      setUserAlarms(prevAlarms => prevAlarms.filter(alarm => alarm.id !== alarmToDelete));
      setShowDeleteModal(false);
      setAlarmToDelete(null);
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteModal(false);
    setAlarmToDelete(null);
  };

  const handleSetAlarm = () => {
    // Create new alarm object
    const newAlarm = {
      id: Date.now(), // Simple ID generation
      time: selectedTime,
      days: selectedDays,
      questionType: selectedQuestionType,
      subCategory: selectedSubCategory,
      difficulty: selectedDifficulty,
      ringtone: selectedRingtone,
      examType: examType,
      isActive: true,
      createdAt: new Date().toISOString()
    };

    // Add to user alarms
    setUserAlarms(prevAlarms => [...prevAlarms, newAlarm]);

    // In a real app, this would save to a database
    console.log('New alarm created:', newAlarm);
    console.log(`Alarm set for ${selectedTime} with question type: ${selectedQuestionType}`);
    console.log(`Sub-category: ${selectedSubCategory}`);
    console.log(`Days: ${selectedDays.map((day, index) => day ? daysOfWeek[index] : '').filter(day => day).join(', ')}`);
    console.log(`Difficulty: ${selectedDifficulty}`);
    console.log(`Ringtone: ${selectedRingtone}`);
    
    setShowAlarmModal(false);
  };

  useEffect(() => {
    const storedExamType = localStorage.getItem('examType');
    if (storedExamType === 'GMAT' || storedExamType === 'LSAT') {
      setExamType(storedExamType as "GMAT" | "LSAT");
      setSelectedQuestionType(storedExamType === "GMAT" ? "quantitative" : "reading");
      setShowOnboardingModal(false);
    } else {
      setShowOnboardingModal(true);
    }
  }, []); // Only run on mount

  useEffect(() => {
    if (selectedQuestionType) {
      setSelectedSubCategory("random");
    }
  }, [selectedQuestionType]);

  console.log('Current examType:', examType); // DEBUG LOG
  console.log('Available questionTypes:', questionTypes); // DEBUG LOG

  return (
    <div className="min-h-screen pb-16">
      <main className="max-w-md mx-auto p-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-alarm-black mb-2">Alarm Prep</h1>
          <p className="text-lg text-alarm-black/80">Your daily dose of exam readiness.</p>
        </div>

        {/* Alarms Tab and Create Icon */}
        <div className="text-center mb-12">
          <h2 className="text-2xl font-semibold text-alarm-black mb-3">Alarms</h2>
          <button 
            onClick={() => {
              setShowAlarmModal(true);
              setSelectedQuestionType("");
            }}
            className="w-16 h-16 bg-alarm-blue text-white rounded-full hover:bg-blue-700 transition-colors flex items-center justify-center shadow-lg mx-auto"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </button>
        </div>

        {/* Alarms List */}
        {userAlarms.length === 0 ? (
          <div className="text-center py-12 px-6 bg-white rounded-lg border border-alarm-black/10">
            <p className="text-gray-500">No alarms set.</p>
            <p className="text-gray-400 text-sm mt-2">Tap the '+' button to create a new alarm.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {userAlarms.map((alarm) => {
              const isOneTime = !alarm.days.some((day: boolean) => day);

              const testSectionName = alarm.questionType.charAt(0).toUpperCase() + alarm.questionType.slice(1);
              const subCategoryName = alarm.subCategory === 'random' ? 'Random' : alarm.subCategory;
              const difficultyName = alarm.difficulty.charAt(0).toUpperCase() + alarm.difficulty.slice(1);
              const alarmDetails = `${alarm.examType} ${testSectionName} - ${subCategoryName} - ${difficultyName}`;

              return (
                <div key={alarm.id} className="relative p-4 bg-white rounded-xl shadow-sm">
                  <div className="flex items-center justify-between">
                    {/* Left side content */}
                    <div className="flex-1 pr-4">
                      {/* Day display */}
                      <div className="text-xs mb-2">
                        {isOneTime ? (
                          <span className="font-medium text-gray-600">One-time</span>
                        ) : (
                          <div className="flex space-x-1.5">
                            {daysOfWeek.map((day, index) => (
                              <span key={index} className={alarm.days[index] ? 'font-bold text-alarm-black' : 'text-gray-400'}>
                                {day}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
    
                      {/* Time display */}
                      <div>
                        <span className="text-4xl font-bold text-alarm-black leading-none">{alarm.time}</span>
                        <span className="text-lg font-medium text-gray-600 ml-1">{parseInt(alarm.time.split(':')[0]) >= 12 ? 'PM' : 'AM'}</span>
                      </div>
    
                      {/* Other details */}
                      <div className="mt-2 h-12 flex items-center">
                        <div className="flex flex-wrap items-baseline font-medium text-alarm-black text-sm leading-tight">
                          <span>{alarm.examType} {testSectionName}</span>
                          <span className="mx-1 text-gray-500">-</span>
                          <span>{subCategoryName}</span>
                          <span className="mx-1 text-gray-500">-</span>
                          <span>{difficultyName}</span>
                        </div>
                      </div>
                    </div>
    
                    {/* Right side controls */}
                    <div className="flex flex-col items-center space-y-3">
                      <button
                        onClick={() => handleAlarmToggle(alarm.id)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                          alarm.isActive ? 'bg-alarm-blue' : 'bg-gray-300'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            alarm.isActive ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                      <button
                        onClick={() => handleDeleteClick(alarm.id)}
                        className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-full transition-colors"
                        title="Delete alarm"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Onboarding Modal */}
        {showOnboardingModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg p-8 max-w-md w-full text-center border border-alarm-black/10">
              <h2 className="text-3xl font-bold text-alarm-black mb-4">Welcome to Alarm Prep!</h2>
              <p className="text-lg text-gray-600 mb-8">Which exam are you studying for?</p>
              <div className="space-y-4">
                <button
                  onClick={() => handleExamSelection("GMAT")}
                  className="w-full p-4 bg-alarm-blue text-white rounded-lg hover:bg-blue-700 transition-colors text-lg font-medium"
                >
                  GMAT
                </button>
                <button
                  onClick={() => handleExamSelection("LSAT")}
                  className="w-full p-4 bg-alarm-blue text-white rounded-lg hover:bg-blue-700 transition-colors text-lg font-medium"
                >
                  LSAT
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg p-8 max-w-md w-full text-center border border-alarm-black/10">
              <h2 className="text-xl font-bold text-alarm-black mb-4">Confirm Delete</h2>
              <p className="text-gray-600 mb-8">Are you sure you want to delete this alarm?</p>
              <div className="flex justify-center space-x-4">
                <button 
                  onClick={handleCancelDelete}
                  className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleConfirmDelete}
                  className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Set Alarm Modal */}
        {showAlarmModal && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-50 overflow-y-auto"
            onClick={() => setShowAlarmModal(false)}
          >
            <div 
              className="flex items-start justify-center min-h-screen pt-12 px-4 pb-20"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="bg-white rounded-lg p-6 max-w-md w-full border border-alarm-black/10">
                <h2 className="text-2xl font-bold text-alarm-black mb-6 text-center">Set Alarm</h2>
                
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Time</label>
                    <div className="relative">
                      <input 
                        type="time"
                        value={selectedTime}
                        onChange={(e) => setSelectedTime(e.target.value)}
                        className="w-full p-3 bg-gray-100 border-gray-300 rounded-lg text-lg appearance-none focus:outline-none focus:ring-2 focus:ring-alarm-blue"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Days of the Week</label>
                    <div className="flex justify-between">
                      {daysOfWeek.map((day, index) => (
                        <button
                          key={index}
                          onClick={() => handleDayToggle(index)}
                          className={`w-10 h-10 rounded-full text-sm font-medium transition-colors ${
                            selectedDays[index]
                              ? 'bg-alarm-blue text-white'
                              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                          }`}
                        >
                          {day}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Test Section</label>
                    <div className="space-y-2">
                      {questionTypes.map((type) => (
                        <button
                          key={type.id}
                          onClick={() => {
                            console.log('Test Section selected:', type.id); // DEBUG LOG
                            setSelectedQuestionType(type.id);
                          }}
                          className={`w-full text-left p-3 rounded-lg font-medium transition-colors ${
                            selectedQuestionType === type.id
                              ? 'bg-alarm-blue text-white'
                              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                          }`}
                        >
                          {type.name}
                        </button>
                      ))}
                    </div>
                  </div>
                  {selectedQuestionType && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Question Type</label>
                      <select
                        value={selectedSubCategory}
                        onChange={(e) => setSelectedSubCategory(e.target.value)}
                        className="w-full p-3 bg-gray-100 border-gray-300 rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-alarm-blue"
                      >
                        {questionSubCategories[selectedQuestionType as keyof typeof questionSubCategories]?.map((subCategory) => (
                          <option key={subCategory} value={subCategory}>{subCategory}</option>
                        ))}
                      </select>
                    </div>
                  )}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Difficulty</label>
                    <div className="flex space-x-2">
                      {difficulties.map((difficulty) => (
                        <button
                          key={difficulty.id}
                          onClick={() => setSelectedDifficulty(difficulty.id)}
                          className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                            selectedDifficulty === difficulty.id
                              ? 'bg-alarm-blue text-white'
                              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                          }`}
                        >
                          {difficulty.name}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Ringtone</label>
                    <select
                      value={selectedRingtone}
                      onChange={(e) => setSelectedRingtone(e.target.value)}
                      className="w-full p-3 bg-gray-100 border-gray-300 rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-alarm-blue"
                    >
                      {ringtones.map((ringtone) => (
                        <option key={ringtone.id} value={ringtone.id}>{ringtone.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Modal Actions */}
                <div className="flex justify-end space-x-4 mt-6 pt-4 border-t border-gray-200">
                  <button 
                    onClick={() => setShowAlarmModal(false)}
                    className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleSetAlarm}
                    className="px-6 py-2 bg-alarm-blue text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Set Alarm
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
      
      <BottomNav />
    </div>
  );
}
 