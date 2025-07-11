import { dataService } from '@/services/dataService';

async function testFiltering() {
  console.log('=== TESTING QUESTION FILTERING ===\n');
  
  // Test 1: GMAT Quantitative Easy
  console.log('TEST 1: GMAT Quantitative Easy');
  const test1 = await dataService.getRandomQuestion({
    exam: 'GMAT',
    type: 'quantitative',
    difficulty: 'easy'
  });
  console.log('Result:', test1 ? { id: test1.id, exam: test1.exam, type: test1.type, difficulty: test1.difficulty } : 'null');
  
  console.log('\n---\n');
  
  // Test 2: GMAT Quantitative Medium
  console.log('TEST 2: GMAT Quantitative Medium');
  const test2 = await dataService.getRandomQuestion({
    exam: 'GMAT',
    type: 'quantitative',
    difficulty: 'medium'
  });
  console.log('Result:', test2 ? { id: test2.id, exam: test2.exam, type: test2.type, difficulty: test2.difficulty } : 'null');
  
  console.log('\n---\n');
  
  // Test 3: GMAT Verbal
  console.log('TEST 3: GMAT Verbal');
  const test3 = await dataService.getRandomQuestion({
    exam: 'GMAT',
    type: 'verbal'
  });
  console.log('Result:', test3 ? { id: test3.id, exam: test3.exam, type: test3.type, difficulty: test3.difficulty } : 'null');
  
  console.log('\n---\n');
  
  // Test 4: LSAT Logical Reasoning
  console.log('TEST 4: LSAT Logical Reasoning');
  const test4 = await dataService.getRandomQuestion({
    exam: 'LSAT',
    type: 'logical'
  });
  console.log('Result:', test4 ? { id: test4.id, exam: test4.exam, type: test4.type, difficulty: test4.difficulty } : 'null');
  
  console.log('\n---\n');
  
  // Test 5: LSAT Reading Comprehension
  console.log('TEST 5: LSAT Reading Comprehension');
  const test5 = await dataService.getRandomQuestion({
    exam: 'LSAT',
    type: 'reading'
  });
  console.log('Result:', test5 ? { id: test5.id, exam: test5.exam, type: test5.type, difficulty: test5.difficulty } : 'null');
}

testFiltering();
