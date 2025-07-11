import { prisma } from '@/lib/prisma';

async function testConnection() {
  try {
    console.log('Testing database connection...');
    const count = await prisma.question.count();
    console.log(`Found ${count} questions in database`);
    
    const sampleQuestions = await prisma.question.findMany({
      take: 3,
      select: {
        id: true,
        exam: true,
        type: true,
        difficulty: true,
        text: true
      }
    });
    
    console.log('Sample questions:', JSON.stringify(sampleQuestions, null, 2));
    
    // Test case-insensitive filtering - search for quantitative (lowercase)
    const gmatQuestions = await prisma.question.findMany({
      where: {
        exam: 'GMAT',
        type: {
          equals: 'Quantitative', // Use the actual case from database
        }
      },
      take: 2
    });
    
    console.log(`Found ${gmatQuestions.length} GMAT Quantitative questions`);
    console.log('Sample GMAT questions:', gmatQuestions.map(q => ({ id: q.id, type: q.type, text: q.text.substring(0, 50) + '...' })));
    
  } catch (error) {
    console.error('Database connection error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testConnection();
