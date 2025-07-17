import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const questions = await prisma.question.findMany({
      orderBy: { createdAt: 'desc' }
    });
    return NextResponse.json(questions);
  } catch (error) {
    console.error('Error fetching questions:', error);
    return NextResponse.json({ error: 'Failed to fetch questions' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { exam, type, subcategory, text, correctAnswer, choices, difficulty, explanation } = body;

    const question = await prisma.question.create({
      data: {
        exam,
        type,
        subcategory,
        text,
        correctAnswer,
        choices,
        difficulty,
        explanation: explanation || null,
      },
    });

    return NextResponse.json(question);
  } catch (error) {
    console.error('Error creating question:', error);
    return NextResponse.json({ error: 'Failed to create question' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { id } = body;

    await prisma.question.delete({
      where: { id: parseInt(id) },
    });

    return NextResponse.json({ message: 'Question deleted successfully' });
  } catch (error) {
    console.error('Error deleting question:', error);
    return NextResponse.json({ error: 'Failed to delete question' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, exam, type, subcategory, text, correctAnswer, choices, difficulty, explanation } = body;

    const question = await prisma.question.update({
      where: { id: parseInt(id) },
      data: {
        exam,
        type,
        subcategory,
        text,
        correctAnswer,
        choices,
        difficulty,
        explanation: explanation || null,
      },
    });

    return NextResponse.json(question);
  } catch (error) {
    console.error('Error updating question:', error);
    return NextResponse.json({ error: 'Failed to update question' }, { status: 500 });
  }
}