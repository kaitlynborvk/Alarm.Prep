"use client";

import { useState, useEffect } from "react";

const EXAMS = ["GMAT", "LSAT"] as const;
const QUESTION_TYPES = {
  GMAT: [
    { id: "quantitative", name: "Quantitative Reasoning" },
    { id: "verbal", name: "Verbal Reasoning" },
    { id: "data", name: "Data Insights" },
  ],
  LSAT: [
    { id: "reading", name: "Reading Comprehension" },
    { id: "logical", name: "Logical Reasoning" },
  ],
} as const;
const QUESTION_SUBCATEGORIES = {
  quantitative: ["Random", "Algebra & Equations", "Arithmetic & Number Properties", "Word Problems & Math Logic", "Logic, Sets, and Counting"],
  verbal: ["Random", "Main Idea", "Primary Purpose", "Inference", "Detail", "Function/Purpose of Sentence or Paragraph", "Strengthen/Weaken", "Author's Tone or Attitude", "Logical Structure or Flow", "Evaluate or Resolve Discrepancy"],
  data: ["Random", "Table Analysis", "Graphics Interpretation", "Two-Part Analysis", "Multi-Source Reasoning", "Data Sufficiency (non-quantitative)"],
  reading: ["Random", "Main Point", "Primary Purpose", "Author's Attitude/Tone", "Passage Organization", "Specific Detail", "Inference", "Function", "Analogy", "Application", "Strengthen/Weaken", "Comparative Reading"],
  logical: ["Random", "Assumption (Necessary)", "Assumption (Sufficient)", "Strengthen", "Weaken", "Flaw", "Inference", "Must Be True", "Most Strongly Supported", "Principle (Apply)", "Principle (Identify)", "Parallel Reasoning", "Parallel Flaw", "Resolve the Paradox", "Main Point", "Method of Reasoning", "Role in Argument", "Point at Issue", "Argument Evaluation"],
} as const;
const DIFFICULTIES = [
  { id: "easy", name: "Easy" },
  { id: "intermediate", name: "Intermediate" },
  { id: "hard", name: "Hard" },
] as const;

type QuestionTypeID = typeof QUESTION_TYPES[keyof typeof QUESTION_TYPES][number]['id'];
type Subcategory = typeof QUESTION_SUBCATEGORIES[keyof typeof QUESTION_SUBCATEGORIES][number];
type DifficultyID = typeof DIFFICULTIES[number]['id'];

type Question = {
  id: number;
  exam: string;
  type: string;
  subcategory: string;
  text: string;
  correctAnswer: string;
  choices: string[];
  difficulty: string;
  explanation?: string;
  createdAt?: string;
  updatedAt?: string;
};

