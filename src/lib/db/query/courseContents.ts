// lib/db/query/courseContents.ts
import prisma from '@/lib/db'

export interface CourseContent {
  id?: number;
  title: string;
  type: 'announcement' | 'resource';
  task_number?: number;
  content_markdown: string;
  is_pinned?: boolean;
  created_at?: Date;
  updated_at?: Date;
}

export async function getAllCourseContents(): Promise<CourseContent[]> {
  return await prisma.courseContent.findMany({
    orderBy: { created_at: 'desc' }
  })
}

export async function addCourseContent(content: Omit<CourseContent, 'id' | 'created_at' | 'updated_at'>): Promise<void> {
  await prisma.courseContent.create({
    data: {
      ...content,
      updated_at: new Date()
    }
  })
}

export async function updateCourseContent(id: number, updates: Partial<CourseContent>): Promise<{ success: boolean; changes?: number; error?: unknown }> {
  try {
    const data: Partial<CourseContent> = { ...updates }
    delete data.id
    data.updated_at = new Date()

    await prisma.courseContent.update({
      where: { id },
      data
    })

    return { success: true, changes: 1 }
  } catch (error) {
    return { success: false, error }
  }
}

export async function deleteCourseContent(id: number): Promise<{ success: boolean; changes?: number; error?: unknown }> {
  try {
    await prisma.courseContent.delete({
      where: { id }
    })
    return { success: true, changes: 1 }
  } catch (error) {
    return { success: false, error }
  }
}