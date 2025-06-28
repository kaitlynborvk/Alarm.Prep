import { prisma } from '../src/lib/prisma'

async function testConnection() {
  try {
    console.log('Testing database connection...')
    
    // Test basic connection
    await prisma.$queryRaw`SELECT 1`
    console.log('✅ Database connection successful!')
    
    // Test question model
    const count = await prisma.question.count()
    console.log(`📊 Found ${count} questions in database`)
    
    // Test creating a sample question
    const testQuestion = await prisma.question.create({
      data: {
        exam: 'TEST',
        type: 'Test',
        subcategory: 'Connection Test',
        text: 'This is a test question to verify database connectivity.',
        correctAnswer: 'Working',
        choices: ['Working', 'Not Working', 'Maybe', 'Unknown'],
        difficulty: 'easy',
        explanation: 'If you can see this, the database connection is working!'
      }
    })
    
    console.log('✅ Test question created with ID:', testQuestion.id)
    
    // Clean up test question
    await prisma.question.delete({
      where: { id: testQuestion.id }
    })
    
    console.log('✅ Test question cleaned up')
    console.log('🎉 All database operations successful!')
    
  } catch (error) {
    console.error('❌ Database connection failed:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

testConnection()
