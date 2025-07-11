"use client";

import { useState, useEffect } from "react";

// Hybrid LaTeX preview formatter - renders sqrt and fractions with CSS, others as text
const formatLatexPreview = (text: string): { __html: string } | string => {
  if (!text) return '';
  
  // Check if text contains sqrt or frac - if so, return HTML for React dangerouslySetInnerHTML
  if (text.includes('\\sqrt{') || text.includes('\\frac{')) {
    let processedText = text
      // Convert common LaTeX symbols to Unicode equivalents first
      .replace(/\$\$([^$]+)\$\$/g, '[$1]') // Display math: $$x$$ -> [x]
      .replace(/\$([^$]+)\$/g, '$1') // Inline math: $x$ -> x
      .replace(/\^(\w+|\{[^}]+\})/g, (match, exp) => {
        // Superscripts: x^2 -> x², x^{10} -> x¹⁰, x^a -> xᵃ
        const cleanExp = exp.replace(/[{}]/g, '');
        const superscriptMap: { [key: string]: string } = {
          '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴', 
          '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹',
          'a': 'ᵃ', 'b': 'ᵇ', 'c': 'ᶜ', 'd': 'ᵈ', 'e': 'ᵉ', 'f': 'ᶠ', 'g': 'ᵍ', 'h': 'ʰ', 'i': 'ⁱ',
          'j': 'ʲ', 'k': 'ᵏ', 'l': 'ˡ', 'm': 'ᵐ', 'n': 'ⁿ', 'o': 'ᵒ', 'p': 'ᵖ', 'r': 'ʳ', 's': 'ˢ',
          't': 'ᵗ', 'u': 'ᵘ', 'v': 'ᵛ', 'w': 'ʷ', 'x': 'ˣ', 'y': 'ʸ', 'z': 'ᶻ',
          'A': 'ᴬ', 'B': 'ᴮ', 'D': 'ᴰ', 'E': 'ᴱ', 'G': 'ᴳ', 'H': 'ᴴ', 'I': 'ᴵ', 'J': 'ᴶ',
          'K': 'ᴷ', 'L': 'ᴸ', 'M': 'ᴹ', 'N': 'ᴺ', 'O': 'ᴼ', 'P': 'ᴾ', 'R': 'ᴿ', 'T': 'ᵀ',
          'U': 'ᵁ', 'V': 'ⱽ', 'W': 'ᵂ',
          '+': '⁺', '-': '⁻', '=': '⁼', '(': '⁽', ')': '⁾'
        };
        return cleanExp.split('').map((char: string) => superscriptMap[char] || char).join('');
      })
      .replace(/_(\w+|\{[^}]+\})/g, (match, sub) => {
        // Subscripts: x_1 -> x₁, x_{10} -> x₁₀
        const cleanSub = sub.replace(/[{}]/g, '');
        const subscriptMap: { [key: string]: string } = {
          '0': '₀', '1': '₁', '2': '₂', '3': '₃', '4': '₄',
          '5': '₅', '6': '₆', '7': '₇', '8': '₈', '9': '₉'
        };
        return cleanSub.split('').map((char: string) => subscriptMap[char] || char).join('');
      })
      .replace(/\\pi/g, 'π')
      .replace(/\\alpha/g, 'α')
      .replace(/\\beta/g, 'β')
      .replace(/\\gamma/g, 'γ')
      .replace(/\\delta/g, 'δ')
      .replace(/\\epsilon/g, 'ε')
      .replace(/\\zeta/g, 'ζ')
      .replace(/\\eta/g, 'η')
      .replace(/\\theta/g, 'θ')
      .replace(/\\iota/g, 'ι')
      .replace(/\\kappa/g, 'κ')
      .replace(/\\lambda/g, 'λ')
      .replace(/\\mu/g, 'μ')
      .replace(/\\nu/g, 'ν')
      .replace(/\\xi/g, 'ξ')
      .replace(/\\omicron/g, 'ο')
      .replace(/\\rho/g, 'ρ')
      .replace(/\\sigma/g, 'σ')
      .replace(/\\tau/g, 'τ')
      .replace(/\\upsilon/g, 'υ')
      .replace(/\\phi/g, 'φ')
      .replace(/\\chi/g, 'χ')
      .replace(/\\psi/g, 'ψ')
      .replace(/\\omega/g, 'ω')
      .replace(/\\infty/g, '∞')
      .replace(/\\pm/g, '±')
      .replace(/\\times/g, '×')
      .replace(/\\div/g, '÷')
      .replace(/\\neq/g, '≠')
      .replace(/\\leq/g, '≤')
      .replace(/\\geq/g, '≥')
      .replace(/\\sum/g, '∑')
      .replace(/\\int/g, '∫')
      .replace(/\\sum_\{([^}]*)\}\^\{([^}]*)\}/g, '∑$1^$2') // Sum with limits: \sum_{i=1}^{n} -> ∑i=1^n
      .replace(/\\int_\{([^}]*)\}\^\{([^}]*)\}/g, '∫$1^$2') // Integral with limits: \int_{a}^{b} -> ∫a^b
      .replace(/\\partial/g, '∂')
      .replace(/\\nabla/g, '∇');

    // Recursive function to handle nested LaTeX expressions
    const processNestedLatex = (str: string): string => {
      let result = str;
      let hasChanges = true;
      
      // Keep processing until no more changes are made
      while (hasChanges) {
        const before = result;
        
        // Handle fractions first (innermost expressions)
        result = result.replace(/\\frac\{([^{}]*(?:\{[^{}]*\}[^{}]*)*)\}\{([^{}]*(?:\{[^{}]*\}[^{}]*)*)\}/g, (match, numerator, denominator) => {
          // Recursively process the numerator and denominator
          const processedNum = processNestedLatex(numerator);
          const processedDen = processNestedLatex(denominator);
          return `<span class="fraction">
            <span class="numerator">${processedNum}</span>
            <span class="denominator">${processedDen}</span>
          </span>`;
        });
        
        // Handle square roots
        result = result.replace(/\\sqrt\{([^{}]*(?:\{[^{}]*\}[^{}]*)*)\}/g, (match, content) => {
          // Recursively process the content inside sqrt
          const processedContent = processNestedLatex(content);
          return `<span class="sqrt-symbol">
            <span class="sqrt-radical">√</span><span class="sqrt-content">${processedContent}</span>
          </span>`;
        });
        
        // Handle superscripts and subscripts within the processed content
        result = result.replace(/\^(\w+|\{[^}]+\})/g, (match, exp) => {
          const cleanExp = exp.replace(/[{}]/g, '');
          
          // For single characters or simple numbers, use Unicode superscripts
          if (cleanExp.length === 1 || /^\d+$/.test(cleanExp)) {
            const superscriptMap: { [key: string]: string } = {
              '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴', 
              '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹',
              'a': 'ᵃ', 'b': 'ᵇ', 'c': 'ᶜ', 'd': 'ᵈ', 'e': 'ᵉ', 'f': 'ᶠ', 'g': 'ᵍ', 'h': 'ʰ', 'i': 'ⁱ',
              'j': 'ʲ', 'k': 'ᵏ', 'l': 'ˡ', 'm': 'ᵐ', 'n': 'ⁿ', 'o': 'ᵒ', 'p': 'ᵖ', 'r': 'ʳ', 's': 'ˢ',
              't': 'ᵗ', 'u': 'ᵘ', 'v': 'ᵛ', 'w': 'ʷ', 'x': 'ˣ', 'y': 'ʸ', 'z': 'ᶻ',
              'A': 'ᴬ', 'B': 'ᴮ', 'D': 'ᴰ', 'E': 'ᴱ', 'G': 'ᴳ', 'H': 'ᴴ', 'I': 'ᴵ', 'J': 'ᴶ',
              'K': 'ᴷ', 'L': 'ᴸ', 'M': 'ᴹ', 'N': 'ᴺ', 'O': 'ᴼ', 'P': 'ᴾ', 'R': 'ᴿ', 'T': 'ᵀ',
              'U': 'ᵁ', 'V': 'ⱽ', 'W': 'ᵂ',
              '+': '⁺', '-': '⁻', '=': '⁼', '(': '⁽', ')': '⁾'
            };
            return cleanExp.split('').map((char: string) => superscriptMap[char] || char).join('');
          } else {
            // For complex expressions, use CSS superscript
            const processedExp = processNestedLatex(cleanExp);
            return `<sup>${processedExp}</sup>`;
          }
        });
        
        result = result.replace(/_(\w+|\{[^}]+\})/g, (match, sub) => {
          const cleanSub = sub.replace(/[{}]/g, '');
          
          // For single characters or simple numbers, use Unicode subscripts
          if (cleanSub.length === 1 || /^\d+$/.test(cleanSub)) {
            const subscriptMap: { [key: string]: string } = {
              '0': '₀', '1': '₁', '2': '₂', '3': '₃', '4': '₄',
              '5': '₅', '6': '₆', '7': '₇', '8': '₈', '9': '₉',
              'a': 'ₐ', 'e': 'ₑ', 'h': 'ₕ', 'i': 'ᵢ', 'j': 'ⱼ', 'k': 'ₖ', 'l': 'ₗ', 'm': 'ₘ',
              'n': 'ₙ', 'o': 'ₒ', 'p': 'ₚ', 'r': 'ᵣ', 's': 'ₛ', 't': 'ₜ', 'u': 'ᵤ', 'v': 'ᵥ', 'x': 'ₓ'
            };
            return cleanSub.split('').map((char: string) => subscriptMap[char] || char).join('');
          } else {
            // For complex expressions, use CSS subscript
            const processedSub = processNestedLatex(cleanSub);
            return `<sub>${processedSub}</sub>`;
          }
        });
        
        hasChanges = (result !== before);
      }
      
      return result;
    };

    // Apply the recursive processing
    processedText = processNestedLatex(processedText);
    
    // Clean up any remaining backslashes except already processed ones
    processedText = processedText.replace(/\\(?![a-zA-Z])/g, '');

    return { __html: processedText };
  }
  
  // Fallback to simple text conversion for non-sqrt/frac content
  return text
    .replace(/\$\$([^$]+)\$\$/g, '[$1]') // Display math: $$x$$ -> [x]
    .replace(/\$([^$]+)\$/g, '$1') // Inline math: $x$ -> x
    .replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, '$1/$2') // Fractions: \frac{a}{b} -> a/b
    .replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, '$1/$2') // Fractions: \frac{a}{b} -> a/b
    .replace(/\^(\w+|\{[^}]+\})/g, (match, exp) => {
      const cleanExp = exp.replace(/[{}]/g, '');
      const superscriptMap: { [key: string]: string } = {
        '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴', 
        '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹',
        'a': 'ᵃ', 'b': 'ᵇ', 'c': 'ᶜ', 'd': 'ᵈ', 'e': 'ᵉ', 'f': 'ᶠ', 'g': 'ᵍ', 'h': 'ʰ', 'i': 'ⁱ',
        'j': 'ʲ', 'k': 'ᵏ', 'l': 'ˡ', 'm': 'ᵐ', 'n': 'ⁿ', 'o': 'ᵒ', 'p': 'ᵖ', 'r': 'ʳ', 's': 'ˢ',
        't': 'ᵗ', 'u': 'ᵘ', 'v': 'ᵛ', 'w': 'ʷ', 'x': 'ˣ', 'y': 'ʸ', 'z': 'ᶻ',
        'A': 'ᴬ', 'B': 'ᴮ', 'D': 'ᴰ', 'E': 'ᴱ', 'G': 'ᴳ', 'H': 'ᴴ', 'I': 'ᴵ', 'J': 'ᴶ',
        'K': 'ᴷ', 'L': 'ᴸ', 'M': 'ᴹ', 'N': 'ᴺ', 'O': 'ᴼ', 'P': 'ᴾ', 'R': 'ᴿ', 'T': 'ᵀ',
        'U': 'ᵁ', 'V': 'ⱽ', 'W': 'ᵂ',
        '+': '⁺', '-': '⁻', '=': '⁼', '(': '⁽', ')': '⁾'
      };
      return cleanExp.split('').map((char: string) => superscriptMap[char] || char).join('');
    })
    .replace(/_(\w+|\{[^}]+\})/g, (match, sub) => {
      const cleanSub = sub.replace(/[{}]/g, '');
      const subscriptMap: { [key: string]: string } = {
        '0': '₀', '1': '₁', '2': '₂', '3': '₃', '4': '₄',
        '5': '₅', '6': '₆', '7': '₇', '8': '₈', '9': '₉'
      };
      return cleanSub.split('').map((char: string) => subscriptMap[char] || char).join('');
    })
    .replace(/\\pi/g, 'π')
    .replace(/\\alpha/g, 'α')
    .replace(/\\beta/g, 'β')
    .replace(/\\gamma/g, 'γ')
    .replace(/\\delta/g, 'δ')
    .replace(/\\epsilon/g, 'ε')
    .replace(/\\zeta/g, 'ζ')
    .replace(/\\eta/g, 'η')
    .replace(/\\theta/g, 'θ')
    .replace(/\\iota/g, 'ι')
    .replace(/\\kappa/g, 'κ')
    .replace(/\\lambda/g, 'λ')
    .replace(/\\mu/g, 'μ')
    .replace(/\\nu/g, 'ν')
    .replace(/\\xi/g, 'ξ')
    .replace(/\\omicron/g, 'ο')
    .replace(/\\rho/g, 'ρ')
    .replace(/\\sigma/g, 'σ')
    .replace(/\\tau/g, 'τ')
    .replace(/\\upsilon/g, 'υ')
    .replace(/\\phi/g, 'φ')
    .replace(/\\chi/g, 'χ')
    .replace(/\\psi/g, 'ψ')
    .replace(/\\omega/g, 'ω')
    .replace(/\\infty/g, '∞')
    .replace(/\\pm/g, '±')
    .replace(/\\times/g, '×')
    .replace(/\\div/g, '÷')
    .replace(/\\neq/g, '≠')
    .replace(/\\leq/g, '≤')
    .replace(/\\geq/g, '≥')
    .replace(/\\sum/g, '∑')
    .replace(/\\int/g, '∫')
    .replace(/\\sum_\{([^}]*)\}\^\{([^}]*)\}/g, '∑$1^$2') // Sum with limits
    .replace(/\\int_\{([^}]*)\}\^\{([^}]*)\}/g, '∫$1^$2') // Integral with limits
    .replace(/\\partial/g, '∂')
    .replace(/\\nabla/g, '∇')
    .replace(/\\/g, '');
};

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

