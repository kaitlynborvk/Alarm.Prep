import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database...')

  // Clear existing data
  await prisma.question.deleteMany()

  // GMAT Questions
  const gmatQuestions = [
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
      subcategory: 'Problem Solving',
      text: 'What is the value of $x^2 + 2x - 8$ when $x = 3$?',
      correctAnswer: '$7$',
      choices: ['$5$', '$7$', '$9$', '$11$'],
      difficulty: 'easy',
      explanation: 'Substitute $x = 3$: $(3)^2 + 2(3) - 8 = 9 + 6 - 8 = 7$'
    },
    {
      exam: 'GMAT',
      type: 'Quantitative',
      subcategory: 'Algebra',
      text: 'If $\\frac{x^2 - 4}{x + 2} = 5$, what is the value of $x$?',
      correctAnswer: '$x = 7$',
      choices: ['$x = 5$', '$x = 6$', '$x = 7$', '$x = 8$'],
      difficulty: 'medium',
      explanation: 'Factor the numerator: $\\frac{(x-2)(x+2)}{x+2} = x-2 = 5$, so $x = 7$'
    },
    {
      exam: 'GMAT',
      type: 'Verbal',
      subcategory: 'Critical Reasoning',
      text: 'The city council has proposed a new ordinance requiring all restaurants to post calorie counts. This will help reduce obesity rates. Which of the following, if true, would most weaken this argument?',
      correctAnswer: 'Studies show that calorie posting has no significant effect on customer ordering behavior',
      choices: [
        'Studies show that calorie posting has no significant effect on customer ordering behavior',
        'Many restaurants already voluntarily post calorie information',
        'The cost of implementing calorie posting would be significant for small businesses',
        'Some customers are not concerned about calorie content'
      ],
      difficulty: 'medium',
      explanation: 'The argument assumes calorie posting will reduce obesity. If posting doesn\'t change behavior, it won\'t achieve this goal.'
    }
  ]

  // LSAT Questions  
  const lsatQuestions = [
    {
      exam: 'LSAT',
      type: 'Logical Reasoning',
      subcategory: 'Strengthen',
      text: 'The new highway will reduce traffic congestion in downtown. Therefore, air pollution in the city center will decrease. Which of the following, if true, would most strengthen this argument?',
      correctAnswer: 'Most air pollution in the city center comes from vehicle emissions',
      choices: [
        'Most air pollution in the city center comes from vehicle emissions',
        'The highway construction will take two years to complete',
        'Some residents oppose the highway construction',
        'The highway will cost $50 million to build'
      ],
      difficulty: 'medium',
      explanation: 'If most pollution comes from vehicles, then reducing traffic (vehicles) would reduce pollution.'
    },
    {
      exam: 'LSAT',
      type: 'Logic Games',
      subcategory: 'Analytical Reasoning',
      text: 'In a sequence, the formula is $a_n = 2^n + 3$. What is the value of $a_4$?',
      correctAnswer: '$a_4 = 19$',
      choices: ['$a_4 = 15$', '$a_4 = 17$', '$a_4 = 19$', '$a_4 = 21$'],
      difficulty: 'medium',
      explanation: 'Substitute $n = 4$: $a_4 = 2^4 + 3 = 16 + 3 = 19$'
    },
    {
      exam: 'LSAT',
      type: 'Reading Comprehension',
      subcategory: 'Main Point',
      text: 'Recent studies have shown that meditation can improve focus and reduce stress. Companies are beginning to offer meditation programs to employees. What is the main point of this passage?',
      correctAnswer: 'Companies are implementing meditation programs based on research showing its benefits',
      choices: [
        'Companies are implementing meditation programs based on research showing its benefits',
        'Meditation is better than other stress reduction techniques',
        'All employees should practice meditation',
        'Studies about meditation are conclusive'
      ],
      difficulty: 'easy',
      explanation: 'The passage connects research findings to corporate implementation of meditation programs.'
    }
  ]

  // Insert questions
  for (const question of [...gmatQuestions, ...lsatQuestions]) {
    await prisma.question.create({
      data: question
    })
  }

  console.log('Database seeded successfully!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
