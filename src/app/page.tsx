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
  const [selectedQuestionType, setSelectedQuestionType] = useState("quantitative");
  const [selectedRingtone, setSelectedRingtone] = useState("default");
  const [examType, setExamType] = useState<"GMAT" | "LSAT" | null>(null); // Track user's exam choice

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

  const ringtones = [
    { id: "default", name: "Default" },
    { id: "gentle", name: "Gentle Wake" },
    { id: "energetic", name: "Energetic" },
    { id: "nature", name: "Nature Sounds" },
    { id: "classical", name: "Classical" }
  ];

  const handleExamSelection = (exam: "GMAT" | "LSAT") => {
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

  const handleSetAlarm = () => {
    // In a real app, this would save to a database
    console.log(`Alarm set for ${selectedTime} with question: ${selectedQuestion.question}`);
    console.log(`Days: ${selectedDays.map((day, index) => day ? daysOfWeek[index] : '').filter(day => day).join(', ')}`);
    console.log(`Question type: ${selectedQuestionType}`);
    console.log(`Ringtone: ${selectedRingtone}`);
    setShowAlarmModal(false);
  };

  useEffect(() => {
    // Check localStorage for existing exam selection
    // const storedExamType = localStorage.getItem('examType');
    // if (storedExamType) {
    //   setExamType(storedExamType as "GMAT" | "LSAT");
    //   setSelectedQuestionType(storedExamType === "GMAT" ? "quantitative" : "reading");
    //   setShowOnboardingModal(false);
    // }
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 pb-16">
      <main className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Alarm Prep</h1>
          <p className="text-lg text-gray-600">Start your day preparing for your future!</p>
        </div>

        {/* Alarms Tab and Create Icon */}
        <div className="text-center mb-12">
          <h2 className="text-2xl font-semibold text-gray-900 mb-3">Alarms</h2>
          <button 
            onClick={() => setShowAlarmModal(true)}
            className="w-16 h-16 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors flex items-center justify-center shadow-lg mx-auto"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </button>
        </div>

        {/* Today's Schedule */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <h3 className="font-medium">Morning Quiz Alarm</h3>
                <p className="text-gray-600">6:00 AM</p>
                <p className="text-sm text-gray-500">Question: {sampleQuestions[0].question}</p>
              </div>
              <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">Active</span>
            </div>
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <h3 className="font-medium">Evening Quiz Alarm</h3>
                <p className="text-gray-600">10:00 PM</p>
                <p className="text-sm text-gray-500">Question: {sampleQuestions[1].question}</p>
              </div>
              <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">Active</span>
            </div>
          </div>
        </div>

        {/* Onboarding Modal */}
        {showOnboardingModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg p-8 max-w-md w-full text-center">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Welcome to Alarm Prep!</h2>
              <p className="text-lg text-gray-600 mb-8">Which exam are you studying for?</p>
              <div className="space-y-4">
                <button
                  onClick={() => handleExamSelection("GMAT")}
                  className="w-full p-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-lg font-medium"
                >
                  GMAT
                </button>
                <button
                  onClick={() => handleExamSelection("LSAT")}
                  className="w-full p-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-lg font-medium"
                >
                  LSAT
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Set Alarm Modal */}
        {showAlarmModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
              <h2 className="text-2xl font-bold mb-6">Create New Alarm</h2>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Alarm Time
                  </label>
                  <input
                    type="time"
                    value={selectedTime}
                    onChange={(e) => setSelectedTime(e.target.value)}
                    className="w-full p-3 border rounded-lg text-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Days of the Week
                  </label>
                  <div className="flex space-x-2">
                    {selectedDays.map((day, index) => (
                      <button
                        key={index}
                        onClick={() => handleDayToggle(index)}
                        className={`w-10 h-10 rounded-full font-medium ${
                          day ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
                        } hover:bg-blue-100 transition-colors`}
                      >
                        {daysOfWeek[index]}
                      </button>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500 mt-2">Click to unselect days</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {examType} Question Type
                  </label>
                  <select
                    value={selectedQuestionType}
                    onChange={(e) => setSelectedQuestionType(e.target.value)}
                    className="w-full p-3 border rounded-lg"
                  >
                    {questionTypes.map((type) => (
                      <option key={type.id} value={type.id}>
                        {type.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ringtone
                  </label>
                  <select
                    value={selectedRingtone}
                    onChange={(e) => setSelectedRingtone(e.target.value)}
                    className="w-full p-3 border rounded-lg"
                  >
                    {ringtones.map((ringtone) => (
                      <option key={ringtone.id} value={ringtone.id}>
                        {ringtone.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    onClick={() => setShowAlarmModal(false)}
                    className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSetAlarm}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Create Alarm
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
