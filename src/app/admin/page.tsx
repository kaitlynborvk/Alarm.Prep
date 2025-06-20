"use client";

import { useState } from "react";

const QUESTION_TYPES = ["Math", "Reading", "Science", "Other"];

type Question = {
  id: number;
  text: string;
  type: string;
  correctAnswer: string;
  choices: string[];
};

export default function AdminPage() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [filter, setFilter] = useState<string>("");
  const [text, setText] = useState("");
  const [type, setType] = useState(QUESTION_TYPES[0]);
  const [correctAnswer, setCorrectAnswer] = useState("");
  const [choices, setChoices] = useState(["", "", "", "", ""]);

  // Add question handler
  const addQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || !correctAnswer.trim()) return;
    
    // Validate that all choices are filled
    if (choices.some(choice => !choice.trim())) {
      alert("Please fill in all 5 answer choices");
      return;
    }

    setQuestions([
      ...questions,
      { 
        id: Date.now(), 
        text: text.trim(), 
        type,
        correctAnswer: correctAnswer.trim(),
        choices: [...choices]
      },
    ]);
    
    // Reset form
    setText("");
    setType(QUESTION_TYPES[0]);
    setCorrectAnswer("");
    setChoices(["", "", "", "", ""]);
  };

  // Update choice at specific index
  const updateChoice = (index: number, value: string) => {
    const newChoices = [...choices];
    newChoices[index] = value;
    setChoices(newChoices);
  };

  // Delete question
  const deleteQuestion = (id: number) => {
    setQuestions(questions.filter(q => q.id !== id));
  };

  // Filtered questions
  const displayedQuestions = filter
    ? questions.filter((q) => q.type === filter)
    : questions;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Admin: Manage Questions</h1>
      
      {/* Add Question Form */}
      <form onSubmit={addQuestion} className="mb-6 bg-gray-50 p-4 rounded shadow">
        <div className="grid grid-cols-1 gap-4">
          {/* Question Type */}
          <div>
            <label className="font-semibold block mb-2">Question Type</label>
            <select
              className="border p-2 rounded w-full"
              value={type}
              onChange={(e) => setType(e.target.value)}
            >
              {QUESTION_TYPES.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          {/* Question Text */}
          <div>
            <label className="font-semibold block mb-2">Question Text</label>
            <textarea
              className="border p-2 rounded w-full h-24 resize-none"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Enter your question here..."
              required
            />
          </div>

          {/* Correct Answer (First Choice) */}
          <div>
            <label className="font-semibold block mb-2 text-green-700">
              Correct Answer (Choice 1)
            </label>
            <input
              className="border p-2 rounded w-full border-green-300 bg-green-50"
              value={correctAnswer}
              onChange={(e) => setCorrectAnswer(e.target.value)}
              placeholder="Enter the correct answer..."
              required
            />
          </div>

          {/* Other Choices */}
          <div>
            <label className="font-semibold block mb-2">Other Choices</label>
            <div className="grid grid-cols-1 gap-2">
              {choices.slice(1).map((choice, index) => (
                <input
                  key={index + 1}
                  className="border p-2 rounded"
                  value={choice}
                  onChange={(e) => updateChoice(index + 1, e.target.value)}
                  placeholder={`Choice ${index + 2}...`}
                  required
                />
              ))}
            </div>
          </div>

          <button 
            type="submit" 
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Add Question
          </button>
        </div>
      </form>

      {/* Filter by Type */}
      <div className="mb-4 flex items-center gap-2">
        <span className="font-semibold">Filter by type:</span>
        <select
          className="border p-2 rounded"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        >
          <option value="">All</option>
          {QUESTION_TYPES.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
      </div>

      {/* Questions List */}
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border rounded">
          <thead>
            <tr>
              <th className="py-2 px-4 border-b">Question</th>
              <th className="py-2 px-4 border-b">Type</th>
              <th className="py-2 px-4 border-b">Correct Answer</th>
              <th className="py-2 px-4 border-b">All Choices</th>
              <th className="py-2 px-4 border-b">Actions</th>
            </tr>
          </thead>
          <tbody>
            {displayedQuestions.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-4 text-gray-500">
                  No questions found. Add some questions above!
                </td>
              </tr>
            ) : (
              displayedQuestions.map((q) => (
                <tr key={q.id}>
                  <td className="py-2 px-4 border-b max-w-xs">{q.text}</td>
                  <td className="py-2 px-4 border-b">{q.type}</td>
                  <td className="py-2 px-4 border-b text-green-700 font-semibold">
                    {q.correctAnswer}
                  </td>
                  <td className="py-2 px-4 border-b">
                    <div className="text-sm">
                      {q.choices.map((choice, index) => (
                        <div key={index} className={index === 0 ? "text-green-700 font-semibold" : ""}>
                          {index + 1}. {choice}
                        </div>
                      ))}
                    </div>
                  </td>
                  <td className="py-2 px-4 border-b">
                    <button
                      onClick={() => deleteQuestion(q.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
} 