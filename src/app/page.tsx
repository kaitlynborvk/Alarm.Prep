"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import BottomNav from '@/components/BottomNav';
import AlarmScreen from '@/components/AlarmScreen';
import AlarmPopup from '@/components/AlarmPopup';
import { dataService, Question } from '@/services/dataService';
import { IOSService } from '@/services/iosService';
import { alarmService, AlarmInstance } from '@/services/alarmService';

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
  const [isTestMode, setIsTestMode] = useState(false); // Track if we're in test mode
  const [showOnboardingModal, setShowOnboardingModal] = useState(true);
  const [selectedTime, setSelectedTime] = useState("06:00");
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDays, setSelectedDays] = useState([true, true, true, true, true, true, true]); // All days selected by default
  const [selectedQuestionType, setSelectedQuestionType] = useState("");
  const [selectedSubCategory, setSelectedSubCategory] = useState("Random");
  const [selectedRingtone, setSelectedRingtone] = useState("default");
  const [examType, setExamType] = useState<"GMAT" | "LSAT" | null>(null); // Track user's exam choice
  const [selectedDifficulty, setSelectedDifficulty] = useState("easy"); // Track difficulty selection
  const [userAlarms, setUserAlarms] = useState<any[]>([]); // Store user's created alarms
  const [showDeleteModal, setShowDeleteModal] = useState(false); // Show delete confirmation modal
  const [alarmToDelete, setAlarmToDelete] = useState<number | null>(null); // Track which alarm to delete
  
  // Alarm system state
  const [activeAlarm, setActiveAlarm] = useState<AlarmInstance | null>(null);
  const [showAlarmScreen, setShowAlarmScreen] = useState(false);
  const [showAlarmPopup, setShowAlarmPopup] = useState(false);

  const daysOfWeek = ["S", "M", "T", "W", "T", "F", "S"];

  // Load questions on component mount
  useEffect(() => {
    const loadQuestions = async () => {
      setIsLoading(true);
      try {
        const loadedQuestions = await dataService.getQuestions();
        setQuestions(loadedQuestions);
        if (loadedQuestions.length > 0) {
          setSelectedQuestion(loadedQuestions[0]);
        }
      } catch (error) {
        console.error('Failed to load questions:', error);
      } finally {
        setIsLoading(false);
      }
    };

    const initializeAlarmSystem = async () => {
      try {
        // Initialize alarm service
        await alarmService.initialize();
        console.log('Alarm service initialized');
        
        // Load existing alarms
        const existingAlarms = alarmService.getAlarms();
        setUserAlarms(existingAlarms);
        
        // Load any active alarms
        await alarmService.loadActiveAlarms();
      } catch (error) {
        console.error('Failed to initialize alarm system:', error);
      }
    };

    loadQuestions();
    initializeAlarmSystem();
    
    // Set up iOS notification handlers
    IOSService.setupNotificationHandlers((notification) => {
      // Handle alarm notification tap
      console.log('Alarm triggered:', notification);
    });

    // Set up alarm event listeners
    const handleAlarmTriggered = (event: CustomEvent) => {
      console.log('Alarm triggered event:', event.detail);
      setActiveAlarm(event.detail);
      setShowAlarmPopup(true);
    };

    const handleAlarmDismissed = (event: CustomEvent) => {
      console.log('Alarm dismissed event:', event.detail);
      setActiveAlarm(null);
      setShowAlarmScreen(false);
      setShowAlarmPopup(false);
    };

    // Add event listeners
    window.addEventListener('alarmTriggered', handleAlarmTriggered as EventListener);
    window.addEventListener('alarmDismissed', handleAlarmDismissed as EventListener);

    // Cleanup
    return () => {
      window.removeEventListener('alarmTriggered', handleAlarmTriggered as EventListener);
      window.removeEventListener('alarmDismissed', handleAlarmDismissed as EventListener);
    };
  }, []);
  
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
    quantitative: [
      "Linear and Quadratic Equations", 
      "Properties of Numbers", 
      "Roots and Exponents", 
      "Inequalities and Absolute Values", 
      "Unit Conversions", 
      "Time/Distance/Rate Problems", 
      "Work Problems", 
      "Ratios", 
      "Percents", 
      "Overlapping Sets", 
      "Combinations and Permutations", 
      "Probability", 
      "GMAT Geometry", 
      "Functions and Sequences"
    ],
    verbal: ["Main Idea", "Primary Purpose", "Inference", "Detail", "Function/Purpose of Sentence or Paragraph", "Strengthen/Weaken", "Author's Tone or Attitude", "Logical Structure or Flow", "Evaluate or Resolve Discrepancy"],
    data: ["Table Analysis", "Graphics Interpretation", "Two-Part Analysis", "Multi-Source Reasoning", "Data Sufficiency (non-quantitative)"],
    reading: ["Main Point", "Primary Purpose", "Author's Attitude/Tone", "Passage Organization", "Specific Detail", "Inference", "Function", "Analogy", "Application", "Strengthen/Weaken", "Comparative Reading"],
    logical: ["Assumption (Necessary)", "Assumption (Sufficient)", "Strengthen", "Weaken", "Flaw", "Inference", "Must Be True", "Most Strongly Supported", "Principle (Apply)", "Principle (Identify)", "Parallel Reasoning", "Parallel Flaw", "Resolve the Paradox", "Main Point", "Method of Reasoning", "Role in Argument", "Point at Issue", "Argument Evaluation"],
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

  const handleAlarmToggle = async (alarmId: number) => {
    try {
      const alarm = userAlarms.find(a => a.id === alarmId);
      if (alarm) {
        await alarmService.updateAlarm(alarmId, { isActive: !alarm.isActive });
        setUserAlarms(prevAlarms => 
          prevAlarms.map(alarm => 
            alarm.id === alarmId 
              ? { ...alarm, isActive: !alarm.isActive }
              : alarm
          )
        );
      }
    } catch (error) {
      console.error('Failed to toggle alarm:', error);
    }
  };

  const handleDeleteClick = (alarmId: number) => {
    setAlarmToDelete(alarmId);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (alarmToDelete) {
      try {
        await alarmService.deleteAlarm(alarmToDelete);
        setUserAlarms(prevAlarms => prevAlarms.filter(alarm => alarm.id !== alarmToDelete));
        setShowDeleteModal(false);
        setAlarmToDelete(null);
      } catch (error) {
        console.error('Failed to delete alarm:', error);
      }
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteModal(false);
    setAlarmToDelete(null);
  };

  const handleSetAlarm = async () => {
    if (!examType || !selectedQuestionType) {
      console.error('Missing exam type or question type');
      return;
    }

    try {
      if (isTestMode) {
        // Test mode: Show alarm screen immediately with a question
        console.log('Test mode: Creating immediate alarm with current selections');
        console.log('User selections:', {
          examType,
          selectedQuestionType,
          selectedDifficulty
        });

        // Validate required fields
        if (!examType) {
          console.error('Missing examType for test mode');
          alert('Please select an exam type first (GMAT or LSAT)');
          return;
        }

        if (!selectedQuestionType) {
          console.error('Missing selectedQuestionType for test mode');
          alert('Please select a question type');
          return;
        }
        
        // Build filter based on user selections
        const filter: any = {
          exam: examType
        };
        
        // Only add type filter if a specific type is selected (not "random")
        if (selectedQuestionType && selectedQuestionType !== 'random') {
          filter.type = selectedQuestionType;
        }
        
        // Only add difficulty filter if a specific difficulty is selected
        if (selectedDifficulty && selectedDifficulty !== 'random') {
          filter.difficulty = selectedDifficulty;
        }
        
        // Add subcategory filter - "Random" means include all subcategories
        filter.subcategory = selectedSubCategory;
        
        console.log('Test mode filter:', filter);
        
        // Get a test question with the user's current selections
        console.log('About to call dataService.getRandomQuestion with filter:', filter);
        let testQuestion = await dataService.getRandomQuestion(filter);
        console.log('getRandomQuestion returned:', testQuestion ? { id: testQuestion.id, exam: testQuestion.exam, type: testQuestion.type } : 'null');

        // If no question found with full filter, try with just exam type
        if (!testQuestion && filter.type) {
          console.log('No question found with type filter, trying with just exam...');
          const fallbackFilter = { exam: filter.exam };
          testQuestion = await dataService.getRandomQuestion(fallbackFilter);
          console.log('Fallback question:', testQuestion ? { id: testQuestion.id, exam: testQuestion.exam, type: testQuestion.type } : 'null');
        }

        // If still no question, try without any filter
        if (!testQuestion) {
          console.log('No question found with exam filter, trying without any filter...');
          testQuestion = await dataService.getRandomQuestion();
          console.log('No-filter question:', testQuestion ? { id: testQuestion.id, exam: testQuestion.exam, type: testQuestion.type } : 'null');
        }

        if (testQuestion) {
          const testAlarmInstance: AlarmInstance = {
            alarmId: 9999, // Test alarm ID
            scheduledTime: new Date(),
            originalAlarmTime: selectedTime, // Add the original alarm time
            question: testQuestion,
            isActive: true
          };

          console.log('Test mode: Creating alarm instance:', testAlarmInstance);

          // Add to alarm service's active alarms for proper validation
          alarmService.addTestAlarmInstance(testAlarmInstance);

          setActiveAlarm(testAlarmInstance);
          setShowAlarmPopup(true);  // Show popup first, not screen directly
          setShowAlarmModal(false);
          setIsTestMode(false); // Reset test mode
          
          console.log('Test alarm popup should now be visible');
        } else {
          console.error('No test question found');
          console.error('Debug info:', {
            examType,
            selectedQuestionType,
            selectedDifficulty,
            filter,
            isOnline: navigator.onLine
          });
          
          // Try to get all questions without filter to see what's available
          const allQuestions = await dataService.getQuestions();
          console.error('Available questions:', allQuestions.length);
          console.error('Sample questions:', allQuestions.slice(0, 3).map(q => ({
            id: q.id,
            exam: q.exam,
            type: q.type,
            difficulty: q.difficulty
          })));
          
          alert('No test question found with the selected criteria. Check console for details.');
        }
        
        return;
      }

      // Normal mode: Create actual alarm
      // Create alarm using alarmService
      const alarmId = await alarmService.createAlarm({
        time: selectedTime,
        days: selectedDays,
        examType: examType,
        questionType: selectedQuestionType,
        subcategory: selectedSubCategory, // Pass the subcategory preference ("Random" or specific)
        difficulty: selectedDifficulty as 'easy' | 'intermediate' | 'hard',
        isActive: true
      });

      // Create display object for UI
      const newAlarm = {
        id: alarmId,
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

      // Add to user alarms for display
      setUserAlarms(prevAlarms => [...prevAlarms, newAlarm]);

      console.log('New alarm created:', newAlarm);
      console.log(`Alarm set for ${selectedTime} with question type: ${selectedQuestionType}`);
      console.log(`Sub-category: ${selectedSubCategory}`);
      console.log(`Days: ${selectedDays.map((day, index) => day ? daysOfWeek[index] : '').filter(day => day).join(', ')}`);
      console.log(`Difficulty: ${selectedDifficulty}`);
      
      setShowAlarmModal(false);
    } catch (error) {
      console.error('Failed to create alarm:', error);
    }
  };

  // Test function to open alarm modal in test mode
  const handleTestAlarm = () => {
    console.log('Opening alarm modal in test mode');
    console.log('Current state:', {
      examType,
      selectedQuestionType,
      selectedDifficulty
    });
    
    setIsTestMode(true);
    
    // Set defaults for test mode if nothing is selected
    if (!selectedQuestionType && examType) {
      const defaultType = examType === "GMAT" ? "quantitative" : "reading";
      console.log('Setting default question type:', defaultType);
      setSelectedQuestionType(defaultType);
    }
    if (!selectedDifficulty) {
      console.log('Setting default difficulty: easy');
      setSelectedDifficulty("easy");
    }
    
    setShowAlarmModal(true);
  };

  // Test function to schedule a real notification (iOS testing)
  const handleTestNotification = async () => {
    try {
      await alarmService.scheduleTestAlarm(10); // 10 seconds from now
      alert('Test notification scheduled for 10 seconds from now. Put the app in background to test!');
    } catch (error) {
      console.error('Failed to schedule test notification:', error);
      alert('Failed to schedule test notification. Check console for details.');
    }
  };

  // Test function to immediately trigger a web alarm
  const handleTestWebAlarm = async () => {
    try {
      console.log('=== Testing web alarm ===');
      console.log('Current settings:', {
        examType,
        selectedQuestionType,
        selectedSubCategory,
        selectedDifficulty
      });

      if (!examType || !selectedQuestionType) {
        alert('Please select exam type and question type first!');
        return;
      }

      // Test question fetching first
      console.log('Testing question fetch...');
      const testFilter = {
        exam: examType,
        type: selectedQuestionType,
        subcategory: selectedSubCategory === 'Random' ? undefined : selectedSubCategory,
        difficulty: selectedDifficulty
      };
      console.log('Test filter:', testFilter);
      
      const testQuestion = await dataService.getRandomQuestion(testFilter);
      console.log('Test question result:', testQuestion);
      
      if (!testQuestion) {
        console.log('No question found with current criteria. Trying broader search...');
        const broadFilter = { exam: examType };
        const broadQuestion = await dataService.getRandomQuestion(broadFilter);
        console.log('Broad search result:', broadQuestion);
        
        if (!broadQuestion) {
          alert('No questions available in database! Please add questions through the admin panel first.');
          return;
        }
      }

      // Create a test alarm config
      const testAlarmConfig = {
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }), // Current time in HH:MM format
        days: [true, true, true, true, true, true, true], // All days
        examType,
        questionType: selectedQuestionType,
        subcategory: selectedSubCategory,
        difficulty: selectedDifficulty as 'easy' | 'intermediate' | 'hard',
        isActive: true,
        name: 'Test Alarm'
      };

      console.log('Triggering test alarm with config:', testAlarmConfig);

      // Directly trigger the web alarm
      await alarmService.triggerTestWebAlarm(testAlarmConfig);
      
    } catch (error) {
      console.error('Error in handleTestWebAlarm:', error);
      alert('Failed to trigger test alarm. Error: ' + error.message);
    }
  };

  // Handler for when user wants to answer the question from the popup
  const handleAnswerQuestion = () => {
    console.log('User selected "Answer Question" - switching to question screen');
    setShowAlarmPopup(false);
    setShowAlarmScreen(true);
    // The alarm sound should stop when the question screen is shown (handled by AlarmScreen component)
  };

  // Handler for dismissing the alarm popup
  const handleDismissPopup = () => {
    console.log('User dismissed alarm popup');
    setShowAlarmPopup(false);
    setActiveAlarm(null);
    // This should also stop the alarm sound
    if (activeAlarm) {
      alarmService.dismissAlarm(activeAlarm.alarmId);
    }
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
      setSelectedSubCategory("Random");
    }
  }, [selectedQuestionType]);

  console.log('Current examType:', examType); // DEBUG LOG
  console.log('Available questionTypes:', questionTypes); // DEBUG LOG

  return (
    <div className="min-h-screen pb-16">
      <main className="max-w-md mx-auto p-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-alarm-black mb-3">Alarm Prep</h1>
          <p className="text-xl text-white font-semibold" style={{textShadow: '2px 2px 4px rgba(0,0,0,0.8), -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000'}}>Your daily dose of exam readiness.</p>
        </div>

        {/* Create Icon and Test Buttons */}
        <div className="text-center mb-8">
          {/* Test Buttons - Only show in development */}
          {(process.env.NODE_ENV === 'development' || !process.env.NODE_ENV) && (
            <div className="flex justify-center space-x-3 mt-4">
              <button 
                onClick={handleTestAlarm}
                className="px-4 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm font-medium"
                title="Test question preview with current settings"
              >
                Test Question
              </button>
              <button 
                onClick={handleTestNotification}
                className="px-4 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors text-sm font-medium"
                title="Test iOS notification (10 seconds)"
              >
                Test Notification
              </button>
              <button 
                onClick={handleTestWebAlarm}
                className="px-4 py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors text-sm font-medium"
                title="Test web alarm immediately"
              >
                Test Web Alarm
              </button>
            </div>
          )}
        </div>

        {/* Alarms List */}
        {userAlarms.length === 0 ? (
          <div className="text-center py-12 px-6 bg-white rounded-lg border border-alarm-black/10">
            <h2 className="text-4xl font-bold text-alarm-black mb-6">Alarms</h2>
            <p className="text-gray-500 text-lg">No alarms set.</p>
            <p className="text-gray-400 text-base mt-2">Tap the '+' button to create a new alarm.</p>
          </div>
        ) : (
          <div className="space-y-4">
            <h2 className="text-4xl font-bold text-alarm-black mb-6 text-center">Alarms</h2>
            {userAlarms.map((alarm) => {
              const isOneTime = !alarm.days.some((day: boolean) => day);

              const testSectionName = alarm.questionType.charAt(0).toUpperCase() + alarm.questionType.slice(1);
              const subCategoryName = alarm.subCategory === 'Random' ? 'Random' : alarm.subCategory;
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
                        {(() => {
                          const [hours, minutes] = alarm.time.split(':');
                          const hour24 = parseInt(hours);
                          const hour12 = hour24 === 0 ? 12 : hour24 > 12 ? hour24 - 12 : hour24;
                          const ampm = hour24 >= 12 ? 'PM' : 'AM';
                          return (
                            <>
                              <span className="text-4xl font-bold text-alarm-black leading-none">{hour12}:{minutes}</span>
                              <span className="text-lg font-medium text-gray-600 ml-1">{ampm}</span>
                            </>
                          );
                        })()}
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
            onClick={() => {
              setShowAlarmModal(false);
              setIsTestMode(false); // Reset test mode when closing
            }}
          >
            <div 
              className="flex items-start justify-center min-h-screen pt-12 px-4 pb-20"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="bg-white rounded-lg p-6 max-w-md w-full border border-alarm-black/10">
                <h2 className="text-2xl font-bold text-alarm-black mb-6 text-center">
                  {isTestMode ? 'Test Question Settings' : 'Set Alarm'}
                </h2>
                
                {isTestMode && (
                  <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-800 text-center">
                      Select your preferences to instantly preview a practice question without scheduling an alarm.
                    </p>
                  </div>
                )}
                
                <div className="space-y-6">
                  {!isTestMode && (
                    <>
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
                    </>
                  )}
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
                        <option key="Random" value="Random">Random</option>
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
                  {!isTestMode && (
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
                  )}
                </div>

                {/* Modal Actions */}
                <div className="flex justify-end space-x-4 mt-6 pt-4 border-t border-gray-200">
                  <button 
                    onClick={() => {
                      setShowAlarmModal(false);
                      setIsTestMode(false); // Reset test mode when canceling
                    }}
                    className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleSetAlarm}
                    className="px-6 py-2 bg-alarm-blue text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    {isTestMode ? 'Start Test' : 'Set Alarm'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
      
      {/* Floating Action Button - Add Alarm */}
      <button 
        onClick={() => {
          setShowAlarmModal(true);
          setSelectedQuestionType("");
        }}
        className="fixed bottom-24 right-6 w-16 h-16 bg-alarm-blue text-white rounded-full hover:bg-blue-700 transition-colors flex items-center justify-center shadow-lg z-40"
        title="Add new alarm"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
      </button>
      
      <BottomNav />
      
      {/* Alarm Popup - Shows first when alarm triggers */}
      {showAlarmPopup && activeAlarm && (
        <AlarmPopup 
          alarmInstance={activeAlarm}
          onAnswerQuestion={handleAnswerQuestion}
          onDismiss={handleDismissPopup}
        />
      )}
      
      {/* Alarm Screen Modal - Shows when user clicks "Answer Question" */}
      {showAlarmScreen && activeAlarm && (
        <AlarmScreen 
          alarmInstance={activeAlarm}
          isTestMode={isTestMode}
          onDismiss={() => {
            setShowAlarmScreen(false);
            setActiveAlarm(null);
          }}
        />
      )}
    </div>
  );
}
