"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { errorReportingService, ReportedError } from "@/services/errorReportingService";
import { InlineMath, BlockMath } from 'react-katex';
import 'katex/dist/katex.min.css';

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
    { id: "Quantitative", name: "Quantitative Reasoning" },
    { id: "Verbal", name: "Verbal Reasoning" },
    { id: "Data Insights", name: "Data Insights" },
  ],
  LSAT: [
    { id: "Reading Comprehension", name: "Reading Comprehension" },
    { id: "Logical Reasoning", name: "Logical Reasoning" },
  ],
} as const;
const QUESTION_SUBCATEGORIES = {
  "Quantitative": ["Algebra & Equations", "Arithmetic & Number Properties", "Word Problems & Math Logic", "Logic, Sets, and Counting"],
  "Verbal": ["Main Idea", "Primary Purpose", "Inference", "Detail", "Function/Purpose of Sentence or Paragraph", "Strengthen/Weaken", "Author's Tone or Attitude", "Logical Structure or Flow", "Evaluate or Resolve Discrepancy"],
  "Data Insights": ["Table Analysis", "Graphics Interpretation", "Two-Part Analysis", "Multi-Source Reasoning", "Data Sufficiency (non-quantitative)"],
  "Reading Comprehension": ["Main Point", "Primary Purpose", "Author's Attitude/Tone", "Passage Organization", "Specific Detail", "Inference", "Function", "Analogy", "Application", "Strengthen/Weaken", "Comparative Reading"],
  "Logical Reasoning": ["Assumption (Necessary)", "Assumption (Sufficient)", "Strengthen", "Weaken", "Flaw", "Inference", "Must Be True", "Most Strongly Supported", "Principle (Apply)", "Principle (Identify)", "Parallel Reasoning", "Parallel Flaw", "Resolve the Paradox", "Main Point", "Method of Reasoning", "Role in Argument", "Point at Issue", "Argument Evaluation"],
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
    QUESTION_SUBCATEGORIES[QUESTION_TYPES[EXAMS[0]][0].id as keyof typeof QUESTION_SUBCATEGORIES][0]
  );
  const [text, setText] = useState("");
  const [correctAnswer, setCorrectAnswer] = useState("");
  const [choices, setChoices] = useState(["", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [difficulty, setDifficulty] = useState<DifficultyID>(DIFFICULTIES[0].id);
  const [difficultyFilter, setDifficultyFilter] = useState("");
  const [examFilter, setExamFilter] = useState("");
  const [explanation, setExplanation] = useState("");

  // Enhanced state for new features
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedQuestions, setSelectedQuestions] = useState<number[]>([]);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [showStats, setShowStats] = useState(false);
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [sortBy, setSortBy] = useState<'date' | 'exam' | 'type' | 'difficulty'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [viewMode, setViewMode] = useState<'list' | 'grid' | 'table'>('list');
  
  // Hierarchical navigation state
  const [selectedExamType, setSelectedExamType] = useState<string | null>(null);
  const [selectedQuestionType, setSelectedQuestionType] = useState<string | null>(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(null);
  
  // Special sections state
  const [showReportedErrors, setShowReportedErrors] = useState<boolean>(false);
  const [reportedErrors, setReportedErrors] = useState<ReportedError[]>([]);
  
  // Refs for preventing multiple fetches and tracking mounted state
  const isMountedRef = useRef(true);
  const isFetchingRef = useRef(false);
  
  // Helper function to render text with LaTeX support (simplified for now)
  const renderMathText = (text: string) => {
    if (!text) return text;
    
    // For now, just return the text as-is to avoid KaTeX rendering issues
    // We can re-enable LaTeX rendering once we fix the loading issue
    return text;
  };
  
  // Fetch questions from API - memoized to prevent unnecessary re-creation
  const fetchQuestions = useCallback(async () => {
    if (isFetchingRef.current || !isMountedRef.current) {
      console.log('Skipping fetch - already fetching or component unmounted');
      return;
    }
    
    console.log('Starting fetch questions...');
    isFetchingRef.current = true;
    setLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      const res = await fetch("/api/questions");
      if (!res.ok) throw new Error("Failed to fetch questions");
      const data = await res.json();
      
      if (isMountedRef.current) {
        setQuestions(data);
        console.log('Questions loaded:', data.length);
        setReportedErrors([]); // Set empty array for now
      }
    } catch (err: any) {
      console.error('Fetch error:', err);
      if (isMountedRef.current) {
        setError(err.message || "Unknown error");
      }
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
      isFetchingRef.current = false;
      console.log('Fetch completed');
    }
  }, []); // Empty dependency array since this function doesn't depend on any state

  useEffect(() => {
    isMountedRef.current = true;
    fetchQuestions();
    
    // Cleanup function to handle unmounting
    return () => {
      isMountedRef.current = false;
    };
  }, [fetchQuestions]); // Include fetchQuestions in dependencies since it's memoized

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

  // Import questions from JSON file
  const handleImportQuestions = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const content = e.target?.result as string;
        const importedQuestions = JSON.parse(content);
        
        if (!Array.isArray(importedQuestions)) {
          throw new Error('Invalid file format');
        }

        setLoading(true);
        let successCount = 0;
        
        for (const q of importedQuestions) {
          try {
            await fetch("/api/questions", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                exam: q.exam,
                type: q.type,
                subcategory: q.subcategory,
                text: q.text,
                correctAnswer: q.correctAnswer,
                choices: q.choices,
                difficulty: q.difficulty,
                explanation: q.explanation || "",
              }),
            });
            successCount++;
          } catch (err) {
            console.error('Failed to import question:', err);
          }
        }
        
        await fetchQuestions();
        setSuccess(`Successfully imported ${successCount} questions!`);
      } catch (err) {
        setError('Failed to import questions. Please check the file format.');
      } finally {
        setLoading(false);
      }
    };
    reader.readAsText(file);
  };

  // Enhanced filtered questions with search and sorting
  const displayedQuestions = questions
    .filter((q) => {
      const typeMatch = !filter || q.type === filter;
      const difficultyMatch = !difficultyFilter || q.difficulty === difficultyFilter;
      const examMatch = !examFilter || q.exam === examFilter;
      const searchMatch = !searchTerm || 
        q.text.toLowerCase().includes(searchTerm.toLowerCase()) ||
        q.explanation?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        q.choices.some(choice => choice.toLowerCase().includes(searchTerm.toLowerCase()));
      return typeMatch && difficultyMatch && examMatch && searchMatch;
    })
    .sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case 'date':
          comparison = new Date(a.createdAt || '').getTime() - new Date(b.createdAt || '').getTime();
          break;
        case 'exam':
          comparison = a.exam.localeCompare(b.exam);
          break;
        case 'type':
          comparison = a.type.localeCompare(b.type);
          break;
        case 'difficulty':
          const diffOrder = { 'easy': 1, 'intermediate': 2, 'hard': 3 };
          comparison = (diffOrder[a.difficulty as keyof typeof diffOrder] || 4) - 
                      (diffOrder[b.difficulty as keyof typeof diffOrder] || 4);
          break;
      }
      return sortOrder === 'desc' ? -comparison : comparison;
    });

  // Question statistics
  const getQuestionStats = () => {
    const total = questions.length;
    const byExam = questions.reduce((acc, q) => {
      acc[q.exam] = (acc[q.exam] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    const byDifficulty = questions.reduce((acc, q) => {
      acc[q.difficulty] = (acc[q.difficulty] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    const byType = questions.reduce((acc, q) => {
      acc[q.type] = (acc[q.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return { total, byExam, byDifficulty, byType };
  };

  // Get question type breakdown for a specific exam
  const getQuestionTypeBreakdown = (examType: string) => {
    const examQuestions = questions.filter(q => q.exam === examType);
    const breakdown = examQuestions.reduce((acc, q) => {
      const type = q.type;
      if (!acc[type]) {
        acc[type] = { total: 0, subcategories: {} };
      }
      acc[type].total += 1;
      
      const subcategory = q.subcategory;
      if (!acc[type].subcategories[subcategory]) {
        acc[type].subcategories[subcategory] = 0;
      }
      acc[type].subcategories[subcategory] += 1;
      
      return acc;
    }, {} as Record<string, { total: number; subcategories: Record<string, number> }>);
    
    return breakdown;
  };

  // Get subcategory breakdown for a specific exam and question type
  const getSubcategoryBreakdown = (examType: string, questionType: string) => {
    const filteredQuestions = questions.filter(q => 
      q.exam === examType && q.type === questionType
    );
    
    // Start with all defined subcategories for this question type, initialized to 0
    const allSubcategories = QUESTION_SUBCATEGORIES[questionType as keyof typeof QUESTION_SUBCATEGORIES] || [];
    const breakdown = allSubcategories.reduce((acc, subcategory) => {
      acc[subcategory] = 0;
      return acc;
    }, {} as Record<string, number>);
    
    // Count actual questions for each subcategory
    filteredQuestions.forEach(q => {
      const subcategory = q.subcategory;
      if (breakdown.hasOwnProperty(subcategory)) {
        breakdown[subcategory] += 1;
      } else {
        // Handle subcategories not in the predefined list (legacy data)
        breakdown[subcategory] = (breakdown[subcategory] || 0) + 1;
      }
    });
    
    return breakdown;
  };

  // Get questions for a specific subcategory
  const getSubcategoryQuestions = (examType: string, questionType: string, subcategory: string) => {
    return questions.filter(q => 
      q.exam === examType && 
      q.type === questionType && 
      q.subcategory === subcategory
    );
  };

  // Bulk operations
  const handleSelectAll = () => {
    if (selectedQuestions.length === displayedQuestions.length) {
      setSelectedQuestions([]);
    } else {
      setSelectedQuestions(displayedQuestions.map(q => q.id));
    }
  };

  const handleSelectQuestion = (id: number) => {
    setSelectedQuestions(prev => 
      prev.includes(id) 
        ? prev.filter(qId => qId !== id)
        : [...prev, id]
    );
  };

  const bulkDeleteQuestions = async () => {
    if (!confirm(`Are you sure you want to delete ${selectedQuestions.length} questions?`)) return;
    
    setLoading(true);
    try {
      await Promise.all(selectedQuestions.map(id => 
        fetch("/api/questions", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id }),
        })
      ));
      await fetchQuestions();
      setSelectedQuestions([]);
      setSuccess(`${selectedQuestions.length} questions deleted successfully!`);
    } catch (err: any) {
      setError("Failed to delete questions");
    } finally {
      setLoading(false);
    }
  };

  // Export questions as JSON
  const exportQuestions = () => {
    const questionsToExport = selectedQuestions.length > 0 
      ? questions.filter(q => selectedQuestions.includes(q.id))
      : displayedQuestions;
    
    const dataStr = JSON.stringify(questionsToExport, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = `questions_${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
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

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'text-green-600 bg-green-100';
      case 'intermediate': return 'text-yellow-600 bg-yellow-100';
      case 'hard': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
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
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Question Management Dashboard</h1>
              <p className="text-lg text-gray-700">Comprehensive admin tools for LSAT and GMAT questions</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="text-2xl font-bold text-alarm-blue">{questions.length}</div>
                <div className="text-sm text-gray-600">Total Questions</div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-green-600">
                  {questions.filter(q => q.difficulty === 'easy').length}
                </div>
                <div className="text-sm text-gray-600">Easy</div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-yellow-600">
                  {questions.filter(q => q.difficulty === 'intermediate').length}
                </div>
                <div className="text-sm text-gray-600">Medium</div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-red-600">
                  {questions.filter(q => q.difficulty === 'hard').length}
                </div>
                <div className="text-sm text-gray-600">Hard</div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Analytics Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
          <button
            onClick={() => {
              const isSelected = selectedExamType === 'GMAT';
              setSelectedExamType(isSelected ? null : 'GMAT');
              setSelectedQuestionType(null); // Reset question type when changing exam
              setSelectedSubcategory(null); // Reset subcategory when changing exam
              setShowReportedErrors(false); // Reset reported errors when selecting exam
            }}
            className={`bg-white rounded-lg shadow-sm p-6 border transition-all text-left ${
              selectedExamType === 'GMAT' 
                ? 'border-alarm-blue border-2 bg-blue-50' 
                : 'border-alarm-black/10 hover:border-alarm-blue hover:bg-blue-50'
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">GMAT Questions</p>
                <p className="text-3xl font-semibold text-alarm-blue">
                  {questions.filter(q => q.exam === 'GMAT').length}
                </p>
              </div>
              <div className="p-3 bg-alarm-blue-light rounded-full">
                <svg className="w-8 h-8 text-alarm-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
            </div>
            {selectedExamType === 'GMAT' && (
              <div className="mt-3 pt-3 border-t border-gray-200">
                <p className="text-xs text-gray-500 mb-1">Click to explore question types</p>
              </div>
            )}
          </button>

          <button
            onClick={() => {
              const isSelected = selectedExamType === 'LSAT';
              setSelectedExamType(isSelected ? null : 'LSAT');
              setSelectedQuestionType(null); // Reset question type when changing exam
              setSelectedSubcategory(null); // Reset subcategory when changing exam
              setShowReportedErrors(false); // Reset reported errors when selecting exam
            }}
            className={`bg-white rounded-lg shadow-sm p-6 border transition-all text-left ${
              selectedExamType === 'LSAT' 
                ? 'border-purple-600 border-2 bg-purple-50' 
                : 'border-alarm-black/10 hover:border-purple-600 hover:bg-purple-50'
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">LSAT Questions</p>
                <p className="text-3xl font-semibold text-purple-600">
                  {questions.filter(q => q.exam === 'LSAT').length}
                </p>
              </div>
              <div className="p-3 bg-purple-100 rounded-full">
                <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
            </div>
            {selectedExamType === 'LSAT' && (
              <div className="mt-3 pt-3 border-t border-gray-200">
                <p className="text-xs text-gray-500 mb-1">Click to explore question types</p>
              </div>
            )}
          </button>

          <button
            onClick={() => {
              setShowReportedErrors(!showReportedErrors);
              setSelectedExamType(null); // Reset exam selection when viewing reported errors
              setSelectedQuestionType(null); // Reset question type
              setSelectedSubcategory(null); // Reset subcategory
            }}
            className={`bg-white rounded-lg shadow-sm p-6 border transition-all text-left ${
              showReportedErrors 
                ? 'border-red-500 border-2 bg-red-50' 
                : 'border-alarm-black/10 hover:border-red-500 hover:bg-red-50'
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Reported Errors</p>
                <p className="text-3xl font-semibold text-red-600">
                  {reportedErrors.length}
                </p>
              </div>
              <div className="p-3 bg-red-100 rounded-full">
                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 18.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
            </div>
            {showReportedErrors && (
              <div className="mt-3 pt-3 border-t border-gray-200">
                <p className="text-xs text-gray-500 mb-1">View and manage reported question errors</p>
              </div>
            )}
          </button>
        </div>

        {/* Reported Errors Section */}
        {showReportedErrors && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6 border border-red-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <div className="p-2 bg-red-100 rounded-lg mr-3">
                  <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 18.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900">Reported Question Errors ({reportedErrors.length})</h3>
              </div>
              {reportedErrors.length > 0 && (
                <button
                  onClick={() => {
                    if (confirm('Are you sure you want to clear all reported errors? This action cannot be undone.')) {
                      errorReportingService.clearAllErrors();
                      setReportedErrors([]);
                    }
                  }}
                  className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                >
                  Clear All
                </button>
              )}
            </div>
            
            {reportedErrors.length === 0 ? (
              <div className="text-center py-12">
                <div className="p-4 bg-gray-50 rounded-lg inline-block mb-4">
                  <svg className="w-12 h-12 text-gray-400 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h4 className="text-lg font-medium text-gray-900 mb-2">No Reported Errors</h4>
                <p className="text-gray-600 mb-4">
                  No question errors have been reported from the app yet.
                </p>
                <p className="text-sm text-gray-500">
                  When users report errors through the app, they will appear here for admin review and resolution.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {reportedErrors
                  .sort((a, b) => new Date(b.reportedAt).getTime() - new Date(a.reportedAt).getTime())
                  .map((error) => (
                    <div key={error.id} className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center mb-2">
                            <span className="text-sm font-medium text-red-800">
                              Question ID: {error.questionId}
                            </span>
                            <span className="mx-2 text-gray-400">•</span>
                            <span className="text-sm text-gray-600">
                              {error.exam} - {error.type}
                            </span>
                            <span className="mx-2 text-gray-400">•</span>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              error.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                              error.status === 'reviewed' ? 'bg-blue-100 text-blue-800' :
                              'bg-green-100 text-green-800'
                            }`}>
                              {error.status}
                            </span>
                          </div>
                          
                          <div className="mb-3">
                            <p className="text-sm font-medium text-gray-900 mb-1">Question:</p>
                            <p className="text-sm text-gray-700 bg-white p-2 rounded border">
                              {renderMathText(error.questionText)}
                            </p>
                          </div>
                          
                          <div className="mb-3">
                            <p className="text-sm font-medium text-gray-900 mb-1">Reported Error:</p>
                            <p className="text-sm text-red-700 bg-white p-2 rounded border">
                              {error.errorDescription}
                            </p>
                          </div>
                          
                          <div className="flex items-center text-xs text-gray-500">
                            <span>Reported: {new Date(error.reportedAt).toLocaleString()}</span>
                          </div>
                        </div>
                        
                        <div className="flex flex-col space-y-2 ml-4">
                          <select
                            value={error.status}
                            onChange={(e) => {
                              const newStatus = e.target.value as ReportedError['status'];
                              errorReportingService.updateErrorStatus(error.id, newStatus);
                              setReportedErrors(prev => 
                                prev.map(err => err.id === error.id ? { ...err, status: newStatus } : err)
                              );
                            }}
                            className="text-xs border border-gray-300 rounded px-2 py-1"
                          >
                            <option value="pending">Pending</option>
                            <option value="reviewed">Reviewed</option>
                            <option value="resolved">Resolved</option>
                          </select>
                          
                          <button
                            onClick={() => {
                              if (confirm('Are you sure you want to delete this error report?')) {
                                errorReportingService.deleteError(error.id);
                                setReportedErrors(prev => prev.filter(err => err.id !== error.id));
                              }
                            }}
                            className="text-xs text-red-600 hover:text-red-800 hover:bg-red-100 px-2 py-1 rounded transition-colors"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                }
              </div>
            )}
          </div>
        )}

        {/* Question Type Breakdown */}
        {selectedExamType && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6 border border-alarm-black/10">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              {selectedExamType} Question Types
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              {QUESTION_TYPES[selectedExamType as keyof typeof QUESTION_TYPES].map((questionType) => {
                const breakdown = getQuestionTypeBreakdown(selectedExamType);
                const typeData = breakdown[questionType.name] || { total: 0, subcategories: {} };
                const isSelected = selectedQuestionType === questionType.id;
                
                // Get total number of defined subcategories for this question type
                const allSubcategories = QUESTION_SUBCATEGORIES[questionType.id as keyof typeof QUESTION_SUBCATEGORIES] || [];
                const totalSubcategories = allSubcategories.length;
                
                return (
                  <button
                    key={questionType.id}
                    onClick={() => {
                      const isSelected = selectedQuestionType === questionType.id;
                      setSelectedQuestionType(isSelected ? null : questionType.id);
                      setSelectedSubcategory(null); // Reset subcategory when changing question type
                    }}
                    className={`p-4 rounded-lg border-2 transition-all text-left ${
                      isSelected 
                        ? 'border-purple-500 bg-purple-500 text-white' 
                        : 'border-gray-200 bg-white text-gray-900 hover:border-purple-500 hover:bg-purple-50'
                    }`}
                  >
                    <div className="font-medium mb-1">{questionType.name}</div>
                    <div className={`text-xl font-bold ${isSelected ? 'text-white' : 'text-purple-600'}`}>
                      {typeData.total} questions
                    </div>
                    <div className={`text-sm ${isSelected ? 'text-purple-100' : 'text-gray-500'}`}>
                      {totalSubcategories} subcategories
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Subcategory Breakdown */}
            {selectedQuestionType && (
              <div>
                <h4 className="text-md font-medium text-gray-900 mb-3">
                  {selectedQuestionType} Subcategories
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                  {Object.entries(getSubcategoryBreakdown(selectedExamType, selectedQuestionType))
                    .sort(([,a], [,b]) => b - a) // Sort by count descending
                    .map(([subcategory, count]) => {
                      const isSelected = selectedSubcategory === subcategory;
                      
                      return (
                        <button
                          key={subcategory}
                          onClick={() => {
                            setSelectedSubcategory(isSelected ? null : subcategory);
                          }}
                          className={`p-3 rounded-lg border-2 transition-all text-left ${
                            isSelected 
                              ? 'border-green-500 bg-green-500 text-white' 
                              : 'border-gray-200 bg-gray-50 text-gray-900 hover:border-green-500 hover:bg-green-50'
                          }`}
                        >
                          <div className={`font-medium text-sm mb-1 leading-tight ${
                            isSelected ? 'text-white' : 'text-gray-900'
                          }`}>
                            {subcategory}
                          </div>
                          <div className={`text-lg font-bold ${
                            isSelected ? 'text-white' : 'text-green-600'
                          }`}>
                            {count}
                          </div>
                          <div className={`text-xs ${
                            isSelected ? 'text-green-100' : 'text-gray-500'
                          }`}>
                            questions
                          </div>
                        </button>
                      );
                    })
                  }
                </div>

                {/* Questions Display */}
                {selectedSubcategory && (
                  <div className="mt-6">
                    <h4 className="text-md font-medium text-gray-900 mb-3">
                      Questions in "{selectedSubcategory}"
                    </h4>
                    {(() => {
                      const subcategoryQuestions = getSubcategoryQuestions(selectedExamType, selectedQuestionType, selectedSubcategory);
                      
                      if (subcategoryQuestions.length === 0) {
                        return (
                          <div className="text-center py-8 px-4 bg-gray-50 rounded-lg border border-gray-200">
                            <div className="text-gray-500 text-lg font-medium mb-2">No Questions Available</div>
                            <div className="text-gray-400 text-sm">
                              There are currently no questions in this subcategory.
                            </div>
                          </div>
                        );
                      }
                      
                      return (
                        <div className="space-y-4">
                          {subcategoryQuestions.map((question, index) => (
                            <div key={question.id} className="bg-white border border-gray-200 rounded-lg p-4">
                              <div className="flex items-start justify-between mb-2">
                                <div className="flex items-center space-x-2">
                                  <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded">
                                    #{question.id}
                                  </span>
                                  <span className={`text-xs font-medium px-2 py-1 rounded ${
                                    question.difficulty === 'easy' ? 'bg-green-100 text-green-800' :
                                    question.difficulty === 'intermediate' ? 'bg-yellow-100 text-yellow-800' :
                                    'bg-red-100 text-red-800'
                                  }`}>
                                    {question.difficulty}
                                  </span>
                                </div>
                                <div className="text-xs text-gray-500">
                                  {question.createdAt ? new Date(question.createdAt).toLocaleDateString() : 'No date'}
                                </div>
                              </div>
                              
                              <div className="mb-3">
                                <div className="font-medium text-gray-900 mb-2">Question:</div>
                                <div className="text-gray-700 text-sm leading-relaxed">
                                  {question.text ? (
                                    question.text.length > 200 ? (
                                      <div>
                                        {renderMathText(question.text.substring(0, 200))}
                                        <span className="text-gray-500">...</span>
                                      </div>
                                    ) : (
                                      renderMathText(question.text)
                                    )
                                  ) : (
                                    'No question text available'
                                  )}
                                </div>
                              </div>
                              
                              {/* Answer Choices */}
                              {question.choices && question.choices.length > 0 && (
                                <div className="mt-3 pt-3 border-t border-gray-100">
                                  <div className="font-medium text-gray-900 mb-2 text-sm">Answer Choices:</div>
                                  <div className="space-y-1">
                                    {question.choices.map((choice, choiceIndex) => (
                                      <div key={choiceIndex} className="flex items-start text-xs">
                                        <span className={`inline-block w-6 h-6 rounded-full text-center leading-6 mr-2 flex-shrink-0 ${
                                          choice === question.correctAnswer 
                                            ? 'bg-green-100 text-green-800 font-bold' 
                                            : 'bg-gray-100 text-gray-600'
                                        }`}>
                                          {String.fromCharCode(65 + choiceIndex)}
                                        </span>
                                        <div className="text-gray-700 flex-1 mt-0.5">
                                          {renderMathText(choice)}
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                              
                              {question.explanation && (
                                <div className="mt-3 pt-3 border-t border-gray-100">
                                  <div className="font-medium text-gray-900 mb-1 text-sm">Explanation:</div>
                                  <div className="text-gray-600 text-sm">
                                    {question.explanation.length > 150 ? (
                                      <div>
                                        {renderMathText(question.explanation.substring(0, 150))}
                                        <span className="text-gray-500">...</span>
                                      </div>
                                    ) : (
                                      renderMathText(question.explanation)
                                    )}
                                  </div>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      );
                    })()}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

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
          
          {/* Quick Actions */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg border">
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-2">Import Questions</h3>
              <input
                type="file"
                accept=".json"
                onChange={handleImportQuestions}
                className="text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-alarm-blue file:text-white hover:file:bg-alarm-blue-dark"
              />
            </div>
          </div>
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

        {/* Enhanced Toolbar */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6 border border-alarm-black/10">
          {/* Search and Filter Row */}
          <div className="flex flex-col lg:flex-row gap-4 mb-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="Search questions, answers, or explanations..."
                  className="w-full pl-10 pr-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-alarm-blue focus:border-alarm-blue"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-2">
              <select
                className="border-2 border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-alarm-blue focus:border-alarm-blue"
                value={examFilter}
                onChange={(e) => setExamFilter(e.target.value)}
              >
                <option value="">All Exams</option>
                {EXAMS.map((ex) => (
                  <option key={ex} value={ex}>{ex}</option>
                ))}
              </select>

              <select
                className="border-2 border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-alarm-blue focus:border-alarm-blue"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
              >
                <option value="">All Types</option>
                {Object.values(QUESTION_TYPES).flat().map((t) => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>

              <select
                className="border-2 border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-alarm-blue focus:border-alarm-blue"
                value={difficultyFilter}
                onChange={(e) => setDifficultyFilter(e.target.value)}
              >
                <option value="">All Difficulties</option>
                {DIFFICULTIES.map((d) => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>

              <select
                className="border-2 border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-alarm-blue focus:border-alarm-blue"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'date' | 'exam' | 'type' | 'difficulty')}
              >
                <option value="date">Sort by Date</option>
                <option value="exam">Sort by Exam</option>
                <option value="type">Sort by Type</option>
                <option value="difficulty">Sort by Difficulty</option>
              </select>

              <button
                onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
                className="px-3 py-2 border-2 border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                title={`Sort ${sortOrder === 'asc' ? 'ascending' : 'descending'}`}
              >
                {sortOrder === 'asc' ? '↑' : '↓'}
              </button>
            </div>
          </div>

          {/* Action Row */}
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            {/* Stats and Info */}
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">
                Showing {displayedQuestions.length} of {questions.length} questions
              </span>
              {examFilter && (
                <span className="text-xs text-red-600 font-medium">
                  Filter: {examFilter}
                </span>
              )}
              {selectedQuestions.length > 0 && (
                <span className="text-sm text-alarm-blue font-medium">
                  {selectedQuestions.length} selected
                </span>
              )}
              <button
                onClick={() => setShowStats(!showStats)}
                className="text-sm text-alarm-blue hover:text-alarm-blue-dark underline"
              >
                {showStats ? 'Hide' : 'Show'} Statistics
              </button>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              {selectedQuestions.length > 0 && (
                <>
                  <button
                    onClick={exportQuestions}
                    className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                  >
                    Export Selected
                  </button>
                  <button
                    onClick={bulkDeleteQuestions}
                    className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
                  >
                    Delete Selected
                  </button>
                </>
              )}
              <button
                onClick={exportQuestions}
                className="px-3 py-2 bg-alarm-blue text-white rounded-lg hover:bg-alarm-blue-dark transition-colors text-sm font-medium"
              >
                Export All
              </button>
              <button
                onClick={fetchQuestions}
                className="px-3 py-2 border-2 border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
              >
                Refresh
              </button>
            </div>
          </div>

          {/* Statistics Panel */}
          {showStats && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg border">
              <h4 className="font-semibold text-gray-900 mb-3">Question Statistics</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <h5 className="font-medium text-gray-700 mb-2">By Exam</h5>
                  {Object.entries(getQuestionStats().byExam).map(([exam, count]) => (
                    <div key={exam} className="flex justify-between text-sm">
                      <span>{exam}:</span>
                      <span className="font-medium">{count}</span>
                    </div>
                  ))}
                </div>
                <div>
                  <h5 className="font-medium text-gray-700 mb-2">By Difficulty</h5>
                  {Object.entries(getQuestionStats().byDifficulty).map(([difficulty, count]) => (
                    <div key={difficulty} className="flex justify-between text-sm">
                      <span className="capitalize">{difficulty}:</span>
                      <span className="font-medium">{count}</span>
                    </div>
                  ))}
                </div>
                <div>
                  <h5 className="font-medium text-gray-700 mb-2">By Type</h5>
                  {Object.entries(getQuestionStats().byType).slice(0, 5).map(([type, count]) => (
                    <div key={type} className="flex justify-between text-sm">
                      <span>{type}:</span>
                      <span className="font-medium">{count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Questions List */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-alarm-black/10">
          <div className="px-6 py-4 border-b border-alarm-black/10">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-alarm-black">Questions</h3>
              {displayedQuestions.length > 0 && (
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={selectedQuestions.length === displayedQuestions.length}
                    onChange={handleSelectAll}
                    className="rounded border-gray-300 text-alarm-blue focus:ring-alarm-blue"
                  />
                  <label className="text-sm text-gray-600">Select All</label>
                </div>
              )}
            </div>
          </div>
          
          {displayedQuestions.length === 0 ? (
            <div className="text-center py-12">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-alarm-black">No questions found</h3>
              <p className="mt-1 text-sm text-alarm-black/70">
                {searchTerm || filter || difficultyFilter || examFilter
                  ? "Try adjusting your search or filters" 
                  : "Add your first question using the form above"}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-alarm-black/10">
              {displayedQuestions.map((q) => (
                <div key={q.id} className={`p-6 hover:bg-gray-50 transition-colors ${selectedQuestions.includes(q.id) ? 'bg-alarm-blue-light/10' : ''}`}>
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={selectedQuestions.includes(q.id)}
                        onChange={() => handleSelectQuestion(q.id)}
                        className="rounded border-gray-300 text-alarm-blue focus:ring-alarm-blue"
                      />
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
                    <div className="flex gap-2">
                      <button
                        onClick={() => setEditingQuestion(q)}
                        className="text-alarm-blue hover:text-alarm-blue-dark bg-alarm-blue-light hover:bg-alarm-blue-light/80 border-2 border-alarm-blue/30 hover:border-alarm-blue/50 p-2 rounded-lg transition-all duration-200 font-semibold shadow-sm"
                        title="Edit question"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
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

        {/* Edit Question Modal */}
        {editingQuestion && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">Edit Question</h2>
                  <button
                    onClick={() => setEditingQuestion(null)}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <EditQuestionForm 
                  question={editingQuestion}
                  onSave={async (updatedQuestion) => {
                    // Update question logic here
                    try {
                      const res = await fetch("/api/questions", {
                        method: "PUT",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(updatedQuestion),
                      });
                      if (!res.ok) throw new Error("Failed to update question");
                      await fetchQuestions();
                      setEditingQuestion(null);
                      setSuccess("Question updated successfully!");
                    } catch (err: any) {
                      setError("Failed to update question");
                    }
                  }}
                  onCancel={() => setEditingQuestion(null)}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Edit Question Form Component
function EditQuestionForm({ 
  question, 
  onSave, 
  onCancel 
}: { 
  question: Question;
  onSave: (question: Question) => Promise<void>;
  onCancel: () => void;
}) {
  const [text, setText] = useState(question.text);
  const [correctAnswer, setCorrectAnswer] = useState(question.correctAnswer);
  const [choices, setChoices] = useState(question.choices.slice(1)); // Exclude correct answer
  const [explanation, setExplanation] = useState(question.explanation || "");
  const [exam, setExam] = useState(question.exam);
  const [type, setType] = useState(question.type);
  const [subcategory, setSubcategory] = useState(question.subcategory);
  const [difficulty, setDifficulty] = useState(question.difficulty);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSave({
        ...question,
        text,
        correctAnswer,
        choices: [correctAnswer, ...choices],
        explanation,
        exam,
        type,
        subcategory,
        difficulty
      });
    } finally {
      setLoading(false);
    }
  };

  const updateChoice = (index: number, value: string) => {
    const newChoices = [...choices];
    newChoices[index] = value;
    setChoices(newChoices);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Form fields similar to the add question form */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">Exam</label>
          <select
            className="w-full border-2 border-gray-400 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            value={exam}
            onChange={(e) => setExam(e.target.value)}
          >
            {EXAMS.map((ex) => (
              <option key={ex} value={ex}>{ex}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">Difficulty</label>
          <select
            className="w-full border-2 border-gray-400 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value)}
          >
            {DIFFICULTIES.map((d) => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-900 mb-2">Question Text</label>
        <textarea
          className="w-full border-2 border-gray-400 rounded-lg px-3 py-2 h-32 resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          value={text}
          onChange={(e) => setText(e.target.value)}
          required
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-900 mb-2">Correct Answer</label>
        <input
          type="text"
          className="w-full border-2 border-gray-400 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          value={correctAnswer}
          onChange={(e) => setCorrectAnswer(e.target.value)}
          required
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-900 mb-2">Other Answer Choices</label>
        <div className="space-y-2">
          {choices.map((choice, index) => (
            <input
              key={index}
              type="text"
              placeholder={`Choice ${String.fromCharCode(66 + index)}`}
              className="w-full border-2 border-gray-400 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={choice}
              onChange={(e) => updateChoice(index, e.target.value)}
              required
            />
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-900 mb-2">Explanation (Optional)</label>
        <textarea
          className="w-full border-2 border-gray-400 rounded-lg px-3 py-2 h-24 resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          value={explanation}
          onChange={(e) => setExplanation(e.target.value)}
        />
      </div>

      <div className="flex gap-4 pt-4">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 bg-alarm-blue text-white py-3 px-6 rounded-lg hover:bg-alarm-blue-dark transition-colors font-semibold disabled:opacity-50"
        >
          {loading ? 'Updating...' : 'Update Question'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-3 border-2 border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-semibold"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}