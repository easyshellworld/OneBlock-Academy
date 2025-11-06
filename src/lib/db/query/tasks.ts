// lib/db/query/tasks.ts
import prisma from '@/lib/db'

export interface Task {
  id?: number;
  student_id: string;
  student_name: string;
  task1_choice_score: number;
  task1_practice_score: number;
  task2_choice_score: number;
  task2_practice_score: number;
  task3_choice_score: number;
  task3_practice_score: number;
  task4_choice_score: number;
  task4_practice_score: number;
  task5_choice_score: number;
  task5_practice_score: number;
  task6_choice_score: number;
  task6_practice_score: number;
  task1_choice_completed: boolean;
  task2_choice_completed: boolean;
  task3_choice_completed: boolean;
  task4_choice_completed: boolean;
  task5_choice_completed: boolean;
  task6_choice_completed: boolean;
  created_at?: Date;
  updated_at?: Date | null; // 允许 null
}

export async function getAllTasks(): Promise<Task[]> {
  return await prisma.task.findMany({
    orderBy: { created_at: 'desc' }
  })
}

export async function getTaskByStudentId(studentId: string): Promise<Task | null> {
  return await prisma.task.findFirst({
    where: { student_id: studentId }
  })
}

export async function addTask(task: Omit<Task, 'id' | 'created_at' | 'updated_at'>): Promise<void> {
  await prisma.task.create({
    data: {
      ...task,
      updated_at: new Date()
    }
  })
}

export async function updateTask(id: number, task: Partial<Task>): Promise<{ success: boolean; changes?: number; error?: unknown }> {
  try {
    const data: Partial<Task> = { ...task }
    delete data.id
    data.updated_at = new Date()

    await prisma.task.update({
      where: { id },
      data
    })

    return { success: true, changes: 1 }
  } catch (error) {
    return { success: false, error }
  }
}

export async function deleteTask(id: number): Promise<{ success: boolean; changes?: number; error?: unknown }> {
  try {
    await prisma.task.delete({
      where: { id }
    })
    return { success: true, changes: 1 }
  } catch (error) {
    return { success: false, error }
  }
}