export default function AdminPage() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [filter, setFilter] = useState<string>("");
  const [exam, setExam] = useState<keyof typeof QUESTION_TYPES>(EXAMS[0]);
  const [type, setType] = useState<QuestionTypeID>(QUESTION_TYPES[EXAMS[0]][0].id);
  const [subcategory, setSubcategory] = useState<Subcategory>(
    QUESTION_SUBCATEGORIES[QUESTION_TYPES[EXAMS[0]][0].id][0]
  );
  const [text, setText] = useState("");
  const [correctAnswer, setCorrectAnswer] = useState("");
  const [choices, setChoices] = useState(["", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [difficulty, setDifficulty] = useState<DifficultyID>(DIFFICULTIES[0].id);
  const [difficultyFilter, setDifficultyFilter] = useState("");
  const [explanation, setExplanation] = useState("");

  // Fetch questions from API
  const fetchQuestions = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/questions");
      if (!res.ok) throw new Error("Failed to fetch questions");
      const data = await res.json();
      setQuestions(data);
    } catch (err: any) {
      setError(err.message || "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, []);

  // Update type and subcategory when exam changes
  const handleExamChange = (newExam: string) => {
    const examKey = newExam as keyof typeof QUESTION_TYPES;
    setExam(examKey);
    const firstType = QUESTION_TYPES[examKey][0].id;
    setType(firstType);
    setSubcategory(QUESTION_SUBCATEGORIES[firstType][0]);
  };

  // Update subcategory when type changes
  const handleTypeChange = (newType: string) => {
    setType(newType as QuestionTypeID);
    setSubcategory(QUESTION_SUBCATEGORIES[newType as keyof typeof QUESTION_SUBCATEGORIES][0]);
  };

  // Add question handler (POST to API)
  const addQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    const allChoices = [correctAnswer, ...choices.slice(1)];
    if (allChoices.some(choice => !choice.trim())) {
      alert("Please fill in all 5 answer choices");
      return;
    }
    console.log('Submitting question with difficulty:', difficulty);
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          exam,
          type,
          subcategory,
          text: text.trim(),
          correctAnswer: correctAnswer.trim(),
          choices: allChoices,
          difficulty,
          explanation: explanation.trim(),
        }),
      });
      if (!res.ok) throw new Error("Failed to add question");
      await fetchQuestions();
      setText("");
      setExam(EXAMS[0]);
      setType(QUESTION_TYPES[EXAMS[0]][0].id);
      setSubcategory(QUESTION_SUBCATEGORIES[QUESTION_TYPES[EXAMS[0]][0].id][0]);
      setCorrectAnswer("");
      setChoices(["", "", "", "", ""]);
      setDifficulty(DIFFICULTIES[0].id);
      setExplanation("");
    } catch (err: any) {
      setError(err.message || "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  // Update choice at specific index
  const updateChoice = (index: number, value: string) => {
    const newChoices = [...choices];
    newChoices[index] = value;
    setChoices(newChoices);
  };

  // Delete question
  const deleteQuestion = async (id: number) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/questions", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (!res.ok) throw new Error("Failed to delete question");
      await fetchQuestions();
    } catch (err: any) {
      setError(err.message || "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  // Filtered questions
  const displayedQuestions = questions.filter((q) => {
    const typeMatch = !filter || q.type === filter;
    const difficultyMatch = !difficultyFilter || q.difficulty === difficultyFilter;
    return typeMatch && difficultyMatch;
  });

  return (
    <div className="p-6 max-w-4xl mx-auto text-gray-900">
      <h1 className="text-2xl font-bold mb-4 text-gray-900">Admin: Manage Questions</h1>
      {loading && <div className="mb-4 text-blue-600">Loading...</div>}
      {error && <div className="mb-4 text-red-600">{error}</div>}
      
      {/* Add Question Form */}
      <form onSubmit={addQuestion} className="mb-6 bg-gray-50 p-4 rounded shadow">
        <div className="grid grid-cols-1 gap-4">
          {/* Exam Selection */}
          <div>
            <label className="font-semibold block mb-2 text-gray-900">Exam</label>
            <select
              className="border p-2 rounded w-full text-gray-900"
              value={exam}
              onChange={(e) => handleExamChange(e.target.value)}
            >
              {EXAMS.map((ex) => (
                <option key={ex} value={ex}>{ex}</option>
              ))}
            </select>
          </div>
          {/* Question Type Selection */}
          <div>
            <label className="font-semibold block mb-2 text-gray-900">Question Type</label>
            <select
              className="border p-2 rounded w-full text-gray-900"
              value={type}
              onChange={(e) => handleTypeChange(e.target.value)}
            >
              {QUESTION_TYPES[exam as keyof typeof QUESTION_TYPES].map((t) => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
          </div>
          {/* Subcategory Selection */}
          <div>
            <label className="font-semibold block mb-2 text-gray-900">Subcategory</label>
            <select
              className="border p-2 rounded w-full text-gray-900"
              value={subcategory}
              onChange={(e) => setSubcategory(e.target.value as Subcategory)}
            >
              {QUESTION_SUBCATEGORIES[type].map((sub) => (
                <option key={sub} value={sub}>{sub}</option>
              ))}
            </select>
          </div>
          {/* Difficulty Selection */}
          <div>
            <label className="font-semibold block mb-2 text-gray-900">Difficulty</label>
            <select
              className="border p-2 rounded w-full text-gray-900"
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value as DifficultyID)}
            >
              {DIFFICULTIES.map((d) => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
          </div>
          {/* Question Text */}
          <div>
            <label className="font-semibold block mb-2 text-gray-900">Question Text</label>
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
            <label className="font-semibold block mb-2 text-green-700 text-gray-900">
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
            <label className="font-semibold block mb-2 text-gray-900">Other Choices</label>
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
          {/* Explanation */}
          <div>
            <label className="font-semibold block mb-2 text-gray-900">Explanation</label>
            <textarea
              className="border p-2 rounded w-full h-24 resize-none"
              value={explanation}
              onChange={(e) => setExplanation(e.target.value)}
              placeholder="Enter an explanation for the answer (optional)"
            />
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
        <span className="font-semibold text-gray-900">Filter by type:</span>
        <select
          className="border p-2 rounded text-gray-900"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        >
          <option value="">All</option>
          {Object.values(QUESTION_TYPES).flat().map((t) => (
            <option key={t.id} value={t.id}>{t.name}</option>
          ))}
        </select>
      </div>

      {/* Filter by Difficulty */}
      <div className="mb-4 flex items-center gap-2">
        <span className="font-semibold text-gray-900">Filter by difficulty:</span>
        <select
          className="border p-2 rounded text-gray-900"
          value={difficultyFilter}
          onChange={(e) => setDifficultyFilter(e.target.value)}
        >
          <option value="">All</option>
          {DIFFICULTIES.map((d) => (
            <option key={d.id} value={d.id}>{d.name}</option>
          ))}
        </select>
      </div>

      {/* Questions List */}
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border rounded">
          <thead>
            <tr>
              <th className="py-2 px-4 border-b text-gray-900">Exam</th>
              <th className="py-2 px-4 border-b text-gray-900">Type</th>
              <th className="py-2 px-4 border-b text-gray-900">Subcategory</th>
              <th className="py-2 px-4 border-b text-gray-900">Question</th>
              <th className="py-2 px-4 border-b text-gray-900">Correct Answer</th>
              <th className="py-2 px-4 border-b text-gray-900">All Choices</th>
              <th className="py-2 px-4 border-b text-gray-900">Difficulty</th>
              <th className="py-2 px-4 border-b text-gray-900">Explanation</th>
              <th className="py-2 px-4 border-b text-gray-900">Actions</th>
            </tr>
          </thead>
          <tbody>
            {displayedQuestions.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-4 text-gray-500">
                  No questions found. Add some questions above!
                </td>
              </tr>
            ) : (
              displayedQuestions.map((q) => (
                <tr key={q.id}>
                  <td className="py-2 px-4 border-b">{q.exam}</td>
                  <td className="py-2 px-4 border-b">{QUESTION_TYPES[q.exam as keyof typeof QUESTION_TYPES].find(t => t.id === q.type)?.name || q.type}</td>
                  <td className="py-2 px-4 border-b">{q.subcategory}</td>
                  <td className="py-2 px-4 border-b max-w-xs">{q.text}</td>
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
                  <td className="py-2 px-4 border-b">{DIFFICULTIES.find(d => d.id === q.difficulty)?.name || q.difficulty}</td>
                  <td className="py-2 px-4 border-b max-w-xs whitespace-pre-line">{q.explanation}</td>
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