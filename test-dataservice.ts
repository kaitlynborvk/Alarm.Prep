import { dataService } from '@/services/dataService';

async function testDataService() {
  try {
    console.log('Testing dataService...');
    
    // Test getting all questions
    const allQuestions = await dataService.getQuestions();
    console.log(`Got ${allQuestions.length} questions from dataService`);
    
    // Test filtering with lowercase (what the UI sends)
    const gmatQuantFilter = {
      exam: 'GMAT',
      type: 'quantitative' // lowercase like UI sends
    };
    
    console.log('Testing filter:', gmatQuantFilter);
    const filteredQuestions = await dataService.getQuestions(gmatQuantFilter);
    console.log(`Got ${filteredQuestions.length} filtered questions`);
    
    // Test getting random question
    const randomQuestion = await dataService.getRandomQuestion(gmatQuantFilter);
    console.log('Random question:', randomQuestion ? { id: randomQuestion.id, type: randomQuestion.type } : 'null');
    
  } catch (error) {
    console.error('DataService test error:', error);
  }
}

testDataService();
