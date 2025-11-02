// lib/db/query/taskScores.ts
import prisma from '@/lib/db'

export type ScoreType = 'choice' | 'practice'

export interface StudentScore {
  student_id: string;
  student_name: string;
  wechat_id: string;
  wallet_address: string;
  total_score: number;
}

export interface TaskScore {
  id: number
  student_id: string
  task_number: number
  score_type: ScoreType
  score: number
  completed: boolean
  created_at: Date
  updated_at: Date | null
}

export interface OverallSummary {
  total_score: number
  avg_score: number
  records_count: number
}

interface TaskSummary {
  task_number: number
  score_type: ScoreType
  total_score: number
  times_completed: number
}

interface RawScore {
  id: number
  student_id: string
  student_name: string | null
  task_number: number
  score_type: ScoreType
  score: number
}

interface TaskSummaryResult {
  task_number: number
  score_type: string
  _sum: {
    score: number | null
  }
  _count: number
}

interface StudentWithScores {
  student_id: string
  student_name: string
  wechat_id: string
  wallet_address: string
  task_scores: Array<{ score: number }>
}

interface RawScoreItem {
  id: number
  student_id: string
  registration: {
    student_name: string
  } | null
  task_number: number
  score_type: string
  score: number
}

export async function createTaskScore(payload: {
  student_id: string
  task_number: number
  score_type: ScoreType
  score: number
  completed?: boolean
}): Promise<number> {
  const result = await prisma.taskScore.create({
    data: {
      student_id: payload.student_id,
      task_number: payload.task_number,
      score_type: payload.score_type,
      score: payload.score ?? 0,
      completed: payload.completed ?? false
    }
  })
  return result.id
}

export async function deleteTaskScore(id: number): Promise<void> {
  await prisma.taskScore.delete({
    where: { id }
  })
}

export async function updateTaskScore(
  id: number,
  updates: Partial<Pick<TaskScore, 'score' | 'completed' | 'score_type'>>
): Promise<void> {
  await prisma.taskScore.update({
    where: { id },
    data: {
      ...updates,
      updated_at: new Date()
    }
  })
}

export async function getTaskScoresByStudent(student_id: string): Promise<TaskScore[]> {
  return await prisma.taskScore.findMany({
    where: { student_id },
    orderBy: { task_number: 'asc' }
  })
}

export async function getStudentScoreSummary(student_id: string): Promise<{
  perTask: TaskSummary[]
  overall: OverallSummary
}> {
  const perTaskResults = await prisma.taskScore.groupBy({
    by: ['task_number', 'score_type'],
    where: { student_id },
    _sum: {
      score: true
    },
    _count: {
      _all: true
    }
  }) as TaskSummaryResult[]

  const overall = await prisma.taskScore.aggregate({
    where: { student_id },
    _sum: { score: true },
    _avg: { score: true },
    _count: true
  })

  const perTask: TaskSummary[] = perTaskResults.map((item: TaskSummaryResult) => ({
    task_number: item.task_number,
    score_type: item.score_type as ScoreType,
    total_score: item._sum.score || 0,
    times_completed: item._count
  }))

  return {
    perTask,
    overall: {
      total_score: overall._sum.score || 0,
      avg_score: overall._avg.score || 0,
      records_count: overall._count || 0
    }
  }
}

export async function getRawScores(): Promise<RawScore[]> {
  const results = await prisma.taskScore.findMany({
    select: {
      id: true,
      student_id: true,
      registration: {
        select: {
          student_name: true
        }
      },
      task_number: true,
      score_type: true,
      score: true
    },
    orderBy: [
      { student_id: 'asc' },
      { task_number: 'asc' }
    ]
  }) as RawScoreItem[]

  return results.map((item: RawScoreItem) => ({
    id: item.id,
    student_id: item.student_id,
    student_name: item.registration?.student_name || null,
    task_number: item.task_number,
    score_type: item.score_type as ScoreType,
    score: item.score
  }))
}

export async function getStudentScores(): Promise<StudentScore[]> {
  const result = await prisma.registration.findMany({
    select: {
      student_id: true,
      student_name: true,
      wechat_id: true,
      wallet_address: true,
      task_scores: {
        select: {
          score: true
        }
      }
    }
  }) as StudentWithScores[]

  return result.map((student: StudentWithScores) => ({
    student_id: student.student_id,
    student_name: student.student_name,
    wechat_id: student.wechat_id,
    wallet_address: student.wallet_address,
    total_score: student.task_scores.reduce((sum: number, score: { score: number }) => sum + score.score, 0)
  })).sort((a: StudentScore, b: StudentScore) => b.total_score - a.total_score)
}