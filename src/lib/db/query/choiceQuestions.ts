// lib/db/query/choiceQuestions.ts
import prisma from '@/lib/db'

export interface ChoiceQuestion {
  id?: number;
  task_number: number;
  question_number: number;
  question_text: string;
  options: Record<string, string>;
  question_type: 'single' | 'multiple';
  correct_options: string[];
  score: number;
  created_at?: string;
  updated_at?: string;
}

interface ChoiceQuestionRow {
  id: number;
  task_number: number;
  question_number: number;
  question_text: string;
  options: string; // JSON string from database
  question_type: string;
  correct_options: string; // JSON string from database
  score: number;
  created_at: string;
  updated_at: string;
}

export async function getAllChoiceQuestions(): Promise<ChoiceQuestion[]> {
  const questions = await prisma.choiceQuestion.findMany({
    orderBy: [
      { task_number: 'asc' },
      { question_number: 'asc' }
    ]
  }) as unknown as ChoiceQuestionRow[];

  return questions.map((q: ChoiceQuestionRow) => ({
    ...q,
    options: JSON.parse(q.options) as Record<string, string>,
    correct_options: JSON.parse(q.correct_options) as string[]
  }))
}

export async function getQuestionsWithoutAnswers(): Promise<Omit<ChoiceQuestion, 'correct_options'>[]> {
  const questions = await prisma.choiceQuestion.findMany({
    select: {
      id: true,
      task_number: true,
      question_number: true,
      question_text: true,
      options: true,
      question_type: true,
      score: true,
      created_at: true,
      updated_at: true
    },
    orderBy: [
      { task_number: 'asc' },
      { question_number: 'asc' }
    ]
  }) as unknown as Omit<ChoiceQuestionRow, 'correct_options'>[];

  return questions.map((q: Omit<ChoiceQuestionRow, 'correct_options'>) => ({
    ...q,
    options: JSON.parse(q.options) as Record<string, string>
  }))
}

export async function addChoiceQuestion(q: ChoiceQuestion): Promise<void> {
  await prisma.choiceQuestion.create({
    data: {
      ...q,
      options: JSON.stringify(q.options),
      correct_options: JSON.stringify(q.correct_options),
      updated_at: new Date()
    }
  })
}

export async function updateChoiceQuestion(id: number, updates: Partial<ChoiceQuestion>): Promise<{ success: boolean; changes?: number; error?: unknown }> {
  try {
    const data: Record<string, unknown> = { ...updates, updated_at: new Date() }
    
    if (data.options && typeof data.options === 'object') {
      data.options = JSON.stringify(data.options)
    }

    if (data.correct_options && Array.isArray(data.correct_options)) {
      data.correct_options = JSON.stringify(data.correct_options)
    }

    delete data.id

    const result = await prisma.choiceQuestion.update({
      where: { id },
      data
    })
    console.log(result) 
    return { success: true, changes: 1 }
  } catch (error) {
    return { success: false, error }
  }
}

export async function deleteChoiceQuestion(id: number): Promise<{ success: boolean; changes?: number; error?: unknown }> {
  try {
    await prisma.choiceQuestion.delete({
      where: { id }
    })
    return { success: true, changes: 1 }
  } catch (error) {
    return { success: false, error }
  }
}

export async function calculateChoiceScore(studentAnswers: { [questionId: number]: string | string[] }): Promise<number> {
  let score = 0
  const allQuestions = await getAllChoiceQuestions()

  for (const [idStr, answer] of Object.entries(studentAnswers)) {
    const question = allQuestions.find((q) => q.id === Number(idStr))
    if (!question) continue

    const studentSet = new Set(Array.isArray(answer) ? answer : [answer])
    const correctSet = new Set(question.correct_options)

    const isCorrect =
      studentSet.size === correctSet.size &&
      [...studentSet].every((a) => correctSet.has(a))

    if (isCorrect) {
      score += question.score ?? 1
    }
  }

  return score
}

export async function deleteChoiceQuestionsByTaskNumber(taskNumber: number): Promise<{ success: boolean; changes?: number; error?: unknown }> {
  try {
    const result = await prisma.choiceQuestion.deleteMany({
      where: { task_number: taskNumber }
    })
    return { success: true, changes: result.count }
  } catch (error) {
    return { success: false, error }
  }
}
