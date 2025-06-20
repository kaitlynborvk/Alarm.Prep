import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/questions
export async function GET() {
  try {
    const questions = await prisma.question.findMany({
      orderBy: { createdAt: 'desc' }
    })
    return NextResponse.json(questions)
  } catch (error) {
    return NextResponse.json({ error: 'Error fetching questions' }, { status: 500 })
  }
}

// POST /api/questions
export async function POST(request: Request) {
  try {
    const json = await request.json()
    const question = await prisma.question.create({
      data: {
        text: json.text,
        type: json.type
      }
    })
    return NextResponse.json(question)
  } catch (error) {
    return NextResponse.json({ error: 'Error creating question' }, { status: 500 })
  }
}

// PUT /api/questions
export async function PUT(request: Request) {
  try {
    const json = await request.json()
    const question = await prisma.question.update({
      where: { id: json.id },
      data: {
        text: json.text,
        type: json.type
      }
    })
    return NextResponse.json(question)
  } catch (error) {
    return NextResponse.json({ error: 'Error updating question' }, { status: 500 })
  }
}

// DELETE /api/questions
export async function DELETE(request: Request) {
  try {
    const json = await request.json()
    await prisma.question.delete({
      where: { id: json.id }
    })
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Error deleting question' }, { status: 500 })
  }
} 