import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET: Fetch all questions
export async function GET() {
  try {
    const questions = await prisma.question.findMany();
    return NextResponse.json(questions);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to fetch questions' }, { status: 500 });
  }
}

// POST: Add a new question
export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    const question = await prisma.question.create({
      data: {
        exam: data.exam,
        type: data.type,
        subcategory: data.subcategory,
        text: data.text,
        correctAnswer: data.correctAnswer,
        choices: data.choices,
        difficulty: data.difficulty,
        explanation: data.explanation,
      },
    });
    return NextResponse.json(question, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to add question' }, { status: 500 });
  }
}

// PUT /api/questions
export async function PUT(request: Request) {
  try {
    const json = await request.json();
    const question = await prisma.question.update({
      where: { id: json.id },
      data: {
        text: json.text,
        type: json.type,
        difficulty: json.difficulty,
        explanation: json.explanation,
      },
    });
    return NextResponse.json(question);
  } catch (error) {
    return NextResponse.json({ error: 'Error updating question' }, { status: 500 });
  }
}

// DELETE /api/questions
export async function DELETE(request: Request) {
  try {
    const json = await request.json();
    await prisma.question.delete({
      where: { id: json.id },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Error deleting question' }, { status: 500 });
  }
} 