// Common LaTeX symbols for quick insertion
const LATEX_SYMBOLS = [
  { label: "Square Root", latex: "\\sqrt{}", description: "√" },
  { label: "Fraction", latex: "\\frac{}{}", description: "fraction" },
  { label: "Power", latex: "^", description: "x²" },
  { label: "Subscript", latex: "_", description: "x₁" },
  { label: "Plus/Minus", latex: "\\pm", description: "±" },
  { label: "Times", latex: "\\times", description: "×" },
  { label: "Divide", latex: "\\div", description: "÷" },
  { label: "Equals", latex: "=", description: "=" },
  { label: "Not Equal", latex: "\\neq", description: "≠" },
  { label: "Less Than", latex: "<", description: "<" },
  { label: "Greater Than", latex: ">", description: ">" },
  { label: "Less Equal", latex: "\\leq", description: "≤" },
  { label: "Greater Equal", latex: "\\geq", description: "≥" },
  { label: "Pi", latex: "\\pi", description: "π" },
  { label: "Infinity", latex: "\\infty", description: "∞" },
  { label: "Sum", latex: "\\sum_{}^{}", description: "∑" },
  { label: "Integral", latex: "\\int_{}^{}", description: "∫" },
];

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
  const [success, setSuccess] = useState<string | null>(null);
  const [difficulty, setDifficulty] = useState<DifficultyID>(DIFFICULTIES[0].id);
  const [difficultyFilter, setDifficultyFilter] = useState("");
  const [explanation, setExplanation] = useState("");

  // Fetch questions from API
  const fetchQuestions = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);
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

  // Insert LaTeX symbol at cursor position
  const insertLatexSymbol = (latex: string, target: 'question' | 'answer' | 'choice' | 'explanation', choiceIndex?: number) => {
    let textarea: HTMLTextAreaElement | null = null;
    
    if (target === 'choice' && choiceIndex !== undefined) {
      textarea = document.getElementById(`choice-${choiceIndex}-textarea`) as HTMLTextAreaElement;
    } else {
      textarea = document.getElementById(`${target}-textarea`) as HTMLTextAreaElement;
    }
    
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const currentValue = textarea.value;
      
      let newValue: string;
      let newCursorPos: number;
      
      if (latex.includes('{}')) {
        // For symbols with placeholders like \sqrt{}, \frac{}{}
        newValue = currentValue.substring(0, start) + latex + currentValue.substring(end);
        newCursorPos = start + latex.indexOf('{}');
      } else {
        // For simple symbols
        newValue = currentValue.substring(0, start) + latex + currentValue.substring(end);
        newCursorPos = start + latex.length;
      }
      
      // Update the appropriate state
      switch (target) {
        case 'question':
          setText(newValue);
          break;
        case 'answer':
          setCorrectAnswer(newValue);
          break;
        case 'explanation':
          setExplanation(newValue);
          break;
        case 'choice':
          if (choiceIndex !== undefined) {
            updateChoice(choiceIndex + 1, newValue);
          }
          break;
      }
      
      // Set cursor position after a short delay
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(newCursorPos, newCursorPos);
      }, 10);
    }
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
    setSuccess(null);
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
      setSuccess("Question added successfully!");
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
    if (!confirm("Are you sure you want to delete this question?")) return;
    
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const res = await fetch("/api/questions", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (!res.ok) throw new Error("Failed to delete question");
      await fetchQuestions();
      setSuccess("Question deleted successfully!");
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

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'text-green-600 bg-green-100';
      case 'intermediate': return 'text-alarm-yellow bg-yellow-100';
      case 'hard': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  // Helper function to render text with LaTeX support
  const renderTextWithLatex = (text: string) => {
    if (!text) return null;
    const formatted = formatLatexPreview(text);
    
    // If formatted is an object with __html, use dangerouslySetInnerHTML
    if (typeof formatted === 'object' && formatted.__html) {
      return (
        <span dangerouslySetInnerHTML={formatted} />
      );
    }
    
    // Otherwise return plain text
    return <span>{formatted as string}</span>;
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      {/* CSS for sqrt and fraction styling */}
      <style dangerouslySetInnerHTML={{
        __html: `
          .sqrt-symbol {
            position: relative;
            display: inline-block;
            white-space: nowrap;
          }
          .sqrt-radical {
            font-size: 1.2em;
            position: relative;
            top: 0.1em;
          }
          .sqrt-content {
            border-top: 1px solid currentColor;
            padding-top: 0px;
            display: inline-block;
            position: relative;
            top: 0.15em;
            margin-left: -1px;
          }
          .fraction {
            display: inline-block;
            position: relative;
            vertical-align: middle;
            text-align: center;
            font-size: 0.9em;
          }
          .numerator {
            display: block;
            border-bottom: 1px solid currentColor;
            padding-bottom: 1px;
            margin-bottom: 1px;
          }
          .denominator {
            display: block;
            padding-top: 1px;
          }
          sup {
            font-size: 0.75em;
            line-height: 0;
            position: relative;
            vertical-align: baseline;
            top: -0.5em;
          }
          sub {
            font-size: 0.75em;
            line-height: 0;
            position: relative;
            vertical-align: baseline;
            bottom: -0.25em;
          }
        `
      }} />
      
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6 border border-alarm-black/10">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Question Management</h1>
          <p className="text-lg text-gray-700">Manage LSAT and GMAT questions for your alarm app</p>
        </div>

        {loading && (
          <div className="bg-alarm-blue-light border border-alarm-blue rounded-lg p-4 mb-6">
            <div className="flex items-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-alarm-blue"></div>
              <span className="text-alarm-blue font-medium">Loading...</span>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-red-800 font-medium">{error}</span>
            </div>
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-green-800 font-bold">{success}</span>
            </div>
          </div>
        )}
        
        {/* Add Question Form - Always Visible */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6 border border-alarm-black/10">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Add New Question</h2>
          <form onSubmit={addQuestion} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Exam Selection */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">Exam</label>
                <select
                  className="w-full border-2 border-gray-400 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 font-medium"
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
                <label className="block text-sm font-semibold text-gray-900 mb-2">Question Type</label>
                <select
                  className="w-full border-2 border-gray-400 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 font-medium"
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
                <label className="block text-sm font-semibold text-gray-900 mb-2">Subcategory</label>
                <select
                  className="w-full border-2 border-gray-400 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 font-medium"
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
                <label className="block text-sm font-semibold text-gray-900 mb-2">Difficulty</label>
                <select
                  className="w-full border-2 border-gray-400 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 font-medium"
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value as DifficultyID)}
                >
                  {DIFFICULTIES.map((d) => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Question Text with LaTeX Support */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">Question Text</label>
              
              {/* LaTeX Help Section */}
              <div className="mb-3 p-3 bg-alarm-blue-light/20 rounded-lg border border-alarm-blue/20">
                <h4 className="text-sm font-semibold text-gray-900 mb-2">💡 Math Symbols Help</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2 mb-3">
                  {LATEX_SYMBOLS.map((symbol, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => insertLatexSymbol(symbol.latex, 'question')}
                      className="text-sm font-semibold bg-white border-2 border-gray-400 rounded-md px-3 py-2 hover:bg-blue-50 hover:border-blue-500 transition-all duration-200 shadow-sm text-gray-800"
                      title={`${symbol.label}: ${symbol.description}`}
                    >
                      {symbol.description}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-gray-800">
                  <strong>Examples:</strong> x^2 → x², \sqrt{5} → √5, \frac{1}{2} → ½
                </p>
              </div>

              <textarea
                id="question-textarea"
                className="w-full border-2 border-gray-400 rounded-lg px-3 py-2 h-32 resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 font-medium"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Enter your question here... Use LaTeX for math: x^2, \sqrt{5}, \frac{1}{2}"
                required
              />

              {/* Live Preview */}
              {text && (
                <div className="mt-2 p-3 bg-gray-50 rounded-lg border">
                  <h4 className="text-sm font-medium text-alarm-black mb-2">Preview:</h4>
                  <div className="text-gray-900 font-medium">
                    {renderTextWithLatex(text)}
                  </div>
                </div>
              )}
            </div>

            {/* Answer Choices */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Correct Answer */}
              <div>
                <label className="block text-sm font-medium text-green-700 mb-2">
                  ✓ Correct Answer
                </label>
                
                {/* LaTeX Help for Answer */}
                <div className="mb-2">
                  <button
                    type="button"
                    onClick={() => insertLatexSymbol("\\sqrt{}", 'answer')}
                    className="text-sm font-semibold bg-green-100 border-2 border-green-400 rounded-md px-3 py-2 hover:bg-green-200 hover:border-green-600 transition-all duration-200 mr-2 shadow-sm text-green-800"
                  >
                    √
                  </button>
                  <button
                    type="button"
                    onClick={() => insertLatexSymbol("\\frac{}{}", 'answer')}
                    className="text-sm font-semibold bg-green-100 border-2 border-green-400 rounded-md px-3 py-2 hover:bg-green-200 hover:border-green-600 transition-all duration-200 mr-2 shadow-sm text-green-800"
                  >
                    fraction
                  </button>
                  <button
                    type="button"
                    onClick={() => insertLatexSymbol("^", 'answer')}
                    className="text-sm font-semibold bg-green-100 border-2 border-green-400 rounded-md px-3 py-2 hover:bg-green-200 hover:border-green-600 transition-all duration-200 shadow-sm text-green-800"
                  >
                    x²
                  </button>
                </div>

                <input
                  id="answer-textarea"
                  className="w-full border-2 border-green-300 rounded-lg px-3 py-2 bg-green-50 focus:ring-2 focus:ring-green-500 focus:border-green-500 text-alarm-black"
                  value={correctAnswer}
                  onChange={(e) => setCorrectAnswer(e.target.value)}
                  placeholder="Enter the correct answer..."
                  required
                />

                {/* Answer Preview */}
                {correctAnswer && (
                  <div className="mt-2 p-2 bg-green-50 rounded border border-green-200">
                    <span className="text-xs text-green-700 font-medium">Preview: </span>
                    <span className="text-green-800">{renderTextWithLatex(correctAnswer)}</span>
                  </div>
                )}
              </div>

              {/* Other Choices */}
              <div>
                <label className="block text-sm font-medium text-alarm-black mb-2">Other Choices</label>
                <div className="space-y-2">
                  {choices.slice(1).map((choice, index) => (
                    <div key={index + 1}>
                      <div className="mb-1">
                        <button
                          type="button"
                          onClick={() => insertLatexSymbol("\\sqrt{}", 'choice', index)}
                          className="text-sm font-semibold bg-gray-100 border-2 border-gray-400 rounded-md px-3 py-2 hover:bg-blue-50 hover:border-blue-500 transition-all duration-200 mr-2 shadow-sm text-gray-800"
                        >
                          √
                        </button>
                        <button
                          type="button"
                          onClick={() => insertLatexSymbol("\\frac{}{}", 'choice', index)}
                          className="text-sm font-semibold bg-gray-100 border-2 border-gray-400 rounded-md px-3 py-2 hover:bg-blue-50 hover:border-blue-500 transition-all duration-200 mr-2 shadow-sm text-gray-800"
                        >
                          fraction
                        </button>
                        <button
                          type="button"
                          onClick={() => insertLatexSymbol("^", 'choice', index)}
                          className="text-sm font-semibold bg-gray-100 border-2 border-gray-400 rounded-md px-3 py-2 hover:bg-blue-50 hover:border-blue-500 transition-all duration-200 shadow-sm text-gray-800"
                        >
                          x²
                        </button>
                      </div>
                      <input
                        id={`choice-${index}-textarea`}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-alarm-blue focus:border-alarm-blue text-alarm-black"
                        value={choice}
                        onChange={(e) => updateChoice(index + 1, e.target.value)}
                        placeholder={`Choice ${index + 2}...`}
                        required
                      />
                      
                      {/* Choice Preview */}
                      {choice && (
                        <div className="mt-2 p-2 bg-gray-50 rounded border border-gray-200">
                          <span className="text-xs text-gray-700 font-medium">Preview: </span>
                          <span className="text-gray-900 font-medium">{renderTextWithLatex(choice)}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Explanation */}
            <div>
              <label className="block text-sm font-medium text-alarm-black mb-2">Explanation (Optional)</label>
              
              {/* LaTeX Help for Explanation */}
              <div className="mb-2">
                <button
                  type="button"
                  onClick={() => insertLatexSymbol("\\sqrt{}", 'explanation')}
                  className="text-sm font-semibold bg-blue-100 border-2 border-blue-400 rounded-md px-3 py-2 hover:bg-blue-200 hover:border-blue-600 transition-all duration-200 mr-2 shadow-sm text-blue-800"
                >
                  √
                </button>
                <button
                  type="button"
                  onClick={() => insertLatexSymbol("\\frac{}{}", 'explanation')}
                  className="text-sm font-semibold bg-blue-100 border-2 border-blue-400 rounded-md px-3 py-2 hover:bg-blue-200 hover:border-blue-600 transition-all duration-200 mr-2 shadow-sm text-blue-800"
                >
                  fraction
                </button>
                <button
                  type="button"
                  onClick={() => insertLatexSymbol("^", 'explanation')}
                  className="text-sm font-semibold bg-blue-100 border-2 border-blue-400 rounded-md px-3 py-2 hover:bg-blue-200 hover:border-blue-600 transition-all duration-200 shadow-sm text-blue-800"
                >
                  x²
                </button>
              </div>
              
              <textarea
                id="explanation-textarea"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 h-24 resize-none focus:ring-2 focus:ring-alarm-blue focus:border-alarm-blue text-alarm-black"
                value={explanation}
                onChange={(e) => setExplanation(e.target.value)}
                placeholder="Enter an explanation for the answer..."
              />
              
              {/* Explanation Preview */}
              {explanation && (
                <div className="mt-2 p-3 bg-gray-50 rounded-lg border">
                  <h4 className="text-sm font-medium text-alarm-black mb-2">Preview:</h4>
                  <div className="text-gray-900 font-medium">
                    {renderTextWithLatex(explanation)}
                  </div>
                </div>
              )}
            </div>

            <button 
              type="submit" 
              className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 focus:ring-4 focus:ring-blue-300 transition-all duration-200 font-semibold text-lg shadow-lg"
              disabled={loading}
            >
              {loading ? 'Adding...' : 'Add Question'}
            </button>
          </form>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6 border border-alarm-black/10">
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-alarm-black">Filter by type:</span>
              <select
                className="border border-gray-300 rounded-lg px-3 py-1 text-sm focus:ring-2 focus:ring-alarm-blue focus:border-alarm-blue text-alarm-black"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
              >
                <option value="">All Types</option>
                {Object.values(QUESTION_TYPES).flat().map((t) => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-alarm-black">Filter by difficulty:</span>
              <select
                className="border border-gray-300 rounded-lg px-3 py-1 text-sm focus:ring-2 focus:ring-alarm-blue focus:border-alarm-blue text-alarm-black"
                value={difficultyFilter}
                onChange={(e) => setDifficultyFilter(e.target.value)}
              >
                <option value="">All Difficulties</option>
                {DIFFICULTIES.map((d) => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm text-alarm-black/70">
                Total Questions: {displayedQuestions.length}
              </span>
            </div>
          </div>
        </div>

        {/* Questions List */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-alarm-black/10">
          <div className="px-6 py-4 border-b border-alarm-black/10">
            <h3 className="text-lg font-semibold text-alarm-black">Questions</h3>
          </div>
          
          {displayedQuestions.length === 0 ? (
            <div className="text-center py-12">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-alarm-black">No questions found</h3>
              <p className="mt-1 text-sm text-alarm-black/70">Add your first question using the form above.</p>
            </div>
          ) : (
            <div className="divide-y divide-alarm-black/10">
              {displayedQuestions.map((q) => (
                <div key={q.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-alarm-blue text-white">
                        {q.exam}
                      </span>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-alarm-blue-light text-alarm-blue">
                        {QUESTION_TYPES[q.exam as keyof typeof QUESTION_TYPES].find(t => t.id === q.type)?.name || q.type}
                      </span>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getDifficultyColor(q.difficulty)}`}>
                        {DIFFICULTIES.find(d => d.id === q.difficulty)?.name || q.difficulty}
                      </span>
                    </div>
                    <button
                      onClick={() => deleteQuestion(q.id)}
                      className="text-red-700 hover:text-red-900 bg-red-50 hover:bg-red-100 border-2 border-red-300 hover:border-red-500 p-2 rounded-lg transition-all duration-200 font-semibold shadow-sm"
                      title="Delete question"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <h4 className="font-medium text-alarm-black mb-1">Question:</h4>
                      <p className="text-gray-900 bg-gray-50 p-3 rounded-lg font-medium">
                        {renderTextWithLatex(q.text)}
                      </p>
                    </div>

                    <div>
                      <h4 className="font-medium text-alarm-black mb-2">Answer Choices:</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {q.choices.map((choice, index) => (
                          <div key={index} className={`p-2 rounded-lg border font-medium ${index === 0 ? 'bg-green-50 border-green-200 text-green-800' : 'bg-gray-50 border-gray-200 text-gray-900'}`}>
                            <span className="font-semibold">{String.fromCharCode(65 + index)}.</span> {renderTextWithLatex(choice)}
                            {index === 0 && <span className="ml-2 text-xs font-medium">✓ Correct</span>}
                          </div>
                        ))}
                      </div>
                    </div>

                    {q.explanation && (
                      <div>
                        <h4 className="font-medium text-alarm-black mb-1">Explanation:</h4>
                        <p className="text-gray-800 bg-alarm-blue-light/20 p-3 rounded-lg text-sm font-medium">
                          {renderTextWithLatex(q.explanation)}
                        </p>
                      </div>
                    )}

                    <div className="text-xs text-alarm-black/50 pt-2 border-t border-alarm-black/10">
                      Subcategory: {q.subcategory} • Created: {new Date(q.createdAt || '').toLocaleDateString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}