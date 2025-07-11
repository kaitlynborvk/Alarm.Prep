import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const comprehensiveQuestions = [
  // GMAT Quantitative - Easy
  {
    exam: 'GMAT',
    type: 'Quantitative',
    subcategory: 'Problem Solving',
    text: 'If $3x + 5 = 20$, what is the value of $x$?',
    correctAnswer: '$x = 5$',
    choices: ['$x = 3$', '$x = 4$', '$x = 5$', '$x = 6$'],
    difficulty: 'easy',
    explanation: 'Solve for $x$: $3x + 5 = 20$, so $3x = 15$, therefore $x = 5$'
  },
  {
    exam: 'GMAT',
    type: 'Quantitative',
    subcategory: 'Data Sufficiency',
    text: 'What is the value of $x$? \\n(1) $x^2 = 9$ \\n(2) $x > 0$',
    correctAnswer: 'C',
    choices: ['A', 'B', 'C', 'D', 'E'],
    difficulty: 'easy',
    explanation: 'Statement (1) gives $x = 3$ or $x = -3$. Statement (2) tells us $x > 0$. Together, $x = 3$.'
  },
  {
    exam: 'GMAT',
    type: 'Quantitative',
    subcategory: 'Geometry',
    text: 'A circle has radius 5. What is its area?',
    correctAnswer: '$25\\pi$',
    choices: ['$10\\pi$', '$25\\pi$', '$50\\pi$', '$100\\pi$'],
    difficulty: 'easy',
    explanation: 'Area of circle = $\\pi r^2 = \\pi \\cdot 5^2 = 25\\pi$'
  },

  // GMAT Quantitative - Intermediate
  {
    exam: 'GMAT',
    type: 'Quantitative',
    subcategory: 'Algebra',
    text: 'If $\\frac{x^2 - 4}{x + 2} = 5$, what is the value of $x$?',
    correctAnswer: '$x = 7$',
    choices: ['$x = 5$', '$x = 6$', '$x = 7$', '$x = 8$'],
    difficulty: 'intermediate',
    explanation: 'Factor: $\\frac{(x-2)(x+2)}{x+2} = x-2 = 5$, so $x = 7$'
  },
  {
    exam: 'GMAT',
    type: 'Quantitative',
    subcategory: 'Statistics',
    text: 'The average of 5 numbers is 12. If one number is removed, the average becomes 10. What was the removed number?',
    correctAnswer: '20',
    choices: ['15', '18', '20', '22'],
    difficulty: 'intermediate',
    explanation: 'Sum of 5 numbers = $5 \\times 12 = 60$. Sum of 4 numbers = $4 \\times 10 = 40$. Removed number = $60 - 40 = 20$'
  },

  // GMAT Quantitative - Hard
  {
    exam: 'GMAT',
    type: 'Quantitative',
    subcategory: 'Combinatorics',
    text: 'In how many ways can 6 people be arranged in a row if 2 specific people must sit together?',
    correctAnswer: '240',
    choices: ['120', '180', '240', '360'],
    difficulty: 'hard',
    explanation: 'Treat the 2 people as one unit. Arrange 5 units in $5! = 120$ ways. The 2 people can be arranged in $2! = 2$ ways. Total = $120 \\times 2 = 240$'
  },

  // GMAT Verbal - Easy
  {
    exam: 'GMAT',
    type: 'Verbal',
    subcategory: 'Critical Reasoning',
    text: 'The city council has proposed a new ordinance requiring all restaurants to post calorie counts. This will help customers make healthier choices. \\n\\nWhich of the following, if true, would most strengthen this argument?',
    correctAnswer: 'Studies show that when calorie information is available, people consistently choose lower-calorie options.',
    choices: [
      'Most restaurants already voluntarily post some nutritional information.',
      'Studies show that when calorie information is available, people consistently choose lower-calorie options.',
      'The ordinance will cost restaurants money to implement.',
      'Some customers are already health-conscious in their food choices.'
    ],
    difficulty: 'easy',
    explanation: 'This directly supports the claim that posting calories will help customers make healthier choices.'
  },
  {
    exam: 'GMAT',
    type: 'Verbal',
    subcategory: 'Reading Comprehension',
    text: 'The following passage discusses renewable energy: \\n\\n"Solar power has become increasingly cost-effective over the past decade. Manufacturing improvements have reduced panel costs by 60%, while efficiency has improved by 25%. However, storage remains a challenge for widespread adoption." \\n\\nWhat is the main idea of this passage?',
    correctAnswer: 'Solar power has improved significantly but still faces storage challenges.',
    choices: [
      'Solar power is now the cheapest energy source.',
      'Solar power has improved significantly but still faces storage challenges.',
      'Manufacturing improvements are the key to renewable energy.',
      'Storage technology needs major breakthroughs.'
    ],
    difficulty: 'easy',
    explanation: 'The passage presents both improvements and remaining challenges in solar power.'
  },

  // GMAT Verbal - Intermediate
  {
    exam: 'GMAT',
    type: 'Verbal',
    subcategory: 'Sentence Correction',
    text: 'The company\'s new policy, which was implemented last month, has been effective in reducing costs and to improve efficiency.',
    correctAnswer: 'has been effective in reducing costs and improving efficiency.',
    choices: [
      'has been effective in reducing costs and to improve efficiency.',
      'has been effective in reducing costs and improving efficiency.',
      'have been effective in reducing costs and to improve efficiency.',
      'has been effective to reduce costs and improve efficiency.'
    ],
    difficulty: 'intermediate',
    explanation: 'Parallel structure requires "reducing" and "improving" (both gerunds).'
  },

  // GMAT Verbal - Hard
  {
    exam: 'GMAT',
    type: 'Verbal',
    subcategory: 'Critical Reasoning',
    text: 'Company X claims that their new software reduces processing time by 40%. However, a study found that while the software does speed up certain tasks, overall processing time only decreased by 15% due to increased setup time. \\n\\nWhich of the following best explains this discrepancy?',
    correctAnswer: 'The company measured only the tasks that were sped up, not the overall process including setup.',
    choices: [
      'The study was conducted by a competitor of Company X.',
      'The company measured only the tasks that were sped up, not the overall process including setup.',
      'The software works differently in different environments.',
      'The study participants were not properly trained on the software.'
    ],
    difficulty: 'hard',
    explanation: 'This explains how both claims can be true - the company focused on specific tasks while ignoring setup overhead.'
  },

  // GMAT Data Insights
  {
    exam: 'GMAT',
    type: 'Data Insights',
    subcategory: 'Table Analysis',
    text: 'Based on the table below showing quarterly sales data, what was the percentage increase in Q4 sales compared to Q1? \\n\\nQ1: $100K, Q2: $120K, Q3: $110K, Q4: $150K',
    correctAnswer: '50%',
    choices: ['40%', '45%', '50%', '55%'],
    difficulty: 'intermediate',
    explanation: 'Percentage increase = $(150 - 100) / 100 \\times 100\\% = 50\\%$'
  },

  // LSAT Logical Reasoning - Easy
  {
    exam: 'LSAT',
    type: 'Logical Reasoning',
    subcategory: 'Strengthen',
    text: 'The new highway will reduce traffic congestion in downtown. Traffic studies show that 60% of downtown traffic is pass-through traffic that could use the highway instead. \\n\\nWhich of the following would most strengthen this argument?',
    correctAnswer: 'Most drivers prefer highways to city streets when available.',
    choices: [
      'The highway will have tolls that some drivers may want to avoid.',
      'Most drivers prefer highways to city streets when available.',
      'Downtown businesses are concerned about losing customers.',
      'The highway construction will temporarily increase traffic.'
    ],
    difficulty: 'easy',
    explanation: 'This supports the assumption that drivers will actually choose to use the highway.'
  },

  // LSAT Logical Reasoning - Intermediate
  {
    exam: 'LSAT',
    type: 'Logical Reasoning',
    subcategory: 'Assumption',
    text: 'Studies show that students who eat breakfast perform better on tests. Therefore, schools should provide free breakfast to improve academic performance. \\n\\nThis argument assumes which of the following?',
    correctAnswer: 'Students who don\'t currently eat breakfast would eat it if it were provided free.',
    choices: [
      'All students currently skip breakfast.',
      'Students who don\'t currently eat breakfast would eat it if it were provided free.',
      'Breakfast is more important than other meals for academic performance.',
      'Free breakfast programs are cost-effective for schools.'
    ],
    difficulty: 'intermediate',
    explanation: 'The argument requires this link between providing free breakfast and students actually eating it.'
  },

  // LSAT Logical Reasoning - Hard
  {
    exam: 'LSAT',
    type: 'Logical Reasoning',
    subcategory: 'Parallel Reasoning',
    text: 'All effective leaders are good communicators. Some good communicators are introverts. Therefore, some effective leaders are introverts. \\n\\nWhich argument has the same logical structure?',
    correctAnswer: 'All successful athletes are disciplined. Some disciplined people are quiet. Therefore, some successful athletes are quiet.',
    choices: [
      'All cats are mammals. Some mammals are large. Therefore, some cats are large.',
      'All successful athletes are disciplined. Some disciplined people are quiet. Therefore, some successful athletes are quiet.',
      'All roses are flowers. Some flowers are red. Therefore, all roses are red.',
      'All birds can fly. Some flying things are fast. Therefore, all birds are fast.'
    ],
    difficulty: 'hard',
    explanation: 'This follows the same logical pattern: All A are B, Some B are C, Therefore some A are C.'
  },

  // LSAT Reading Comprehension - Easy
  {
    exam: 'LSAT',
    type: 'Reading Comprehension',
    subcategory: 'Main Point',
    text: 'Recent studies have shown that meditation can improve focus and reduce stress. Participants who meditated for 20 minutes daily showed significant improvements in attention span and reported feeling calmer. These benefits appeared after just two weeks of practice. \\n\\nWhat is the main point of this passage?',
    correctAnswer: 'Meditation provides quick and measurable benefits for focus and stress.',
    choices: [
      'Everyone should meditate for 20 minutes daily.',
      'Meditation provides quick and measurable benefits for focus and stress.',
      'Stress reduction is the primary benefit of meditation.',
      'More research is needed on meditation benefits.'
    ],
    difficulty: 'easy',
    explanation: 'The passage emphasizes both the specific benefits and how quickly they appear.'
  },

  // LSAT Reading Comprehension - Intermediate
  {
    exam: 'LSAT',
    type: 'Reading Comprehension',
    subcategory: 'Inference',
    text: 'The ancient library of Alexandria was likely destroyed gradually rather than in a single catastrophic event. Various factors contributed to its decline: funding cuts, political instability, and the rise of Christianity which viewed pagan texts with suspicion. \\n\\nBased on this passage, which can be reasonably inferred?',
    correctAnswer: 'The library\'s destruction was a complex process with multiple causes.',
    choices: [
      'Christianity was solely responsible for the library\'s destruction.',
      'The library was destroyed in a single fire.',
      'The library\'s destruction was a complex process with multiple causes.',
      'Political factors were more important than religious ones.'
    ],
    difficulty: 'intermediate',
    explanation: 'The passage presents multiple contributing factors rather than a single cause.'
  },

  // LSAT Logic Games
  {
    exam: 'LSAT',
    type: 'Logic Games',
    subcategory: 'Linear Ordering',
    text: 'Seven students (A, B, C, D, E, F, G) must give presentations in order. The following constraints apply: \\n- A must present before B \\n- C must present before D \\n- E must present immediately after F \\n\\nIf F presents third, which student could present fifth?',
    correctAnswer: 'B',
    choices: ['A', 'B', 'C', 'D'],
    difficulty: 'intermediate',
    explanation: 'If F is third, then E is fourth. A must be before B, and C before D. B could be fifth with A earlier in the sequence.'
  }
];

async function addComprehensiveQuestions() {
  console.log('Adding comprehensive question set...');
  
  // Clear existing questions
  await prisma.question.deleteMany();
  console.log('Cleared existing questions');
  
  // Add all new questions
  for (const question of comprehensiveQuestions) {
    await prisma.question.create({
      data: question
    });
  }
  
  console.log(`Added ${comprehensiveQuestions.length} questions`);
  
  // Show distribution
  const questions = await prisma.question.findMany();
  const distribution: Record<string, Record<string, number>> = {};
  
  questions.forEach(q => {
    const key = `${q.exam} - ${q.type}`;
    if (!distribution[key]) distribution[key] = {};
    if (!distribution[key][q.difficulty]) distribution[key][q.difficulty] = 0;
    distribution[key][q.difficulty]++;
  });
  
  console.log('\nQuestion distribution:');
  Object.entries(distribution).forEach(([key, difficulties]) => {
    console.log(`${key}:`);
    Object.entries(difficulties).forEach(([diff, count]) => {
      console.log(`  ${diff}: ${count}`);
    });
  });
  
  await prisma.$disconnect();
}

addComprehensiveQuestions().catch(console.error);
